var Jelszavak = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/jelszavak/JelszavakForm.js'],
function()
{

/**
 * Jelszavak kezelésére szolgáló objektum osztálya.      
 */
Jelszavak = TableTool.extend(
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
    this.modifyDataBtnText = 'Jelsz\u00f3 meghat./m\u00f3dos\u00edt.';
    this.removeDataBtnText = 'Jelszavak t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Jelsz\u00f3 meghat\u00e1roz\u00e1sa';
    this.modifyDataDialogTitle = 'Jelsz\u00f3 m\u00f3dos\u00edt\u00e1sa';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = JelszavakForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = JelszavakRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = JelszavakPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = JelszavakScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = JelszavakGetDataListAction;
    
    var tool = this;
    
    // Jelszavak szűrőinek a létrehozása
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'felhasznaloNev',text:'Felhaszn\u00e1l\u00f3 neve'}));
    this.appendColumn(new TableColumn({id:'meghatarozva',text:'Meghat\u00e1rozva'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();
  },
  
  // @override
  showData : function(data,modify)
  {  
    // A jelszó létezésétől függően létrehozzuk a megfelelő dialógust
    var tool = this;
  
    // Szűrők listájának az elkészítése
    var filtersObj = new Object();
    for (var i = 0; i < this.filters.length; i++)
    {
      var filter = this.filters[i];
      filtersObj[filter.id] = filter.getValue();
    }  
    filtersObj['felhasznaloID'] = data['felhasznaloID'];
    filtersObj['felhasznaloNev'] = data['felhasznaloNev'];
    
    var b = ('X' === data['meghatarozva']);
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
      button1Text:(b) ? 'M\u00f3dos\u00edt' : 'Meghat\u00e1roz',
      onSuccess:function(dialog){tool.getDataListFromServer();}
    });    
  },
  
  // @override
  toString : function()
  {
    return 'Jelszavak';
  }
});

ModuleManager.ready('Jelszavak');

});