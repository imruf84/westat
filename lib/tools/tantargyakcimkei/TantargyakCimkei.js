var TantargyakCimkei = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/tantargyakcimkei/TantargyakCimkeiForm.js'],
function()
{

/**
 * Tantárgyak címkéit kezelő objektum osztálya.      
 */
TantargyakCimkei = TableTool.extend(
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
    this.formClass = TantargyakCimkeiForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = TantargyakCimkeiRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = TantargyakCimkeiPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TantargyakCimkeiScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = TantargyakCimkeiGetDataListAction;
    
    var tool = this;
    
    // Tantárgyak címkéinek a szűrőinek a létrehozása
    
    tool.appendFilter(
      tantargyField = new TantargyakComboBox(
      {
        id:'tantargyID',
        loading:true,
        index:'first',
        onChange:function(field,valid){tool.update(true);},
        onSuccess:function(filed){tool.update(true);}
      }),
      new Label({text:'Tant\u00e1rgy:'})
    );
    
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'tantargyCimkeNev',text:'Tant\u00e1rgyc\u00edmke neve'}));
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
   * Tantárgycímkék hozzárendelését, eltávolítását kezelő függvény.
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
    this.insertRemoveFunc(ids,TantargyakCimkeiInsertDataAction,
      function(response){tool.getDataListFromServer();}); 
  },
  
  // @override
  removeDataList : function(datas)
  {
    var ids = new Array();
    for (var i = 0; i < datas.length; i++)
      ids[i] = datas[i][this.primaryField];
      
    var tool = this;
    this.insertRemoveFunc(ids,TantargyakCimkeiRemoveDataListAction,
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
    return 'TantargyakCimkei';
  }
});

ModuleManager.ready('TantargyakCimkei');

});