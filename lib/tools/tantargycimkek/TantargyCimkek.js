var TantargyCimkek = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/tantargycimkek/TantargyCimkekForm.js'],
function()
{

/**
 * Tantárgycímkék adatainak kezelésére szolgáló objektum osztálya.      
 */
TantargyCimkek = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Tant\u00e1rgy c. l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Tant\u00e1rgy c. adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt tant\u00e1rgy c. t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Tant\u00e1rgy c. l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Tant\u00e1rgy c. adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = TantargyCimkekForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = TantargyCimkekRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = TantargyCimkekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TantargyCimkekScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = TantargyCimkekGetDataListAction;
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'tantargyCimkeNev',text:'Tant\u00e1rgyc\u00edmke neve'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
    
  // @override
  toString : function()
  {
    return 'TantargyCimkek';
  }
});

ModuleManager.ready('TantargyCimkek');

});