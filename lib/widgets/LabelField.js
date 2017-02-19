var LabelField = null;

ModuleManager.load(
['lib/widgets/Field.js','lib/widgets/Label.js'],
function()
{

/**
 * Egysoros szöveges adatok megjelenítésére, módosítására szolgáló beviteli 
 * mező osztálya.
 * BUG: - ha egérrel használjuk a vágólapot a szöveg beillesztésére, akkor
 *        nem fut le az onChange() esemény  
 */
LabelField = Field.extend(
{ 
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property pattern {RegExpPattern?undefined} az értéket tesztelő minta
   *   NOTE: - ha nem adunk meg mintát, akkor nem történik vizsgálat
   */
  constructor : function(args)
  {
    // Azért kell az ősosztály konstruktora előtt létrehozni, mert hibát okozna
    this.domelement = new Label();
    
    // Ősosztály konstruktora
    this.base(args);
            
    // Elemek létrehozása
    var field = this;
    this.domelement.appendTo(this.content);
    
    // Minta tárolása
    this.pattern = (this.argsExist && 'undefined' !== typeof(args.pattern) && 
                    args.pattern.pattern.test) ? 
                    args.pattern : 
                    null;    
  },
  
  // @override
  setValueDom : function(value)
  {
    if (this.domelement.getText() !== value)
      this.domelement.setText(value);
  },
  
  // @override
  validateValue : function(value)
  {
    return (this.pattern) ? 
      ((0 !== value.length) ? this.pattern.pattern.test(value) : true) :
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
  toString : function()
  {
    return 'LabelField';
  }
});

ModuleManager.ready('LabelField');

});