const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const M = require('../src/explore/math');
const catalogue = require('../src/explore/catalogue');
const near = (actual,expected,tolerance=1e-9) => assert.ok(Math.abs(actual-expected)<tolerance,`${actual} != ${expected}`);
test('six routes and exact original hashes remain traceable',()=>{
  assert.deepEqual(catalogue.map(m=>m.slug),require('../cms/explorer-routes'));
  const manifest=require('../src/explore/reference-manifest.json');
  for(const m of manifest){const bytes=fs.readFileSync(path.join(__dirname,`../src/explore/reference/${m.slug}.html`));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),m.sha256);}
  assert.equal(manifest.reduce((sum,m)=>sum+m.cases,0),64);
});
test('trade neutral baseline, sign, analytical elasticity and complete input grid',()=>{
  for(const v of Object.values(M.trade(0,0,1.5)))near(v,1);
  near(M.trade(.1,0,1).qty,1/1.1);
  near(M.trade(.1,0,1).usd,1/1.1);
  for(const t of [0,.12,.3])for(const d of [-.15,0,.08,.25])for(const e of [.5,1.5,3]){
    const a=M.trade(t,d,e),p=(1+.4*d)/(1+d),q=Math.exp(-e*Math.log((1+t)*p));
    near(a.qty,q);near(a.local,p*q*(1+d));assert.ok(Object.values(a).every(Number.isFinite));
  }
  assert.ok(M.trade(.3,0,1.5).qty<M.trade(0,0,1.5).qty);
  assert.throws(()=>M.trade(0,-1,1));
});
test('finance discount timing and conventional IRR known solutions',()=>{
  near(M.npv([-100,60,60],0),20);
  near(M.npv([-100,110],.1),0);
  near(M.irr([-100,110]),.1);
  near(M.irr([-100,90]),-.1);
  near(M.irr([-100,60,60]),(.6+Math.sqrt(2.76))/2-1);
  near(M.npv([-100,60,60],M.irr([-100,60,60])),0,1e-9);
  assert.ok(Number.isNaN(M.irr([-100,-10,-10])));
  assert.ok(Number.isNaN(M.irr([-100,300,-210])));
  assert.ok(Number.isNaN(M.irr([-100,0,0])));
  assert.throws(()=>M.npv([-100,10],-1));
});
test('all eight finance cases match independent annuity and IRR residuals at UI boundaries',()=>{
  const {cases}=require('../src/explore/models/finance-investment.json');
  for(const pair of Object.values(cases))for(const x of Object.values(pair))for(const stress of [0,20,40])for(const rate of [.04,.08,.14]){
    const arr=M.flow(x,stress),annual=x.benefit*(1-stress/100)-x.opex*(1+stress/200);
    const expected=annual*(1-(1+rate)**-x.years)/rate-x.capex;
    near(M.npv(arr,rate),expected,1e-9);const r=M.irr(arr);if(Number.isFinite(r))near(M.npv(arr,r),0,1e-8);
  }
  assert.deepEqual(M.flow({capex:100,benefit:20,opex:5,years:2},40),[-100,6,6]);
});
test('enterprise fixed vs variable costs, zero and negative contribution, boundary grid',()=>{
  const z=M.enterprise(100,100,0,1);assert.equal(z.breakEven,Infinity);near(z.profit,-29000);
  assert.equal(M.enterprise(85,120,0,1).breakEven,Infinity);
  near(M.enterprise(120,70,0,1).profit,31000);assert.equal(M.enterprise(120,70,0,1).breakEven,580);
  for(const p of [85,125,175])for(const c of [50,78,120])for(const u of [0,.08,.3])for(const e of [.3,1.3,2.5]){
    const x=M.enterprise(p,c,u,e),contribution=p-c/(1+u);near(x.profit,1200*(p/120)**-e*contribution-29000);
    if(Number.isFinite(x.breakEven)){assert.ok(x.breakEven*contribution>=29000);assert.ok((x.breakEven-1)*contribution<29000)}
  }
});
test('DiD arithmetic, pp units, negative/zero changes and infeasible counterfactuals',()=>{
  assert.deepEqual(M.impact(46,74,43,56),{deltaT:28,deltaC:13,did:15,cf:59,feasible:true});
  near(M.impact(50,60,40,50).did,0);near(M.impact(70,50,40,60).did,-40);
  assert.equal(M.impact(100,100,0,100).cf,200);assert.equal(M.impact(100,100,0,100).feasible,false);
  assert.equal(M.impact(0,0,100,0).cf,-100);
  for(const p of [0,50,100])for(const q of [0,50,100])for(const r of [0,50,100])for(const s of [0,50,100])near(M.impact(p,q,r,s).did,q+r-p-s);
});
test('governance neutral reference, negative hours and value interpretation',()=>{
  const neutral=M.governance(0,0,.24,3000);near(neutral.saved,0);near(neutral.percent,0);near(neutral.baseline,2.028);
  const adverse=M.governance(0,0,.4,10000);assert.ok(adverse.saved<0&&adverse.value<0);
  for(const step of [0,3,5])for(const digital of [0,.65,1])for(const rework of [0,.12,.4])for(const vol of [500,3000,10000]){
    const x=M.governance(step,digital,rework,vol),after=1.5*(1-.065*step)*(1-.36*digital)+rework*2.2;
    near(x.after,after);near(x.saved,(2.028-after)*vol*12,1e-8);near(x.value,x.saved*650,1e-8);
  }
});
test('delivery correct capacity, rounding, baseline and slow/fast boundaries',()=>{
  assert.equal(Math.ceil(120/M.deliveryRate(12,.8,.14,.12)),22);
  assert.ok(Math.ceil(120/M.deliveryRate(5,.5,.4,.35))>48);
  for(const team of [5,12,20])for(const avail of [.5,.8,1])for(const rework of [0,.14,.4])for(const drag of [0,.12,.35]){
    const rate=M.deliveryRate(team,avail,rework,drag),duration=Math.ceil(120/rate);assert.ok(duration*rate>=120);assert.ok((duration-1)*rate<120);
  }
  assert.throws(()=>M.deliveryRate(0,1,0,0));assert.throws(()=>M.deliveryRate(10,1,0,1));
});
test('native pages preserve full initial state, static narratives and a single shared shell',()=>{
  const {model,hub}=require('../src/explore');
  for(const m of catalogue){const html=model(m);assert.equal((html.match(/<main\b/g)||[]).length,1);assert.equal((html.match(/<footer\b/g)||[]).length,1);assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.doesNotMatch(html,/<iframe\b|fonts\.googleapis[^"\n]*(?:DM\+Sans|Newsreader)/);assert.match(html,/Interpretation & methodology/);assert.match(html,/Read all \d+ scenario narratives/);assert.match(html,/Synthetic teaching scenario/);assert.match(html,/\/assets\/js\/model-math\.js\?v=/);}
  assert.equal((hub().match(/data-hub-case/g)||[]).length,12);
});
test('native CSS is scoped and no original document or six-model preload enters Home',()=>{
  const postcss=require('postcss');
  for(const m of catalogue){const css=fs.readFileSync(path.join(__dirname,`../src/explore/models/${m.slug}.css`),'utf8');postcss.parse(css).walkRules(rule=>{if(rule.parent.type==='atrule'&&/keyframes$/.test(rule.parent.name))return;assert.ok(rule.selectors.every(s=>s.startsWith('.ip3-model')),rule.selector)});}
  const html=require('../src/pages-home').home();assert.equal((html.match(/data-xp-select=/g)||[]).length,6);assert.doesNotMatch(html,/assets\/js\/models\/|<iframe/);
});
