(function(){
  function updateThemeIcon(mode){
    try{
      var btn = document.querySelector('.theme-btn, .theme-toggle, .theme-button');
      if(btn){
        var icon = btn.querySelector('i');
        if(icon){
          icon.className = mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
      }
    }catch(e){/* ignore */}
  }
  function applyTheme(mode){
    try{
      if(mode === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      updateThemeIcon(mode);
    }catch(e){/* ignore */}
  }
  function getStored(){ try{return localStorage.getItem('site-theme')||'light'}catch(e){return 'light'} }
  function setStored(m){ try{localStorage.setItem('site-theme',m)}catch(e){} }
  window.theme = {
    init: function(){ applyTheme(getStored()); },
    toggle: function(){ var cur = getStored(); var next = cur==='dark'?'light':'dark'; setStored(next); applyTheme(next); },
    set: function(m){ setStored(m); applyTheme(m); }
  };
  // auto-init immediately
  try{applyTheme(localStorage.getItem('site-theme')||'light')}catch(e){}

  // Hide any existing theme toggle on non-index pages, show only on index
  try{
    // Try to inject theme.css using several relative paths so pages across folders pick it up
    ['.','..','..\\..'].forEach(function(p){
      var l = document.createElement('link'); l.rel='stylesheet'; l.href = p + '/theme.css'; l.onerror = function(){}; document.head.appendChild(l);
    });

    var p = (location.pathname||'').toLowerCase();
    var isIndex = p.endsWith('/index.html') || p === '/' || p.endsWith('\\index.html') || p === '';
    document.querySelectorAll('.theme-toggle, .theme-button, .theme-btn').forEach(function(el){
      if(isIndex) el.style.display = '';
      else el.style.display = 'none';
    });
    // If index page has no toggle element, inject a small floating button
    if(isIndex){
      if(!document.querySelector('.theme-toggle') && !document.querySelector('.theme-button')){
        var btn = document.createElement('button');
        btn.className = 'theme-button';
        btn.title = 'Toggle theme';
        btn.style.position = 'fixed';
        btn.style.right = '16px';
        btn.style.bottom = '16px';
        btn.style.zIndex = 9999;
        btn.style.padding = '10px 12px';
        btn.style.borderRadius = '8px';
        btn.style.boxShadow = '0 6px 18px rgba(2,6,23,0.2)';
        btn.innerText = 'Theme';
        btn.addEventListener('click', function(){ window.theme.toggle(); });
        document.body.appendChild(btn);
      } else {
        // wire existing toggle elements to theme.toggle
        var existing = document.querySelectorAll('.theme-toggle, .theme-button, .theme-btn');
        existing.forEach(function(el){
          if(!el.__themeListenerAdded){
            el.addEventListener('click', function(e){ e.preventDefault(); window.theme.toggle(); });
            el.__themeListenerAdded = true;
          }
        });
      }
    }
  }catch(e){}
  
  // Also init icons after a small delay to ensure DOM is ready
  setTimeout(function(){
    try{
      var mode = getStored();
      updateThemeIcon(mode);
    }catch(e){}
  }, 50);
})();
