var Tanevek = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/tanevek/TanevekForm.js'],
function()
{

/**
 * Tanévek adatainak kezelésére szolgáló objektum osztálya.      
 */
Tanevek = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Tan\u00e9v l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Tan\u00e9v adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt tan\u00e9v(ek) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Tan\u00e9v l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Tan\u00e9v adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = TanevekForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = TanevekRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = TanevekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TanevekScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = TanevekGetDataListAction;
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'tanevNev',text:'Tan\u00e9v'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },
    
  // @override
  toString : function()
  {
    return 'Tanevek';
  }
});

ModuleManager.ready('Tanevek');

});