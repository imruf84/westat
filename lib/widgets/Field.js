var Field = null;

ModuleManager.load(
['lib/widgets/Control.js','lib/System.js'],
function()
{

/**
 * Adatok megjelenítésére, módosítására szolgáló mező alaposztálya.
 * NOTE: - Form-okba rendezve az adatbázis rekordjait tudjuk elérni 
 *       - az osztály önbálló használatra nem ajánlott    
 */
Field = Control.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property id {string} a mező azonosítója
   *   NOTE: - adatok lekérdezésénél, illetve mentésénél van fontos szerepe      
   *   #property value {any type} a mező értéke   
   *   #property onChange {function(field:Field,isValueValid:boolean)} érték változásának eseménye   
   *   NOTE: - akkor fut le ha a mező készen áll a használatra
   *         - olyan esetekben hasznos, amikor a szerverről töltünk le adatokat   
   *   #property unused {boolean} ha hamis, akkor a mező nem vesz részt semmiféle 
   *     lekérdezésben ([false])         
   */
  constructor : function(args)
  {
    this.base(args);
      
    //Igaz, ha az érték megváltozott
    this.valueChanged = false;
    
    // Azonosító tárolása
    this.id = (this.argsExist && 'string' === typeof(args.id) && 
               (System.patterns.oneWord.pattern.test(this.id))) ? args.id : '';
      
    // Használaton kívüliség tárolása
    this.unused = (this.argsExist && 'boolean' === typeof(args.unused)) ? 
      args.unused : false;
      
    // Események tárolása
    this.onChange = (this.argsExist && 'function' === typeof(args.onChange)) ?
      args.onChange : function(){};
      
    // Érték tárolása
    this.value;
        
    // Kezdőérték megadása  
    if (this.argsExist)
      this.setValue(args.value);
  },
  
  /**
   * Érték helyességének az ellenörzése.
   * 
   * @param value {ani type} az ellenőrizendő érték
   * @return {boolean} igaz ha az érték helyes, egyébként hamis         
   */     
  validateValue : function(value)
  {
    // Egyenlőre minden értéket átengedünk
    return true;
  },
  
  /**
   * Érték típusának az  ellenörzése.
   * 
   * @param value {ani type} az ellenőrizendő érték
   * @return {boolean} igaz ha az érték típusa helyes, egyébként hamis         
   */
  validateValueType : function(value)
  {
    // Egyenlőre minden értéket átengedünk
    return true;
  },
  
  /**
   * Egy adott értékről megmondja, hogy helyes-e a mező szabályai szerint?
   * NOTE: - a vizsgálast két szinten történik: 1. típusellenőrzés
   *                                            2. érték ellenörzés
   *                                            
   * @param value {any type} a vizsgálandó érték
   * @return {number} 0 vagy hiba esetén a hiba kódja
   * NOTE: 0: minden rendben van
   *       1: típushiba
   *       2: értékhiba                        
   */     
  isValidValue : function(value)
  {
    if (!this.validateValueType(value)) return 1;
    if (!this.validateValue(value)) return 2;
    
    return 0;
  },
  
  /**
   * Egy mezőnek a helyességének a lekérdezése.
   * 
   * @return {boolean} igaz ha a mező helyesen van kitöltve, egyébként hamis      
   */     
  isValid : function()
  {
    return (0 === this.isValidValue(this.value));
  },
  
  /*
   * Érték megadása.
   * NOTE: - a származtatott osztályokban felül lesz írva. Ott kap majd értéket
   *         a valueChanged tag is   
   *   
   * @param value {Any type} az új érték            
   */   
  setValue: function(value)
  {
    // Ha a típus nem megfelelő, akkor kilépünk
    var validType = this.validateValueType(value);
    if (!validType) return;
    
    // Ha ugyanazt az értéket szeretnénk beállítani, ami már létezik
    // akkor kilépünk
    if (value === this.value) return;
    
    this.value = value;
    this.setValueDom(value);

    // Változott az érték, így lefuttatjuk a megfelelő eseményt    
    this.onChange(this,this.validateValue(this.value));
  },
  
  /**
   * Érték hozzáadása dom szinten.
   * NOTE: - önálló használatra nem ajánlott   
   * 
   * @param value {any type} a hozzáadandó érték      
   */     
  setValueDom : function(value)
  {
  },
  
  /*
   * Érték lekérdezése
   *   return: a mező értéke   
   */   
  getValue: function(value)
  {
    return this.value;
  },
  
  /**
   * Érték formátumához tartozó szöveges segítség lekérdezése.
   */     
  getValueFormatHelp : function()
  {
    return '';
  },
  
  /**
   * Dom elem létrehozása.
   * NOTE: - a Field osztály konstruktorában hívódik meg az ősosztály 
   *         konstruktora előtt
   *       - a származtatott osztályokban felül kell írni
   *       - önálló használatra nem ajánlott         
   */
  createDomElement : function()
  {
  },     
    
  // @override
  toString : function()
  {
    return 'Field';
  }
});

ModuleManager.ready('Field');

});