var Control = null;

ModuleManager.load(
['lib/widgets/Widget.js','lib/BrowserDetect.js'],
function()
{

/**
 * Felhasználói felület vezérlő elemeinak alaposztálya.
 */ 
Control = Widget.extend(
{
  /**
   * Konstruktor.
   * 
   * @override   
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum      
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Elemek létrehozása
      // Alap tároló táblázat létrehozása
      // NOTE: - a tartalom középre igazítása miatt kell
      this.mainTable = document.createElement('table');
      this.dom.appendChild(this.mainTable);
      this.mainTable.style.width =
      this.mainTable.style.height = '100%'; 
      this.mainTable.cellPadding =
      this.mainTable.cellSpacing = 0;
      this.mainTable.border = 0;
      var row = this.mainTable.insertRow(0);
      row.style.width =
      row.style.height = '100%';
      var cell = row.insertCell(0);
      cell.style.width =
      cell.style.height = '100%';
      cell.align = 'center';
      cell.vAlign = 'center';
      // Tartalom tároló táblázatának létrehozása
      // NOTE: - a táblázat automatikusan felveszi a tartalma méretét
      this.contentTable = document.createElement('table');
      cell.appendChild(this.contentTable);
      this.contentTable.cellPadding =
      this.contentTable.cellSpacing = 0;
      this.contentTable.border = 0;
      row = this.contentTable.insertRow(0);
      row.style.width =
      row.style.height = '100%';
      this.content = row.insertCell(0);
      this.content.style.width =
      this.content.style.height = '100%';
      this.content.style.whiteSpace = 'nowrap';                                                     
  },
  
  /**
   * Vezérlő tartalmának vízszintes igazítása.
   * 
   * @param align {string} a tartalom vízszintes igazítása ('left'|['center']|'right')      
   */
  setContentHAlign : function(align)
  {
    if ('string' !== typeof(align)) return;
    
    switch (align)
    {
      case 'left':
      case 'center':
      case 'right':
        // Chrome alatt még egy szülőt fentébb kell menni
        // NOTE: - ha gáz lenne, akkor unkommentelni
        //if ('Chrome' === BrowserDetect.browser)
          this.content.parentNode.parentNode.parentNode.parentNode.align = align;
        //else
        //  this.content.parentNode.parentNode.parentNode.align = align;
    }
  },
  
  /**
   * Vezérlő tartalmának függőleges igazítása.
   * 
   * @param align {string} a tartalom függőleges igazítása ('top'|['center']|'bottom')      
   */
  setContentVAlign : function(align)
  {
    if ('string' !== typeof(align)) return;
    
    switch (align)
    {
      case 'top':
      case 'center':
      case 'bottom':
        // Chrome alatt még egy szülőt fentébb kell menni
        // NOTE: - ha gáz lenne, akkor unkommentelni
        //if ('Chrome' === BrowserDetect.browser)
          this.content.parentNode.parentNode.parentNode.parentNode.vAlign = align;
        //else
        //  this.content.parentNode.parentNode.parentNode.vAlign = align;
    }
  },
  
  // @override
  getContentSize : function()
  {
    return new Array(
      this.contentTable.offsetWidth,
      this.contentTable.offsetHeight);
  },
  
  // @override
  toString : function()
  {
    return 'Control';
  }
});

ModuleManager.ready('Control');

});