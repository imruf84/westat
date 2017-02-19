var OsztalyokCimkeiForm = null;

var OsztalyokCimkeiPrimaryField = 'osztalyCimkeID';
var OsztalyokCimkeiScript = 'lib/tools/osztalyokcimkei/osztalyokcimkei.php';
var OsztalyokCimkeiGetDataListAction = 'GET_OSZTALYOK_CIMKEI_LIST';
var OsztalyokCimkeiRemoveDataListAction = 'UNASSIGN_OSZTALYOK_CIMKEI_LIST';
var OsztalyokCimkeiGetDataAction = 'GET_OSZTALYOK_CIMKEI_DATA';
var OsztalyokCimkeiInsertDataAction = 'ASSIGN_OSZTALYOK_CIMKEI_LIST';
var OsztalyokCimkeiModifyDataAction = 'MODIFY_OSZTALYOK_CIMKEI_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js'],
function()
{

/**
 * Osztályok címkéinek a kezelésére szolgáló űrlap osztálya.      
 */
OsztalyokCimkeiForm = Form.extend(
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
    this.primaryField = OsztalyokCimkeiPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OsztalyokCimkeiScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = OsztalyokCimkeiGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = OsztalyokCimkeiInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = OsztalyokCimkeiModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
  },
      
  // @override
  toString : function()
  {
    return 'OsztalyokCimkeiForm';
  }
});

ModuleManager.ready('OsztalyokCimkeiForm');

});