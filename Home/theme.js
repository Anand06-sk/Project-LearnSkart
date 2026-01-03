(function(){
  function updateThemeIcon(mode){
    try{
      var toggles = document.querySelectorAll('.theme-btn, .theme-toggle, .theme-button');
      toggles.forEach(function(btn){
        var icon = btn.querySelector('i');
        if(icon){ icon.className = mode === 'dark' ? 'fas fa-sun' : 'fas fa-moon'; }
        
        // Update text content for buttons that have text (mobile menu button)
        var textNodes = [];
        for(var i = 0; i < btn.childNodes.length; i++){
          if(btn.childNodes[i].nodeType === 3){ // Text node
            textNodes.push(btn.childNodes[i]);
          }
        }
        textNodes.forEach(function(textNode){
          var text = textNode.textContent.trim();
          if(text === 'Dark Mode' || text === 'Light Mode'){
            textNode.textContent = mode === 'dark' ? '\n                Light Mode\n            ' : '\n                Dark Mode\n            ';
          }
        });
      });
    }catch(e){/* ignore */}
  }
  function applyTheme(mode){
    try{
      // Toggle html.dark (theme.css uses this)
      if(mode === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');

      // Also toggle body.dark-mode (Home/style.css uses this)
      var body = document.body;
      if(body){
        if(mode === 'dark') body.classList.add('dark-mode');
        else body.classList.remove('dark-mode');
      }

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

  // Inject theme.css from the same directory as this script
  try{
    // Get the script's source path to determine where theme.css is
    var scripts = document.querySelectorAll('script[src*="theme.js"]');
    var scriptPath = scripts.length > 0 ? scripts[scripts.length - 1].src : '';
    if(scriptPath){
      var themeCssPath = scriptPath.replace('theme.js', 'theme.css');
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = themeCssPath;
      document.head.appendChild(link);
    }
  }catch(e){}

  // Hide any existing theme toggle on non-index pages, show only on index
  try{
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
      // Force dark mode reapplication for all elements
      if(mode === 'dark'){
        document.documentElement.classList.add('dark');
        if(document.body){ document.body.classList.add('dark-mode'); }
        // Apply dark mode to all dynamically added content
        var observer = new MutationObserver(function(mutations){
          mutations.forEach(function(mutation){
            if(mutation.addedNodes.length){
              mutation.addedNodes.forEach(function(node){
                if(node.nodeType === 1){
                  if(getStored() === 'dark'){
                    if(!document.documentElement.classList.contains('dark')){
                      document.documentElement.classList.add('dark');
                    }
                    if(document.body && !document.body.classList.contains('dark-mode')){
                      document.body.classList.add('dark-mode');
                    }
                  }
                }
              });
            }
          });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      }
    }catch(e){}
  }, 50);

  // Re-apply theme when page fully loads to ensure all elements are styled
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      try{
        var mode = getStored();
        applyTheme(mode);
      }catch(e){}
    });
  }

  // Also apply on window load for late-loaded content
  window.addEventListener('load', function(){
    try{
      var mode = getStored();
      applyTheme(mode);
    }catch(e){}
  }, false);
})();
