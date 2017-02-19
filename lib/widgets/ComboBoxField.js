var ComboBoxField = null;

ModuleManager.load(
['lib/widgets/Field.js','lib/BrowserDetect.js','lib/HelpfulTools.js'],
function()
{

/**
 * Legördülő lista mezőt megvalósító osztály.   
 */
ComboBoxField = Field.extend(
{ 
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property required {boolean?undefined} ha igaz akkor kötelező elemet választani ([true])   
   */
  constructor : function(args)
  {
    // Azért kell az ősosztály konstruktora előtt létrehozni, mert hibát okozna
    this.createDomElement();
    
    // Ősosztály konstruktora
    this.base(args);
            
    // Elemek létrehozása
    var field = this;
    this.domelement.onchange = function(){field.setValue(field.domelement.options[field.domelement.selectedIndex].value);};
    this.content.appendChild(this.domelement);
    
    this.required = (this.argsExist && 'boolean' === typeof(args.required)) ? 
      args.required : true;
    
    // Minta tárolása
    this.pattern = (this.argsExist && 'undefined' !== typeof(args.pattern) && 
                    args.pattern.pattern.test) ? 
                    args.pattern : 
                    null;
    
  },
  
  /**
   * Elem hozzáadása a listához.
   * 
   * @param value {any type} az elem értéke
   * @param text {string} az elem felirata
   * @return {boolean} sikeres hozzáadás esetén igaz, egyébként hamis             
   */     
  appendItem : function(value,text)
  {
    if ('undefined' === typeof(value)) return false;
    if ('string' !== typeof(text)) return false;
    
    // Elem hozzáadása
    var option = document.createElement('option');
    option.value = value;
    option.text = text;
    if ('Explorer' == BrowserDetect.browser) 
      this.domelement.add(option);
    else
      this.domelement.add(option,null);

    return true;
  },
  
  /**
   * Elem eltávolítása a listából.
   * 
   * @param value {any type} az eltávolítandó elem értéke
   * @return {boolean} igaz ha az eltávolítás sikeres, egyébként hamis         
   */     
  removeItemByValue : function(value)
  {
    if ('undefined' === typeof(value)) return false;
    
    // Elem eltávolítása
    for (var i = 0; i < this.domelement.options.length; )
      if (value === this.domelement.options[i].value)
        this.domelement.remove(i);
      else
        i++;

    return true;
  },
  
  /**
   * Összes elem eltávolítása a listából.
   */     
  removeAllItems : function()
  {
    for (var i = 0; i < this.domelement.options.length; )
      this.domelement.remove(0);
      
    this.value = null;
  },
    
  /**
   * Legördülő lista aktív elemének a szövegének a lekérdezése.
   * 
   * @return {string} a legördülő lista aktív szövege      
   */     
  getText : function()
  {
    var index = this.domelement.selectedIndex;
    
    if (0 > index) return '';
    
    return this.domelement.options[index].text;
  },
  
  /**
   * Legördülő lista értékeinek a lekérdezése.
   * NOTE: - az értékekről másolat készül   
   * 
   * @return {Array as string} a legördülő lista értékei      
   */
  getValuesArray : function()
  {
    var a = new Array();
    for (var i = 0; i < this.domelement.options.length; i++)
    {
      a[a.length] = this.domelement.options[i].value;
    }
    
    return a;
  },     
  
  // @override
  setValueDom : function(value)
  {
    // Értékhez tartzó index megkeresése
    var index = -1;
    for (var i = 0; i < this.domelement.options.length; i++)
      if (this.domelement.options[i].value == value)
      {
        index = i;
        break;
      }
      
    // Érték beállítása
    if (!(0 > index) && (this.domelement.selectedIndex !== index))
      this.domelement.selectedIndex = index;
  },
  
  // @override
  validateValue : function(value)
  {
    return (this.required) ? (!(0 > this.domelement.selectedIndex)) : true;
  },
  
  // @override
  createDomElement : function()
  {
    this.domelement = document.createElement('select');
  },
  
  // @override
  toString : function()
  {
    return 'ComboBoxField';
  }
});

ModuleManager.ready('ComboBoxField');

});