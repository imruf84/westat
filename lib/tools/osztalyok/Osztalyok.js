var Osztalyok = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/osztalyok/OsztalyokForm.js'],
function()
{

/**
 * Osztályok adatainak kezelésére szolgáló objektum osztálya.      
 */
Osztalyok = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Oszt\u00e1ly l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Oszt\u00e1ly adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt oszt\u00e1ly t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Oszt\u00e1ly l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Oszt\u00e1ly adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = OsztalyokForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = OsztalyokRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = OsztalyokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OsztalyokScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = OsztalyokGetDataListAction;
    
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
    this.appendColumn(new TableColumn({id:'osztalyNev',text:'Oszt\u00e1ly neve'}));
    this.appendColumn(new TableColumn({id:'tipus',text:'Oszt\u00e1ly t\u00edpusa'}));
    this.appendColumn(new TableColumn({id:'tanevNev',text:'Indul\u00e1s \u00e9ve'}));
    this.appendColumn(new TableColumn({id:'indulo',text:'Indul\u00f3 oszt\u00e1ly'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
    
  // @override
  toString : function()
  {
    return 'Osztalyok';
  }
});

ModuleManager.ready('Osztalyok');

});