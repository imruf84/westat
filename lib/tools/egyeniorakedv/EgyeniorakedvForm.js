var EgyeniorakedvForm = null;

var EgyeniorakedvPrimaryField = 'felhasznaloID';
var EgyeniorakedvScript = 'lib/tools/egyeniorakedv/egyeniorakedv.php';
var EgyeniorakedvGetDataListAction = 'GET_EGYENIORAKEDV_LIST';
var EgyeniorakedvRemoveDataListAction = 'REMOVE_EGYENIORAKEDV_LIST';
var EgyeniorakedvGetDataAction = 'GET_EGYENIORAKEDV_DATA';
var EgyeniorakedvInsertDataAction = 'INSERT_EGYENIORAKEDV_DATA';
var EgyeniorakedvModifyDataAction = 'MODIFY_EGYENIORAKEDV_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/LabelField.js',
 'lib/widgets/InputField.js',
 'lib/Ajax.js'
 ],
function()
{

/**
 * Egyéni órakedvezmények kezelésére szolgáló űrlap osztálya.      
 */
EgyeniorakedvForm = Form.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum 
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = EgyeniorakedvPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = EgyeniorakedvScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = EgyeniorakedvGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = EgyeniorakedvInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = EgyeniorakedvModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
    // Tájékoztató jellegű adatok
    
    // Felhasználó neve
    this.appendField(new LabelField(
    {
      id:'felhasznaloNev',
      unused:true,
      value:form.initalValues['felhasznaloNev'],
      pattern:System.patterns.anyWord,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Felhaszn\u00e1l\u00f3 neve:'}));
    
    // Felhasználó azonosítója
    this.appendField(new LabelField(
    {
      id:'felhasznaloID',
      value:form.initalValues['felhasznaloID'],
      pattern:System.patterns.posInt,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Felhaszn\u00e1l\u00f3 azonos\u00edt\u00f3ja:'}),
    true);
    
    // Tanév neve
    this.appendField(new LabelField(
    {
      id:'tanevNev',
      unused:true,
      value:form.initalValues['tanevNev'],
      pattern:System.patterns.tanevNev,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Tan\u00e9v neve:'}));
    
    // Tanév azonosítója
    this.appendField(new LabelField(
    {
      id:'tanevID',
      value:form.initalValues['tanevID'],
      pattern:System.patterns.posInt,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Tan\u00e9v azonos\u00edt\u00f3ja:'}),
    true);
    
    // Órák száma ("A" hét)
    this.appendField(new InputField(
    {
      id:'oraA',
      value:'0',
      pattern:System.patterns.posInt,
      minLength:1,
      maxLength:2,
      size:2}),
    new Label({text:'Egy\u00e9ni \u00f3rakedvezm\u00e9ny ("A" h\u00e9t):'}));
    
    // Kötelező órába beszámított órák száma ("A" hét)
    this.appendField(new InputField(
    {
      id:'oraKotelezoA',
      value:'0',
      pattern:System.patterns.fraction,
      minLength:1,
      maxLength:3,
      size:3}),
    new Label({text:'Ebb\u0151l k\u00f6telez\u0151 \u00f3rasz\u00e1mban elsz\u00e1molt ("A" h\u00e9t):'}));
    
    // Órák száma ("B" hét)
    this.appendField(new InputField(
    {
      id:'oraB',
      value:'0',
      pattern:System.patterns.posInt,
      minLength:1,
      maxLength:2,
      size:2}),
    new Label({text:'Egy\u00e9ni \u00f3rakedvezm\u00e9ny ("B" h\u00e9t):'}));
    
    // Kötelező órába beszámított órák száma ("B" hét)
    this.appendField(new InputField(
    {
      id:'oraKotelezoB',
      value:'0',
      pattern:System.patterns.fraction,
      minLength:1,
      maxLength:3,
      size:3}),
    new Label({text:'Ebb\u0151l k\u00f6telez\u0151 \u00f3rasz\u00e1mban elsz\u00e1molt ("B" h\u00e9t):'}));
    
  },
  
  // @override
  // NOTE: - mivel itt nincs kitüntetett elsődleges kulcs, ezért küldenünk kell 
  //         minden mezőértéket a szervernek
  getDataFromDbCreateParam : function(id)
  {
    var param = this.base(id);
    
    // Mezők értékeinek tárolása
    for (var i = 0; i < param.FIELDS.length; i++)
    {
      var field = this.getFieldById(param.FIELDS[i]);
      if (null !== field)
        param[param.FIELDS[i]] = field.getValue();
    }
    
    return param;
  },
  
  // @override
  isValid : function()
  { 
    if (false === this.base()) return false;
    
    // Az űrlap csak akkor helyes, ha az egyéni órakedvezmény nagyobb, vagy egyenlő
    // a kötelező órában elszámolt órakedvezménnyel
    var oraA = parseFloat(this.getFieldById('oraA').getValue());
    var oraKotelezoA = parseFloat(this.getFieldById('oraKotelezoA').getValue());
    
    var oraB = parseFloat(this.getFieldById('oraB').getValue());
    var oraKotelezoB = parseFloat(this.getFieldById('oraKotelezoB').getValue());
    
    return ((oraKotelezoA <= oraA) && (oraKotelezoB <= oraB));
  },
      
  // @override
  toString : function()
  {
    return 'EgyeniorakedvForm';
  }
});

ModuleManager.ready('EgyeniorakedvForm');

});