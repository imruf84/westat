var LezarasokForm = null;

var LezarasokPrimaryField = 'felhasznaloID';
var LezarasokScript = 'lib/tools/lezarasok/lezarasok.php';
var LezarasokGetDataListAction = 'GET_LEZARAS_LIST';
var LezarasokRemoveDataListAction = 'UNLOCK_LEZARAS_LIST';
var LezarasokGetDataAction = 'GET_LEZARAS_DATA';
var LezarasokInsertDataAction = 'LOCK_LEZARAS_LIST';
var LezarasokModifyDataAction = 'MODIFY_LEZARAS_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js'],
function()
{

/**
 * Lezárások kezelésére szolgáló űrlap osztálya.      
 */
LezarasokForm = Form.extend(
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
    this.primaryField = LezarasokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = LezarasokScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = LezarasokGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = LezarasokInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = LezarasokModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
  },
      
  // @override
  toString : function()
  {
    return 'LezarasokForm';
  }
});

ModuleManager.ready('LezarasokForm');

});