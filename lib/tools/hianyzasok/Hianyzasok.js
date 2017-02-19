var Hianyzasok = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/hianyzasok/HianyzasokForm.js',
 'lib/tools/tanevek/TanevekComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js',
 'lib/tools/felhasznalok/FelhasznalokComboBox.js'
],
function()
{

/**
 * Hiányzások adatainak kezelésére szolgáló objektum osztálya.      
 */
Hianyzasok = TableTool.extend(
{
  /**                
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Hi\u00e1nyz\u00e1s l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Hi\u00e1nyz\u00e1s adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt hi\u00e1nyz\u00e1s(ok) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Hi\u00e1nyz\u00e1s l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Hi\u00e1nyz\u00e1s adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = HianyzasokForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = HianyzasokRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = HianyzasokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HianyzasokScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = HianyzasokGetDataListAction;
    
    // Hiányzások szűrőinek létrehozása
    var tool = this;
    
    var idoszakField = null;
    
    var createFelhasznalokFieldFunc = function(field)
    {
      tool.appendFilter(
        new FelhasznalokComboBox(
        {
          id:'felhasznaloID',
          loading:true,
          index:'first',
          onChange:function(field,valid){tool.update(true);},
          onSuccess:function(field){tool.update(true);}
        }),
        new Label({text:'Tan\u00e1r:'})
      );
    };
    
    var createIdoszakokFieldFunc = function(field)
    {
      tool.appendFilter(
        idoszakField = new IdoszakokComboBox(
        {
          id:'idoszakID',
          loading:true,
          index:'last',
          filters:{tanevID:tanevekField.getValue()},
          onChange:function(field,valid){tool.update(true);},
          // Felhasználók szűrőjének létrehozása
          onSuccess:createFelhasznalokFieldFunc
        }),
        new Label({text:'Id\u0151szak:'})
      );
    };
    
    var tanevekField = this.appendFilter(
      new TanevekComboBox(
      {
        id:'tanevID',
        loading:true,
        unused:true,
        index:'last',
        onChange:function(field,valid)
        {
          idoszakField.doAjax(
            function(field,valid){tool.update(true);},
            'last',
            {tanevID:tanevekField.getValue()}
          );
        },
        // Időszakok szűrőjének létrehozása
        onSuccess:createIdoszakokFieldFunc
      }),
      new Label({text:'Tan\u00e9v:'})
    );
 
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'datum',text:'D\u00e1tum'}));
    this.appendColumn(new TableColumn({id:'ora',text:'\u00d3ra'}));
    this.appendColumn(new TableColumn({id:'osztalyNev',text:'Oszt\u00e1ly'}));
    this.appendColumn(new TableColumn({id:'tantargyNev',text:'Tant\u00e1rgy'}));
    this.appendColumn(new TableColumn({id:'hianyzasokaNev',text:'Hi\u00e1nyz\u00e1s oka'}));   
    this.appendColumn(new TableColumn({id:'igazolt',text:'Igazolt'}));
  },
  
  // @override
  toString : function()
  {
    return 'Hianyzasok';
  }
});

ModuleManager.ready('Hianyzasok');

});