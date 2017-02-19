var Rnapok = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/rnapok/RnapokForm.js',
 'lib/tools/tanevek/TanevekComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js'
],
function()
{

/**
 * Rendhagyó napok adatainak kezelésére szolgáló objektum osztálya.      
 */
Rnapok = TableTool.extend(
{
  /**                
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Rendh. nap l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Rendh. nap adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt rendhagy\u00f3 nap(ok) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Rendhagy\u00f3 nap l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Rendhagy\u00f3 nap adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = RnapokForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = RnapokRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = RnapokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = RnapokScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = RnapokGetDataListAction;
    
    // Rendhagyó nap szűrőinek létrehozása
    var tool = this;
    
    var idoszakField = null;
    
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
          onSuccess:function(field){tool.update(true);}
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
    this.appendColumn(new TableColumn({id:'tipus',text:'T\u00edpus'}));
    this.appendColumn(new TableColumn({id:'megjegyzes',text:'Megjegyz\u00e9s'}));
  },
  
  // @override
  toString : function()
  {
    return 'Rnapok';
  }
});

ModuleManager.ready('Rnapok');

});