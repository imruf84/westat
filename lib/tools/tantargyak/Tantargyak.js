var Tantargyak = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/tantargyak/TantargyakForm.js'],
function()
{

/**
 * Tantárgyak adatainak kezelésére szolgáló objektum osztálya.      
 */
Tantargyak = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Tant\u00e1rgy l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Tant\u00e1rgy adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt tant\u00e1rgy(ak) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Tant\u00e1rgy l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Tant\u00e1rgy adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = TantargyakForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = TantargyakRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = TantargyakPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TantargyakScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = TantargyakGetDataListAction;
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'tantargyNev',text:'Tant\u00e1rgy neve'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
    
  // @override
  toString : function()
  {
    return 'Tantargyak';
  }
});

ModuleManager.ready('Tantargyak');

});