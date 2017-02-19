/**
 * Modulok betöltését kezelő objektum.
 * 
 * Segítségével dinamikusan tölthetünk be javascript fájlokat, továbbá
 * elkerülhetőek a fájlok többszörös betöltései is.   
 */ 
var ModuleManager = 
{
  /**
   * Modul betöltése.
   * TOTO: - loaders tömb elemeinek törlése használat után
   *       - loaders tömb lecserélése láncolt listára (nem fontos)       
   * 
   * @param modulesURL {Array of string} betöltendő modulok elérési útjai
   * @param onCompleteFunction {function()?undefined} a betöltés után lefuttatandó metódus         
   */     
  load : function(modulesURL,onCompleteFunction)
  {
    // Ha még nincs inicializálva az objektum, akkor megtesszük
    if (('boolean' !== typeof(this.init)) || (false === this.init))
    {
      // Modulokat tároló tömb
      this.modules = new Array();
      // Betöltő objektumokat tároló tömb
      this.loaders = new Array();
      
      // Modulok elérési útjához előállítjuk az alkalmazásunk elérési útját
      var s = document.URL.split('/');
      this.rootPath = '';
      for (var i = 0; i < s.length-1; i++)
        this.rootPath += s[i]+'/';
        
      // Modul betöltési információinak megjelenítéséért felelős tároló létrehozása
      this.loadingDiv = document.createElement('div');
      this.loadingDiv.style.position = 'absolute';
      this.loadingDiv.style.top = this.loadingDiv.style.left = '0px';
      this.loadingDiv.style.backgroundColor = 'red';
      this.loadingDiv.style.zIndex = 5000;
      //document.body.appendChild(this.loadingDiv);
      
      this.init = true;
    }
    
    // Ha nincsenek megadva betöltendő modulok, akkor kilépünk
    if (!(modulesURL instanceof Array) && ('number' !== typeof(modulesURL.length))) return;
    
    // Betöltő létrehozása
    var loader = this.loaders[this.loaders.length] = new Object;
    // Betöltés utáni esemény tárolása
    loader.onCompleteFunction = ('function' === typeof(onCompleteFunction)) ? onCompleteFunction : function(){};
    // Ebben tároljuk majd a betöltendő modulok listáját
    loader.modules = new Array();
    // Egyenlőre a loader még nincs kész
    loader.complete = false;
    
    // Végig megyünk a modulok neveinek listáján
    for (var i = 0; i < modulesURL.length; i++)
    {
      // Ha nem szöveg van megadva, akkor tovább lépünk
      if ('string' !== typeof(modulesURL[i])) continue;
      
      // Modul nevének meghatározása
      var s = modulesURL[i].split('/');
      var moduleName = (0 < s.length) ? s[s.length-1].split('.')[0] : '';
      
      // Ha üres a modul neve, akkor tovább lépünk
      if ('' === moduleName) continue;
      
      // Modul lekérdezése
      var module = this.modules[moduleName];
      // Ha a modul még nem létezik a modulkezelőben, akkor létrehozzuk
      if ('undefined' === typeof(module))
      {
        // Modul létrehozása
        module = this.modules[moduleName] = new Object();
        // Modul nevének tárolása
        module.moduleName = moduleName;
        // URL tárolása
        module.url = modulesURL[i];
        // Egyenlőre még nincs betöltve
        module.loaded = false;
        // Egyenlőre még nincs betöltés alatt
        module.loading = false;
        // A betöltendő modul egyenlőre még nem áll készen
        module.ready = false;
      }
      
      // Modul hozzáadása a betöltőhöz
      loader.modules[loader.modules.length] = module;
    }
    
    var manager = this;
    
    // Modulok betöltésének elindítása
    for (var i = 0; i < loader.modules.length; i++)
    {
      var module = loader.modules[i];
      // Ha már be van töltve a modul vagy még betöltés alatt áll, akkor 
      // lefuttatjuk a megfelelő eseményt, majd tovább lépünk
      if (module.loaded || module.loading)
      {
        manager.execute();
        continue;
      }
      
      module.load = function()
      {
        var module2 = this;
        // Egyébként elindítjuk a betöltést
        var func = function()
        {
          if (module2.loaded) return;
          var bb = ('undefined' !== typeof(this.readyState)) ? 
                    (('complete' === this.readyState) || ('loaded' === this.readyState)) : true;
          if (!bb) return;
      
          module2.loading = false;
          module2.loaded = true;
          
          // Betöltési információ törlése          
          for (var i = 0; i < manager.loadingDiv.childNodes.length; i++)
            if (module2.moduleName === manager.loadingDiv.childNodes[i].childNodes[0].nodeValue)
            {
              manager.loadingDiv.removeChild(manager.loadingDiv.childNodes[i]);
              break;
            }
          
          manager.execute();
        };
        
        // Betöltési információ kiírása
        var loadingTextDiv = document.createElement('div');
        loadingTextDiv.appendChild(document.createTextNode(module2.moduleName));
        //manager.loadingDiv.appendChild(loadingTextDiv);
      
        module2.loading = true;
      
        // Modul betöltésének elindítása
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onreadystatechange = func;
        script.onload = func;
        script.src = manager.rootPath+module.url;
    
        document.getElementsByTagName('head')[0].appendChild(script);
        
      }
      
      // Modul betöltése
      module.load();
    }    
  },
  
  /**
   * A metódus végig nézi az összes betöltőt, és lefuttatja azok onComplete
   * eseményeit, amelyek betöltődtek és készen állnak.    
   */     
  execute : function()
  {
    // Végig nézzük az összes loadert, hogy minden rendben van-e?
    for (var i = 0; i < this.loaders.length; i++)
    {
      var loader = this.loaders[i];
      // Ha a loader már elvégezte a feladatát, akkor tovább lépünk
      if (loader.complete) continue;
        
      // Egyébként megvizsgáljuk, hogy készen áll-e?
      var complete = true;
      for (var j = 0; j < loader.modules.length; j++)
      {
        var module = loader.modules[j];
        complete = complete && module.loaded && module.ready;
      }
        
      // Ha a betöltő készen áll, akkor lefuttatjuk az eseményét
      if (complete)
      {
        loader.complete = complete;
        loader.onCompleteFunction();
      }
          
    }
  },
  
  /**
   * Megjelöli készenlétre a paraméterként megadott modult.
   * 
   * @param moduleName {string} a modul neve      
   */     
  ready : function(moduleName)
  {
    if ('string' !== typeof(moduleName)) return;
    
    var module = this.modules[moduleName];
    if ('undefined' === typeof(module)) return;
    
    module.ready = true;
    
    this.execute();
  }
};