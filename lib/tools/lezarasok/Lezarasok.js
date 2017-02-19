var Lezarasok = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/lezarasok/LezarasokForm.js'],
function()
{

/**
 * Időszakok lezárását kezelő objektum osztálya.      
 */
Lezarasok = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Kijel\u00f6lt(ek) lez\u00e1r\u00e1sa';
    this.modifyDataBtnText = '';
    this.removeDataBtnText = 'Kijel\u00f6lt(ek) megnyit\u00e1sa';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = '';
    this.modifyDataDialogTitle = '';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = LezarasokForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = LezarasokRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = LezarasokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = LezarasokScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = LezarasokGetDataListAction;
    
    var tool = this;
    
    // Lezárások szűrőinek a létrehozása
    
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
    this.appendColumn(new TableColumn({id:'felhasznaloNev',text:'Felhaszn\u00e1l\u00f3 neve'}));
    this.appendColumn(new TableColumn({id:'lezarva',text:'Lez\u00e1rva'}));
  },
  
  // @override
  updateButtonsState : function()
  {
    this.base();
    
    if (this.insertDataBtn instanceof Button)
      this.insertDataBtn.setState((0 < this.selectedRows.length));
  },
  
  /**
   * Időszakok lezárását és megnyitását kezelő függvény.
   * NOTE: - a két parancs nem sokban tér el egymástól, ezért egyszerűbb így megoldani
   * 
   * @param ids {Array():number} a kiválasztott felhasználók azonosítói
   * @param action {string} a végrehajtandó parancs neve
   * @param onSuccess {function(response)} a sikeres lefutás eseménye   
   * @param showConfirm {boolean?undefined} ha hamis akkor nem jelenik meg a 
   *   figyelmeztetés ([false])
   * @param text {string?undefined} figyelmeztető szöveg         
   */     
  insertRemoveFunc : function(ids,action,onSuccess,showConfirm,text)
  {
    if ('boolean' === typeof(showConfirm) && showConfirm && !confirm(text)) return;
    
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
      
    var text = 'Amennyiben lez\u00e1rja az id\u0151szakot, a tov\u00e1bbiakban '+
      'az id\u0151szak adatai nem lesznek m\u00f3dos\u00edthat\u00f3ak. Val\u00f3ban '+
      'folytatni k\u00edv\u00e1nja az id\u0151szak lez\u00e1r\u00e1s\u00e1t?';  
    
    var tool = this;
    this.insertRemoveFunc(ids,LezarasokInsertDataAction,
      function(response){tool.getDataListFromServer();},true,text); 
  },
  
  // @override
  removeDataList : function(datas)
  {
    var ids = new Array();
    for (var i = 0; i < datas.length; i++)
      ids[i] = datas[i][this.primaryField];
      
    var tool = this;
    this.insertRemoveFunc(ids,LezarasokRemoveDataListAction,
      function(response){tool.getDataListFromServer();});
  },
  
  // @override
  onRowDbClick : function(row,data)
  {
    // Felhasználó állapotának a lekérdezése
    var tool = this;
    
    var b = ('X' === data['lezarva']);

    if (b)
      this.removeDataList(new Array(data));
    else
      this.insertData();
  },
    
  // @override
  toString : function()
  {
    return 'Lezarasok';
  }
});

ModuleManager.ready('Lezarasok');

});