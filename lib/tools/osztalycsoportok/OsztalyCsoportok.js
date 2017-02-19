var OsztalyCsoportok = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/osztalycsoportok/OsztalyCsoportokForm.js'],
function()
{

/**
 * Osztálycsoportok adatainak kezelésére szolgáló objektum osztálya.      
 */
OsztalyCsoportok = TableTool.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Oszt\u00e1ly cs. l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Oszt\u00e1ly cs. adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt oszt\u00e1ly cs. t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Oszt\u00e1lycsoport l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Oszt\u00e1lycsoport adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = OsztalyCsoportokForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = OsztalyCsoportokRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = OsztalyCsoportokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OsztalyCsoportokScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = OsztalyCsoportokGetDataListAction;
    
    // Szűrők listájának létrehozása
    // Szűrők listájának létrehozása
    var tool = this;
    
    var osztalyField = null;
    
    // Lehetőséget adunk az összes osztály lekérdezésére is
    var addMindenToField = function(field)
    {
      field.appendItem(-1,'Minden');
      tool.update(true);
    };
    
    var createOsztalyFieldFunc = function(field)
    {
      var filter = tool.appendFilter(
        osztalyField = new OsztalyokComboBox(
        {
          id:'osztalyID',
          loading:true,
          index:'first',
          filters:{tanevID:tanevekField.getValue()},
          onChange:function(field,valid){tool.update(true);},
          onSuccess:addMindenToField
        }),
        new Label({text:'Oszt\u00e1ly:'})
      );
    };
    
    var tanevekField = this.appendFilter(
      new TanevekComboBox(
      {
        id:'tanevID',
        loading:true,
        index:'last',
        onChange:function(field,valid)
        {
          osztalyField.doAjax(
            addMindenToField,
            'first',
            {tanevID:tanevekField.getValue()}
          );
        },
        // Osztályok szűrőjének létrehozása
        onSuccess:createOsztalyFieldFunc
      }),
      new Label({text:'Tan\u00e9v:'})
    );
    
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'szakmaCsoportNev',text:'Szakmacsoport neve'}));
    this.appendColumn(new TableColumn({id:'osztalyNev',text:'Oszt\u00e1ly neve'}));
    
    // Adatok listájának a lekérdezése, illetve táblázat adatokkal való feltöltése
    this.base();    
  },    
  
  // @override
  createFilterObject : function()
  {
  
    var filtersObj = this.base();
  
    // A formon megjelenítjük majd a tanév nevét is
    filtersObj['tanevNev'] = this.getFilterById('tanevID').getText();
    
    return filtersObj;
    
  },
    
  // @override
  toString : function()
  {
    return 'OsztalyCsoportok';
  }
});

ModuleManager.ready('OsztalyCsoportok');

});