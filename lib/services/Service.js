var Service = null;

ModuleManager.load(
['lib/BaseClass.js','lib/System.js','lib/tools/Tool.js','lib/HelpfulTools.js',
 'lib/widgets/Label.js','lib/ResizeManager.js','lib/tools/LoginConstants.js',
 'lib/widgets/Button.js'],
function()
{

/**
 * Szolgáltatást megvalósító objektumok alaposztálya.
 */
Service = BaseClass.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property menuBarWidth {number?undefined} a menüsáv szélessége ([200])
   *   #property menuItemHeight {number?undefined} a menüpontok magassága ([25]) 
   *   #property actions {Array():string} a felhasználó által használható parancsok listája               
   */
  constructor : function(args)
  {
    this.base(args);
    
    var service = this;
    
    this.menuBarWidth = (this.argsExist && 'number' === typeof(args.menuBarWidth)) ? 
      args.menuBarWidth : 200;
    this.menuItemHeight = (this.argsExist && 'number' === typeof(args.menuItemHeight)) ? 
      args.menuItemHeight : 25;
      
    // Parancsok tárolása
    this.actions = (this.argsExist && (args.actions instanceof Array)) ?
      args.actions : new Array();
      
    // Menüsáv létrehozása
    this.menuBarDiv = document.createElement('div');
    this.menuBarDiv.style.position = 'absolute';
    this.menuBarDiv.style.left = 
    this.menuBarDiv.style.top = '0px';
    this.menuBarDiv.style.padding =
    this.menuBarDiv.style.margin = '0px'; 
    this.menuBarDiv.style.backgroundColor = System.colors.divColor;
    this.menuBarDiv.style.borderRight = '1px solid black';
    this.menuBarDiv.style.width = this.menuBarWidth+'px';
    this.menuBarDiv.style.height = '100%';
    this.menuBarDiv.style.overflowX = 'hidden';
    this.menuBarDiv.style.overflowY = 'auto';
    document.body.appendChild(this.menuBarDiv);
    
    // Aktív menüelem
    this.activeMenuItem = null;
    
    // Menüpontok tárolójának a létrehozása
    this.menuItemsTable = document.createElement('table');
    this.menuItemsTable.cellPadding =
    this.menuItemsTable.cellSpacing = 0;
    this.menuItemsTable.border = 0;
    this.menuItemsTable.style.width = '100%';
    this.menuItemsTable.style.borderBottom = '1px solid black';
    this.menuBarDiv.appendChild(this.menuItemsTable); 
    
    // Eszközök funkcióinak a tárolójának a létrehozása
    var table = document.createElement('table');
    table.cellPadding =
    table.cellSpacing = 0;
    table.border = 0;
    table.style.width = '100%';
    this.menuBarDiv.appendChild(table);
    var row = table.insertRow(0);
    // Eszközök paneljának a tárolója
    this.toolCell = row.insertCell(0);
    
    // Munkaterület létrehozása
    this.workingAreaDiv = document.createElement('div');
    this.workingAreaDiv.style.position = 'absolute';
    this.workingAreaDiv.style.top = '0px';
    this.workingAreaDiv.style.left = (this.menuBarWidth+1)+'px';
    this.workingAreaDiv.style.padding =
    this.workingAreaDiv.style.margin = '0px';
    this.workingAreaDiv.style.height = '0px';
    this.workingAreaDiv.style.overflow = 'auto';
    this.workingAreaDiv.style.backgroundColor = System.colors.divColor;
    document.body.appendChild(this.workingAreaDiv);
    
    // Adatmennyiség szabályzó tárolójának a létrehozása
    this.dataLimitDiv = document.createElement('div');
    this.dataLimitDiv.style.position = 'absolute';
    this.dataLimitDiv.style.top = '0px';
    this.dataLimitDiv.style.left = (this.menuBarWidth+1)+'px';
    this.dataLimitDiv.style.padding =
    this.dataLimitDiv.style.margin = '0px';
    this.dataLimitDiv.style.height = 'auto';
    this.dataLimitDiv.style.overflow = 'hidden';
    this.dataLimitDiv.style.backgroundColor = System.colors.divColor;
    this.dataLimitDiv.style.borderTop = '1px solid black';
    document.body.appendChild(this.dataLimitDiv);
    
    var table = document.createElement('table');
    this.dataLimitDiv.appendChild(table);
    table.cellPadding =
    table.cellSpacing = 0;
    table.border = 0;
    var row = table.insertRow(0);
    row.style.height = '100%';
    
    // Elválasztó
    var cellIndex = 0;
    cell = row.insertCell(cellIndex++);
    cell.style.height = '100%';
    var separatorLbl = new Label({text:'\u00a0\u00a0'});
    separatorLbl.appendTo(cell);
    
    // Előző gomb
    var cell = row.insertCell(cellIndex++);
    cell.style.height = '100%';
    this.dataLimitPrevBtn = new Button({
      text:'<<',
      state:false,
      onClick:function(widget)
      {
        if (!(service.tool instanceof TableTool)) return;
        
        var currentPage = parseInt(service.dataLimitPageCb.getValue());
        
        if (!(currentPage > 0)) return;
        
        currentPage--;
        service.dataLimitPageCb.setValue(currentPage.toString());
      }
    });
    this.dataLimitPrevBtn.appendTo(cell);
    
    // Elválasztó
    cell = row.insertCell(cellIndex++);
    cell.style.height = '100%';
    separatorLbl = new Label({text:'\u00a0\u00a0'});
    separatorLbl.appendTo(cell);
    
    // Oldal
    cell = row.insertCell(cellIndex++);
    cell.style.height = '100%';
    this.dataLimitPageCb = new ComboBoxField({
      onChange:function(field,isValueValid)
      {
        if (!(service.tool instanceof TableTool)) return;
        
        service.tool.setPage(parseInt(field.getValue()));
        
        // Ha szükséges akkor engedélyezzük, vagy letiltjuk a megfelelő gombokat
        service.updatePrevNextButtonsState();
        
      }});
    this.dataLimitPageCb.appendTo(cell);
    this.dataLimitPageCb.appendItem('0','0');
    this.dataLimitPageCb.setValue('0');
    
    // Elválasztó
    cell = row.insertCell(cellIndex++);
    cell.style.height = '100%';
    separatorLbl = new Label({text:'\u00a0\u00a0'});
    separatorLbl.appendTo(cell);
    
    // Következő gomb
    cell = row.insertCell(cellIndex++);
    cell.style.height = '100%';
    this.dataLimitNextBtn = new Button({
      text:'>>',
      state:false,
      onClick:function(widget)
      {
        if (!(service.tool instanceof TableTool)) return;
        
        var maxPage = service.tool.getMaxPageCount();
        var currentPage = parseInt(service.dataLimitPageCb.getValue());
        
        if (!(currentPage < maxPage)) return;
        
        currentPage++;
        service.dataLimitPageCb.setValue(currentPage.toString());
      }
    });
    this.dataLimitNextBtn.appendTo(cell);
    
    // Sorszám címke
    cell = row.insertCell(cellIndex++);
    cell.style.height = '100%';
    this.dataLimitRowCountLbl = new Label({text:'\u00a0\u00a0Sorok sz\u00e1ma:'});
    this.dataLimitRowCountLbl.appendTo(cell);
    
    // Sorszám legördülő lista
    cell = row.insertCell(cellIndex++);
    cell.style.height = '100%';
    this.dataLimitRowsPerPageCb = new ComboBoxField({
      onChange:function(field,isValueValid)
      {
        if (!(service.tool instanceof TableTool)) return;
        
        service.tool.setRowsPerPage(parseInt(field.getValue()));
      }});
    this.dataLimitRowsPerPageCb.appendTo(cell);
    this.dataLimitRowsPerPageCb.appendItem(10,  '10');
    this.dataLimitRowsPerPageCb.appendItem(20,  '20');
    this.dataLimitRowsPerPageCb.appendItem(30,  '30');
    this.dataLimitRowsPerPageCb.appendItem(50,  '50');
    this.dataLimitRowsPerPageCb.appendItem(100, '100');
    this.dataLimitRowsPerPageCb.appendItem(200, '200');
    var allRows = 100000;
    this.dataLimitRowsPerPageCb.appendItem(allRows,  'Mind');
    this.dataLimitRowsPerPageCb.setValue(allRows);
    
    // Átméretező metódus regisztrálása
    var service = this;
    this.onResize = function(w,h)
    {
      service.workingAreaDiv.style.width = Math.max(0,w-service.menuBarWidth-1)+'px';
      service.workingAreaDiv.style.height = Math.max(0,h-service.dataLimitDiv.offsetHeight)+'px';
      
      service.dataLimitDiv.style.width = Math.max(0,w-service.menuBarWidth-1)+'px';
      service.dataLimitDiv.style.top = Math.max(0,service.workingAreaDiv.offsetHeight-1)+'px';
    };
    ResizeManager.addFunction(this.onResize,true);
    
    // Aktuális eszköz
    this.tool = null;
  },
  
  // @override
  destroy : function()
  {
    // Aktív eszköz eltávolítása
    this.setTool(null);
    
    // Átméretező metódus törlése
    ResizeManager.removeFunction(this.onResize);
    // Munkaterület eltávolítása
    var parent = this.workingAreaDiv.parentNode;
    if (('undefined' !== typeof(parent)) && (parent.removeChild))
      parent.removeChild(this.workingAreaDiv);
    // Menüsáv eltávolítása
    parent = this.menuBarDiv.parentNode;
    if (('undefined' !== typeof(parent)) && (parent.removeChild))
      parent.removeChild(this.menuBarDiv);
    // Adatmennyiség szabályozó eltávolítása
    parent = this.dataLimitDiv.parentNode;
    if (('undefined' !== typeof(parent)) && (parent.removeChild))
      parent.removeChild(this.dataLimitDiv);
      
    this.base();
  },
  
  addExitMenuItem : function()
  {
    var s = this;
    
    // Kilépés menüpont
    this.addMenuItem('Kil\u00e9p\u00e9s',function()
    {
      // Felhasználó ideinglenes adatainak a törlése (session)
      // Adatok ellenörzése
      var param = new Object();
      param.ACTION = LoginRemoveDataListAction;
      param.url = LoginScript;
      param.loading = true;
      // Sikeres bejelentkezés esetén elindítjuk a megfelelő szolgáltatást
      param.onSuccess = function(response)
      {
        // Kilépés eseményének futtatása
        s.onExit(s);
      };
      param.onError = function(response){alert(response.ERROR_MSG);};
      
      Ajax.post(param);
    });
  },
  
  /**
   * Az előző ill. a következő lap gombjainak az állapotának a beállítása.
   */     
  updatePrevNextButtonsState : function()
  {
    var currentPage = parseInt(this.dataLimitPageCb.getValue());
    var maxPage = this.tool.getMaxPageCount();
    this.dataLimitPrevBtn.setState(0<currentPage);
    this.dataLimitNextBtn.setState(currentPage<maxPage);
  },
  
  /**
   * Szolgáltatás elemeinek frissítése.
   * NOTE: - a megfeleő méretezés illetve pozicíonálás elvégzése   
   */     
  updateContents : function()
  {
    // Menüsáv méretének frissítése
    this.menuBarDiv.style.width = this.menuBarWidth+'px';
    // Munkaterület pozíciójának frissítése
    this.workingAreaDiv.style.left = (this.menuBarWidth+1)+'px';
    // Adatmennyiség szabályozó frissítése
    this.dataLimitDiv.style.left = (this.menuBarWidth+1)+'px';
    // Munkaterület méretének frissítése
    this.onResize(System.window.width(),System.window.height());
  },
  
  /**
   * Menüsáv szélességének a beállítása.
   * 
   * @param width {number} az új szélesség
   * @return {boolean} igaz ha sikerült a méret beállítása, egyébként hamis            
   */     
  setMenuBarWidth : function(width)
  {
    // Ha nem számot adtunk meg akkor kilépünk
    if ('number' !== typeof(width)) return false;
    // Ha negatív számot adtunk meg akkor kilépünk
    if (0 > width) return false;
    
    // Új méret beállítása
    this.menuBarWidth = width;
    // Tartalom méretének és pozíciójának frissítése
    this.updateContents();
    
    return true;
  },
  
  /**
   * Menüpont hozzáadása.
   *          
   * @param text {string} a menüpont felirata
   * @param onClick {function(menuItem:Label)} a menüpontra kattintás eseménye
   * @return {Label} a létrehozott menüpont objektuma   
   */     
  addMenuItem : function(text,onClick)
  {
    var service = this;
    
    var row = this.menuItemsTable.insertRow(this.menuItemsTable.rows.length);
    var cell = row.insertCell(0);
    
    cell.label = new Label({text:text,
                            onClick:function(widget)
                            {
                              if (service.activeMenuItem === widget) return;
                              if (null !== service.activeMenuItem)
                              {
                                service.activeMenuItem.dom.style.backgroundColor = '';
                                service.activeMenuItem = null;
                              }
                             
                              widget.dom.style.backgroundColor = System.colors.mouseClick;
                              service.activeMenuItem = widget;
                              if ('function' === typeof(onClick))
                                onClick(widget);
                            },
                            onMouseOver:function(widget)
                            {
                              if (service.activeMenuItem === widget) return;                              
                              widget.dom.style.backgroundColor = System.colors.mouseOver;
                            },
                            onMouseOut:function(widget)
                            {
                              if (service.activeMenuItem === widget) return;                              
                              widget.dom.style.backgroundColor = '';
                            }
                           });
    
    cell.label.dom.style.height = this.menuItemHeight+'px';
    
    cell.label.appendTo(cell);
  },
  
  /**
   * Eszköz beállítása.
   * NOTE: - a metódus automatikusan megsemmisíti az előző eszközt   
   * 
   * @param tool {Tool?null?undefined} a beállítandó eszköz   
   * NOTE: - undefined vagy null esetén csak törlődik az aktuális eszköz            
   */
  setTool : function(tool)
  {
  
    // Eltávolítjuk a régi eszközt
    if (this.tool instanceof Tool)
    {
    
      this.tool.destroy();
      this.tool = null;
      
    }
      
    if (!(tool instanceof Tool)) return;
    
    var service = this;
      
    // Beállítjuk az új eszközt
    tool.setWorkingArea(this.workingAreaDiv);
    tool.setToolPanel(this.toolCell);
    tool.rowsPerPage = parseInt(this.dataLimitRowsPerPageCb.getValue());
    tool.page = 0;
    tool.onRowsPerPageChange = function(lTool)
    {
      // Ideiglenesen letiltjuk az eseményeket
      var func = service.dataLimitPageCb.onChange;
      service.dataLimitPageCb.onChange = function(field,isValueValid){};
      
      
      // Létrehozzuk a lapok számát
      service.dataLimitPageCb.removeAllItems();
      for (var i = 0; i <= Math.max(0,lTool.getMaxPageCount()); i++)
        service.dataLimitPageCb.appendItem(i.toString(),i.toString());
        
      // Kezdőérték az eredeti lap, vagy az ahoz legközelebbi
      service.dataLimitPageCb.setValue(lTool.getPage().toString());
      
      // Események visszaállítása
      service.dataLimitPageCb.onChange = func;
      
      // Ha szükséges akkor engedélyezzük, vagy letiltjuk a megfelelő gombokat
      service.updatePrevNextButtonsState();
    };
    tool.construct();
    
    this.tool = tool;
    
  },
  
  // @override
  toString : function()
  {
    return 'Service';
  }     
});

ModuleManager.ready('Service');

});
