var Helyettesitestipusai = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/helyettesitestipusai/HelyettesitestipusaiForm.js'
],
function()
{

/**
 * Helyettesítések típusainak az adatainak kezelésére szolgáló objektum osztálya.      
 */
Helyettesitestipusai = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Helyettes\u00edt\u00e9s t\u00edpus\u00e1nak l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Helyettes\u00edt\u00e9s t\u00edpus\u00e1nak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Helyettes\u00edt\u00e9s t\u00edpus\u00e1nak t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Helyettes\u00edt\u00e9s t\u00edpus\u00e1nak l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Helyettes\u00edt\u00e9s t\u00edpus\u00e1nak adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = HelyettesitestipusaiForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = HelyettesitestipusaiRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = HelyettesitestipusaiPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HelyettesitestipusaiScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = HelyettesitestipusaiGetDataListAction;
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'helyettesitestipusaNev',text:'Helyettes\u00edt\u00e9s t\u00edpusa'}));
    this.appendColumn(new TableColumn({id:'osszevont',text:'\u00d6sszevont'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
    
  // @override
  toString : function()
  {
    return 'Helyettesitestipusai';
  }
});

ModuleManager.ready('Helyettesitestipusai');

});