var Jelentesek = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/jelentesek/JelentesekForm.js',
 'lib/BrowserDetect.js','lib/widgets/Dialog.js','lib/widgets/DateField.js',
 'lib/tools/tanevek/TanevekComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js',
 'lib/tools/jelentesek/JelentestipusaiComboBox.js'],
function()
{

/**
 * Jelentések kezelésére szolgáló objektum osztálya.      
 */
Jelentesek = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Kijel\u00f6lt jelent\u00e9s(ek) l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Jelent\u00e9s felt\u00f6lt\u00e9se';
    this.removeDataBtnText = 'Kijel\u00f6lt jelent\u00e9s(ek) t\u00f6rl\u00e9se';
    this.downloadDataBtnText = 'Kijel\u00f6lt jelent\u00e9s(ek) let\u00f6lt\u00e9se';
    this.downloadEmptyBtnText = '\u00dcres jelent\u00e9s let\u00f6lt\u00e9se';
    this.clearTempDirBtnText = 'Temp k\u00f6nyvt\u00e1r "tiszt\u00edt\u00e1sa"';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = '';
    this.modifyDataDialogTitle = 'Jelent\u00e9s felt\u00f6lt\u00e9se';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = JelentesekForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = JelentesekRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = JelentesekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = JelentesekScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = JelentesekGetDataListAction;
    // Adatok letöltésének parancsa
    this.downloadDataListAction = JelentesekDownloadDataListAction;
    // Temp könyvtár tisztítása
    this.clearTempDirAction = JelentesekClearTempDirAction;
        
    var tool = this;
    
    // Gombok hozzáadása
    // Jelentések letöltése
    if (this.actions.has(this.downloadDataListAction))
    this.downloadDataBtn = this.appendButton(new Button(
    {
      text:tool.downloadDataBtnText,
      onClick:function()
      {
        // Adatlista létrehozása
        var datas = new Array();
        for (var i = 0; i < tool.selectedRows.length; i++)
          datas[i] = tool.data[tool.selectedRows[i].dataIndex];
        
        tool.downloadDataList(datas);
      }
    }));
    // Gombok sorrendjének megváltoztatása
    if (this.downloadDataBtn instanceof Button)
      this.toolPanelCell.insertBefore(this.downloadDataBtn.dom,
        ((this.removeDataBtn instanceof Button)?this.removeDataBtn:this.selectAllBtn).dom);
        
    // Üres jelentés letöltése
    this.downloadEmptyBtn = this.appendButton(new Button(
    {
      text:tool.downloadEmptyBtnText,
      onClick:function(){tool.downloadEmpty();}
    }));
    // Gombok sorrendjének megváltoztatása
    if (this.downloadEmptyBtn instanceof Button)
      this.toolPanelCell.insertBefore(this.downloadEmptyBtn.dom,
        ((this.removeDataBtn instanceof Button)?this.removeDataBtn:this.selectAllBtn).dom);
        
    // Temp könyvtár tisztítása
    if (this.actions.has(this.clearTempDirAction))
    this.clearTempDirBtn = this.appendButton(new Button(
    {
      text:tool.clearTempDirBtnText,
      onClick:function(){tool.clearTempDir();}
    }));
    
    // Jelentések szűrőinek a létrehozása
    
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
      
      tool.appendFilter(
        new DateField(
        {
          id:'datumtol',
          value:'',
          minLength:10,
          maxLength:10,
          size:10
        }),
        new Label({text:'D\u00e1tumt\u00f3l:'}));
      
      tool.appendFilter(
        new DateField(
        {
          id:'datumig',
          value:'',
          minLength:10,
          maxLength:10,
          size:10
        }),
        new Label({text:'D\u00e1tumig:'}));
        
      tool.appendFilter(
        new JelentestipusaiComboBox(
        {
          id:'tipus',
          value:'szov'
        }),
        new Label({text:'Form\u00e1tum:'}));
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
    this.appendColumn(new TableColumn({id:'letrehozva',text:'L\u00e9trehozva'}));
  },   
  
  // @override
  updateButtonsState : function()
  {
    this.base();
    
    if (this.insertDataBtn instanceof Button)
      this.insertDataBtn.setState((0 < this.selectedRows.length));
    if (this.downloadDataBtn instanceof Button)
      this.downloadDataBtn.setState((0 < this.selectedRows.length));
    if (this.downloadDataBtn instanceof Button)
      this.downloadEmptyBtn.setState(true);
  }, 
  
  // @override
  onRowDbClick : function(row,data)
  {
    this.downloadDataList(new Array(data));
  },
  
  /**
   * Letöltést előkészítő függvény létrehozása.
   * 
   * @param url {string} az iframe url-je   
   * @return {function(response:AjaxResponseObject)} a letöltést végző függvény      
   */     
  createDownloadFunc : function(url)
  {
    var tool = this;
    var onSuccess = function(response)
    {
      // Dialógus ablak megjelenítése alternatív letöltéshez
      var dialogFunc = function()
      {
        var dialog = new Dialog(
        {
          title:'Let\u00f6lt\u00e9s',
          content:new Label({text:'Ha a let\u00f6lt\u00e9s nem kezd\u0151dik el '+
            'n\u00e9h\u00e1ny percen bel\u00fcl, kattintson a '+
            '"Let\u00f6lt\u00e9s" gombra!'}),
          buttons:new Array(
            new Button({text:'Let\u00f6lt\u00e9s',onClick:function(widget)
            {
              window.open(url,'Download','width=200,height=77,directories=no,location=no,menubar=no,resizable=no,scrollbars=1,status=no,toolbar=no');
              dialog.destroy();
            }}),
            new Button({text:'M\u00e9gsem',onClick:function(widget){dialog.destroy();}})
          )
        });
      };
    
      var iframe = document.createElement('iframe'); 
      iframe.src = url;
      iframe.style.width =
      iframe.style.height = '100';
      iframe.style.display = 'none';
    
      // Chrome alatt nem működik az eseményes dolog
      if ('Chrome' === BrowserDetect.browser)
      {
        document.body.appendChild(iframe);
        tool.getDataListFromServer(dialogFunc);
      }
      else
        tool.getDataListFromServer(function(){document.body.appendChild(iframe);dialogFunc();});
      
    };
    
    return onSuccess;
  },
  
  /**
   * Kijelölt jelentések letöltése.
   */     
  downloadDataList : function(datas)
  {           
    var ids = new Array();
    for (var i = 0; i < datas.length; i++)
      ids[i] = datas[i][this.primaryField];
      
    // Jelentések letöltésének elindítása
    var idoszakID = this.getFilterById('idoszakID');
    var tipus = this.getFilterById('tipus');
    
    // Figyelmeztetés küldése
    if ('bin' == tipus.getValue())
      if (!confirm('A megadott form\u00e1tum el\u0151\u00e1ll\u00edt\u00e1sa sok id\u0151t vehet ig\u00e9nybe. '+
                   'Val\u00f3ban folytatni k\u00edv\u00e1nja?')) return;
    
    var url = JelentesekScript+'?ACTION='+JelentesekDownloadDataListAction+
      '&FILTERS=idoszakID,tipus'+'&idoszakID='+idoszakID.getValue()+'&tipus='+tipus.getValue()+
      '&felhasznaloID='+ids.toString();
    
    var tool = this;  
    var onSuccess = tool.createDownloadFunc(url);
    this.insertRemoveDownloadFunc(ids,JelentesekPrepareDownloadDataListAction,
      function(response){onSuccess(response);});     
  },
  
  /**
   * Üres jelentés letöltése
   */     
  downloadEmpty : function()
  {
    var url = JelentesekScript+'?ACTION='+JelentesekDownloadEmptyAction;                    
    // Elkészítjük a letöltést vezérlő függvényt
    var onSuccess = this.createDownloadFunc(url);
    // Mivel nincs szükségünk a letöltés előkészítésére, így azonnal meghívhatjuk 
    // a letöltést elindító függvényt
    onSuccess();
  },
  
  clearTempDir : function()
  {
    var tool = this;
    var param =
    {
      ACTION:tool.clearTempDirAction,
      url:tool.script,
      loading:true,
      onError:function(response){alert(response.ERROR_MSG);}
    };

    Ajax.post(param);
  },
  
  /**
   * Jelentések létrehozását, törlését és letöltését kezelő függvény.
   * NOTE: - a két parancs nem sokban tér el egymástól, ezért egyszerűbb így megoldani
   * 
   * @param ids {Array():number} a kiválasztott felhasználók azonosítói
   * @param action {string} a végrehajtandó parancs neve
   * @param onSuccess {function(response)} a sikeres lefutás eseménye         
   * @param showConfirm {boolean?undefined} ha hamis akkor nem jelenik meg a 
   *   figyelmeztetés ([false])
   * @param text {string?undefined} figyelmeztető szöveg                     
   */     
  insertRemoveDownloadFunc : function(ids,action,onSuccess,showConfirm,text)
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
    var text = 'A m\u0171velet automatikusan fel\u00fcl\u00edrja a '+
      'l\u00e9tez\u0151 jelent\u00e9seket! Val\u00f3ban folytatni '+
      'k\u00edv\u00e1nja?';
    
    // Kijelölt felhasználók azonosítóinak lekérdezése
    var ids = new Array();
    for (var i = 0; i < this.selectedRows.length; i++)
      ids[i] = this.data[this.selectedRows[i].dataIndex][this.primaryField];
      
    var tool = this;
    this.insertRemoveDownloadFunc(ids,JelentesekInsertDataAction,
      function(response){tool.getDataListFromServer();},true,text);  
  },
  
  // @override
  removeDataList : function(datas)
  {
    var text = 'Val\u00f3ban t\u00f6r\u00f6lni k\u00edv\u00e1nja a kijel\u00f6lt '+
      'felhaszn\u00e1l\u00f3k jelent\u00e9seit?';
      
    var ids = new Array();
    for (var i = 0; i < datas.length; i++)
      ids[i] = datas[i][this.primaryField];
      
    var tool = this;
    this.insertRemoveDownloadFunc(ids,JelentesekRemoveDataListAction,
      function(response){tool.getDataListFromServer();},true,text);
  },
  
  // @override
  showData : function(data,modify)
  {  
    alert('A funkci\u00f3 jelenleg nem el\u00e9rhet\u0151!');  
  },
    
  // @override
  toString : function()
  {
    return 'Jelentesek';
  }
});

ModuleManager.ready('Jelentesek');

});