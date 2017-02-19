var TableColumn = null;
var TableTool = null;

ModuleManager.load(
['lib/Tool.js','lib/System.js','lib/widgets/Label.js','lib/BrowserDetect.js',
 'lib/widgets/Button.js','lib/HelpfulTools.js','lib/Ajax.js',
 'lib/widgets/FormDialog.js','lib/KeyManager.js','lib/HelpfulTools.js'],
function()
{

/**
 * Táblázat oszlopát megvalósító osztály.
 * Funkciók: - új adat beszúrása (csak megfelelő jogok mellett)
 *           - adatsor kilistázása (oszlopok alapján)  
 *           - adat törlése (csak megfelelő jogok mellett)
 *           - adat lekérdezése 
 */ 
TableColumn = BaseClass.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property id {string} az oszlop azonosítója
   *   NOTE: - csak a oneWord mintának megfelelő azonosító adható meg   
   *   #property text {string} az oszlop felirata
   */
  constructor : function(args)
  {
    this.base(args);
    
    this.id = (this.argsExist && 'string' === typeof(args.id) && 
               (System.patterns.oneWord.pattern.test(this.id))) ? args.id : '';
    
    this.text = (this.argsExist && 'string' === typeof(args.text)) ? args.text : '';
  },
  
  // @override
  toString : function()
  {
    return 'TableColumn';
  }
});


/**
 * Táblázat alapú eszközöket megvalósító objektumok alaposztálya.
 * NOTE: - az adatok megjelenítése táblázatban történik meg, ami lehetőséget
 *         biztosít beszúrásra, módosításra, törlésre, szűrésre stb.  
 */
