var OrakForm = null;

var OrakScript = 'lib/tools/orak/orak.php';
// Felhasználó heti óráinak a számának lekérdezése napi bontásban
var OrakGetFelhasznaloHetOraiAction = 'GET_FELHASZNALO_HETI_ORAI';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js'],
function()
{

/**
 * Órák adatainak kezelésére szolgáló űrlap osztálya.      
 */
OrakForm = Form.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum 
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
  },
      
  // @override
  toString : function()
  {
    return 'OrakForm';
  }
});

ModuleManager.ready('OrakForm');

});