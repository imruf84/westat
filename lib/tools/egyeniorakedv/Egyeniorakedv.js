var Egyeniorakedv = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/egyeniorakedv/EgyeniorakedvForm.js',
 'lib/tools/tanevek/TanevekComboBox.js'],
function()
{

/**
 * Egyéni órakedvezmények kezelésére szolgáló objektum osztálya.      
 */
Egyeniorakedv = TableTool.extend(
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
    this.modifyDataBtnText = 'Egy\u00e9ni \u00f3rakedv. meghat./m\u00f3dos\u00edt.';
    this.removeDataBtnText = 'Egy\u00e9ni \u00f3rakedv. t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Egy\u00e9ni \u00f3rakedvezm\u00e9ny meghat\u00e1roz\u00e1sa';
    this.modifyDataDialogTitle = 'Egy\u00e9ni \u00f3rakedvezm\u00e9ny m\u00f3dos\u00edt\u00e1sa';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = EgyeniorakedvForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = EgyeniorakedvRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = EgyeniorakedvPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = EgyeniorakedvScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = EgyeniorakedvGetDataListAction;
    
    var tool = this;
    
    // Egyéni órakedvezmény szűrőinek a létrehozása
    
    tool.appendFilter(
      new TanevekComboBox(
      {
        id:'tanevID',
        loading:true,
        index:'last',
        onChange:function(field,valid){tool.update(true);},
        onSuccess:function(field){tool.update(true);}
      }),
      new Label({text:'Tan\u00e9v:'})
    );
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'felhasznaloNev',text:'Felhaszn\u00e1l\u00f3 neve'}));
    this.appendColumn(new TableColumn({id:'meghatarozva',text:'Meghat\u00e1rozva'}));
  },
  
  // @override
  showData : function(data,modify)
  {  
    // A kötelező órák létezésétől függően létrehozzuk a megfelelő dialógust
    var tool = this;
  
    // Szűrők listájának az elkészítése
    var filtersObj = new Object();
    for (var i = 0; i < this.filters.length; i++)
    {
      var filter = this.filters[i];
      filtersObj[filter.id] = filter.getValue();
      
      // A formon feltüntetjük a tanév nevét is
      if ('tanevID' === filter.id)
        filtersObj['tanevNev'] = filter.getText();
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
    return 'Egyeniorakedv';
  }
});

ModuleManager.ready('Egyeniorakedv');

});