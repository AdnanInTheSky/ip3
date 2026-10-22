// Reproducible native extraction. Immutable reference HTML is never copied to dist/.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const postcss = require('postcss');
const catalogue = require('../src/explore/catalogue');
const root = path.join(__dirname, '../src/explore');
const out = path.join(root, 'models');
fs.mkdirSync(out, { recursive: true });

function literal(source, marker) {
  const offset = source.indexOf(marker);
  if (offset < 0) throw new Error(`Missing ${marker}`);
  const start = source.indexOf('{', offset), stack = [];
  let quote = '', escape = false;
  for (let i = start; i < source.length; i++) {
    const c = source[i];
    if (quote) { if (escape) escape = false; else if (c === '\\') escape = true; else if (c === quote) quote = ''; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') stack.push(c);
    if (c === '}' && !stack.pop()) throw new Error('Unbalanced data');
    if (c === '}' && stack.length === 0) return source.slice(start, i + 1);
  }
  throw new Error('Unclosed data');
}
function replaceFunction(js, name, replacement) {
  const start = js.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Missing function ${name}`);
  const block = literal(js.slice(start), `function ${name}(`);
  return js.slice(0, start) + replacement + js.slice(js.indexOf(block, start) + block.length);
}
const manifest = [];
for (const m of catalogue) {
  const original = fs.readFileSync(path.join(root, 'reference', `${m.slug}.html`));
  const html = original.toString('utf8');
  let css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  let js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  let body = html.match(/<body[^>]*>([\s\S]*?)<script>/)[1];
  const caseLiteral = literal(js, 'const cases');
  const cases = vm.runInNewContext(`(${caseLiteral})`, {}, { timeout: 1000 });
  // Handoff expressly marks all new client credits unapproved. Keep the originals
  // for review, while the public interface describes hypothetical applications.
  for (const item of Object.values(cases)) for (const d of Object.values(item)) {
    for (const key of ['ref', 'source', 'evidence', 'reftype']) if (typeof d[key] === 'string') d[key] = key==='source'||key==='reftype'?'Illustrative analytical application':'Synthetic teaching scenario. No client result is asserted.';
    if (d.note) d.note = d.note.replace('The named World Bank project concerned technology-adoption research.', 'This is a hypothetical technology-adoption investment application.');
    if (d.note) d.note = d.note.replace('The economic-NPV illustration', 'The generic NPV illustration').replace('simplified equal annual economic benefit flows', 'simplified equal annual demonstration flows').replace('project financial returns from hypothetical cash flows', 'generic project returns from hypothetical flows');
    if(m.slug==='market-enterprise'&&Array.isArray(d.methods))d.methods=d.methods.map(t=>t==='400-firm survey'?'Enterprise survey design':t==='120 KIIs · 8 FGDs'?'Key informant interviews and focus groups':t);
  }
  js = js.replace(caseLiteral, JSON.stringify(cases));
  const order = vm.runInNewContext(js.match(/(?:const )?order\s*=\s*(\[[^\]]*\])/)[1]);
  // Only the duplicate brand navigation and publication footer are removed.
  body = body.replace(new RegExp(`<nav\\b[^>]*class="${m.prefix}-nav"[^>]*>[\\s\\S]*?<\\/nav>`, 'g'), '');
  body = body.replace(/<header\b[^>]*class="di-nav"[^>]*>[\s\S]*?<\/header>/g, '');
  body = body.replace(/<header\b[^>]*>\s*<\/header>/g, '');
  body = body.replace(/<footer\b[^>]*class="(?:et-footer|fi-shell fi-footer|me-shell me-foot|di-footer)"[^>]*>[\s\S]*?<\/footer>/g, '');
  body = body.replace(/<main\b/g, '<div').replace(/<\/main>/g, '</div>');
  body = body.replace(/<footer\b/g, '<div').replace(/<\/footer>/g, '</div>');
  body = body.replace(/<aside\b([^>]*class="(?:fi-tailnote|et-tailnote|me-tailnote|di-tailnote)[^"]*"[^>]*)>[\s\S]*?<\/aside>/g,
    '<aside$1><strong>Evidence boundary</strong><p>These teaching scenarios use synthetic assumptions. They demonstrate possible analytical methods and decision outputs. They do not document client results.</p></aside>');
  body = body.replace(/<p([^>]*class="di-endnote"[^>]*)>[\s\S]*?<\/p>/g, '<p$1>All applications and model outputs are illustrative; professional references require separate approval.</p>');
  body = body.replace(/<div class="et-outro-note">[\s\S]*?<\/div>/g,'<div class="et-outro-note"><strong>Explicit about uncertainty.</strong><p>The scenarios demonstrate analytical methods and possible decision outputs. Assumptions are synthetic. These hypothetical examples do not document client results.</p></div>');
  body = body.replace(/CV[- ](?:linked|grounded)(?: research| project)? context/gi,'Illustrative analytical context');
  if(m.slug==='management-delivery') body=body.replace('<rect fill="#85a88f" height="208" opacity=".045" width="237" x="60" y="52">','<rect id="md-target-area" fill="#85a88f" height="208" opacity=".045" width="237" x="60" y="52">').replace('<line stroke="#d8b0a0"','<line id="md-target-line" stroke="#d8b0a0"').replace('<text fill="#e6bba7" x="306" y="67">','<text id="md-target-label" fill="#e6bba7" x="306" y="67">');
  // Native root owns the original local variables; the shared shell keeps its own.
  const ast = postcss.parse(css);
  const animations = new Map();
  ast.walkAtRules(/keyframes$/, rule => { const old = rule.params; const name = `${m.slug}-${old}`; animations.set(old, name); rule.params = name; });
  ast.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
    rule.selectors = rule.selectors.map(selector => {
      if (selector === ':root' || selector === 'body' || selector === 'html') return '.ip3-model';
      return '.ip3-model ' + selector.replace(/\bbody\b/g, '.ip3-model').replace(/\bhtml\b/g, '.ip3-model');
    });
  });
  ast.walkDecls(decl => {
    if (decl.prop === '--sans') decl.value = 'var(--f-body)';
    if (decl.prop === '--serif') decl.value = 'var(--f-display)';
    if (decl.prop === '--mono') decl.value = 'var(--f-ui)';
    if (/animation/.test(decl.prop)) for (const [old, name] of animations) decl.value = decl.value.replace(new RegExp(`\\b${old}\\b`, 'g'), name);
  });
  css = ast.toString();
  // Retain the working diagram/rendering code, call verified shared calculations.
  if (m.slug === 'economics-trade') js = replaceFunction(js, 'predict', 'function predict(t,d,eps){return window.IP3ModelMath.trade(t,d,eps);}');
  if (m.slug === 'economics-trade') {
    js=js.replace('const v=[];for(let i=0;i<=60;i++)v.push(predict((i/60)*.30,fx,eps).qty*100)', "const v=window.IP3ModelMath.chartData('economics-trade',[tariff*100,fx*100,eps]).rows.map(row=>row[1])");
    js=js.replace("$('et-grid').innerHTML=ticks;", "ticks+='<line x1=\"'+left+'\" x2=\"'+right+'\" y1=\"'+Y(100)+'\" y2=\"'+Y(100)+'\" stroke=\"#f0c8aa\" stroke-dasharray=\"5 5\"/><text x=\"'+right+'\" y=\"'+(Y(100)-5)+'\" text-anchor=\"end\">Baseline 100</text>';$('et-grid').innerHTML=ticks;");
  }
  if (m.slug === 'finance-investment') {
    js = replaceFunction(js, 'flow', 'function flow(x,stress){return window.IP3ModelMath.flow(x,stress);}');
    js = replaceFunction(js, 'npv', 'function npv(arr,rate){return window.IP3ModelMath.npv(arr,rate);}');
    js = replaceFunction(js, 'irr', 'function irr(arr){return window.IP3ModelMath.irr(arr);}');
    js = js.replace("sector==='public'?'Illustrative economic NPV':'Illustrative financial NPV'", "'Illustrative NPV'")
      .replace("sector==='public'?'Economic IRR (EIRR)':'Project IRR (FIRR)'", "'Illustrative project IRR'");
    body=body.replace('YEAR 01','YEAR 00').replace('MODEL CASH FLOWS<br/>Hover or focus a bar for values','USD MILLIONS · YEAR 0 INCLUDED<br/>Signed flows; full table below').replace('Illustrative discounted annual cash flows / economic net benefits','Illustrative signed discounted net flows, including Year 0');
    js=js.replace(/ const vals=arr\.slice\(1\)[\s\S]*?(?= \$\('fi-modelnote'\))/, ` const rows=window.IP3ModelMath.chartData('finance-investment',[rate,stress],x).rows,lo=Math.min(0,...rows.map(z=>z[2])),hi=Math.max(1,...rows.map(z=>z[2])),Y=v=>190-(v-lo)/(hi-lo)*160,zero=Y(0),slot=500/rows.length;
 $('fi-bars').innerHTML='<svg viewBox="0 0 560 230" role="img" aria-label="Signed discounted annual flows in USD millions, including negative Year 0 investment. Read all values in the adjacent chart data table."><text x="10" y="14">USD million</text>'+[lo,0,hi].map(v=>'<line x1="48" x2="548" y1="'+Y(v)+'" y2="'+Y(v)+'" stroke="#8aa797" stroke-dasharray="'+(v===0?'none':'3 5')+'"/><text x="43" y="'+(Y(v)+4)+'" text-anchor="end">'+Number(v.toFixed(1))+'</text>').join('')+rows.map((z,i)=>{const x=48+i*slot+slot*.15,y=Math.min(Y(z[2]),zero);return '<g><title>Year '+z[0]+': '+z[2].toFixed(6)+' USD million discounted net flow</title><rect class="xp-cash-bar" style="animation-delay:'+i*25+'ms" x="'+x+'" y="'+y+'" width="'+slot*.7+'" height="'+Math.abs(zero-Y(z[2]))+'" fill="'+(z[2]<0?'#e9b99e':'#b8dfc2')+'" stroke="#ffffff" stroke-width=".5"/><text x="'+(x+slot*.35)+'" y="209" text-anchor="middle">'+z[0]+'</text></g>'}).join('')+'<text x="548" y="227" text-anchor="end">Year</text></svg>';
`);
  }
  if (m.slug === 'market-enterprise') {
    body=body.replace(/<section class="me-shell me-proof me-reveal"[\s\S]*?<\/section>/, '<section class="me-shell me-proof me-reveal" aria-label="Illustrative enterprise research methods"><div class="me-proofbar"><div class="me-proofitem"><strong>01</strong><small>SURVEY DESIGN</small><p>Define enterprise sampling, measurement and data-quality requirements.</p></div><div class="me-proofitem"><strong>02</strong><small>STAKEHOLDER INQUIRY</small><p>Plan interviews and group discussions to investigate mechanisms and constraints.</p></div><div class="me-proofitem"><strong>03</strong><small>TRIANGULATION</small><p>Compare evidence sources and test competing explanations before recommending action.</p></div></div></section>')
      .replace('Cases reflect documented professional project domains where identified. Private-company examples are illustrative unless specifically stated otherwise.', 'All cases describe hypothetical applications. No completed engagement, client endorsement or empirical outcome is asserted.');
    js = js.replace('units=1200*Math.pow(price/120,-elasticity),effectiveCost=cost/(1+prod),contribution=price-effectiveCost,fixed=29000,profit=units*contribution-fixed,revenue=units*price,margin=revenue>0?100*profit/revenue:0,breakEven=contribution>0?Math.ceil(fixed/contribution):Infinity',
      '{units,effectiveCost,contribution,fixed,profit,revenue,margin,breakEven}=window.IP3ModelMath.enterprise(price,cost,prod,elasticity)');
    // Include the full plotted line, not just the selected point, in the y-axis.
    js = js.replace('lo=Math.min(-50000,profit-18000),hi=Math.max(50000,profit+22000)', 'lo=Math.min(-50000,profit-18000,-29000,2500*contribution-fixed-18000),hi=Math.max(50000,profit+22000,2500*contribution-fixed+22000)');
    js = js.replace('const lo=Math.min', 'const xMax=Math.max(2500,Math.ceil(units/500)*500);const lo=Math.min')
      .replaceAll('2500*contribution','xMax*contribution').replace('L+x/2500*(R-L)','L+x/xMax*(R-L)').replace('i*2500/60','i*xMax/60').replace('Math.min(2500,units)','Math.min(xMax,units)')
      .replace("'Modelled monthly operating profit against zero to 2500 units sold.", "'Modelled monthly operating profit against zero to '+xMax+' units sold.");
    js = js.replace("$('me-chart').setAttribute('aria-label'", `document.querySelectorAll('#me-chart text[data-volume-tick]').forEach(node=>{node.textContent=Math.round(Number(node.dataset.volumeTick)*xMax/2500).toLocaleString('en-US')+(node.dataset.volumeSuffix||'')});$('me-chart').setAttribute('aria-label'`);
    body=body.replace(/<text([^>]*y="245"[^>]*)>([\d,]+)( units \/ month)?<\/text>/g,(all,attributes,value,suffix)=>`<text${attributes} data-volume-tick="${value.replaceAll(',','')}" data-volume-suffix="${suffix||''}">${value}${suffix||''}</text>`);
    js=js.replace('for(let i=0;i<=60;i++){const v=i*xMax/60;vals.push({x:X(v),y:Y(v*contribution-fixed)})}', "for(const row of window.IP3ModelMath.chartData('market-enterprise',[price,cost,prod*100,elasticity]).rows)vals.push({x:X(row[0]),y:Y(row[1])});");
    body=body.replace(/(<[^>]*id="me-marker"[^>]*>)/, '<g id="me-break-even"></g>$1');
    js=js.replace("$('me-chartgrid').innerHTML=grid;", `$('me-chartgrid').innerHTML=grid;const crossing=contribution>0?fixed/contribution:Infinity;$('me-break-even').innerHTML=crossing<=xMax?'<line x1="'+X(crossing)+'" x2="'+X(crossing)+'" y1="'+T+'" y2="'+B+'" stroke="#f0c8aa" stroke-dasharray="5 5"/><text x="'+Math.max(110,Math.min(450,X(crossing)))+'" y="'+(B-8)+'" text-anchor="middle">Break-even '+breakEven+' units</text>':'';`);
  }
  if (m.slug === 'development-impact') {
    body=body.replace('The dashed line is a trend-adjusted counterfactual', 'The dotted line is a constructed counterfactual');
    body=body.replace(/Difference.in.differences/g,'Illustrative two-period DiD contrast').replace(/Estimated net effect/g,'Illustrative contrast');
    js=js.replace('Estimated net difference ', 'Illustrative two-period contrast ');
    js = js.replace('deltaT=q-p,deltaC=s-r,did=deltaT-deltaC,cf=p+deltaC', '{deltaT,deltaC,did,cf}=window.IP3ModelMath.impact(p,q,r,s)');
    js = js.replace("'NET DIFFERENCE '+diffDisplay(did)+' pp'", "'NET DIFFERENCE '+diffDisplay(did)+' pp'+(cf<0||cf>100?' · INFEASIBLE COUNTERFACTUAL':'')");
    js = js.replace('Y=v=>yBottom-(v/100)*(yBottom-yTop)', 'yMin=Math.min(0,Math.floor(cf/20)*20),yMax=Math.max(100,Math.ceil(cf/20)*20),Y=v=>yBottom-((v-yMin)/(yMax-yMin))*(yBottom-yTop)');
    js = js.replace('let n=i*20,y=Y(n)', 'let n=yMin+i*(yMax-yMin)/5,y=Y(n)');
  }
  if (m.slug === 'policy-governance') {
    js = js.replace(/const baselineCore=1\.5,[\s\S]*?const saved=\(baseline-after\)\*vol\*12, percent=\(baseline-after\)\/baseline\*100, value=saved\*650;/,
      'const {baselineCore,baselineRework,baseline,newCore,newRework,after,saved,percent,value}=window.IP3ModelMath.governance(steps,dig,rw,vol);');
    body=body.replace('<defs>', '<defs><pattern id="pg-rework-hatch" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="#d8a187"/><path d="M-2 2L2 -2M0 7L7 0M5 9L9 5" stroke="#653927" stroke-width="1.2"/></pattern>')
      .replace(/fill="#d8a187"( height="38" id="pg-bar-(?:before|after)-rework")/g,'fill="url(#pg-rework-hatch)"$1');
    body=body.replace('<rect fill="#d8a187" height="5"', '<rect fill="url(#pg-rework-hatch)" height="5"');
  }
  if (m.slug === 'management-delivery') {
    js = replaceFunction(js, 'rate', 'function rate(team,availability,rework,depend){return window.IP3ModelMath.deliveryRate(team,availability,rework,depend);}');
    js = js.replace('const px=week=>60+(week/HORIZON)*474', 'const chartHorizon=Math.max(HORIZON,Math.ceil(duration/12)*12);document.querySelectorAll("#md-chart text").forEach(node=>{if(/^\\d+w$/.test(node.textContent))node.textContent=Math.round(parseInt(node.dataset.originalWeek||(node.dataset.originalWeek=node.textContent),10)*chartHorizon/HORIZON)+"w"});\n const px=week=>60+(week/chartHorizon)*474')
      .replace('w<=HORIZON','w<=chartHorizon').replace('Math.min(HORIZON,TOTAL/r)', 'Math.min(chartHorizon,TOTAL/r)').replace("' weeks. Display chart covers 48 weeks.'", "' weeks. Display chart covers '+chartHorizon+' weeks.'");
    js = js.replace('/^\\d+w$/.test(node.textContent)', 'node.getAttribute("y")==="280"').replace('+"w"', '+(node.getAttribute("x")==="534"?" weeks":"")');
    js = js.replace("' completed packages per week, target 24 weeks. Display chart covers 48 weeks.'", "' completed packages per week, target 24 weeks. Display chart covers '+chartHorizon+' weeks.'");
    js = js.replace('const makePath=rt=>', `$('md-target-line').setAttribute('x1',px(TARGET));$('md-target-line').setAttribute('x2',px(TARGET));$('md-target-area').setAttribute('width',px(TARGET)-60);$('md-target-label').setAttribute('x',px(TARGET)+9);\n const makePath=rt=>`);
  }
  // No iframe messaging or resize loop survives the native migration.
  for (const name of ['notifySize', 'sendSize', 'syncHeight', 'size']) if (js.includes(`function ${name}(`)) js = replaceFunction(js, name, `function ${name}(){}`);
  js = js.replace(/if\(new URLSearchParams\(location.search\)\.has\('embed'\)\)document.body.classList.add\('[^']+'\);?/g, '');
  const timer = m.prefix === 'et' ? 'cycle' : m.prefix === 'fi' || m.prefix === 'di' ? 'timer' : 'interval';
  const restart = m.prefix === 'fi' ? 'restartTour' : m.prefix === 'di' ? 'startTour' : 'restart';
  js = js.replace(`function ${restart}(){`, `function ${restart}(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)tour=false;`);
  js = js.replaceAll('CV-linked assignments identify documented project contexts.', 'These hypothetical applications illustrate analytical methods.')
    .replaceAll('The cited CV engagement documents a real research context.', 'This application and its research pathway are illustrative.')
    .replaceAll('The reference points to a documented CV engagement.', 'The reference describes an illustrative analytical application.')
    .replaceAll('Workflows draw on CV project contexts.', 'Workflows are hypothetical analytical examples.')
    .replaceAll('CV-linked research context', 'Illustrative analytical context');
  js=js.replaceAll('Documented project contexts are identified.', 'All applications are hypothetical.')
    .replaceAll('This is a strategy illustration or CV-referenced research domain', 'This is a hypothetical strategy illustration')
    .replaceAll('informed by documented work—not a claim of completed company work or verified impact', 'using synthetic assumptions, with no claim of completed company work or verified impact')
    .replaceAll('The reference points to a documented professional engagement.', 'The reference describes a hypothetical analytical application.');
  const tourId = m.prefix === 'di' ? 'di-tour' : `${m.prefix}-tour`;
  const benchId = m.prefix === 'di' ? 'di-workbench' : `${m.prefix}-workbench`;
  const stateKey = m.prefix === 'et' || m.prefix === 'me' ? 'theme' : m.prefix === 'fi' ? 'key' : 'active';
  const lifecycle = `
  // Native page lifecycle: tours stop on reader intervention, focus, visibility or leaving the viewport.
  function stopNativeTour(){tour=false;clearInterval(${timer});${restart}();}
  const nativeRoot=document.querySelector('.ip3-model');
  nativeRoot.addEventListener('pointerdown',e=>{if(!e.target.closest('#${tourId}'))stopNativeTour();},true);
  nativeRoot.addEventListener('keydown',e=>{if(!e.target.closest('#${tourId}'))stopNativeTour();},true);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopNativeTour();});
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{if(!es[0].isIntersecting)stopNativeTour();},{threshold:0}).observe($('${benchId}'));
  const query=new URLSearchParams(location.search),entry=query.get('context');
  if(entry==='public'||entry==='private')setCase(${stateKey},entry,false);
  nativeRoot.addEventListener('change',()=>nativeRoot.dispatchEvent(new CustomEvent('ip3:model-update')));
  nativeRoot.dispatchEvent(new CustomEvent('ip3:model-ready',{bubbles:true}));
`;
  const end = js.lastIndexOf('})();');
  if (end < 0) throw new Error('Missing IIFE end');
  js = js.slice(0, end) + lifecycle + js.slice(end);
  fs.writeFileSync(path.join(out, `${m.slug}.html`), body.trim() + '\n');
  fs.writeFileSync(path.join(out, `${m.slug}.css`), css.trim() + '\n');
  fs.writeFileSync(path.join(out, `${m.slug}.js`), js.trim() + '\n');
  fs.writeFileSync(path.join(out, `${m.slug}.json`), JSON.stringify({ order, cases }, null, 2) + '\n');
  manifest.push({ slug: m.slug, sha256: crypto.createHash('sha256').update(original).digest('hex'), cases: order.length * 2 });
}
fs.writeFileSync(path.join(root, 'reference-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`Extracted ${manifest.length} native experiences; ${manifest.reduce((n,m)=>n+m.cases,0)} scenario variants preserved.`);
