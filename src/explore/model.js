(function(){
  'use strict';
  const root=document.querySelector('.ip3-model');if(!root)return;
  const slug=root.dataset.model,button=document.querySelector('[data-model-motion]'),reduce=matchMedia('(prefers-reduced-motion: reduce)');let quiet=reduce.matches;
  const visible=new WeakMap();
  const pictures=[...root.querySelectorAll('.di-orbit,.me-ecosystem,.et-network,.fi-hero-art,.di-workbench,.me-workbench,.et-workbench,.fi-workbench')];
  function syncMotion(){const pause=quiet||reduce.matches||document.hidden;root.classList.toggle('is-quiet',pause);button.setAttribute('aria-pressed',String(quiet));button.textContent=quiet?'Enable motion':'Pause motion';pictures.forEach(el=>{const stop=pause||visible.get(el)===false;el.toggleAttribute('data-animation-off',stop);el.querySelectorAll('svg').forEach(svg=>{if(stop)svg.pauseAnimations?.();else svg.unpauseAnimations?.()})});}
  button.addEventListener('click',()=>{quiet=!quiet;syncMotion();if(quiet)root.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))});document.addEventListener('visibilitychange',syncMotion);reduce.addEventListener('change',()=>{quiet=reduce.matches;syncMotion()});if('IntersectionObserver'in window){const observer=new IntersectionObserver(es=>{es.forEach(e=>visible.set(e.target,e.isIntersecting));syncMotion()});pictures.forEach(el=>observer.observe(el))}syncMotion();
  const protocol=JSON.parse(root.querySelector('[data-model-protocol]').textContent),reset=document.querySelector('[data-model-reset]'),status=document.querySelector('[data-model-status]');
  reset.addEventListener('click',()=>{
    root.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    const selected=root.querySelector('[data-case][aria-selected=true]'),audience=root.querySelector('[data-sector][aria-pressed=true]');
    const scenario=protocol.cases[selected.dataset.case][audience.dataset.sector];
    protocol.inputs.forEach(item=>{
      const input=document.getElementById(item.id),value=slug==='finance-investment'&&item.id==='fi-rate'?scenario.rate:item.default;
      input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));
    });
    status.textContent='Selected case defaults restored. Your selected scenario and audience stay the same.';
  });
})();
