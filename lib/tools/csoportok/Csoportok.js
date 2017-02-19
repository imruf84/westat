var Csoportok = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/csoportok/CsoportokForm.js'],
function()
{

/**
 * Csoportok adatainak kezelésére szolgáló objektum osztálya.      
 */
Csoportok = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Munkak\u00f6z\u00f6ss\u00e9g l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Munkak\u00f6z\u00f6ss\u00e9g m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt munkak\u00f6z\u00f6ss\u00e9g(ek) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Munkak\u00f6z\u00f6ss\u00e9g l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Munkak\u00f6z\u00f6ss\u00e9g adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = CsoportokForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = CsoportokRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = CsoportokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = CsoportokScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = CsoportokGetDataListAction;
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'csoportNev',text:'Munkak\u00f6z\u00f6ss\u00e9g neve'}));
    this.appendColumn(new TableColumn({id:'felhasznaloNev',text:'Munkak\u00f6z\u00f6ss\u00e9g vezet\u0151je'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
    
  // @override
  toString : function()
  {
    return 'Csoportok';
  }
});

ModuleManager.ready('Csoportok');

});