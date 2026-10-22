// Local before/after lab measurement. Does not claim field INP or Vercel measurements.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {execFileSync,spawn}=require('node:child_process');
const root=path.join(__dirname,'..'),evidenceRoot=path.join(root,'docs/interactive-experience/qa'),out=process.env.EXPLORE_PERFORMANCE_OUT||evidenceRoot;
fs.mkdirSync(out,{recursive:true});
const cli=process.env.LIGHTHOUSE_CLI||require.resolve('lighthouse/cli/index.js');
const browserPath=process.env.CHROME_PATH||require('@playwright/test').chromium.executablePath();
const baselineCommit=JSON.parse(fs.readFileSync(path.join(evidenceRoot,'../baseline/build.json'),'utf8')).commit;
const baselineJs=execFileSync('git',['show',`${baselineCommit}:src/js/site.js`],{cwd:root,encoding:'utf8'}).replaceAll('__IP3_CONTACT_EMAIL__',JSON.stringify(require('../src/config').email));
const baselineHtml=fs.readFileSync(path.join(evidenceRoot,'../baseline/home.html'),'utf8');
const version=baselineHtml.match(/assets\/js\/site\.js\?v=([^"&]+)/)[1];
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.mp4':'video/mp4','.json':'application/json','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/baseline'){res.setHeader('Content-Type','text/html');return res.end(baselineHtml)}
  if(url.pathname==='/assets/js/site.js'&&url.searchParams.get('v')===version){res.setHeader('Content-Type','application/javascript');return res.end(baselineJs)}
  let p=path.resolve(root,'dist','.'+url.pathname);if(p!==path.join(root,'dist')&&!p.startsWith(path.join(root,'dist')+path.sep)){res.statusCode=403;return res.end()}
  if(!fs.existsSync(p)&&fs.existsSync(p+'.html'))p+='.html';
  if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');
  if(!fs.existsSync(p)){res.statusCode=404;return res.end()}
  res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);
});
function run(args){return new Promise((resolve,reject)=>{const child=spawn(process.execPath,[cli,...args],{cwd:root,env:{...process.env,CHROME_PATH:browserPath},stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',d=>logs+=d);child.stderr.on('data',d=>logs+=d);child.on('close',code=>code===0?resolve(logs):reject(new Error(logs)));});}
(async()=>{
 await new Promise(r=>server.listen(3124,r));const summary=[];
 const browser=await require('@playwright/test').chromium.launch({headless:true,args:['--remote-debugging-port=9223']});
 try{
  for(const [name,url] of [['home-before','/baseline'],['home-after','/'],...require('../src/explore/catalogue').map(m=>[m.slug,'/explore/'+m.slug])]){
   const filename=path.join(out,`lighthouse-${name}.json`);
   await run([`http://localhost:3124${url}`,'--quiet','--port=9223','--only-categories=performance,accessibility','--output=json',`--output-path=${filename}`]);
   const data=JSON.parse(fs.readFileSync(filename));const r={name,performance:data.categories.performance.score,accessibility:data.categories.accessibility.score,LCP:data.audits['largest-contentful-paint'].numericValue,CLS:data.audits['cumulative-layout-shift'].numericValue,TBT:data.audits['total-blocking-time'].numericValue,bytes:data.audits['total-byte-weight'].numericValue};summary.push(r);console.log(JSON.stringify(r));
   fs.writeFileSync(path.join(out,'performance-summary.json'),JSON.stringify({type:'Local mobile Lighthouse lab; one cold run per route; not field INP',results:summary},null,2));
  }
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
