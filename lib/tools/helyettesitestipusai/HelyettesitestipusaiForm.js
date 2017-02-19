var HelyettesitestipusaiForm = null;

var HelyettesitestipusaiPrimaryField = 'helyettesitestipusaID';
var HelyettesitestipusaiScript = 'lib/tools/helyettesitestipusai/helyettesitestipusai.php';
var HelyettesitestipusaiGetDataListAction = 'GET_HELYETTESITESTIPUSA_LIST';
var HelyettesitestipusaiGetDataListCBAction = 'GET_HELYETTESITESTIPUSA_LIST_CB';
var HelyettesitestipusaiRemoveDataListAction = 'REMOVE_HELYETTESITESTIPUSA_LIST';
var HelyettesitestipusaiGetDataAction = 'GET_HELYETTESITESTIPUSA_DATA';
var HelyettesitestipusaiInsertDataAction = 'INSERT_HELYETTESITESTIPUSA_DATA';
var HelyettesitestipusaiModifyDataAction = 'MODIFY_HELYETTESITESTIPUSA_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/InputField.js',
 'lib/widgets/YesNoComboBox.js'],
function()
{

/**
 * Helyettesítés típusainak a kezelésére szolgáló űrlap osztálya.      
 */
HelyettesitestipusaiForm = Form.extend(
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
    this.primaryField = HelyettesitestipusaiPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HelyettesitestipusaiScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = HelyettesitestipusaiGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = HelyettesitestipusaiInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = HelyettesitestipusaiModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    this.appendField(new InputField(
                     {id:'helyettesitestipusaNev',
                     value:'',
                      pattern:System.patterns.nWordSepBySpaceDot,
                      minLength:1,
                      maxLength:20,
                      size:20}),
                     new Label({text:'Helyettes\u00edt\u00e9s t\u00edpus\u00e1nak megnevez\u00e9se:'}));
    this.appendField(new InputField(
                     {id:'helyettesitestipusaNevH',
                     value:'',
                      pattern:System.patterns.nWordSepBySpaceDot,
                      minLength:1,
                      maxLength:20,
                      size:20}),
                     new Label({text:'Helyettes\u00edt\u00e9s t\u00edpus\u00e1nak \u00e1llom\u00e1nybeli megnevez\u00e9se:'}));
    this.appendField(new YesNoComboBox(
                     {id:'osszevont',
                      value:1}),
                     new Label({text:'A helyettes\u00edt\u00e9s \u00f6sszevont:'}));
  },
      
  // @override
  toString : function()
  {
    return 'HelyettesitestipusaiForm';
  }
});

ModuleManager.ready('HelyettesitestipusaiForm');

});