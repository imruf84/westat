var FelhasznalokForm = null;

var FelhasznalokPrimaryField = 'felhasznaloID';
var FelhasznalokScript = 'lib/tools/felhasznalok/felhasznalok.php';
var FelhasznalokGetDataListAction = 'GET_FELHASZNALO_LIST';
var FelhasznalokGetDataListCBAction = 'GET_FELHASZNALO_LIST_CB';
var FelhasznalokGetDataListAllCBAction = 'GET_FELHASZNALO_LIST_ALL_CB';
var FelhasznalokRemoveDataListAction = 'REMOVE_FELHASZNALO_LIST';
var FelhasznalokGetDataAction = 'GET_FELHASZNALO_DATA';
var FelhasznalokInsertDataAction = 'INSERT_FELHASZNALO_DATA';
var FelhasznalokModifyDataAction = 'MODIFY_FELHASZNALO_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js',
 'lib/widgets/InputField.js','lib/tools/csoportok/CsoportokComboBox.js',
 'lib/tools/felhasznalok/FelhasznalotipusaiComboBox.js'
],
function()
{

/**
 * Felhasználó adatainak kezelésére szolgáló űrlap osztálya.      
 */
FelhasznalokForm = Form.extend(
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
    this.primaryField = FelhasznalokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = FelhasznalokScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = FelhasznalokGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = FelhasznalokInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = FelhasznalokModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    this.appendField(new InputField(
                     {id:'felhasznaloNev',
                      value:'',
                      pattern:System.patterns.anyWord,
                      minLength:1,
                      maxLength:50,
                      size:50}),
                     new Label({text:'Felhaszn\u00e1l\u00f3 neve:'}));
    this.appendField(new InputField(
                     {id:'felhasznaloNevO',
                      value:'',
                      pattern:System.patterns.anyWord,
                      minLength:1,
                      maxLength:50,
                      size:50}),
                     new Label({text:'Felhaszn\u00e1l\u00f3 \u00f3rarendi neve:'}));
    this.appendField(new InputField(
                     {id:'felhasznaloNevH',
                      value:'',
                      pattern:System.patterns.anyWord,
                      minLength:1,
                      maxLength:50,
                      size:50}),
                     new Label({text:'Felhaszn\u00e1l\u00f3 helyettes\u00edt\u00e9si neve:'}));
                     
    var csoportokOnReadyFunc = function(field)
    {
      form.appendField(new FelhasznalotipusaiComboBox(
                       {id:'tipus',
                        value:'user'}),
                       new Label({text:'Felhaszn\u00e1l\u00f3 szintje:'}));
                       
      form.appendField(new YesNoComboBox(
                       {id:'oraado',
                        value:1}),
                       new Label({text:'A felhaszn\u00e1l\u00f3 \u00f3raad\u00f3:'}));
                       
      form.appendField(new YesNoComboBox(
                       {id:'szakoktato',
                        value:1}),
                       new Label({text:'A felhaszn\u00e1l\u00f3 szakoktat\u00f3:'}));
                       
      field.update(true);
    }
                     
    this.appendField(new CsoportokComboBox(
                     {
                       id:'csopID',
                       onReady:csoportokOnReadyFunc,
                       // Az űrlap típusa határozza meg, hogy a mező kezdeti értéke milyen legyen
                       index:('insert' === form.type) ? 'first' : 'value'
                     }),
                     new Label({text:'Felhaszn\u00e1l\u00f3 munkak\u00f6z\u00f6ss\u00e9ge:'}));
  },
      
  // @override
  toString : function()
  {
    return 'FelhasznalokForm';
  }
});

ModuleManager.ready('FelhasznalokForm');

});