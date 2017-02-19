var OsztalyokCimkei = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/osztalyokcimkei/OsztalyokCimkeiForm.js'],
function()
{

/**
 * Osztályok címkéit kezelő objektum osztálya.      
 */
OsztalyokCimkei = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Kijel\u00f6lt(ek) hozz\u00e1rendel\u00e9se';
    this.modifyDataBtnText = '';
    this.removeDataBtnText = 'Kijel\u00f6lt(ek) elt\u00e1vol\u00edt\u00e1sa';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = '';
    this.modifyDataDialogTitle = '';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = OsztalyokCimkeiForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = OsztalyokCimkeiRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = OsztalyokCimkeiPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OsztalyokCimkeiScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = OsztalyokCimkeiGetDataListAction;
    
    var tool = this;
    
    var osztalyField = null;
    
    // Osztályok címkéinek a szűrőinek a létrehozása
    
    var createOsztalyFieldFunc = function(field)
    {
      var filter = tool.appendFilter(
        osztalyField = new OsztalyokComboBox(
        {
          id:'osztalyID',
          loading:true,
          index:'first',
          filters:{tanevID:tanevekField.getValue()},
          onChange:function(field,valid){tool.update(true);},
          onSuccess:function(filed){tool.update(true);}
        }),
        new Label({text:'Oszt\u00e1ly:'})
      );
    };
    
    var tanevekField = this.appendFilter(
      new TanevekComboBox(
      {
        id:'tanevID',
        loading:true,
        index:'last',
        onChange:function(field,valid)
        {
          osztalyField.doAjax(
            function(){tool.update(true);},
            'first',
            {tanevID:tanevekField.getValue()}
          );
        },
        // Osztályok szűrőjének létrehozása
        onSuccess:createOsztalyFieldFunc
      }),
      new Label({text:'Tan\u00e9v:'})
    );
    
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'osztalyCimkeNev',text:'Oszt\u00e1lyc\u00edmke neve'}));
    this.appendColumn(new TableColumn({id:'hozzarendelve',text:'Hozz\u00e1rendelve'}));
  },
  
  // @override
  updateButtonsState : function()
  {
    this.base();
    
    if (this.insertDataBtn instanceof Button)
      this.insertDataBtn.setState((0 < this.selectedRows.length));
  },
  
  /**
   * Osztálycímkék hozzárendelését, eltávolítását kezelő függvény.
   * NOTE: - a két parancs nem sokban tér el egymástól, ezért egyszerűbb így megoldani
   * 
   * @param ids {Array():number} a kiválasztott felhasználók azonosítói
   * @param action {string} a végrehajtandó parancs neve
   * @param onSuccess {function(response)} a sikeres lefutás eseménye   
   */     
  insertRemoveFunc : function(ids,action,onSuccess)
  {
    var lOnSuccess = ('function' === typeof(onSuccess)) ? onSuccess : function(response){};
      
    var tool = this;
    var param =
    {
      ACTION:action,
      url:tool.script,
      loading:true,
      onSuccess:lOnSuccess,
      onError:function(response){alert(response.ERROR_MSG);}
    };
    param[tool.primaryField] = ids;
    
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
  insertData : function()
  {
    // Kijelölt felhasználók azonosítóinak lekérdezése
    var ids = new Array();
    for (var i = 0; i < this.selectedRows.length; i++)
      ids[i] = this.data[this.selectedRows[i].dataIndex][this.primaryField];
      
    var tool = this;
    this.insertRemoveFunc(ids,OsztalyokCimkeiInsertDataAction,
      function(response){tool.getDataListFromServer();}); 
  },
  
  // @override
  removeDataList : function(datas)
  {
    var ids = new Array();
    for (var i = 0; i < datas.length; i++)
      ids[i] = datas[i][this.primaryField];
      
    var tool = this;
    this.insertRemoveFunc(ids,OsztalyokCimkeiRemoveDataListAction,
      function(response){tool.getDataListFromServer();});
  },
  
  // @override
  onRowDbClick : function(row,data)
  {
    // Osztálycímke hozzárendeltségének a lekérdezése
    var tool = this;
    
    var b = ('X' === data['hozzarendelve']);

    if (b)
      this.removeDataList(new Array(data));
    else
      this.insertData();
  },
    
  // @override
  toString : function()
  {
    return 'OsztalyokCimkei';
  }
});

ModuleManager.ready('OsztalyokCimkei');

});