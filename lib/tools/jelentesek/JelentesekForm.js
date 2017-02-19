var JelentesekForm = null;

var JelentesekPrimaryField = 'felhasznaloID';
var JelentesekScript = 'lib/tools/jelentesek/jelentesek.php';
var JelentesekGetDataListAction = 'GET_JELENTES_LIST';
var JelentesekRemoveDataListAction = 'REMOVE_JELENTES_LIST';
var JelentesekGetDataAction = 'GET_JELENTES_DATA';
var JelentesekInsertDataAction = 'INSERT_JELENTES_DATA';
var JelentesekModifyDataAction = 'MODIFY_JELENTES_DATA';
var JelentesekPrepareDownloadDataListAction = 'PREPARE_DOWNLOAD_JELENTES_LIST';
var JelentesekDownloadDataListAction = 'DOWNLOAD_JELENTES_LIST';
var JelentesekDownloadEmptyAction = 'DOWNLOAD_JELENTES_EMPTY';
var JelentesekClearTempDirAction = 'CLEAR_TEMP_DIR';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js'],
function()
{

/**
 * Jelentések kezelésére szolgáló űrlap osztálya.      
 */
JelentesekForm = Form.extend(
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
    this.primaryField = JelentesekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = JelentesekScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = JelentesekGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = JelentesekInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = JelentesekModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
  },
      
  // @override
  toString : function()
  {
    return 'JelentesekForm';
  }
});

ModuleManager.ready('JelentesekForm');

});