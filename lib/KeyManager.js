var KeyManager = null;

ModuleManager.load(
['lib/BrowserDetect.js'],
function()
{

/**
 * Billentyűzet eseményeit kezelő objektum.                                        
 */
 
KeyManager = 
{
  /**
   * Objektum inicializálása.
   * NOTE: - segítségével megtudhatjuk, hogy milyen gombok vannak lenyomva   
   */   
  init : function()
  {
    // Láncolt litában tároljuk a függvényeket
    this.keys = new Array();
    this.register();
  },
  
  /**
   * Objektum regisztrálása a böngésző számára.
   */     
  register : function()
  {
    var mgr = this;
    var down = function(e)
    {
      var evt = e || window.event;
      mgr.keys[evt.keyCode] = true;
    };      
    var up = function(e)
    {
      var evt = e || window.event;
      mgr.keys[evt.keyCode] = false;
    };
    
    var obj;  
    if ('Opera' === BrowserDetect.browser)
      obj = window;
    else
      obj = document;
      
    obj.onkeydown = down;
    obj.onkeyup = up;
  },
  
  /**
   * Billentyű állapotának a lekérdezése.
   * 
   * @param keyCode {number} a lekérdezendő billentyű kódja
   * @return {boolean} a lekérdezett billentyű állapota         
   */     
  getKeyState : function(keyCode)
  {
    if ('number' !== typeof(keyCode)) return false;
    
    var key = this.keys[keyCode];
    if ('boolean' !== typeof(key)) return false;
    
    return key;
  },
  
  /**
   * Billentyű lenyomott állapotának lekérdezése.
   * 
   * @param keyCode {number} a lekérdezendő billentyű kódja
   * @return {boolean} igaz ha a lekérdezett billentyű állapota lenyomott
   */     
  isKeyDown : function(keyCode)
  {
    return (true === this.getKeyState(keyCode));
  },
  
  /**
   * Billentyűkódok.
   */     
  KEY_CTRL : 17,
  KEY_SHIFT : 16,
  
  // @override
  toString : function()
  {
    return 'KeyManager';
  }
}; 

KeyManager.init();

ModuleManager.ready('KeyManager');

});