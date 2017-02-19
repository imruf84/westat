var Tktef = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/tktef/TktefForm.js',
 'lib/tools/tanevek/TanevekComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js',
 'lib/tools/felhasznalok/FelhasznalokComboBox.js'
],
function()
{

/**
 * Tanórán kívüli tevékenységek adatainak kezelésére szolgáló objektum osztálya.      
 */
Tktef = TableTool.extend(
{
  /**                
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Tkt.,ef. l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Tkt.,ef. adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt tkt.,ef.(ek) t\u00f6rl\u00e9se';
    this.loadLessonsBtnText = 'Tkt.,ef.-ok bet\u00f6lt\u00e9se \u00f3rarendb\u0151l';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Tkt.,ef. l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Tkt.,ef. adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = TktefForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = TktefRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = TktefPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TktefScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = TktefGetDataListAction;
    // Tevékenységek betöltése
    this.loadLessonsAction = TktefLoadLessonsAction;
    
    // Hiányzások szűrőinek létrehozása
    var tool = this;
    
    // Ebből az osztályból származtatjuk a tktef napló eszközt, ahol
    // nincs szükség ezekre a szűrőkre, így csak akkor hozzuk létre ha szükséges
    
    if ('boolean' === typeof(this.dontCreateFilters) && this.dontCreateFilters) return;
    
    // Tevékenységek betöltése
    if (this.actions.has(this.loadLessonsAction))
    this.loadLessonsBtn = this.appendButton(new Button(
    {
      text:tool.loadLessonsBtnText,
      onClick:function(){tool.loadLessons();}
    }));
    
    // Gombok sorrendjének megváltoztatása
    if (this.loadLessonsBtn instanceof Button)
      this.toolPanelCell.insertBefore(this.loadLessonsBtn.dom,
        ((this.modifyDataBtn instanceof Button)?this.modifyDataBtn:this.removeDataBtn).dom);
    
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
    this.appendColumn(new TableColumn({id:'oraszam',text:'\u00d3rasz\u00e1m'}));
    this.appendColumn(new TableColumn({id:'tantargyNev',text:'Megnevez\u00e9s'}));
    this.appendColumn(new TableColumn({id:'csoportos',text:'Csoportos'}));   
    this.appendColumn(new TableColumn({id:'dijazott',text:'D\u00edjazott'}));
  },
  
  // @override
  updateButtonsState : function()
  {
    this.base();
    
    if (this.loadLessonsBtn instanceof Button)
      this.loadLessonsBtn.setState(true);
  },
  
  loadLessons : function()
  {
    var tool = this;
    var param =
    {
      ACTION:tool.loadLessonsAction,
      url:tool.script,
      loading:true,
      onSuccess:function(response){tool.update(true);},
      onError:function(response){alert(response.ERROR_MSG);}
    };
    
    // Ha vannak szűrők, akkor azokat is hozzáadjuk
    var filters = this.getFiltersId();
    if (0 < filters.length)
    {
      param.FILTERS = new Array();
      for (var i = 0; i < filters.length; i++)
      {
        var id = filters[i];
        var filter = this.getFilterById(id);
        param.FILTERS[param.FILTERS.length] = id;
        param[id] = filter.getValue();
      }
    }

    Ajax.post(param);
  },
  
  // @override
  toString : function()
  {
    return 'Tktef';
  }
});

ModuleManager.ready('Tktef');

});