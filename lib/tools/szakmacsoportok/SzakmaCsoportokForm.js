var SzakmaCsoportokForm = null;

var SzakmaCsoportokPrimaryField = 'szakmaCsoportID';
var SzakmaCsoportokScript = 'lib/tools/szakmacsoportok/szakmacsoportok.php';
var SzakmaCsoportokGetDataListAction = 'GET_SZAKMACSOPORTOK_LIST';
var SzakmaCsoportokGetDataListCBAction = 'GET_SZAKMACSOPORTOK_LIST_CB';
var SzakmaCsoportokRemoveDataListAction = 'REMOVE_SZAKMACSOPORTOK_LIST';
var SzakmaCsoportokGetDataAction = 'GET_SZAKMACSOPORTOK_DATA';
var SzakmaCsoportokInsertDataAction = 'INSERT_SZAKMACSOPORTOK_DATA';
var SzakmaCsoportokModifyDataAction = 'MODIFY_SZAKMACSOPORTOK_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/InputField.js'],
function()
{

/**
 * Szakmacsoportok adatainak kezelésére szolgáló űrlap osztálya.      
 */
SzakmaCsoportokForm = Form.extend(
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
    this.primaryField = SzakmaCsoportokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = SzakmaCsoportokScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = SzakmaCsoportokGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = SzakmaCsoportokInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = SzakmaCsoportokModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    
    var form = this;
    
    this.appendField(new InputField(
                     {id:'szakmaCsoportNev',
                      value:'',
                      pattern:System.patterns.anyWord,
                      minLength:1,
                      maxLength:50,
                      size:50}),
                     new Label({text:'Szakmacsoport neve:'}));
  },
      
  // @override
  toString : function()
  {
    return 'SzakmaCsoportokForm';
  }
});

ModuleManager.ready('SzakmaCsoportokForm');

});