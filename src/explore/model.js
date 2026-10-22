(function(){
  'use strict';
  const root=document.querySelector('.ip3-model');if(!root)return;
  const slug=root.dataset.model,button=document.querySelector('[data-model-motion]'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let quiet=reduce.matches;
  const visible=new WeakMap();
  const pictures=[...root.querySelectorAll('.di-orbit,.me-ecosystem,.et-network,.fi-hero-art')];
  function syncMotion(){const pause=quiet||reduce.matches||document.hidden;root.classList.toggle('is-quiet',pause);button.setAttribute('aria-pressed',String(quiet));button.textContent=quiet?'Enable motion':'Pause motion';pictures.forEach(el=>{const stop=pause||visible.get(el)===false;el.toggleAttribute('data-animation-off',stop);el.querySelectorAll('svg').forEach(svg=>{if(stop)svg.pauseAnimations?.();else svg.unpauseAnimations?.()})});}
  button.addEventListener('click',()=>{quiet=!quiet;syncMotion();if(quiet)root.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))});document.addEventListener('visibilitychange',syncMotion);reduce.addEventListener('change',()=>{quiet=reduce.matches;syncMotion()});if('IntersectionObserver'in window){const observer=new IntersectionObserver(es=>{es.forEach(e=>visible.set(e.target,e.isIntersecting));syncMotion()});pictures.forEach(el=>observer.observe(el))}syncMotion();
  const $=id=>document.getElementById(id),text=id=>$(id)?.textContent.trim()||'',number=id=>Number($(id).value),M=window.IP3ModelMath;
  const configs={
    'economics-trade':{ids:['et-tariff','et-fx','et-elasticity'],outputs:[['Export volume index','et-volume'],['USD receipts index','et-usd'],['Local receipts index','et-local'],['Buyer price index','et-price']]},
    'finance-investment':{ids:['fi-rate','fi-stress'],outputs:[['Illustrative NPV','fi-npv'],['Illustrative project IRR','fi-irr'],['Initial investment','fi-capex']]},
    'market-enterprise':{ids:['me-price','me-cost','me-productivity','me-elasticity'],outputs:[['Monthly operating profit','me-profit'],['Operating margin','me-margin'],['Break-even volume','me-breakeven'],['Unit contribution','me-contrib']]},
    'development-impact':{ids:['di-tpre','di-tpost','di-cpre','di-cpost'],outputs:[['Difference in differences (pp)','di-did'],['Treated change (pp)','di-gain'],['Comparison change (pp)','di-controlgain'],['Counterfactual (%)','di-counterfactual']]},
    'policy-governance':{ids:['pg-steps','pg-digital','pg-rework','pg-volume'],outputs:[['Annual hours released','pg-hours'],['Workload change','pg-reduction'],['Staff-time opportunity value (not budget savings)','pg-value'],['Reformed hours per case','pg-after']]},
    'management-delivery':{ids:['md-team','md-available','md-rework','md-depend'],outputs:[['Illustrative duration','md-weeks'],['Relative to 24-week target','md-gap'],['Packages per week','md-rate'],['Relative throughput','md-lift']]},
  };
  const cfg=configs[slug];
  cfg.ids.forEach(id=>{const input=$(id);if(!input.getAttribute('aria-label')&&!input.labels?.length){const label=input.closest('label')?.textContent||id.replace(/^(et|fi|me|di|pg|md)-/,'').replace(/-/g,' ');input.setAttribute('aria-label',label.trim())}});
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(){
    const rows=cfg.outputs.map(([label,id])=>[label,text(id)]);
    const summary=document.querySelector('[data-model-summary]');summary.textContent='Current illustrative results: '+rows.map(r=>r[0]+': '+r[1]).join('; ')+'.';
    if(slug==='development-impact'){const result=M.impact(...cfg.ids.map(number));if(!result.feasible)summary.textContent+=' Warning: counterfactual outside 0–100%; the chosen inputs do not describe a feasible percentage counterfactual.';}
    const container=document.querySelector('[data-model-table]');
    let html='<table class="xp-results-table"><caption>Current results in text</caption><thead><tr><th scope="col">Measure</th><th scope="col">Illustrative value</th></tr></thead><tbody>'+rows.map(([label,value])=>'<tr><th scope="row">'+safe(label)+'</th><td>'+safe(value)+'</td></tr>').join('')+'</tbody></table>';
    if(slug==='finance-investment'){
      const scenario=JSON.parse(root.querySelector('[data-finance-cases]').textContent),key=root.querySelector('[data-case][aria-selected=true]').dataset.case,sector=root.querySelector('[data-sector][aria-pressed=true]').dataset.sector;
      const values=M.flow(scenario[key][sector],number('fi-stress')),r=number('fi-rate')/100;
      html+='<details><summary>Full annual cash-flow table, including Year 0</summary><table class="xp-results-table"><caption>Cash-flow assumptions in USD millions</caption><thead><tr><th scope="col">Year</th><th scope="col">Net flow</th><th scope="col">Discounted flow</th></tr></thead><tbody>'+values.map((v,year)=>'<tr><th scope="row">'+year+'</th><td>'+v.toFixed(3)+'</td><td>'+(v/(1+r)**year).toFixed(3)+'</td></tr>').join('')+'</tbody></table></details>';
    }
    container.innerHTML=html;
  }
  let pending;
  root.addEventListener('input',()=>{clearTimeout(pending);pending=setTimeout(render,150)});root.addEventListener('click',()=>{clearTimeout(pending);pending=setTimeout(render,0)});root.addEventListener('keydown',()=>{clearTimeout(pending);pending=setTimeout(render,0)});
  // Observe text-only scenario refreshes initiated by an opted-in automatic tour.
  const output=$(cfg.outputs[0][1]);if(output)new MutationObserver(()=>{clearTimeout(pending);pending=setTimeout(render,150)}).observe(output,{childList:true,subtree:true,characterData:true});render();
})();