TableTool = Tool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property actions {Array():string} a felhasználó által használható parancsok listája   
   *   #property page {integer} oldalszám               
   *   #property rowsPerPage {integer} oldalankénti sorok száma
   *   #property onRowsPerPageChange {function(tool:TableTool)} a laponkénti sorok számának a megváltozása   
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Az oszlopokat tároló tömb
    this.columns = new Array();
    // A táblázat adatait tároló objektum
    this.data = null;
    // A táblázatban megjelenítendő adatok indexei
    this.dataToShow = new Array();
    // Az adatokat tartalmazó sorok magasságainak összege
    this.dataRowsHeight = 0;
    // A kijelölt sorokat tartalmazó tömb
    this.selectedRows = new Array();
    
    // Oldalbeállítások
    this.page = (this.argsExist && 'number' === typeof(args.page)) ? args.page : 0;
    this.rowsPerPage = (this.argsExist && 'number' === typeof(args.rowsPerPage)) ? args.rowsPerPage : 50;
    
    // Események tárolása
    this.onRowsPerPageChange = (this.argsExist && 'function' === typeof(args.onRowsPerPageChange)) ? 
      args.onRowsPerPageChange : function(){};
    
    // Parancsok tárolása
    this.actions = (this.argsExist && (args.actions instanceof Array)) ?
      args.actions : new Array();
    
    // Gombfeliratok
    this.insertDataBtnText;
    this.modifyDataBtnText;
    this.removeDataBtnText;
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle;
    this.modifyDataDialogTitle;
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass;
    
    // Adatbázissal való kapcsolat esetén az elsődleges kulcs azonosítója
    this.primaryField = '';
    // Az eszközt kiszolgáló szerver oldali script neve
    this.script = '';
    
    // Táblázat kiterjesztésének előkészítése (munkaterület méretének kiterjesztése)
    this.workingAreaTable.style.width = '100%';
    var row = this.workingAreaTable.rows[0];
    row.style.width =
    row.style.height = '100%';
    var cell = row.cells[0];
    cell.vAlign = 'top';
    
    // Adattábla létrehozása
    this.dataDiv = document.createElement('div');
    this.dataDiv.style.overflow = 'hidden';
    cell.appendChild(this.dataDiv);
    this.dataTable = document.createElement('table');    
    this.dataTable.cellPadding = 
    this.dataTable.cellSpacing = 0;
    this.dataTable.border = 0;
    this.dataTable.style.width = '100%';
    this.dataDiv.appendChild(this.dataTable);
    
    // Fejléc létrehozása
    this.headRow = this.workingAreaTable.insertRow(0);
    this.headRow.style.backgroundColor = System.colors.tableColumn;
    
    // Legalább egy oszlopnak lennie kell a táblázatban
    var headCell = this.appendCell({row:this.headRow,text:'TTT'});
    headCell.style.borderBottom = '2px black solid';
    // A felirat színét a hátterére állítjuk
    headCell.label.font.color = System.colors.tableColumn;
        
    // Átméretező függvény regisztrálása
    var tool = this;
    this.onResize = function(w,h)
    {
      if (null !== tool.workingArea)
      {
        // IE esetén le kell vonni a görgetősávok méretét
        var i = ('Explorer' === BrowserDetect.browser) ? -1 : 0;
        tool.workingAreaTable.style.height = (tool.workingArea.offsetHeight+(i*System.window.scrollBarWidth()))+'px';
        
        var scrollWidth = (tool.workingArea.offsetWidth < tool.workingAreaTable.offsetWidth) ? System.window.scrollBarWidth() : 0;
        tool.dataDiv.style.height = (tool.workingArea.offsetHeight-tool.headRow.offsetHeight-scrollWidth)+'px';
        
        // Munkaterület függőleges görgetősávjának letiltása
        tool.workingArea.style.overflow = 'hidden';
        tool.workingArea.style.overflowX = 'auto';
        
        // Terület kitöltése üres sorokkal
        tool.fillWithEmptyRows();
        
      }
    };
    ResizeManager.addFunction(this.onResize,true);
    
    // Vezérlő gombok létrehozása
    
    // Form ideinglenes létrehozása
    var form = new this.formClass({type:'empty'}); 
    
    // Új adat beszúrása
    if (this.actions.has(form.insertDataAction))
    this.insertDataBtn = this.appendButton(new Button(
    {
      text:tool.insertDataBtnText,
      onClick:function()
      {
        tool.insertData();
      }
    }));
    
    // Kijelölt adat módosítása
    if (this.actions.has(form.modifyDataAction))
    this.modifyDataBtn = this.appendButton(new Button(
    {
      text:tool.modifyDataBtnText,
      onClick:function()
      {
        tool.showData(tool.data[tool.selectedRows[0].dataIndex],true);
      }
    }));
    
    // Kijelölt adat(ok) törlése
    if (this.actions.has(this.removeDataListAction))
    this.removeDataBtn = this.appendButton(new Button(
    {
      text:tool.removeDataBtnText,
      onClick:function()
      {
        // Adatlista létrehozása
        var datas = new Array();
        for (var i = 0; i < tool.selectedRows.length; i++)
          datas[i] = tool.data[tool.selectedRows[i].dataIndex];
        
        tool.removeDataList(datas);
      }
    }));
        
    // Összes kijelölése
    this.selectAllBtn = this.appendButton(new Button(
    {
      text:'\u00d6sszes kijel\u00f6l\u00e9se',
      onClick:function(){tool.selectRowAll();}
    }));
    
    // Kijelölés megszüntetése
    this.deselectAllBtn = this.appendButton(new Button(
    {
      text:'Kijel\u00f6l\u00e9s megsz\u00fcntet\u00e9se',
      onClick:function(){tool.deselectRowAll();}
    }));
    
    // Lista frissítése
    this.refreshDataBtn = this.appendButton(new Button(
    {
      text:'Adatok friss\u00edt\u00e9se',
      onClick:function(){tool.getDataListFromServer();}
    }));
    
    form.destroy();
    
    // Gombok állapoítának a frissítése
    this.updateButtonsState();
    
  },
  
  // @override
  destroy : function()
  { 
    // Munkaterület függőleges görgetősávjának engedélyezése
    if (this.workingArea)
      this.workingArea.style.overflow = 'auto';
      
    ResizeManager.removeFunction(this.onResize);
    
    this.base();
  },
  
  // @override
  createElements : function()
  {
    // Adatok listájának a lekérdezése
    // NOTE: - csak akkor kérjük le ebben a szakaszban, ha nincsenek szűrők, 
    //         amikre várni kellene
    if (!(0 < this.getFiltersId().length))
      this.getDataListFromServer();
  },
  
  // @override
  updateFunction : function()
  { 
    // Adatok letöltése
    // NOTE: - általában a szűrők tartalmának betöltése során fut le   
    this.getDataListFromServer();
  },
  
  /**
   * Oszlop sorszámának lekérdezése azonosító alapján.
   * 
   * @return {number} az oszlop indexe, vagy hiba esetén -1      
   */     
  getColumnIndexById : function(id)
  {
    if ('string' !== typeof(id)) return -1;
    
    for (var i = 0; i < this.columns.length; i++)
    {
      var column = this.columns[i];
      if (column.id === id) return i;
    }
    
    return -1;
  },
  
  /**
   * Oszlop megkeresése azonosító alapján.
   * 
   * @param id {string} a keresendő oszlop azonosítója
   * @return {TableColumn?null} a keresett oszlop, vagy hiba esetén null         
   */     
  getColumnById : function(id)
  { 
    var index = this.getColumnIndexById(id);
    return (0 > index) ? null : this.columns[index];
  },
  
  /**
   * Oszlopok azonosítóinak tömbbe rendezése.
   * NOTE: - az elsődleges kulcs minden esetben bele kerül   
   * 
   * @return {Array():string} az oszlopok azonosítóinak tömbje          
   */     
  getColumnsId : function()
  { 
    var fields = new Array();
    for (var i = 0; i < this.columns.length; i++)
      fields[i] = this.columns[i].id;
    // Az azonosító mindenképpen szerepel benne
    if ('' !== this.primaryField)
      fields[fields.length] = this.primaryField;
    // Ismétlődő elemek eltávolítása
    fields = removeDuplicates(fields);
    
    return fields;
  },
  
  /**
   * Oszlop hozzáadása a táblázathoz.
   * 
   * @param column {TableColumn} a hozzáadandó oszlop
   * @return {TableColumn?null} a hozzáadott oszlop, vagy hiba esetén null             
   */     
  appendColumn : function(column)
  {
    if (!(column instanceof TableColumn)) return null;
    // Ha nincs megadva oszlopazonosító, akkor kilépünk
    if ('' === column.id) return null;
    // Ha létezik már ilyen oszlopazonosító, akkor kilépünk
    if (null !== this.getColumnById(column.id)) return null;
    
    // Oszlop hozzáadása a tárolóhoz
    this.columns[this.columns.length] = column;
    
    // Oszlop beszúrása dom szinten
    var cell = this.appendCell({row:this.headRow,index:this.columns.length-1,text:column.text});
    cell.label.font.style.fontWeight = 'bold';
    cell.label.font.style.color = 'black';
    cell.style.borderRight = '1px black solid';
    cell.style.borderBottom = '2px black solid';
    var w = cell.style.width = cell.label.dom.style.width = (cell.label.getContentSize()[0])+'px';
    
    // Oszlop hozzáadása a sorokhoz
    for (var i = 0; i < this.dataTable.rows.length; i++)
    {
      var row = this.dataTable.rows[i];
      var cell2 = this.appendCell({row:row,index:this.columns.length-1});
      
      cell2.style.borderRight = '1px solid black';
      cell2.style.width = cell2.label.dom.style.width = w;
    }
    
    // Az utolsó sort kiterjesztjük az oszlopszám szerint
    this.updateLastCellColSpan();
    
    // Megfelelő gombok állapotának frissítése a kijelölés alapján
    this.updateButtonsState();
    
    return column;
  },
  
  /**
   * Oszlop eltávolítása a táblázatból.
   * 
   * @param id {string} az eltávolítandó oszlop azonosítója
   * @return {bool} igaz ha az eltávolítás sikerült, egyébként hamis             
   */     
  removeColumn : function(id)
  {
    // Ha nincs megadva oszlopazonosító, akkor kilépünk
    if ('' === id) return false;
    
    // Ha nem létezik ilyen oszlopazonosító, akkor kilépünk
    var column = this.getColumnById(id);
    if (null === column) return false;
    
    // Oszlop eltávolítása a tárolóból
    var columnIndex = this.getColumnIndexById(id);
    this.columns.splice(columnIndex,1);
    
    // Oszlop eltávolítása DOM szinten
    this.headRow.removeChild(this.headRow.cells[columnIndex]);
    for (var i = 0; i < this.dataTable.rows.length; i++)
      this.dataTable.rows[i].removeChild(this.dataTable.rows[i].cells[columnIndex]);
    
    // Az utolsó sort kiterjesztjük az oszlopszám szerint
    this.updateLastCellColSpan();
    
    // Megfelelő gombok állapotának frissítése a kijelölés alapján
    this.updateButtonsState();
    
    return true;
  },
  
  /**
   * Új üres sor beszúrása a táblázatba.
   * 
   * @return {HTMLTableRowElement} a hozzáadott sor      
   */     
  appendRow : function()
  {
    // Sor létrehozása
    var index = this.dataTable.rows.length;
    var row = this.dataTable.insertRow(index);
    
    // Sor sorszámának tárolása
    row.index = index;
    
    // Sor színének a beállítása
    row.color = row.style.backgroundColor = (this.dataTable.rows.length % 2) ? 
      System.colors.tableRow2 : System.colors.tableRow1;
    
    // Egyenlőre nem tárol adatot
    row.dataIndex = -1;
    var cell;
    for (var i = 0; i < this.columns.length+1; i++)
    {
      // Ha még nem az utolsó cellánál tartunk akkor beállítjuk a tulajdonságait
      cell = this.appendCell({row:row});
      if (i !== this.columns.length)
      {
        cell.style.borderRight = '1px solid black';
        cell.style.width = cell.label.dom.style.width = (this.headRow.cells[i].offsetWidth-1)+'px';
      }
    }
    
    // Események beállítása
    var tool = this;
    row.onclick = function()
    {
      // A Ctrl billentyű állapota
      var ctrl = KeyManager.isKeyDown(KeyManager.KEY_CTRL);
      
      // Ha nincs lenyomva a Ctrl billentyű akkor töröljük a kijelölések listáját
      if (!ctrl)
        tool.deselectRowAll();
    
      // Ha nincs adat a sorban tárolva akkor megszüntetjük a kijelöléseket és kilépünk
      if (0 > this.dataIndex) return;
      
      // Ha le van nyomva a Ctrl akkor több kijelölés is lehetséges
      tool.setRowSelection(this,(ctrl) ? !tool.isRowSelected(this) : true);
    };
    row.ondblclick = function()
    {
      // Ha nincs adat a sorban tárolva akkor kilépünk
      if (0 > this.dataIndex) return;
      
      // Ha van adat akkor lefuttatjuk a megfelelő eseményt
      tool.onRowDbClick(this,tool.data[this.dataIndex]);
    };
    
    // Az utolsó cella kitölti a rendelkezésre álló területet
    cell.style.width = '100%';
    cell.label.font.style.color = row.style.backgroundColor;
    
    return row;
  },   
  
  /**
   * Táblázat sorára való dupla kattintás eseménye.
   * NOTE: - alapértelmezésben nem történik semmi   
   * 
   * @param row {HTMLTableRowElement} a sor, amelyre kattintottunk
   * @param data {Object} a sorhoz tartozó adat         
   */     
  onRowDbClick : function(row,data)
  {
    // Csak akkor jelenítjük meg az adatokat, ha egy sor van kijelölve, és ez
    // a vizsgálandó sor
    if (this.selectedRows[0] !== row) return;
    
    this.showData(data,true);
  },
  
  /**
   * Összes sor kijelölése.
   * NOTE: - csak az adatokkal rendelkező sorokra vonatkozik   
   */
  selectRowAll : function()
  {
    for (var i = 0; i < this.dataToShow.length; i++)
      this.selectRow(this.dataTable.rows[i]);
  },     
  
  /**
   * Összes sor kijelölésének megszüntetése.
   * NOTE: - csak az adatokkal rendelkező sorokra vonatkozik   
   */
  deselectRowAll : function()
  {
    for (var i = 0; i < this.selectedRows.length;)
      this.deselectRow(this.selectedRows[0]);
  },
  
  /**
   * Sor kijelölése.                    
   * 
   * @param row {HTMLTableRowElement} a kijelölendő sor      
   */     
  selectRow : function(row)
  {
    var index = this.getRowSelection(row);
    if (('undefined' === typeof(index)) || !(0 > index)) return;
    
    this.selectedRows[this.selectedRows.length] = row;
    
    row.cells[row.cells.length-1].label.font.style.color = 
    row.style.backgroundColor = System.colors.tableSelectedRow;
    
    // Megfelelő gombok állapotának frissítése a kijelölés alapján
    this.updateButtonsState();
  },
  
  /**
   * Sor kijelölésének a megszüntetése.      
   * 
   * @param row {HTMLTableRowElement} a nem kijelölendő sor      
   */     
  deselectRow : function(row)
  {
    var index = this.getRowSelection(row);
    if (('undefined' === typeof(index)) || (0 > index)) return;
    
    this.selectedRows.splice(index,1);  
    
    row.cells[row.cells.length-1].label.font.style.color =           
    row.style.backgroundColor = row.color;
    
    // Megfelelő gombok állapotának frissítése a kijelölés alapján
    this.updateButtonsState();
  },
  
  /**
   * Sor kijelölésének a megadása.
   * 
   * @param row {HTMLTableRowElement} a nem kijelölendő sor
   * @param selection {boolean} ha igaz akkor a sor ki lesz jelölve         
   */     
  setRowSelection : function(row,selection)
  {
    if ('boolean' !== typeof(selection)) return;
    
    if (true === selection)
      this.selectRow(row);
    else
      this.deselectRow(row);
  },
  
  /**
   * Sor kijelöltségének a lekérdezése.
   * 
   * @param row {HTMLTableRowElement} a lekérdezendő sor
   * @return {number?-1?undefined}
   * NOTE: - number:ha ki van jelölve (a sor indexe a kijelölés listában)
   *       - -1:ha nincs kijelölve
   *       - undefined:hiba esetén                   
   */     
  getRowSelection : function(row)
  {
    if ('undefined' === typeof(row)) return;
    
    for (var i = 0; i < this.selectedRows.length; i++)
      if (this.selectedRows[i] === row) return i;
    
    return -1;
  },
  
  /**
   * Sor kijelöltségének a lekérdezése.
   * 
   * @param row {HTMLTableRowElement} a lekérdezendő sor
   * @return {boolean} igaz ha a sor ki van jelölve, egyébként hamis         
   */
  isRowSelected : function(row)
  {
    var r = this.getRowSelection(row);
    
    return ('number' === typeof(r) && !(0 > r));
  },     
  
  /**
   * Gombok megfelelő állapotának beállítása.
   * NOTE: - elsősorban a kijelölés határozza meg az állapotokat   
   */     
  updateButtonsState : function()
  {
    if (this.insertDataBtn instanceof Button)
      this.insertDataBtn.setState(true);
    if (this.modifyDataBtn instanceof Button)
      this.modifyDataBtn.setState((1 === this.selectedRows.length));
    if (this.removeDataBtn instanceof Button)
      this.removeDataBtn.setState((0 < this.selectedRows.length));
    if (this.autoSizeBtn instanceof Button)
      this.autoSizeBtn.setState((0 < this.columns.length));
    if (this.selectAllBtn instanceof Button)
      this.selectAllBtn.setState((this.selectedRows.length < this.dataToShow.length));
    if (this.deselectAllBtn instanceof Button)
      this.deselectAllBtn.setState((0 < this.selectedRows.length));
    if (this.deselectAllBtn instanceof Button)
      this.refreshDataBtn.setState(true);
  },
  
  /**
   * Cella készítése.
   * NOTE: - a cella tartalma egy div, ami egy fontot, ami egy textNode-ot tartalmaz
   * 
   * @param args {Object} a cella létrehozásához szükséges tulajdonságok   
   *   #property row {HTMLTableRowElement} a sor
   *   #property index {number?undefined} a cella pozíciója
   *   NOTE: - ha nem adjuk meg akkor a sor végére szúrja be a cellát   
   *   #property text {string?undefined} a cella szövege   
   * @return {HTMLTableCellElement?null} a létrehozott cella, vagy hiba esetén null             
   */     
  appendCell : function(args)
  {
    if ('undefined' === typeof(args)) return null;
    if (('undefined' === typeof(args.row)) || (!args.row.insertCell)) return null;
    
    var row = args.row;
    var index = ('number' === typeof(args.index)) ? args.index : row.cells.length;
    index = Math.max(0,index);
    var text = ('string' === typeof(args.text)) ? args.text : '|';
    
    var cell = row.insertCell(index);
    cell.label = new Label({text:text});
    cell.label.appendTo(cell);
    //cell.label.font.color = row.style.backgroundColor;
    //cell.label.font.color = System.colors.tableRow1;
    cell.label.font.color = ((0 == row.rowIndex % 2) ? System.colors.tableRow2 : System.colors.tableRow1);
    
    return cell;
  },
  
  /**
   * Az utolsó sor cellájátnak méretét kiterjeszti az oszlopszám szerint.
   * NOTE: - önálló használatra nem ajánlott   
   */     
  updateLastCellColSpan : function()
  {
    var cell = this.workingAreaTable.rows[this.workingAreaTable.rows.length-1].cells[0];
    cell.colSpan = this.columns.length+1;
  },
  
  /**
   * Rendelkezésre álló terület kitöltése üres sorokkal ha szükséges.
   */
  fillWithEmptyRows : function()
  {
    // A rendelkezésre álló területet üres sorokkal töltjük ki, illetve töröljük a felesleget
    var i = this.dataTable.rows.length-1;
    while (this.dataTable.offsetHeight > this.dataDiv.offsetHeight)
    {
      var row = this.dataTable.rows[i];
      if (('undefined' === typeof(row)) || !(0 > row.dataIndex)) break;
      
      this.dataTable.deleteRow(i);
      i--;
    }
    while (this.dataTable.offsetHeight < this.dataDiv.offsetHeight)
      this.appendRow();
      
    // Beszúrunk egy üres sort, mert a vízszintes görgetősáv (ha látszik) takarja az utolsó sort
    this.appendRow();
      
    // Görgetősávok engedélyezése ha szükséges
    var b = (this.dataRowsHeight > this.dataDiv.offsetHeight);
    this.dataDiv.style.overflowY = (b) ? 'auto' : 'hidden';
    
    if (!b) this.dataDiv.scrollTop = 0;
  }, 
  
  /**
   * Táblázat adatainak megadása.
   * 
   * @param data {Array():Object} a táblázat adatai      
   */     
  setData : function(data)
  {
    if (!(data instanceof Array)) return;
    
    // Adatok tárolása
    this.data = data;
    
    // Lapok számának frissítése
    var rowsPerPage = this.getRowsPerPage();
    this.setRowsPerPage(rowsPerPage);
  },
  
  /**
   * Szűrők listájának az elkészítése.
   */     
  createFilterObject : function()
  {
    // Szűrők listájának az elkészítése
    var filtersObj = new Object();
    for (var i = 0; i < this.filters.length; i++)
    {
      var filter = this.filters[i];
      filtersObj[filter.id] = filter.getValue();
    }
    
    return filtersObj;
    
  },
  
  /**
   * Új adat beszúrása.
   */     
  insertData : function()
  { 
    // Szűrők listájának az elkészítése
    var filtersObj = this.createFilterObject();
    
    var tool = this;
    new FormDialog(
    {
      title:this.insertDataDialogTitle,
      type:'insert',
      content:new this.formClass(
      {
        initalValues:filtersObj,
        type:'insert'
      }),
      onSuccess:function(dialog){tool.getDataListFromServer();}
    });
  },
  
  /**
   * Adat részleteinek megjelenítése.
   * 
   * @param data {Object} a megjelenítendő adat adatai
   * NOTE: - az az adat amelyre a kijelölt sor mutat
   * @parma modify {boolean?undefined} ha igaz akkor lehetőség nyílik az adatok
   *   módosítására               
   */     
  showData : function(data,modify)
  {  
    // Szűrők listájának az elkészítése
    var filtersObj = this.createFilterObject();
    
    var tool = this;
    new FormDialog(
    {
      title:this.modifyDataDialogTitle,
      type:'modify',
      content:new this.formClass(
      {
        id:data[this.primaryField],
        initalValues:filtersObj,
        type:'modify'
      }),
      onSuccess:function(dialog){tool.getDataListFromServer();}
    });    
  },
  
  /**
   * Adatok törléséhez szükséges paraméterek előállítása.
   * NOTE: - elsősorban a törlendő adatok azonosítóit hozza létre   
   * 
   * @param datas {Array():Object} a törlendő adatok adatai
   * @return {Object} a törléshez szükséges objektum            
   */     
  removeDataListFunc : function(datas)
  {
    var ids = new Array();
    for (var i = 0; i < datas.length; i++)
      ids[i] = datas[i][this.primaryField];
    
    var param = new Object();  
    param[this.primaryField] = ids;
    
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
    
    return param;
  },
  
  /**
   * Figyelmeztetés adatok törlésére.
   */     
  removeDataListConfirm : function()
  {
    return confirm('Val\u00f3ban t\u00f6r\u00f6lni k\u00edv\u00e1nja a '+
                   'kijel\u00f6lt adatokat?');
  },
  
  /**
   * Adat(ok) törlése.
   * 
   * @param datas {Array():Object} a törlendő adatok adatai
   * NOTE: - azok az adatok amelyekre a kijelölt sorok mutatnak         
   */     
  removeDataList : function(datas)
  {
    if (!this.removeDataListConfirm()) return;
    
    var tool = this;
    
    var param = this.removeDataListFunc(datas);
    
    param.ACTION = this.removeDataListAction;
    param.url = this.script;
    param.loading = true;
    param.onSuccess = function(response){tool.getDataListFromServer();};
    param.onError = function(response){alert(response.ERROR_MSG);};
      
    Ajax.post(param);
  },  
  
  /**
   * Adatok számának a lekérdezése.
   * 
   * @return {number} az adatok száma      
   */     
  getDataCount : function()
  {
    if (null == this.data) return 0;
    
    return this.data.length;
  },
  
  /**
   * Táblázat oldalának a megadása.
   * 
   * @param page {integer} az oldal      
   */     
  setPage : function(page)
  {
    if ((null === this.data) || ('number' !== typeof(page))) return;
    
    this.page = Math.min(this.getMaxPageCount(),Math.max(0,page));
    
    // Kijelölések megszűntetése
    this.deselectRowAll();
    
    // Adatok megjelenítésének frissítése
    this.updateTableData();
  },
  
  /**
   * Táblázat oldalának a lekérdezése.
   * 
   * @return {integer} az oldal      
   */     
  getPage : function()
  {
    return this.page;
  },
  
  /**
   * Táblázat maximális lapszámának a lekérdezése.
   * 
   * @return {number} a maximális lapok száma      
   */     
  getMaxPageCount : function()
  {
    return Math.floor(this.getDataCount()/this.getRowsPerPage());
  },
  
  /**
   * Táblázat oldalankénti sorainak a számának a megadása.
   * 
   * @param rowsPerPage {integer} oldalankénti sorok száma          
   */     
  setRowsPerPage : function(rowsPerPage)
  {
    if ((null === this.data) || ('number' !== typeof(rowsPerPage))) return;
    
    this.rowsPerPage = Math.max(1,rowsPerPage);
    
    // Frissítjük a lapot is
    this.setPage(this.getPage());
    
    // Lefuttatjuk a megfelelő eseményt
    this.onRowsPerPageChange(this);
  },
  
  /**
   * Táblázat oldalankénti sorainak a számának a lekérdezése.
   * 
   * @return {integer} oldalankénti sorok száma          
   */     
  getRowsPerPage : function()
  {
    return this.rowsPerPage;
  },
    
  /**
   * Táblázat adatainak frissítése.
   */       
  updateTableData : function()
  {
    // Látható adatok listájának törlése
    this.dataToShow.splice(0,this.dataToShow.length);
    this.dataRowsHeight = 0;
    
    if (null !== this.data)
    {
      // Adatok szűrése
      // NOTE: - egyenlőre minden adatot megjelenítünk
      //       - csak akkor jeleníthetjük meg az adatokat ha vannak oszlopok
      if (0 < this.columns.length)
      {
        // Csak a kívánt számú adatot jelenítjük meg
        var from = Math.min(this.getMaxPageCount(),Math.max(0,this.getPage()))*this.getRowsPerPage();
        var to = Math.min(this.getDataCount(),from+this.getRowsPerPage());
            
        var j = 0;
        for (var i = from; i < to; i++)
          this.dataToShow[j++] = i;
        
      }
                    
      // Adatok megjelenítése
      var i = 0;
      for (; i < this.dataToShow.length; i++)
      {
        var data = this.data[this.dataToShow[i]];
        
        // Ha nincs rendelkezésre álló sor, akkor létrehozunk egyet
        var row = this.dataTable.rows[i];
        if ('undefined' === typeof(row))
          row = this.appendRow();
        
        // Végig haladunk a táblázat oszlopain
        for (var j = 0; j < this.columns.length; j++)
        {
          var column = this.columns[j];
          var cellData = data[column.id];
          // Adat cellába írása
          if (('undefined' !== typeof(cellData)) && (cellData.toString))
          {
            var cell = row.cells[j];
            cell.label.setText(cellData.toString());
            cell.label.font.color = 'black';
            // Adat indexének tárolása a sorban
            row.dataIndex = this.dataToShow[i];
          }
        }
        
        // Adatokkal rendelkező sorok magasságának tárolása
        this.dataRowsHeight += row.offsetHeight;
      }
      
      // A fennmaradó sorok adat indexét 'töröljük'
      for (; i < this.dataTable.rows.length; i++)
      {
        var row = this.dataTable.rows[i];
        row.dataIndex = -1;
        for (var j = 0; j < row.cells.length; j++)
        {
          // Üres sorok szövegének eltüntetése
          var cell = row.cells[j];
          cell.label.setText('|');
          //cell.label.font.color = row.style.backgroundColor;
          //cell.label.font.color = System.colors.tableRow1;
          cell.label.font.color = ((0 == row.rowIndex % 2) ? System.colors.tableRow2 : System.colors.tableRow1);
        }
      }
      
    }
    
    // Táblázat frissítése
    this.fillWithEmptyRows();
    
    // Megfelelő gombok állapotának frissítése a kijelölés alapján
    this.updateButtonsState();
    
    // Automatikus oszlopszélesség beállítása
    for (var i = 0; i < this.columns.length; i++)
      this.setColumnWidth(i);
      
  },
  
  /**
   * Adatok listájának letöltése a szerverről.
   * NOTE: - a táblázat oszlopai alapján lekérdezi az adatokat a szerverről,
   *         majd feltölti velük a táblázatot 
   *       - nem összetévesztendő egy rekord összes mezőjének lekérdezésével
   *       - a mezőneveket vesszővel tagolva küldjük el
   *       
   * @param onSuccess {function()?undefined} a sikeres betöltés utáni esemény                 
   */     
  getDataListFromServer : function(onSuccess)
  {
    var tool = this;
    
    var lOnSuccess = ('function' === typeof(onSuccess)) ? onSuccess : function(){};
    
    var param = new Object();
    param.ACTION = this.getDataListAction;
    param.FIELDS = this.getColumnsId();
    param.url = this.script;
    param.loading = true;
    param.onSuccess = function(response)
    {
      tool.deselectRowAll();          
      tool.setData(response.RESPONSE);
      lOnSuccess();
    };
    param.onError = function(response){alert(response.ERROR_MSG);};
    
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
  
  /**
   * Oszlopszélesség beállítása.
   * 
   * @param columnIndex {number} az oszlop indexe
   * @param width {number?undefined} az oszlop szélessége
   *   NOTE: ha nem adjuk meg, akkor automatikusan a tartalomhoz igazítja a szélességet
   * @return {boolean} igaz ha a szélesség beállítása sikerült, egyébként hamis         
   */     
  setColumnWidth : function(columnIndex,width)
  {
    if (('undefined' === typeof(columnIndex)) || 
        (0 > columnIndex) || 
        !(columnIndex < this.headRow.cells.length)) return false;
    
    // Ha nem számot adtunk meg akkor kilépünk
    if (('undefined' !== typeof(width)) && ('number' !== typeof(width))) return false;
    
    var w = width;
    
    // Ha automatikus szélességet szeretnénk
    if ('undefined' === typeof(width))
    {
      var w = this.headRow.cells[columnIndex].label.getContentSize()[0];
      for (var i = 0; i < this.dataToShow.length; i++)
      {
        var row = this.dataTable.rows[i];
        cell = row.cells[columnIndex];
        w = Math.max(w,cell.label.getContentSize()[0]);
      }
      w += 5;
    }
    
    // Új szélesség beállítása
    var cell = this.headRow.cells[columnIndex];
    cell.style.width = cell.label.dom.style.width = w+'px';
    for (var i = 0; i < this.dataTable.rows.length; i++)
    {
      var row = this.dataTable.rows[i];
      cell = row.cells[columnIndex];
      cell.style.width = cell.label.dom.style.width = w+'px';
    }
    
    return true;
  },
  
  // @override     
  updateContents : function()
  {
    // Táblázat méretének frissítése
    this.onResize(System.window.width(),System.window.height());
  },
  
  // @override
  toString : function()
  {
    return 'TableTool';
  }
});

ModuleManager.ready('TableTool');

});