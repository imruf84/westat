var TantargyakForm = null;

var TantargyakPrimaryField = 'tantargyID';
var TantargyakScript = 'lib/tools/tantargyak/tantargyak.php';
var TantargyakGetDataListAction = 'GET_TANTARGY_LIST';
var TantargyakGetDataListCBAction = 'GET_TANTARGY_LIST_CB';
var TantargyakRemoveDataListAction = 'REMOVE_TANTARGY_LIST';
var TantargyakGetDataAction = 'GET_TANTARGY_DATA';
var TantargyakInsertDataAction = 'INSERT_TANTARGY_DATA';
var TantargyakModifyDataAction = 'MODIFY_TANTARGY_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/InputField.js','lib/System.js'
],
function()
{

/**
 * Tantárgyak adatainak kezelésére szolgáló űrlap osztálya.      
 */
TantargyakForm = Form.extend(
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
    this.primaryField = TantargyakPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TantargyakScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = TantargyakGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = TantargyakInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = TantargyakModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    this.appendField(new InputField(
                     {id:'tantargyNev',
                      value:'',
                      pattern:System.patterns.anyWord,
                      minLength:1,
                      maxLength:100,
                      size:100}),
                     new Label({text:'Tant\u00e1rgy neve:'}));
  },
      
  // @override
  toString : function()
  {
    return 'TantargyakForm';
  }
});

ModuleManager.ready('TantargyakForm');

});