var OsztalyCimkek = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/osztalycimkek/OsztalyCimkekForm.js'],
function()
{

/**
 * Osztálycímkék adatainak kezelésére szolgáló objektum osztálya.      
 */
OsztalyCimkek = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Oszt\u00e1ly c. l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Oszt\u00e1ly c. adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt oszt\u00e1ly c. t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Oszt\u00e1lyc\u00edmke l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Oszt\u00e1lyc\u00edmke adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = OsztalyCimkekForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = OsztalyCimkekRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = OsztalyCimkekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OsztalyCimkekScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = OsztalyCimkekGetDataListAction;
    
    // Szűrők listájának létrehozása
    var tool = this;
    this.appendFilter(
      new TanevekComboBox(
      {
        id:'tanevID',
        loading:true,
        index:'last',
        onSuccess:function(field){tool.update(true);},
        onChange:function(field,valid){tool.update(true);}
      }),
      new Label({text:'Tan\u00e9v:'})
    );
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'osztalyCimkeNev',text:'Oszt\u00e1lyc\u00edmke neve'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
    
  // @override
  toString : function()
  {
    return 'OsztalyCimkek';
  }
});

ModuleManager.ready('OsztalyCimkek');

});