var TantargyakCimkeiForm = null;

var TantargyakCimkeiPrimaryField = 'tantargyCimkeID';
var TantargyakCimkeiScript = 'lib/tools/tantargyakcimkei/tantargyakcimkei.php';
var TantargyakCimkeiGetDataListAction = 'GET_TANTARGYAK_CIMKEI_LIST';
var TantargyakCimkeiRemoveDataListAction = 'UNASSIGN_TANTARGYAK_CIMKEI_LIST';
var TantargyakCimkeiGetDataAction = 'GET_TANTARGYAK_CIMKEI_DATA';
var TantargyakCimkeiInsertDataAction = 'ASSIGN_TANTARGYAK_CIMKEI_LIST';
var TantargyakCimkeiModifyDataAction = 'MODIFY_TANTARGYAK_CIMKEI_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js'],
function()
{

/**
 * Tantárgyak címkéinek a kezelésére szolgáló űrlap osztálya.      
 */
TantargyakCimkeiForm = Form.extend(
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
    this.primaryField = TantargyakCimkeiPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TantargyakCimkeiScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = TantargyakCimkeiGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = TantargyakCimkeiInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = TantargyakCimkeiModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
  },
      
  // @override
  toString : function()
  {
    return 'TantargyakCimkeiForm';
  }
});

ModuleManager.ready('TantargyakCimkeiForm');

});