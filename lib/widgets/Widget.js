var Widget = null;

ModuleManager.load(
['lib/BaseClass.js'],
function()
{

/**
 * Felhasználói felület elemeinek alaposztálya.
 */
Widget = BaseClass.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property onClick {function(widget:Widget)} az objektumra való kattintás eseménye
   *   #property onMouseOver {function(widget:Widget)} az objektumra való ráhúzás egér eseménye            
   *   #property onMouseOut {function(widget:Widget)} az objektumról való elhagyás egér eseménye
   *   #property onReady {function(widget:Widget)} az objektum készenlétének az eseménye     
   *   #property state {boolean} az objetum állapota
   *   #property onStateChange {function(widget:Widget,state:boolean){}} az objektum
   *     állapotának megváltozásának az eseménye          
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Alap dom objektum létrehozása
    this.dom = document.createElement('div');
    this.dom.style.overflow = 'hidden';
    // Referencia készítése
    this.dom.object = this;
    
    // Események tárolása
    this.onClick = (this.argsExist && 'function' === typeof(args.onClick)) ? 
      args.onClick : function(){};
    this.onMouseOver = (this.argsExist && 'function' === typeof(args.onMouseOver)) ? 
      args.onMouseOver : function(){};
    this.onMouseOut = (this.argsExist && 'function' === typeof(args.onMouseOut)) ? 
      args.onMouseOut : function(){};
    this.onStateChange = (this.argsExist && 'function' === typeof(args.onStateChange)) ? 
      args.onStateChange : function(){};
      
    // Alapértelmezésben az objektum már a létrehozásakor készen áll a használatra
    // NOTE: - származtatott osztályokban előbb ezt false-ra kell állítani,
    //         majd az esemény meghívása előtt true-ra
    this.ready = true;
    this.onReady = (this.argsExist && 'function' === typeof(args.onReady)) ? 
      args.onReady : function(){};
      
    // Események beállítása
    var obj = this;
    this.dom.onclick = function(){if (obj.state) obj.onClick(obj);};
    this.dom.onmouseover = function(){obj.onMouseOver(obj);};
    this.dom.onmouseout = function(){obj.onMouseOut(obj);};
    
    // Állapot tárolása
    this.state = (this.argsExist && 'boolean' === typeof(args.state)) ? args.state : true;
  },
  
  // @override  
  destroy : function()
  {
    var parent = this.getParentDom();
    if ((null !== parent) && (parent.removeChild))
      parent.removeChild(this.dom);
      
    this.base();
  },
  
  /**
   * Objektum hozzáadása tárolóhoz.
   * 
   * @param div {HTMLDivElement} az objektum szülő obejtuma
   * @return {boolean} ha sikerült hozzá adni akkor igaz, egyébként hamis         
   */     
  appendTo : function(div)
  {
    if (!div.appendChild) return false;
    
    div.appendChild(this.dom);
    
    return true;
  },
  
  /**
   * Objektum szülőjének a lekérdezése.
   * NOTE: - szülő allatt a parentNode értéke értendő   
   * 
   * @return {HTMLDivElement?null} az objektum szülője, vagy hiba esetén null      
   */     
  getParentDom : function()
  {
    var parent = this.dom.parentNode;
    return ('undefined' === typeof(parent) || null === parent) ? null : this.dom.parentNode;
  },
  
  /**
   * Objektum tartalmának a méretének a lekérdezése.
   * NOTE: - egyenlőre nem definiált   
   * 
   * @return {Array(2):number} az objektum tartalmának a mérete      
   */     
  getContentSize : function()
  {
    return new Array(0,0);
  },
  
  /**
   * Objektum állapotának a beállítása.
   * 
   * @param active {boolean} az objektum állapota
   */     
  setState : function(active)
  {
    if ('boolean' !== typeof(active)) return;
    // Ha nem változik az állapot akkor kilépünk
    if (this.state === active) return;
    
    // Állapot mentése
    this.state = active;
    if (this.state) 
      this.activate();
    else
      this.inactivate();
    
    // Megfelelő esemény lefuttatása
    if (this.onStateChange)
      this.onStateChange(this,active);
  },
  
  /**
   * Objektum állapotának aktívvá tétele.
   * NOTE: - önálló használatra nem ajánlott      
   */     
  activate : function()
  {
  },
  
  /**
   * Objektum állapotának inaktívvá tétele.
   * NOTE: - önálló használatra nem ajánlott      
   */     
  inactivate : function()
  {
  },
  
  /**
   * Objektum állapotának a lekérdezése.
   * 
   * @return {boolean} az objektum állapota      
   */     
  getState : function()
  {
    return this.state;
  },
  
  /**
   * A függvény megadja, hogy az objektum készen áll-e a használatra?
   * 
   * @return {boolean} igaz ha az objektum készen áll      
   */
  isReady : function()
  {
    return this.ready;
  },
  
  /**
   * Ha az objektum készen áll, akkor lefut a megfelelő esemény.
   */
  callOnReady : function()
  {
    if (this.isReady())
      this.onReady(this);
      
    // Lefuttatjuk a szülő készenlét metódusát
    var parent = this.getParentObject(); 
    if (!(parent instanceof Widget)) return;
        
    parent.callOnReady();
  },          
  
  // @override
  toString : function()
  {
    return 'Widget';
  }
});

ModuleManager.ready('Widget');

});