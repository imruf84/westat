var Tool = null;

ModuleManager.load(
['lib/BaseClass.js','lib/widgets/Button.js','lib/widgets/Field.js'],
function()
{

/**
 * Eszközöket megvalósító objektumok alaposztálya.
 * NOTE: - ha az eszközt hozzárendeltük egy szolgáltatáshoz, akkor ajánlott
 *         a szolgáltatás setTool(null)-t használni az eszköz destroy() metódusa
 *         helyett   
 */
Tool = BaseClass.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property workingArea {HTMLDivElement} az eszköz munkaterülete
   *   #property toolPanel {HTMLDivElement} az eszköz funkcióit tároló objektum            
   */
  constructor : function(args)
  {
    this.base(args);
  
    this.workingArea = null;
    this.toolPanel = null;
        
    // Munkaterület tartalma
    this.workingAreaTable = document.createElement('table');
    this.workingAreaTable.cellPadding =
    this.workingAreaTable.cellSpacing = 0;
    this.workingAreaTable.border = 0;
    var row = this.workingAreaTable.insertRow(0);
    this.workingAreaCell = row.insertCell(0);
    if (this.argsExist)
      this.setWorkingArea(args.workingArea);
      
    // Eszközpanel tartalma
    this.toolPanelTable = document.createElement('table');
    this.toolPanelTable.cellPadding =
    this.toolPanelTable.cellSpacing = 0;
    this.toolPanelTable.border = 0;
    
    var row = this.toolPanelTable.insertRow(this.toolPanelTable.rows.length);
    this.toolPanelCell = row.insertCell(0);
    this.toolPanelCell.style.paddingTop = 
    this.toolPanelCell.style.paddingLeft = '10px';
    this.toolPanelCell.align = 'left';
    this.toolPanelCell.vAlign = 'top';
    
    // Szűrők táblázatának a létrehozása
    this.toolFilterTable = document.createElement('table');
    this.toolFilterTable.cellPadding =
    this.toolFilterTable.cellSpacing = 0;
    this.toolFilterTable.border = 0;
    
    row = this.toolPanelTable.insertRow(0);
    cell = row.insertCell(0);
    cell.style.paddingTop = 
    cell.style.paddingLeft = '10px';
    cell.align = 'left';
    cell.vAlign = 'top';
    cell.appendChild(this.toolFilterTable);
        
    // Eszköztár hozzáadása az eszközhöz
    if (this.argsExist) 
      this.setToolPanel(args.toolPanel);
      
    // Ebben tároljuk majd a szűrőket
    this.filters = new Array();
      
    // Az elemek egyenlőre még nincsenek létrehozva
    this.constructed = false;
  },
  
  // @override
  destroy : function()
  {
    var parent = this.workingAreaTable.parentNode;
    if (parent.removeChild)
      parent.removeChild(this.workingAreaTable);
      
    parent = this.toolPanelTable.parentNode;
    if (parent.removeChild)
      parent.removeChild(this.toolPanelTable);
    
    this.base();
  },    
  
  /**
   * Eszköz elemeinek frissítése.
   * NOTE: - a megfeleő méretezés illetve pozicíonálás elvégzése
   *       - egyenlőre nincs definiálva      
   */     
  updateContents : function()
  {
  },
  
  /**
   * Eszköz elemeinek az elkészítése.
   * NOTE: - a konstruktor után szokás meghívni
   *       - csak egyszer kell lefutnia      
   */
  construct : function()
  {
    // Ha már elkészültek az elemek akkor kilépünk
    if (this.constructed) return;
    
    // Elemek létrehozása
    this.createElements();
    
    this.constructed = true;
  },
  
  /**
   * Eszközök elemeinek az elkészítése.
   * NOTE: - ezt kell felülírni a származtatott osztályokban
   *       - a construct() metódus hívja meg  
   *       - önálló használatra nem ajánlott       
   */
  createElements : function()
  {
    // Egyenlőre nem csinálunk semmit
  },  
  
  /**
   * Szűrőlista beszúrása a szűrőlista végére   
   * 
   * @param field {Field} a hozzáadandó szűrő
   * @param label {Label?undefined} a szűrőhöz tartozó címke    
   * @return {Field?null} a hozzáadott szűrő, vagy hiba esetén null         
   */     
  appendFilter : function(field,label)
  {
    if (!(field instanceof Field)) return null;
    // Ha nincs megadva azonosító, akkor kilépünk
    if ('' === field.id) return null;
    // Ha létezik már ilyen oszlopazonosító, akkor kilépünk
    if (null !== this.getFilterById(field.id)) return null;
    
    this.filters[this.filters.length] = field;
    
    var row = this.toolFilterTable.insertRow(this.toolFilterTable.rows.length);
    
    // Szülő tárolása
    field.parentObject = this;
    
    // Címke hozzáadása szinten
    var cell = row.insertCell(row.cells.length);
    if (label instanceof Label)
    {
      label.appendTo(cell);
      label.setContentHAlign('right');
    }
    
    // Szűrő hozzáadása dom szinten
    cell = row.insertCell(row.cells.length); 
    field.appendTo(cell);
    field.setContentHAlign('left');
    
    // Események megváltoztatása
    var tool = this;
    field.onChange2 = field.onChange;
    field.onChange = function(field2,valid2)
    {
      // Mező eredeti eseményének a futtatása
      field2.onChange2(field2,valid2);
    };
    
    return field;
  },
  
  /**
   * Szűrő sorszámának lekérdezése azonosító alapján.
   * 
   * @return {number} a szűrő indexe, vagy hiba esetén -1      
   */     
  getFilterIndexById : function(id)
  {
    if ('string' !== typeof(id)) return -1;
    
    for (var i = 0; i < this.filters.length; i++)
    {
      var filter = this.filters[i];
      if (filter.id === id) return i;
    }
    
    return -1;
  },
  
  /**
   * Szűrő megkeresése azonosító alapján.
   * 
   * @param id {string} a keresendő szűrő azonosítója
   * @return {Field?null} a keresett szűrő, vagy hiba esetén null         
   */     
  getFilterById : function(id)
  { 
    var index = this.getFilterIndexById(id);
    return (0 > index) ? null : this.filters[index];
  },
  
  /**
   * Oszlopok azonosítóinak tömbbe rendezése.
   * NOTE: - az elsődleges kulcs minden esetben bele kerül   
   *       - a szűrők megőinek azonosítói alulvonással kezdődnek   
   * 
   * @return {Array():string} az oszlopok azonosítóinak tömbje          
   */     
  getFiltersId : function()
  { 
    var filters = new Array();
    for (var i = 0; i < this.filters.length; i++)
      // Csak akkor használjuk fel, ha engedélyezve van
      if (!this.filters[i].unused)
        filters[filters.length] = this.filters[i].id;
    
    // Ismétlődő elemek eltávolítása
    filters = removeDuplicates(filters);
    
    return filters;
  },
  
  /**
   * Szűrők törlése.
   */     
  removeAllFilters : function()
  {
    this.filters.splice(0,this.filters.length);
  },
  
  /**
   * Gomb beszúrása az eszközpanel végére.
   * 
   * @param button {Button} a beszúrandó gomb
   * @return {Button} a beszúrt gomb vagy hiba esetén null         
   */     
  appendButton : function(button)
  {
    if (!(button instanceof Button)) return null;

    button.setContentHAlign('left');
    button.appendTo(this.toolPanelCell);
    
    return button;
  },   
  
  /**
   * Eszköz munkaterületének a beállítása.
   * 
   * @param workingArea {HTMLDivElement} az eszköz munkaterülete      
   */     
  setWorkingArea : function(workingArea)
  {
    if (('undefined' !== typeof(workingArea)) && (null !== workingArea) && 
        (workingArea.appendChild))
    {
      this.workingArea = workingArea;
      this.workingArea.appendChild(this.workingAreaTable);
      this.updateContents();
    }
  },
  
  /**
   * Eszköz paneljának a beállítása.
   * 
   * @param toolPanel {HTMLDivElement} az eszköz panelje      
   */     
  setToolPanel : function(toolPanel)
  {
    if (('undefined' !== typeof(toolPanel)) && (null !== toolPanel) && 
        (toolPanel.appendChild))
    {
      this.toolPanel = toolPanel;
      this.toolPanel.appendChild(this.toolPanelTable);
      this.updateContents();
    }
  },     
  
  // @override
  toString : function()
  {
    return 'Tool';
  }
});

ModuleManager.ready('Tool');

});