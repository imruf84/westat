var ResizeManager = null;

ModuleManager.load(
['lib/System.js','lib/LinkedList.js'],
function()
{

/**
 * Az alakzatok átméretezéséért felelős objektum.                                
 * Az ablak átméretezésekor a tárolt függvények lefutnak, amelyekkel a megfelelő 
 * méretűre alakíthatjuk az objektumokat.                                                                                                                       
 * TODO: - unregister függvény hozzáadása                                        
 */
 
ResizeManager = 
{
  /**
   * Objektum inicializálása.
   */   
  init : function()
  {
    // Láncolt litában tároljuk a függvényeket
    this.functionList = new LinkedList();
    this.register();
  },
  
  /**
   * Objektum regisztrálása a böngésző számára.
   */     
  register : function()
  {
    // Lementjük ideinglenesen az objektumunkat
    var mgr = this;
    var resizeFunc = function()
    {
      var w = System.window.width();
      var h = System.window.height();
      // Végig megyünk a függvények listáján, és lefuttatjuk azokat
      var node = mgr.functionList.first;
      while(node)
      {
        node.data(w,h);
        node = node.next;
      }
    }
  
    //FF, Chrome		
	  if (window.addEventListener) 
		  window.addEventListener('resize', resizeFunc, false);
	  //IE
	  else 
      if (window.attachEvent) 
		    window.attachEvent('onresize', resizeFunc);
		  else 
			  window.onresize = resizeFunc;
  },
  
  /**
   * Függvény hozzáadása.
   * 
   * @param func {function(width:number,height:number)} a hozzáadandó függvény
   * @param execute {boolean} ha igaz, akkor a hozzáadás után azonnal le is fut 
   *   a függvény
   * @return {function(width:number,height:number)?null} a hozzáadott függvény 
   *   vagy hiba esetén null            
   */   
  addFunction : function(func,execute)
  {    
    if('function' !== typeof(func)) return null;
    
    this.functionList.append(new ListNode(func));
  
    if (('boolean' === typeof(execute)) && (execute))
    {
      var w = System.window.width();
      var h = System.window.height();
      func(w,h);
    }
    
    return func;
  },
  
  /**
   * Függvény eltávolítása.
   * 
   * @param func {function(width:number,height:number)} az eltávolítandó függvény
   * @return func {function(width:number,height:number)?null} az eltávolított 
   *   függvény vagy hiba esetén null
   */
  removeFunction : function(func)
  {
    if ('function' !== typeof(func)) return null;
    
    var lFunc = this.functionList.findFirst(func);
    if (null != lFunc)
    {
      this.functionList.remove(lFunc);
      return func;
    }
      
    return null;
  },
  
  // @override
  toString : function()
  {
    return 'ResizeManager';
  }
}; 

ResizeManager.init();

ModuleManager.ready('ResizeManager');

});