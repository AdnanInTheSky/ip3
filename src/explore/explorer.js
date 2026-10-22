(function(){
  'use strict';
  const section=document.querySelector('[data-explorer]');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(section){
    const data=JSON.parse(section.querySelector('[data-xp-data]').textContent);let current=data[0].slug,context='public',quiet=reduce.matches;
    const find=selector=>section.querySelector(selector);
    const inputs={
      'economics-trade':['Additional tariff (%)',0,30,1,12,'FX +8%, elasticity 1.5, baseline index 100.'],
      'finance-investment':['Discount rate (%)',4,14,.5,8,'Year 0 investment $65m; annual benefit $14.2m less operating cost $2.3m for 18 years.'],
      'market-enterprise':['Productivity uplift (%)',0,30,1,8,'Price $125, unit cost $78, fixed cost $29,000/month; base demand 1,200 at $120; elasticity 1.3.'],
      'development-impact':['Treated endline (%)',0,100,1,74,'Treated baseline 46%; comparison baseline 43%, endline 56%. Arithmetic does not establish causality.'],
      'policy-governance':['Digital uptake (%)',0,100,5,65,'Three steps removed, rework 12%, 3,000 cases/month. Staff time is not budget saving.'],
      'management-delivery':['Team size (people)',5,20,1,12,'120 packages; availability 80%, rework 14%, dependency drag 12%; 0.75 packages/person/week.']
    };
    function calculate(){const v=Number(find('[data-xp-factor]').value);let result='';
      if(current==='economics-trade'){const p=1-.6*.08/1.08;result='Illustrative export volume index: '+(100*((1+v/100)*p)**-1.5).toFixed(1)}
      if(current==='finance-investment'){const r=v/100,x=context==='public'?[65,11.9,18]:[25,5.7,10];result='Illustrative NPV: $'+(x[1]*(1-(1+r)**-x[2])/r-x[0]).toFixed(1)+'m'}
      if(current==='market-enterprise'){const profit=1200*(125/120)**-1.3*(125-78/(1+v/100))-29000;result='Illustrative monthly profit: $'+Math.round(profit).toLocaleString('en-US')}
      if(current==='development-impact')result='Illustrative DiD: '+(v-46-(56-43))+' percentage points';
      if(current==='policy-governance')result='Illustrative annual hours released: '+Math.round((2.028-(1.5*(1-.065*3)*(1-.36*v/100)+.12*2.2))*3000*12).toLocaleString('en-US');
      if(current==='management-delivery')result='Illustrative duration: '+Math.ceil(120/(v*.75*.8*(1-.12)/(1+.14)))+' weeks';
      find('[data-xp-result]').textContent=result; // Concept maps intentionally do not encode slider values.
    }
    function update(){const m=data.find(d=>d.slug===current),c=m[context];find('[data-xp-kicker]').textContent=m.title;find('[data-xp-question]').textContent=c[1];find('[data-xp-visual]').innerHTML=m.visual;find('[data-xp-link]').href='/explore/'+m.slug+'?context='+context;section.querySelectorAll('[data-xp-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.xpSelect===current)));section.querySelectorAll('[data-xp-context]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.xpContext===context)));const spec=inputs[current],input=find('[data-xp-factor]');input.min=spec[1];input.max=spec[2];input.step=spec[3];input.value=spec[4];find('[data-xp-input-label]').textContent=spec[0];find('[data-xp-assumptions]').textContent='Synthetic assumptions: '+(current==='finance-investment'&&context==='private'?'Year 0 investment $25m; annual net flow $5.7m for 10 years.':spec[5]);calculate();motion();}
    function motion(){section.classList.toggle('is-quiet',quiet||reduce.matches||document.hidden||!section.dataset.inView);const b=find('[data-xp-motion]');b.setAttribute('aria-pressed',String(quiet));b.textContent=quiet?'Enable motion':'Pause motion';}
    section.querySelectorAll('[data-xp-select]').forEach(b=>b.addEventListener('click',()=>{current=b.dataset.xpSelect;update()}));section.querySelectorAll('[data-xp-context]').forEach(b=>b.addEventListener('click',()=>{context=b.dataset.xpContext;update()}));find('[data-xp-motion]').addEventListener('click',()=>{quiet=!quiet;motion()});find('[data-xp-factor]').addEventListener('input',calculate);
    document.addEventListener('visibilitychange',motion);reduce.addEventListener('change',()=>{quiet=reduce.matches;motion()});if('IntersectionObserver'in window)new IntersectionObserver(es=>{section.dataset.inView=es[0].isIntersecting?'yes':'';motion()}).observe(section);else section.dataset.inView='yes';update();
  }
  const tourButton=document.querySelector('[data-hub-tour]');
  if(tourButton){const cards=[...document.querySelectorAll('[data-hub-case]')],status=document.querySelector('[data-hub-status]');let active=false,index=0,timer;
    function stop(){active=false;clearInterval(timer);tourButton.setAttribute('aria-pressed','false');tourButton.textContent='Start guided tour';cards.forEach(c=>c.classList.remove('is-tour-current'));status.textContent='Tour paused. Explore at your own pace.';}
    function show(){cards.forEach((c,i)=>c.classList.toggle('is-tour-current',i===index));cards[index].scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'center'});status.textContent='Scenario '+(index+1)+' of '+cards.length;index=(index+1)%cards.length;}
    tourButton.addEventListener('click',()=>{if(active){stop();return}active=true;tourButton.setAttribute('aria-pressed','true');tourButton.textContent='Pause guided tour';show();if(!reduce.matches)timer=setInterval(show,15000);else{status.textContent='Reduced motion: first scenario highlighted. Follow its link or choose another discipline.';active=false;tourButton.setAttribute('aria-pressed','false');tourButton.textContent='Start guided tour';}});
    ['pointerdown','keydown','wheel','touchstart','focusin'].forEach(event=>document.addEventListener(event,e=>{if(active&&!e.target.closest('[data-hub-tour]'))stop()},{passive:true}));document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});reduce.addEventListener('change',stop);
  }
})();
