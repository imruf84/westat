var Idoszakok = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/idoszakok/IdoszakokForm.js',
 'lib/tools/tanevek/TanevekComboBox.js'],
function()
{

/**
 * Időszakok adatainak kezelésére szolgáló objektum osztálya.      
 */
Idoszakok = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Id\u0151szak l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Id\u0151szak adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt id\u0151szak(ok) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Id\u0151szak l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Id\u0151szak adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = IdoszakokForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = IdoszakokRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = IdoszakokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = IdoszakokScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = IdoszakokGetDataListAction;
    
    // Tanévek listájának létrehozása
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
    this.appendColumn(new TableColumn({id:'idoszakNev',text:'Id\u0151szak'}));    
  },
  
  // @override
  toString : function()
  {
    return 'Idoszakok';
  }
});

ModuleManager.ready('Idoszakok');

});