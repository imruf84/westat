var SzakmaCsoportok = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/szakmacsoportok/SzakmaCsoportokForm.js'],
function()
{

/**
 * Szakmacsoportok adatainak kezelésére szolgáló objektum osztálya.      
 */
SzakmaCsoportok = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Sz.csoport l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Sz.csoport adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt sz.csoport(ok) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Szakmacsoport l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Szakmacsoport adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = SzakmaCsoportokForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = SzakmaCsoportokRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = SzakmaCsoportokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = SzakmaCsoportokScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = SzakmaCsoportokGetDataListAction;
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'szakmaCsoportNev',text:'Szakmacsoport neve'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
    
  // @override
  toString : function()
  {
    return 'SzakmaCsoportok';
  }
});

ModuleManager.ready('SzakmaCsoportok');

});