// Controlled current-baseline/after lab comparison. Snapshots preserve HTML and
// versioned CSS/JS bytes; original media stays unchanged. Not field CWV or INP.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync,spawn}=require('node:child_process');
const {chromium}=require('@playwright/test');
const {sendFile}=require('../build/http-compression.cjs');
const gzip=process.env.EXPLORE_PERFORMANCE_GZIP==='1';
const root=path.join(__dirname,'..'),out=path.resolve(process.env.EXPLORE_QA_OUT||path.join(root,'docs/interactive-experience/review-2026-10-22/FINAL_QA_EVIDENCE'));
const snapshot=path.join(out,'performance-baseline'),phase=process.argv[2]||'baseline';
const label=process.env.EXPLORE_PERFORMANCE_LABEL||phase;
const models=require('../src/explore/catalogue'),routes=[['home','/'],['hub','/explore'],...models.map(m=>[m.slug,'/explore/'+m.slug])];
const requested=process.env.EXPLORE_PERFORMANCE_ROUTES?.split(','),selected=requested?routes.filter(([name])=>requested.includes(name)):routes;
const forms=process.env.EXPLORE_PERFORMANCE_FORMS?.split(',')||['mobile','desktop'];
if(!selected.length||requested?.some(name=>!routes.some(r=>r[0]===name))||forms.some(form=>!['mobile','desktop'].includes(form)))throw Error('Unknown benchmark route or form factor');
fs.mkdirSync(out,{recursive:true});
if(phase==='capture'){
  fs.mkdirSync(snapshot,{recursive:true});const assets={};
  for(const [name,url]of routes){const html=fs.readFileSync(path.join(root,'dist',url==='/'?'index.html':url.slice(1)+'.html'),'utf8');fs.writeFileSync(path.join(snapshot,name+'.html'),html);for(const m of html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:css|js)\?[^"\s]+)"/g)){if(assets[m[1]])continue;const bytes=fs.readFileSync(path.join(root,'dist',m[1].split('?')[0]));const filename='asset-'+Object.keys(assets).length+path.extname(m[1].split('?')[0]);fs.writeFileSync(path.join(snapshot,filename),bytes);assets[m[1]]=filename;}}
  fs.writeFileSync(path.join(snapshot,'assets.json'),JSON.stringify(assets,null,2)+'\n');
  fs.writeFileSync(path.join(snapshot,'identity.json'),JSON.stringify({commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),build:JSON.parse(fs.readFileSync(path.join(root,'dist/build.json')))},null,2)+'\n');console.log('Captured '+routes.length+' pages and '+Object.keys(assets).length+' versioned assets.');process.exit(0);
}
if(!['baseline','after'].includes(phase))throw Error('Use capture, baseline or after.');
const assets=JSON.parse(fs.readFileSync(path.join(snapshot,'assets.json'))),cli=process.env.LIGHTHOUSE_CLI||require.resolve('lighthouse/cli/index.js');
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4','.json':'application/json','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');let filename;
  const page=routes.find(([name])=>u.pathname==='/measure/'+name);
  if(page)filename=phase==='baseline'?path.join(snapshot,page[0]+'.html'):path.join(root,'dist',page[1]==='/'?'index.html':page[1].slice(1)+'.html');
  else if(phase==='baseline'&&assets[u.pathname+u.search])filename=path.join(snapshot,assets[u.pathname+u.search]);
  else {filename=path.resolve(root,'dist','.'+u.pathname);if(!filename.startsWith(path.join(root,'dist')+path.sep)){res.writeHead(403);return res.end()}if(!fs.existsSync(filename)&&fs.existsSync(filename+'.html'))filename+='.html';}
  if(!fs.existsSync(filename)||!fs.statSync(filename).isFile()){res.writeHead(404);return res.end()}
  sendFile(req,res,filename,types[path.extname(filename)]||'application/octet-stream',200,gzip);
});
const run=args=>new Promise((resolve,reject)=>{let log='';const p=spawn(process.execPath,[cli,...args],{cwd:root,stdio:['ignore','pipe','pipe']});p.stdout.on('data',x=>log+=x);p.stderr.on('data',x=>log+=x);p.on('error',reject);p.on('close',code=>code===0?resolve(log):reject(Error(log)))});
(async()=>{
  await new Promise(r=>server.listen(3124,r));const browser=await chromium.launch({args:['--remote-debugging-port=9223']}),results=[];
  const summary={phase,baselineCommit:JSON.parse(fs.readFileSync(path.join(snapshot,'identity.json'))).commit,currentCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:browser.version(),transport:gzip?'gzip negotiated for both baseline and after':'uncompressed for both baseline and after',type:'Local Lighthouse lab, simulated default mobile / desktop preset; cold storage for each run; no field INP',results};
  try{for(const form of forms)for(const [name]of selected)for(let trial=1;trial<=(name==='home'?3:1);trial++){
    const filename=path.join(out,`lh-${label}-${form}-${name}-${trial}.json`),args=[`http://localhost:3124/measure/${name}`,'--quiet','--port=9223','--only-categories=performance,accessibility','--output=json',`--output-path=${filename}`];if(form==='desktop')args.push('--preset=desktop');
    await run(args);const d=JSON.parse(fs.readFileSync(filename));const row={name,form,trial,performance:d.categories.performance.score,accessibility:d.categories.accessibility.score,LCP:d.audits['largest-contentful-paint'].numericValue,CLS:d.audits['cumulative-layout-shift'].numericValue,TBT:d.audits['total-blocking-time'].numericValue,bytes:d.audits['total-byte-weight'].numericValue,observedLCP:d.audits.metrics.details.items[0].observedLargestContentfulPaint};results.push(row);console.log(JSON.stringify(row));fs.writeFileSync(path.join(out,'performance-'+label+'.json'),JSON.stringify(summary,null,2)+'\n');
  }}finally{await browser.close();server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
