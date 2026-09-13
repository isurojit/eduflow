import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import express from "express";
import cors from "cors";
import multer from "multer";
import admin from "firebase-admin";
import { GridFSBucket, MongoClient, ObjectId } from "mongodb";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "2mb" }));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

if (!admin.apps.length && process.env.FIREBASE_ADMIN_PROJECT_ID) admin.initializeApp({ credential: admin.credential.cert({ projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n") }) });
const mongo = process.env.MONGODB_URI ? new MongoClient(process.env.MONGODB_URI) : null;
let dbPromise;
const db = async () => { if (!mongo) throw new Error("MONGODB_URI missing"); dbPromise ??= mongo.connect().then(() => mongo.db(process.env.MONGODB_DB || "eduflow")); return dbPromise; };

async function auth(req, res, next) {
  try { const token = req.headers.authorization?.replace(/^Bearer\s+/i, ""); if (!token || !admin.apps.length) throw new Error("Authentication required"); req.user = await admin.auth().verifyIdToken(token); next(); }
  catch (e) { res.status(401).json({ error: e.message }); }
}

async function research(q) {
  const [wiki, openAlex, crossref] = await Promise.allSettled([
    fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=5`).then(r=>r.json()),
    fetch(`https://api.openalex.org/works?search=${encodeURIComponent(q)}&per-page=5${process.env.OPENALEX_EMAIL?`&mailto=${encodeURIComponent(process.env.OPENALEX_EMAIL)}`:""}`).then(r=>r.json()),
    fetch(`https://api.crossref.org/works?query=${encodeURIComponent(q)}&rows=5`).then(r=>r.json()),
  ]); const out=[];
  if(wiki.status==="fulfilled") for(const x of wiki.value?.query?.search||[]) out.push({id:`wiki-${x.pageid}`,source:"Wikipedia",title:x.title,snippet:(x.snippet||"").replace(/<[^>]+>/g," "),url:`https://en.wikipedia.org/?curid=${x.pageid}`});
  if(openAlex.status==="fulfilled") for(const x of openAlex.value?.results||[]) out.push({id:x.id,source:"OpenAlex",title:x.display_name,snippet:x.primary_topic?.display_name||"Academic work indexed by OpenAlex.",url:x.doi||x.id,year:x.publication_year,authors:(x.authorships||[]).slice(0,4).map(a=>a.author?.display_name).filter(Boolean)});
  if(crossref.status==="fulfilled") for(const x of crossref.value?.message?.items||[]) out.push({id:`crossref-${x.DOI}`,source:"Crossref",title:x.title?.[0]||x.DOI,snippet:(x["container-title"]?.[0]||"Scholarly work indexed by Crossref."),url:x.URL||`https://doi.org/${x.DOI}`,year:x.published?.["date-parts"]?.[0]?.[0]});
  return out.slice(0,15);
}

async function gemini(prompt) { const key=process.env.GEMINI_API_KEY; if(!key) throw new Error("GEMINI_API_KEY missing"); const model=process.env.GEMINI_MODEL||"gemini-2.5-flash-lite"; const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":key},body:JSON.stringify({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{responseMimeType:"application/json"}})}); if(!r.ok) throw new Error(`Gemini ${r.status}`); const d=await r.json(); return JSON.parse(d?.candidates?.[0]?.content?.parts?.[0]?.text||"{}"); }

async function extract(file){ const n=file.originalname.toLowerCase(),m=file.mimetype; if(m==="application/pdf"||n.endsWith(".pdf")) return (await pdfParse(file.buffer)).text||""; if(m.includes("wordprocessingml")||n.endsWith(".docx")) return (await mammoth.extractRawText({buffer:file.buffer})).value||""; if(m.includes("spreadsheet")||n.endsWith(".xlsx")||n.endsWith(".xls")){const b=XLSX.read(file.buffer,{type:"buffer"});return b.SheetNames.map(s=>XLSX.utils.sheet_to_csv(b.Sheets[s])).join("\n\n");} if(m.startsWith("text/")||n.endsWith(".csv")) return file.buffer.toString("utf8"); return ""; }

app.get("/health",(_,res)=>res.json({ok:true,service:"EduFlow MERN API"}));
app.get("/api/cloud/state",auth,async(req,res)=>{try{const d=await db();const x=await d.collection("user_states").findOne({uid:req.user.uid});if(!x?.state)return res.status(404).json({error:"No cloud state yet."});res.json({state:x.state,updatedAt:x.updatedAt})}catch(e){res.status(500).json({error:e.message})}});
app.put("/api/cloud/state",auth,async(req,res)=>{try{if(req.body?.state?.version!==9)return res.status(400).json({error:"Invalid state"});const d=await db(),now=new Date().toISOString();await d.collection("user_states").updateOne({uid:req.user.uid},{$set:{uid:req.user.uid,state:req.body.state,updatedAt:now}},{upsert:true});await d.collection("users").updateOne({uid:req.user.uid},{$set:{uid:req.user.uid,email:req.user.email||null,profile:req.body.state.profile||null,lastSeenAt:now},$setOnInsert:{createdAt:now}},{upsert:true});res.json({ok:true,updatedAt:now})}catch(e){res.status(500).json({error:e.message})}});
app.get("/api/research/search",auth,async(req,res)=>{try{res.json({results:await research(String(req.query.q||""))})}catch(e){res.status(500).json({error:e.message})}});
app.post("/api/ai/agent",auth,async(req,res)=>{try{const d=await db();const x=await d.collection("user_states").findOne({uid:req.user.uid});const context=JSON.stringify(x?.state||{}).slice(0,80000);const prompt=`You are EduFlow AI, an action-capable study copilot. User state: ${context}\nUser request: ${req.body.message}\nReturn JSON with keys message:string and actions:array. Allowed action types: navigate,set_study_minutes,add_goal,add_exam,create_note,complete_topic,bookmark_topic,start_focus,research. Use only IDs present in state. For state changes explain first.`;const out=await gemini(prompt);res.json({message:String(out.message||"I can help with that."),actions:Array.isArray(out.actions)?out.actions:[],source:"gemini"})}catch(e){res.status(500).json({error:e.message})}});
app.get("/api/documents",auth,async(req,res)=>{try{const d=await db();const docs=await d.collection("documents").find({ownerUid:req.user.uid}).sort({createdAt:-1}).limit(100).toArray();res.json({documents:docs.map(({_id,...x})=>({...x,id:String(_id)}))})}catch(e){res.status(500).json({error:e.message})}});
app.post("/api/documents",auth,upload.single("file"),async(req,res)=>{try{if(!req.file)return res.status(400).json({error:"Choose a file"});const text=(await extract(req.file)).slice(0,160000);let analysis={summary:text.slice(0,700)||"Uploaded document.",keyPoints:[],suggestedKind:req.body.kind||"other"};if(process.env.GEMINI_API_KEY){try{analysis=await gemini(`Analyze the following student document. Return JSON with summary,keyPoints,suggestedKind and optional marks,syllabus,noteTitle,noteBody. Do not invent missing values. File: ${req.file.originalname}\n${text.slice(0,100000)}`)}catch{}}const d=await db(),grid=new GridFSBucket(d,{bucketName:"student_uploads"}),id=new ObjectId();await new Promise((resolve,reject)=>{const s=grid.openUploadStreamWithId(id,req.file.originalname,{contentType:req.file.mimetype,metadata:{ownerUid:req.user.uid}});s.on("error",reject);s.on("finish",resolve);s.end(req.file.buffer)});const record={ownerUid:req.user.uid,name:req.file.originalname,mimeType:req.file.mimetype,size:req.file.size,kind:analysis.suggestedKind||req.body.kind||"other",extractedText:text,analysis,storage:"gridfs",storageId:id.toHexString(),createdAt:new Date().toISOString()};const ins=await d.collection("documents").insertOne(record);res.status(201).json({document:{...record,id:ins.insertedId.toHexString()}})}catch(e){res.status(500).json({error:e.message})}});

const port=Number(process.env.PORT||4000); app.listen(port,()=>console.log(`EduFlow MERN API running on http://localhost:${port}`));
