var Orarendek = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/orarendek/OrarendekForm.js'],
function()
{

/**
 * Órarendek kezelésére szolgáló objektum osztálya.      
 */
Orarendek = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = '';
    this.modifyDataBtnText = '\u00d3rarend l\u00e9trehoz\u00e1sa/m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt \u00f3rarend(ek) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = '\u00d3rarend l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = '\u00d3rarend adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = OrarendekForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = OrarendekRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = OrarendekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OrarendekScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = OrarendekGetDataListAction;
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'orarendID',text:'\u00d3rarend neve'}));
    this.appendColumn(new TableColumn({id:'letrehozva',text:'L\u00e9trehozva'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
  
  // @override
  showData : function(data,modify)
  {  
    // Az órarend létezésétől függően létrehozzuk a megfelelő dialógust
    var tool = this;
    
    var filtersObj = new Object();
    filtersObj['orarendID'] = data['orarendID'];
    
    var b = ('X' === data['letrehozva']);
    var formType = (b) ? 'modify' : 'insert';
    
    var form = new this.formClass(
    {
      id:data[this.primaryField],
      type:formType,
      initalValues:filtersObj
    });
    
    new FormDialog(
    {
      title:(b) ? tool.modifyDataDialogTitle : tool.insertDataDialogTitle,
      type:formType,
      content:form,
      onSuccess:function(dialog){tool.getDataListFromServer();}
    });    
  },
    
  // @override
  toString : function()
  {
    return 'Orarendek';
  }
});

ModuleManager.ready('Orarendek');

});