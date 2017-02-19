var Hianyzasokai = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/hianyzasokai/HianyzasokaiForm.js'
],
function()
{

/**
 * Hiányzások okainak az adatainak kezelésére szolgáló objektum osztálya.      
 */
Hianyzasokai = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Hi\u00e1nyz\u00e1s ok\u00e1nak l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Hi\u00e1nyz\u00e1s ok\u00e1nak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Hi\u00e1nyz\u00e1s ok\u00e1nak t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Hi\u00e1nyz\u00e1s ok\u00e1nak l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Hi\u00e1nyz\u00e1s ok\u00e1nak adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = HianyzasokaiForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = HianyzasokaiRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = HianyzasokaiPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HianyzasokaiScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = HianyzasokaiGetDataListAction;
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'hianyzasokaNev',text:'Hi\u00e1nyz\u00e1s oka'}));
    this.appendColumn(new TableColumn({id:'tamogatott',text:'T\u00e1mogatott'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
    
  // @override
  toString : function()
  {
    return 'Hianyzasokai';
  }
});

ModuleManager.ready('Hianyzasokai');

});