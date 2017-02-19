var Felhasznalok = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/felhasznalok/FelhasznalokForm.js'
],
function()
{

/**
 * Felhasználók adatainak kezelésére szolgáló objektum osztálya.      
 */
Felhasznalok = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Felhaszn\u00e1l\u00f3 l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Felhaszn\u00e1l\u00f3 adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt felhaszn\u00e1l\u00f3(k) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Felhaszn\u00e1l\u00f3 l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Felhaszn\u00e1l\u00f3 adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = FelhasznalokForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = FelhasznalokRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = FelhasznalokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = FelhasznalokScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = FelhasznalokGetDataListAction;
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'felhasznaloNev',text:'Felhaszn\u00e1l\u00f3 neve'}));
    this.appendColumn(new TableColumn({id:'csoportNev',text:'Munkak\u00f6z\u00f6ss\u00e9g neve'}));
    this.appendColumn(new TableColumn({id:'tipus',text:'Felhaszn\u00e1l\u00f3 t\u00edpusa'}));
    this.appendColumn(new TableColumn({id:'oraado',text:'\u00d3raad\u00f3'}));
    this.appendColumn(new TableColumn({id:'szakoktato',text:'Szakoktat\u00f3'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
    
  // @override
  toString : function()
  {
    return 'Felhasznalok';
  }
});

ModuleManager.ready('Felhasznalok');

});