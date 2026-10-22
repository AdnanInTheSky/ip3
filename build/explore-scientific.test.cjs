const test=require('node:test'),assert=require('node:assert/strict'),M=require('../src/explore/math');
const near=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('trade sensitivities obey the stated signs, including elasticity below baseline price',()=>{
  for(const d of [-.15,0,.25])for(const e of [.5,1,3]){const a=M.trade(0,d,e),b=M.trade(.3,d,e);assert.ok(b.qty<a.qty);near(a.local,a.usd*(1+d));}
  for(const e of [.5,1,3])assert.ok(M.trade(.1,.25,e).qty>M.trade(.1,-.15,e).qty);
  assert.ok(M.trade(0,.25,3).qty>M.trade(0,.25,.5).qty); // price below baseline: elasticity magnifies an increase.
  near(M.trade(.1,.25,1).usd,M.trade(.1,-.15,1).usd);
});
test('finance rate/stress monotonicity and IRR existence are explicit across all eight cases',()=>{
  for(const pair of Object.values(require('../src/explore/models/finance-investment.json').cases))for(const x of Object.values(pair)){
    const a=M.flow(x,0),b=M.flow(x,40);assert.ok(M.npv(a,.04)>M.npv(a,.14));assert.ok(M.npv(a,.08)>M.npv(b,.08));
    const annual=x.benefit*.6-x.opex*1.2;near(M.npv(b,0),-x.capex+x.years*annual);const r=M.irr(b);if(Number.isFinite(r))near(M.npv(b,r),0,1e-7);
  }
  assert.ok(Number.isNaN(M.irr([-100,300,-210])));assert.ok(Number.isNaN(M.irr([-100,0,0])));near(M.irr([-100,80]),-.2);
});
test('enterprise exact zero crossing and whole-unit rounding do not imply a demand forecast',()=>{
  for(const price of [85,120,175])for(const cost of [50,85,120])for(const p of [0,.3]){
    const x=M.enterprise(price,cost,p,1.3);near(x.profit,x.units*x.contribution-x.fixed);
    if(x.contribution>0){near((x.fixed/x.contribution)*x.contribution-x.fixed,0);assert.ok(x.breakEven*x.contribution>=x.fixed);assert.ok((x.breakEven-1)*x.contribution<x.fixed);}else assert.equal(x.breakEven,Infinity);
  }
});
test('two-period contrast invariances and infeasible counterfactuals remain numerical disclosures',()=>{
  for(const shift of [-10,0,10])near(M.impact(46+shift,74+shift,43+shift,56+shift).did,15);
  near(M.impact(46,74,43,56).did,-M.impact(43,56,46,74).did);
  assert.equal(M.impact(100,100,0,100).cf,200);assert.equal(M.impact(0,0,100,0).cf,-100);
});
test('workload dimensions and opportunity value retain neutral and adverse cases',()=>{
  const a=M.governance(3,.65,.12,3000),b=M.governance(3,.65,.12,6000);near(b.saved,2*a.saved);near(a.value/a.saved,650);
  near(a.after,a.newCore+a.newRework);near(M.governance(0,0,.24,3000).saved,0);assert.ok(M.governance(0,0,.4,3000).saved<0);
});
test('delivery capacity signs, rounded duration and continuous cumulative endpoint agree',()=>{
  const r=M.deliveryRate(12,.8,.14,.12);near(M.deliveryRate(6,.8,.14,.12),r/2);assert.ok(M.deliveryRate(12,1,.14,.12)>r);assert.ok(M.deliveryRate(12,.8,.4,.35)<r);
  const slow=M.deliveryRate(5,.5,.4,.35),w=Math.ceil(120/slow);assert.equal(w,138);assert.ok((w-1)*slow<120&&w*slow>=120);
  const series=M.chartData('management-delivery',[5,50,40,35]);assert.equal(series.rows.at(-1)[0],144);near(series.rows.at(-1)[2],120);
});
test('home stages hidden media, retains the first poster and provides a pause control',()=>{
  const {parseHTML}=require('linkedom'),{document}=parseHTML(require('../src/pages-home').home());const videos=[...document.querySelectorAll('.hero__slide video')];assert.equal(videos.length,require('../src/layout').D.hero.length);assert.equal(videos[0].getAttribute('preload'),'none');assert.ok(videos[0].hasAttribute('poster'));assert.ok(!videos[0].hasAttribute('autoplay'));assert.ok(videos[0].querySelector('source[data-src]'));
  for(const v of videos.slice(1)){assert.ok(v.hasAttribute('data-poster'));assert.ok(!v.hasAttribute('poster'));assert.ok(v.querySelector('source[data-src]'));assert.ok(!v.querySelector('source[src]'));}
  assert.equal(document.querySelectorAll('[data-hero-pause]').length,1);
});
test('Lighthouse warning assertions use the supported configuration path without lowering thresholds',()=>{
  const c=require('../lighthouserc.json');assert.equal(c.assertions,undefined);assert.deepEqual(c.ci.assert.assertions,{'categories:seo':['warn',{minScore:.95}],'categories:accessibility':['warn',{minScore:.9}],'categories:performance':['warn',{minScore:.7}]});
});
