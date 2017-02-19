var TantargyCimkekForm = null;

var TantargyCimkekPrimaryField = 'tantargyCimkeID';
var TantargyCimkekScript = 'lib/tools/tantargycimkek/tantargycimkek.php';
var TantargyCimkekGetDataListAction = 'GET_TANTARGY_CIMKEK_LIST';
var TantargyCimkekGetDataListCBAction = 'GET_TANTARGY_CIMKEK_LIST_CB';
var TantargyCimkekRemoveDataListAction = 'REMOVE_TANTARGY_CIMKEK_LIST';
var TantargyCimkekGetDataAction = 'GET_TANTARGY_CIMKEK_DATA';
var TantargyCimkekInsertDataAction = 'INSERT_TANTARGY_CIMKEK_DATA';
var TantargyCimkekModifyDataAction = 'MODIFY_TANTARGY_CIMKEK_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/InputField.js','lib/System.js'
],
function()
{

/**
 * Tantárgycímkék adatainak kezelésére szolgáló űrlap osztálya.      
 */
TantargyCimkekForm = Form.extend(
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
    this.primaryField = TantargyCimkekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TantargyCimkekScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = TantargyCimkekGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = TantargyCimkekInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = TantargyCimkekModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    this.appendField(new InputField(
                     {id:'tantargyCimkeNev',
                      value:'',
                      pattern:System.patterns.anyWord,
                      minLength:1,
                      maxLength:100,
                      size:100}),
                     new Label({text:'Tant\u00e1rgyc\u00edmke neve:'}));
    this.appendField(new InputField(
                     {id:'tantargyCimkeNevO',
                      value:'',
                      pattern:System.patterns.nWordSepBySpaceSpec,
                      minLength:1,
                      maxLength:50,
                      size:50}),
                     new Label({text:'Tant\u00e1rgyc\u00edmke \u00f3rarendi neve:'}));
    this.appendField(new InputField(
                     {id:'tantargyCimkeNevH',
                      value:'',
                      pattern:System.patterns.nWordSepBySpaceSpec,
                      minLength:1,
                      maxLength:50,
                      size:50}),
                     new Label({text:'Tant\u00e1rgyc\u00edmke helyettes\u00edt\u00e9si neve:'}));
  },
      
  // @override
  toString : function()
  {
    return 'TantargyCimkekForm';
  }
});

ModuleManager.ready('TantargyCimkekForm');

});