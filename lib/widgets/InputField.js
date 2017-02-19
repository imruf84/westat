var InputField = null;

ModuleManager.load(
['lib/widgets/Field.js'],
function()
{

/**
 * Egysoros szöveges adatok megjelenítésére, módosítására szolgáló beviteli 
 * mező osztálya.
 * BUG: - ha egérrel használjuk a vágólapot a szöveg beillesztésére, akkor
 *        nem fut le az onChange() esemény  
 */
InputField = Field.extend(
{ 
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property minLength {number} a bevihető mezőben tárolt szöveg minimális hossza ([0])   
   *   #property maxLength {number} a bevitelő mezőben tárolt szöveg maximális hossza ([200])   
   *   #property size {number} a beviteli mező mérete ([10])      
   *   #property pattern {RegExpPattern?undefined} az értéket tesztelő minta
   *   NOTE: - ha nem adunk meg mintát, akkor nem történik vizsgálat
   */
  constructor : function(args)
  {
    // Azért kell az ősosztály konstruktora előtt létrehozni, mert hibát okozna
    this.createDomElement();
    
    // Ősosztály konstruktora
    this.base(args);
    
    this.minLength = (this.argsExist && 'number' === typeof(args.minLength)) ?
      args.minLength : 0;
    this.maxLength = (this.argsExist && 'number' === typeof(args.maxLength)) ?
      args.maxLength : 200;
    this.size = (this.argsExist && 'number' === typeof(args.size)) ?
      args.size : 10;
        
    // Elemek létrehozása
    var field = this;
    this.domelement.onchange = 
    this.domelement.onblur = 
    this.domelement.onkeyup = function(){field.setValue(field.domelement.value);};
    this.domelement.maxLength = this.maxLength;
    this.domelement.size = this.size;
    this.content.appendChild(this.domelement);
    
    // Minta tárolása
    this.pattern = (this.argsExist && 'undefined' !== typeof(args.pattern) && 
                    args.pattern.pattern.test) ? 
                    args.pattern : 
                    null;
  },
  
  // @override
  setValueDom : function(value)
  {
    if (this.domelement.value !== value)
      this.domelement.value = value;
  },
  
  // @override
  validateValue : function(value)
  {
    return (this.pattern) ? 
      !(value.length < this.minLength) && 
      !(value.length > this.maxLength) && 
      ((0 !== value.length || 0 !== this.minLength) ? this.pattern.pattern.test(value) : true) :
      true;
  },
  
  // @override
  validateValueType : function(value)
  {
    return ('string' === typeof(value));
  },
  
  // @override
  getValueFormatHelp : function()
  {
    return (this.pattern) ? this.pattern.help : '';
  },
  
  // @override
  createDomElement : function()
  {
    this.domelement = document.createElement('input');
  },
  
  // @override
  toString : function()
  {
    return 'InputField';
  }
});

ModuleManager.ready('InputField');

});