const fs=require('fs');
const required=[
 'src/app/auth/page.tsx','src/app/documents/page.tsx','src/app/research/page.tsx','src/app/creators/page.tsx',
 'src/app/api/cloud/state/route.ts','src/app/api/documents/route.ts','src/app/api/ai/agent/route.ts','src/app/api/research/search/route.ts',
 'src/lib/firebase/client.ts','src/lib/server/mongo.ts','src/lib/server/firebase-admin.ts','server/index.mjs','docs/AI-CLOUD-UPGRADE.md'
];
const missing=required.filter(f=>!fs.existsSync(f));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const deps=['firebase','firebase-admin','mongodb','express','pdf-parse','mammoth','xlsx'];
const missingDeps=deps.filter(d=>!pkg.dependencies?.[d]);
const result={requiredFiles:required.length,missingFiles:missing,missingDependencies:missingDeps,ok:!missing.length&&!missingDeps.length};
console.log(JSON.stringify(result,null,2));
if(!result.ok) process.exit(1);
