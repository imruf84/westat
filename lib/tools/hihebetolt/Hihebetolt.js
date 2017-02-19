var Hihebetolt = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/hihebetolt/HihebetoltForm.js',
 'lib/tools/tanevek/TanevekComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js'],
function()
{

/**
 * Hiányzások és helyettesítéske állományból veló betöltésének a kezelésére 
 * szolgáló objektum osztálya.      
 */
Hihebetolt = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = '\u00c1llom\u00e1ny fel\u00f6lt\u00e9se';
    this.modifyDataBtnText = '\u00c1llom\u00e1ny adatainak bet\u00f6lt\u00e9se';
    this.removeDataBtnText = 'Kijel\u00f6lt \u00e1llom\u00e1ny(ok) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = '\u00c1llom\u00e1ny fel\u00f6lt\u00e9se';
    this.modifyDataDialogTitle = '\u00c1llom\u00e1ny bet\u00f6lt\u00e9se';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = HihebetoltForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = HihebetoltRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = HihebetoltPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HihebetoltScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = HihebetoltGetDataListAction;
    
    // Hiányzások és helyettesítések állományból való betöltés szűrőinek létrehozása
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
          onSuccess:function(field,valid){tool.update(true);}
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
            null,
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
    this.appendColumn(new TableColumn({id:'allomanyNev',text:'\u00c1llom\u00e1ny neve'}));
  },    
  
  // @override
  showData : function(data,modify)
  {  
    var tool = this;
    
    // Szűrők listájának az elkészítése
    var filtersObj = new Object();
    for (var i = 0; i < this.filters.length; i++)
    {
      var filter = this.filters[i];
      filtersObj[filter.id] = filter.getValue();
    }
    filtersObj['allomanyNev'] = data['allomanyNev'];
    
    var form = new this.formClass({initalValues:filtersObj});
    
    new FormDialog(
    {
      title:tool.modifyDataDialogTitle,
      type:'modify',
      content:form,
      button1Text:'Bet\u00f6lt',
      onSuccess:function(dialog){tool.getDataListFromServer();}
    });    
  },
  
  // @override
  // NOTE: - a metódus jelenleg nem funkcionál
  //       - a szerver a kérést elutasítja
  //       - elvileg minden működik, csak a szerver oldalon kell lekódolni a dolgokat
  insertData : function()
  { 
    var tool = this;
    
    // Szűrők listájának az elkészítése
    var filtersObj = new Object();
    for (var i = 0; i < this.filters.length; i++)
    {
      var filter = this.filters[i];
      filtersObj[filter.id] = filter.getValue();
    }
    //filtersObj['allomanyNev'] = data['allomanyNev'];
    filtersObj['allomanyNev'] = 'teszt';
    
    var form = new this.formClass({initalValues:filtersObj});
    
    /*
      <script type="text/javascript">
        function submitform()
        {
          document.forms["myform"].submit();
        }
      </script>
      <form id="myform" action="submit-form.php">
        Search: <input type='text' name='query'>
        <a href="javascript: submitform()">Submit</a>
      </form>
     */
    
    new FormDialog(
    {
      title:tool.insertDataDialogTitle,
      type:'insert',
      content:form,
      button1Text:'Felt\u00f6lt',
      onSuccess:function(dialog){tool.getDataListFromServer();}
    }); 
    
  },
    
  // @override
  toString : function()
  {
    return 'Hihebetolt';
  }
});

ModuleManager.ready('Hihebetolt');

});