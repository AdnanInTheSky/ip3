(function(){
  'use strict';
  const root=document.querySelector('.ip3-model');if(!root)return;
  const slug=root.dataset.model,button=document.querySelector('[data-model-motion]'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let quiet=reduce.matches;
  const visible=new WeakMap();
  const pictures=[...root.querySelectorAll('.di-orbit,.me-ecosystem,.et-network,.fi-hero-art,.di-workbench,.me-workbench,.et-workbench,.fi-workbench')];
  function syncMotion(){const pause=quiet||reduce.matches||document.hidden;root.classList.toggle('is-quiet',pause);button.setAttribute('aria-pressed',String(quiet));button.textContent=quiet?'Enable motion':'Pause motion';pictures.forEach(el=>{const stop=pause||visible.get(el)===false;el.toggleAttribute('data-animation-off',stop);el.querySelectorAll('svg').forEach(svg=>{if(stop)svg.pauseAnimations?.();else svg.unpauseAnimations?.()})});}
  button.addEventListener('click',()=>{quiet=!quiet;syncMotion();if(quiet)root.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))});document.addEventListener('visibilitychange',syncMotion);reduce.addEventListener('change',()=>{quiet=reduce.matches;syncMotion()});if('IntersectionObserver'in window){const observer=new IntersectionObserver(es=>{es.forEach(e=>visible.set(e.target,e.isIntersecting));syncMotion()});pictures.forEach(el=>observer.observe(el))}syncMotion();
  const $=id=>document.getElementById(id),text=id=>$(id)?.textContent.trim()||'',number=id=>Number($(id).value),M=window.IP3ModelMath;
  const configs={
    'economics-trade':{ids:['et-tariff','et-fx','et-elasticity'],outputs:[['Export volume index','et-volume'],['USD receipts index','et-usd'],['Local receipts index','et-local'],['Buyer price index','et-price']]},
    'finance-investment':{ids:['fi-rate','fi-stress'],outputs:[['Illustrative NPV','fi-npv'],['Illustrative project IRR','fi-irr'],['Initial investment','fi-capex']]},
    'market-enterprise':{ids:['me-price','me-cost','me-productivity','me-elasticity'],outputs:[['Monthly operating profit','me-profit'],['Operating margin','me-margin'],['Break-even volume','me-breakeven'],['Unit contribution','me-contrib']]},
    'development-impact':{ids:['di-tpre','di-tpost','di-cpre','di-cpost'],outputs:[['Illustrative two-period DiD contrast (pp)','di-did'],['Treated change (pp)','di-gain'],['Comparison change (pp)','di-controlgain'],['Counterfactual (%)','di-counterfactual']]},
    'policy-governance':{ids:['pg-steps','pg-digital','pg-rework','pg-volume'],outputs:[['Annual hours released','pg-hours'],['Workload change','pg-reduction'],['Staff-time opportunity value (not budget savings)','pg-value'],['Reformed hours per case','pg-after']]},
    'management-delivery':{ids:['md-team','md-available','md-rework','md-depend'],outputs:[['Illustrative duration','md-weeks'],['Relative to 24-week target','md-gap'],['Packages per week','md-rate'],['Relative throughput','md-lift']]},
  };
  const cfg=configs[slug],protocol=JSON.parse(root.querySelector('[data-model-protocol]').textContent);
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=id=>({
    'et-tariff':'Additional tariff (%)','et-fx':'FX depreciation (%)','et-elasticity':'Demand elasticity',
    'fi-rate':'Discount rate (%)','fi-stress':'Benefit/cost stress (%)',
    'me-price':'Price (USD/unit)','me-cost':'Variable cost (USD/unit)','me-productivity':'Productivity uplift (%)','me-elasticity':'Demand elasticity',
    'di-tpre':'Treated baseline (%)','di-tpost':'Treated endline (%)','di-cpre':'Comparison baseline (%)','di-cpost':'Comparison endline (%)',
    'pg-steps':'Steps removed (of 10)','pg-digital':'Digital uptake (%)','pg-rework':'Rework rate (%)','pg-volume':'Applications per month',
    'md-team':'Team size (people)','md-available':'Availability (%)','md-rework':'Rework (%)','md-depend':'Dependency drag (%)'
  }[id]||id);
  cfg.ids.forEach(id=>{const input=$(id);if(!input.getAttribute('aria-label')&&!input.labels?.length)input.setAttribute('aria-label',label(id))});
  function snapshot(){
    const key=root.querySelector('[data-case][aria-selected=true]').dataset.case,context=root.querySelector('[data-sector][aria-pressed=true]').dataset.sector,scenario=protocol.cases[key][context];
    const inputs=protocol.inputs.map(x=>({...x,label:label(x.id),default:slug==='finance-investment'&&x.id==='fi-rate'?scenario.rate:x.default,value:number(x.id)}));
    return {protocol:protocol.protocol,calculationVersion:protocol.revision,model:slug,title:protocol.title,evidenceStatus:protocol.provenance.status,scenario:{key,context,title:scenario.title},provenance:protocol.provenance,method:protocol.method,formula:protocol.formula,limits:protocol.limits,guidance:protocol.guidance,inputs,financeAssumptions:slug==='finance-investment'?{capex:scenario.capex,benefit:scenario.benefit,opex:scenario.opex,years:scenario.years,currency:'USD million'}:undefined,results:cfg.outputs.map(([measure,id])=>({measure,displayValue:text(id)})),chart:M.chartData(slug,inputs.map(x=>x.value),scenario)};
  }
  function table(caption,headers,rows){return '<table class="xp-results-table"><caption>'+safe(caption)+'</caption><thead><tr>'+headers.map(h=>'<th scope="col">'+safe(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((v,i)=>'<'+(i?'td':'th scope="row"')+'>'+safe(typeof v==='number'?Number(v.toFixed(6)):v)+'</'+(i?'td':'th')+'>').join('')+'</tr>').join('')+'</tbody></table>'}
  let lastState='';
  function render(){
    const s=snapshot(),summary=root.querySelector('[data-model-summary]');
    const state=JSON.stringify([s.scenario,s.inputs.map(x=>x.value),s.results]);
    // Keep unchanged table nodes stable for keyboard and assistive-technology readers.
    if(state===lastState)return;lastState=state;
    summary.textContent='Current illustrative results: '+s.results.map(r=>r.measure+': '+r.displayValue).join('; ')+'.';
    if(slug==='development-impact'){const result=M.impact(...cfg.ids.map(number));if(!result.feasible)summary.textContent+=' Warning: counterfactual outside 0–100%; the chosen inputs do not describe a feasible percentage counterfactual.';summary.textContent+=' Illustrative two-period contrast only; no causal effect or confidence interval established.'}
    root.querySelector('[data-model-table]').innerHTML=table('Current results in text',['Measure','Illustrative value'],s.results.map(r=>[r.measure,r.displayValue]))+table(s.chart.title,s.chart.headers,s.chart.rows);
    root.querySelector('[data-model-inputs]').innerHTML=table('Current controls and selected-case defaults',['Input and unit','Current','Reset default','Allowed range'],s.inputs.map(x=>[x.label,x.value,x.default,x.min+'–'+x.max]));
  }
  root.querySelector('[data-model-reset]').addEventListener('click',()=>{
    root.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    const s=snapshot();s.inputs.forEach(x=>{$(x.id).value=x.default;$(x.id).dispatchEvent(new Event('input',{bubbles:true}))});render();root.querySelector('[data-model-action-status]').textContent='Selected case defaults restored. Scenario and audience retained; tour paused.';
  });
  root.querySelectorAll('[data-model-export]').forEach(button=>button.addEventListener('click',()=>{
    render();const s=snapshot(),format=button.dataset.modelExport;let body;
    if(format==='json')body=JSON.stringify(s,null,2)+'\n';
    else{
      const rows=[['record_type','name','coordinate','measure','value'],['metadata','evidence_status','','',s.evidenceStatus],['metadata','model','','',s.model],['metadata','calculation_version','','',s.calculationVersion],['metadata','protocol','','',s.protocol],['metadata','scenario',s.scenario.context,s.scenario.key,s.scenario.title],['metadata','method','','',s.method],['metadata','formula','','',s.formula],['metadata','limits','','',s.limits],['metadata','parameter_origin','','',s.provenance.parameterOrigin],['metadata','calibration','','',s.provenance.calibration],['metadata','domain_review','','',s.provenance.domainReview],['metadata','reference_sha256','','',s.provenance.referenceSHA256],['metadata','claim_approval','','',s.provenance.claimApproval],...s.provenance.methodReferences.flatMap(r=>[['reference',r.label,r.url,r.role,r.publicationDate],['reference_author',r.label,r.url,'author_or_publisher',r.author]]),...s.inputs.flatMap(x=>[['input',x.id,x.label,'current',x.value],['input',x.id,x.label,'reset_default',x.default]]),...Object.entries(s.financeAssumptions||{}).map(([k,v])=>['fixed_assumption',k,'','',v]),...s.results.map(r=>['result',r.measure,'','display_value',r.displayValue]),...s.chart.rows.flatMap(row=>row.slice(1).map((v,i)=>['chart',s.chart.title,row[0],s.chart.headers[i+1],v]))];
      const cell=v=>'"'+String(typeof v==='string'&&/^[=+@-]/.test(v)?"'"+v:v).replace(/"/g,'""')+'"';body='\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
    }
    const url=URL.createObjectURL(new Blob([body],{type:format==='json'?'application/json':'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='ip3-synthetic-'+slug+'-'+s.scenario.key+'-'+s.scenario.context+'-'+s.calculationVersion+'.'+format;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);root.querySelector('[data-model-action-status]').textContent='Synthetic '+format.toUpperCase()+' download prepared with current assumptions and calculation version. This is not a validated finding.';
  }));
  let pending;
  const schedule=()=>{clearTimeout(pending);pending=setTimeout(render,100)};
  root.addEventListener('input',schedule);root.addEventListener('click',schedule);root.addEventListener('keydown',schedule);
  const output=$(cfg.outputs[0][1]);if(output)new MutationObserver(schedule).observe(output,{childList:true,subtree:true,characterData:true});render();
})();
