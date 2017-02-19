var BaseClass = null;

ModuleManager.load(
['lib/Base.js'],
function()
{

/**
 * Minden westat osztály ősosztálya.
 */ 
BaseClass = Base.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum      
   */     
  constructor : function(args)
  {
    this.argsExist = ('undefined' !== typeof(args));
    
    // Objektum szülőobjektuma
    // NOTE: - nem összetévesztendő a parentNode értékével
    this.parentObject = null;
  },
  
  /**
   * Destruktor.
   */     
  destroy : function()
  {
  },   
  
  /**
   * Objektum frissítése.  
   * 
   * @param update {boolean?undefined} ha hamis akkor nem fut le az update metódus ([true])
   * NOTE: - konstruktorban történő paraméterátadás során fontos       
   */     
  update : function(update)
  {
    // Ha nem kérünk frissítést akkor kilépünk
    if ('boolean' === typeof(update) && !update) return;
    
    // Lefuttatjuk a szülő update metódusát
    this.updateFunction();
    
    // Lefuttatjuk a szülő frissítés metódusát
    var parent = this.getParentObject(); 
    if (!(parent instanceof BaseClass)) return;
        
    parent.update(update);
  },
  
  /**
   * Objektum frissítés metódusa.
   * NOTE: - önálló használatra nem ajánlott   
   */     
  updateFunction : function()
  {
    // Egyenlőre nem csinálunk semmit
  },
  
  /**
   * Objektum szülőjének a lekérdezése.
   * 
   * @return {Widget?null} az objektum szülőobjektuma      
   */     
  getParentObject : function()
  {
    return this.parentObject;
  }, 
  
  /**
   * Karakterlánccá alakítás.
   * 
   * @return {string} az osztály neve      
   */     
  toString : function()
  {
    return 'BaseClass';
  }
});

ModuleManager.ready('BaseClass');

});