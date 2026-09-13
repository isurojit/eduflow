const fs=require('fs'),path=require('path');
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript');
const root=path.resolve(__dirname,'..'), src=path.join(root,'src');
const files=[];
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(ts|tsx)$/.test(e.name))files.push(p);}})(src);
let syntax=[];let unresolved=[];
for(const f of files){const source=fs.readFileSync(f,'utf8'); const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},fileName:f,reportDiagnostics:true}); for(const d of result.diagnostics||[]){if(d.category===ts.DiagnosticCategory.Error)syntax.push({file:path.relative(root,f),message:ts.flattenDiagnosticMessageText(d.messageText,'\n')});}
 const importRe=/(?:from\s+|import\s*\()?["'](@\/[^"']+)["']/g; let m; while((m=importRe.exec(source))){const rel=m[1].slice(2), base=path.join(src,rel); const candidates=[base,base+'.ts',base+'.tsx',path.join(base,'index.ts'),path.join(base,'index.tsx')]; if(!candidates.some(fs.existsSync)) unresolved.push({file:path.relative(root,f),import:m[1]});}}
const report={files:files.length,syntaxDiagnostics:syntax,unresolvedImports:unresolved};fs.writeFileSync(path.join(root,'docs','PHASE-15-SOURCE-AUDIT.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({files:files.length,syntaxErrors:syntax.length,unresolvedImports:unresolved.length},null,2));if(syntax.length||unresolved.length)process.exitCode=1;
