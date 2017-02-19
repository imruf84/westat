var CsoportokForm = null;

var CsoportokPrimaryField = 'csoportID';
var CsoportokScript = 'lib/tools/csoportok/csoportok.php';
var CsoportokGetDataListAction = 'GET_CSOPORT_LIST';
var CsoportokGetDataListCBAction = 'GET_CSOPORT_LIST_CB';
var CsoportokRemoveDataListAction = 'REMOVE_CSOPORT_LIST';
var CsoportokGetDataAction = 'GET_CSOPORT_DATA';
var CsoportokInsertDataAction = 'INSERT_CSOPORT_DATA';
var CsoportokModifyDataAction = 'MODIFY_CSOPORT_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/InputField.js','lib/System.js'],
function()
{

/**
 * Csoportok adatainak kezelésére szolgáló űrlap osztálya.      
 */
CsoportokForm = Form.extend(
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
    this.primaryField = CsoportokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = CsoportokScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = CsoportokGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = CsoportokInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = CsoportokModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    this.appendField(new InputField(
                     {id:'csoportNev',
                      value:'',
                      pattern:System.patterns.anyWord,
                      minLength:1,
                      maxLength:50,
                      size:50}),
                     new Label({text:'Munkak\u00f6z\u00f6ss\u00e9g neve:'}));
    this.appendField(new FelhasznalokComboBox(
                     {
                       id:'vezetoID',
                       onReady:function(field){field.update(true);}
                     }),
                     new Label({text:'Munkak\u00f6z\u00f6ss\u00e9g vezet\u0151je:'}));
  },
      
  // @override
  toString : function()
  {
    return 'CsoportokForm';
  }
});

ModuleManager.ready('CsoportokForm');

});