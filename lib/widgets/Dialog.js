var Dialog = null;

ModuleManager.load(
['lib/widgets/Control.js','lib/widgets/NSControl.js','lib/System.js',
 'lib/widgets/Button.js','lib/ResizeManager.js','lib/BrowserDetect.js',
 'lib/widgets/Label.js'],
function()
{

/**
 * Dialógus ablakot megvalósító osztály.
 * TODO: - dialógus bezárása az Esc billentyű lenyomására 
 */ 
Dialog = Control.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property content {Control} a dialógus tartalma   
   *   NOTE: azért lehet csak control a tartalom, mert annak van definiálva
   *         egyértelműen a mérete            
   *   #property title {string} a dialógus címe      
   *   #proberty buttons {Array():Button} a dialógus ablak gombjai      
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Háttérfelület létrehozása
    this.overlay = new NSControl();
    this.overlay.dom.style.position = 'absolute';
    this.overlay.dom.style.top = this.overlay.dom.style.left = '0px';
    this.overlay.dom.style.width = this.overlay.dom.style.height = '100%';
    this.overlay.dom.style.backgroundColor = 'black';
    this.overlay.dom.style.filter = 'alpha(opacity=50)';  
    this.overlay.dom.style.opacity = '0.5';
    this.overlay.appendTo(document.body);
    
    // Dialógus megjelenítése
    this.dom.style.position = 'absolute';
    this.dom.style.backgroundColor = System.colors.dialogBody;
    document.body.appendChild(this.dom);
    
    // Dialógus címsorának a létrehozása
    this.dialogTitleRow = this.contentTable.insertRow(0);
    this.dialogTitleRow.style.backgroundColor = System.colors.dialogTitle;
    this.dialogTitleCell = this.dialogTitleRow.insertCell(0);
    this.titleLabel = new Label();
    this.titleLabel.setContentHAlign('left');
    this.titleLabel.setContentVAlign('top');
    this.titleLabel.font.style.fontWeight = 'bold';
    this.titleLabel.appendTo(this.dialogTitleCell);
    
    // Cím megadása
    this.setTitle((this.argsExist)?args.title:'',false);
    
    // Dialógus ablak alap tárolója
    this.content = this.contentTable.rows[1].cells[0];
    this.dialogBodyDiv = document.createElement('div');
    this.dialogBodyDiv.style.overflow = 'hidden';
    this.content.appendChild(this.dialogBodyDiv);
    
    // Dialógus ablak gomb tárolójának a létrehozása
    this.dialogFooterRow = this.contentTable.insertRow(2);
    this.dialogFooterCell = this.dialogFooterRow.insertCell(0);
    this.dialogFooterCell.style.borderTop = '1px solid '+System.colors.dialogSeparator;
    this.dialogButtonsDiv = document.createElement('div');
    this.dialogButtonsDiv.style.overflow = 'hidden';
    this.dialogFooterCell.appendChild(this.dialogButtonsDiv);
    
    this.dialogButtonsTable = document.createElement('table');
    this.dialogButtonsTable.style.width =
    this.dialogButtonsTable.style.height = '100%'; 
    this.dialogButtonsTable.cellPadding = 0;
    this.dialogButtonsTable.cellSpacing = 0;
    this.dialogButtonsTable.border = 0;
    this.dialogButtonsDiv.appendChild(this.dialogButtonsTable);
    this.dialogButtonsRow = this.dialogButtonsTable.insertRow(0);
    this.dialogButtonsRow.style.width =
    this.dialogButtonsRow.style.height = '100%';
    
    // Gombok hozzáadása
    if (this.argsExist && (args.buttons instanceof Array))
    {
      for (var i = 0; i < args.buttons.length; i++)
        this.appendButton(args.buttons[i],false);
    }
    
    // Tartalom megadása
    this.dialogContent = null;
    this.setContent(((this.argsExist) ? args.content : {}),false);
    
    // Átméretező függvény regisztrálása
    var dialog = this;
    this.onResize = function(w,h)
    {
      dialog.align(w,h);
    };
    ResizeManager.addFunction(this.onResize,false);
    
    // Dialógus ablak frissítése
    this.update();
  },
  
  // @override
  // NOTE: - a dialógus ablak szülője minden esetben a document.body
  appendTo : function()
  {
  },
  
  // @override
  updateFunction : function()
  {
    this.align(System.window.width(),System.window.height());
    this.base();
  },
  
  // @override
  destroy : function()
  {
    ResizeManager.removeFunction(this.onResize);
    this.overlay.destroy();
    this.dom.parentNode.removeChild(this.dom);
  
    this.base();
  },
  
  /**
   * Tartalom beállítása.
   * 
   * @param content {Control} a dialógus tartalma
   * @param update {boolean?undefined} ha hamis akkor nem fut le az update metódus   
   * NOTE: - konstruktorban történő paraméterátadás során fontos               
   */     
  setContent : function(content,update)
  {
    // Régi tartalom eltávolítása
    this.removeContent();
    
    // Új tartalom hozzáadása
    if (content instanceof Control)
    {
      this.dialogBodyDiv.appendChild(content.dom);
      this.dialogContent = content;
      this.dialogContent.parentObject = this;
    }
    
    this.update(update);
  },
  
  /**
   * Tartalom eltávolítása.
   */     
  removeContent : function()
  {
    if (this.dialogContent instanceof Control)
    {
      this.dialogBodyDiv.removeChild(this.dialogContent.dom);
      this.dialogContent = null;
      this.dialogContent.parentObject = null;
    }
  },
  
  /**
   * Tartalom lekérdezése.
   * 
   * @return {Control} a dialógus tartalma      
   */   
  getContent : function()
  {
    return this.dialogContent;
  },  
  
  /**
   * Dialógus címének a megadása.
   * 
   * @param title {string} a dialógus címe  
   * @param update {boolean?undefined} ha hamis akkor nem fut le az update metódus
   * NOTE: - konstruktorban történő paraméterátadás során fontos       
   */     
  setTitle : function(title,update)
  {
    if ('string' !== typeof(title)) return;
    
    this.title = title;
    this.titleLabel.setText(title);
        
    this.update(update);
  },
  
  /**
   * Dialógus címének a lekérdezése.
   * 
   * @return {string} a dialógus címe      
   */     
  getTitle : function()
  {
    return this.titleLabel.getText();
  },
  
  /**
   * Gomb hozzáadása a dialógushoz.
   * NOTE: - a így hozzáadott gombok minden esetben a dialógus alján helyezkednek el
   *       - a gomb a gombsor végéhez adódik hozza
   * TODO: - gombok rendezésének automatikus beállítása
   *       - a bal szélső gomb balra, míg a jobb szélső jobbra legyen igazítva      
   *       
   * @param button {Button} a hozzáadandó gomb
   * @return {Button?null} a hozzáadott gomb, vagy hiba esetén null            
   */     
  appendButton : function(button,update)
  {
    // Ha nem gombot adtunk meg akkor kilépünk
    if (!(button instanceof Button)) return null;
    
    // Gomb hozzáadása dom szinten
    var cell = this.dialogButtonsRow.insertCell(this.dialogButtonsRow.cells.length);
    button.appendTo(cell);
    
    this.update(update);
    
    return button;
  },
  
  /**
   * Gomb lekérdezése index alapján.
   * 
   * @param index {number} a gomb indexe
   * @return {Button?null} az indexhez tartozó gomb, vagy hiba esetén null         
   */     
  getButtonByIndex : function(index)
  {
    if (0 > index || !(this.dialogButtonsRow.cells.length > index)) return null;
    
    return this.dialogButtonsRow.cells[index].childNodes[0].object;
  },
  
  /**
   * Gomb lekérdezése index alapján.
   * 
   * @param index {number} a gomb indexe
   * @return {Button?null} az indexhez tartozó gomb, vagy hiba esetén null         
   */     
  getButton : function(index)
  {
    if ('number' !== typeof(index)) return null;
    
    var buttonsCount = this.getButtonsCount();
    if (0 > index || !(index < buttonsCount)) return null;
    
    return this.dialogButtonsRow.cells[index].childNodes[0].object;
  },
  
  /**
   * Gomb eltávolítása.
   * 
   * @param button {Button} az eltávolítandó gomb
   * @return {Button?null} az eltávolított gomb, vagy hiba esetén null        
   */      
  removeButton : function(button)
  {
    if (!(button instanceof Button)) return null;
    
    for (var i = 0; i < this.getButtonsCount(); i++)
      if (this.getButton(i) === button)
      {
        this.dialogButtonsRow.deleteCell(i);
        return button;
      }
  },  
  
  /**
   * Az összes gomb eltávolítása.
   */     
  removeAllButtons : function()
  {
    for (var i = 0; i < this.getButtonsCount();)
      this.removeButton(this.getButton(i));
  },
  
  /**
   * Gombok számának a lekérdezése.
   * 
   * @return {number} a gombok száma      
   */     
  getButtonsCount : function()
  {
    return this.dialogButtonsRow.cells.length;
  },
  
  /**
   * Dialógus középre igazítása, méretének beállítása.
   * TODO: - optimalizálni a kódot, hogy átláthatóbb és egyszerűbb legyen
   *       - ha nem közvetlenül a div-nek a méretében tárolom a méreteket,
   *         akkor gondok vannak, azaz néhány böngészőben a függőleges méret
   *         csökkentésekor van egy pixelnyi hely, amikor a gombok arréb tolódnak
   *         egy kicsit
   *       - meg kellene oldani, hogy változók tároljanak mindent, és csak a 
   *         végén történjen div méretezés            
   * 
   * @param winW {number} a rendelkezésre álló szélesség      
   * @param winH {number} a rendelkezésre álló magasság   
   */     
  align : function(winW,winH)
  { 
    // Tartalom méretének a lekérdezése
    var cSize = new Array(0,0);
    
    // A jobb olvashatósáb miatt
    var body = this.dialogBodyDiv;
    
    // A minimális méretet a címsor és a gombsor minimális méreteinek a minimuma adja
    for (var i = 0; i < this.getButtonsCount(); i++)
      cSize[0] += this.getButton(i).getContentSize()[0];
    cSize[0] = Math.max(cSize[0],this.titleLabel.getContentSize()[0]);
    
    // Ha van tartalom akkor az ő méretét is számításba vesszük
    if (null !== this.dialogContent)
    {
      var size = this.dialogContent.getContentSize();
      
      cSize[0] = Math.max(cSize[0],size[0]);
      // NOTE: a jól tagoltság miatt kell hozzáadni a számot
      cSize[1] = size[1]+5;
      
      // Tartalom méretének fixálása
      this.dialogContent.dom.style.width = cSize[0]+'px';
      this.dialogContent.dom.style.height = cSize[1]+'px';
    }
    
    // Görgetősáv mérete
    var sbw = System.window.scrollBarWidth();
  
    // Méret beállítása
    body.style.width = Math.max(0,Math.min(cSize[0],winW))+'px';
    var h = winH-(this.contentTable.rows[0].offsetHeight+
                  this.contentTable.rows[2].offsetHeight);
    if (body.offsetWidth < cSize[0])
      h -= sbw;
    body.style.height = Math.max(1,Math.min(cSize[1],h))+'px';
    
    // Görgetősávok engedélyezése, letiltása
    // BUG: - hiba javítás miatt kell
    var es = 0;
              
    if (body.offsetHeight < cSize[1])
    {
      body.style.overflowY = 'scroll';
      
      //if (this.dialogBodyDiv.offsetWidth < winW)
      if (body.offsetWidth < winW)
      {
        body.style.width = Math.min(winW,body.offsetWidth+sbw)+'px';
        // BUG: - egyes böngészőkön nem működik rendesen
        // NOTE: - ez az értékadás javítja
        if (('Chrome' === BrowserDetect.browser) || 
            ('Safari' === BrowserDetect.browser))
          es = sbw;
      }
    }
    else
      body.style.overflowY = 'hidden';
    
    var w = 0;
    if (body.offsetHeight < cSize[1])
      w = sbw;
      
    if (body.offsetWidth-w < cSize[0])
    {
      body.style.overflowX = 'scroll';
      
      if (body.offsetHeight+
          this.contentTable.rows[0].offsetHeight+
          this.contentTable.rows[2].offsetHeight < winH)
      {
        body.style.height = Math.min(winH,body.offsetHeight+sbw)+'px';
      }
    }
    else
      body.style.overflowX = 'hidden';
        
    this.dialogButtonsDiv.style.width = (body.offsetWidth)+'px';
    
    this.dom.style.width = (this.contentTable.offsetWidth - es)+'px';
    this.dom.style.height = (this.contentTable.offsetHeight)+'px';
    
    // Középre igazítás
    this.dom.style.top = Math.max(0,(winH-this.dom.offsetHeight)/2)+'px';
    this.dom.style.left = Math.max(0,(winW-this.dom.offsetWidth)/2)+'px';  
  },
  
  // @override
  isReady : function()
  {
    return (this.dialogContent instanceof Control) ? this.dialogContent.isReady() : true;
  },
    
  // @override
  toString : function()
  {
    return 'Dialog';
  }
});

ModuleManager.ready('Dialog');

});