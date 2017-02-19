var Kotelezoorak = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/kotelezoorak/KotelezoorakForm.js',
 'lib/tools/orarendek/OrarendekComboBox.js',
 'lib/tools/orarendek/OrarendHetekComboBox.js'],
function()
{

/**
 * Kötelező órák adatainak a kezelésére szolgáló objektum osztálya.      
 */
Kotelezoorak = TableTool.extend(
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
    this.modifyDataBtnText = 'K\u00f6telez\u0151 \u00f3r\u00e1k meghat./m\u00f3dos\u00edt.';
    this.removeDataBtnText = 'K\u00f6telez\u0151 \u00f3r\u00e1k t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'K\u00f6telez\u0151 \u00f3r\u00e1k meghat\u00e1roz\u00e1sa';
    this.modifyDataDialogTitle = 'K\u00f6telez\u0151 \u00f3r\u00e1k m\u00f3dos\u00edt\u00e1sa';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = KotelezoorakForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = KotelezoorakRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = KotelezoorakPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = KotelezoorakScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = KotelezoorakGetDataListAction;
    
    var tool = this;
    
    // Kötelező órák szűrőinek a létrehozása
    
    // Az eljárás lecseréli a címkéket számokról betűkre
    var changeNumbersToChars = function(field)
    {
      var HetekBetui = new Array('A','B','C','D');
      field.value = HetekBetui[field.value];
      for (var i = 0; i < field.domelement.options.length; i++)
      {
        field.domelement.options[i].text = HetekBetui[i];
        field.domelement.options[i].value = HetekBetui[i];
      }
    };
    
    var orarendHetekField = null;
    var createOrarendHetekFieldFunc = function(field)
    {
      tool.appendFilter(
        orarendHetekField = new OrarendHetekComboBox(
        {
          id:'het',
          loading:true,
          index:'first',
          filters:{orarendID:orarendekField.getValue()},
          onChange:function(field,valid){tool.update(true);},
          onSuccess:function(field)
          {
            changeNumbersToChars(field);
            tool.update(true);
          }
        }),
        new Label({text:'H\u00e9t:'})
      );
    };
    
    var orarendekField = this.appendFilter(
      new OrarendekComboBox(
      {
        id:'orarendID',
        loading:true,
        index:'last',
        onChange:function(field,valid)
        {
          orarendHetekField.doAjax(
            function(field,valid)
            {
              changeNumbersToChars(field);
              tool.update(true);
            },
            'first',
            {orarendID:orarendekField.getValue()}
          );
        },
        // Időszakok szűrőjének létrehozása
        onSuccess:createOrarendHetekFieldFunc
      }),
      new Label({text:'\u00d3rarend:'})
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
    return 'Kotelezoorak';
  }
});

ModuleManager.ready('Kotelezoorak');

});