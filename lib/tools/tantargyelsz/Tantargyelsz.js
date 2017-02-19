var Tantargyelsz = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/tantargyelsz/TantargyelszForm.js',
 'lib/tools/tanevek/TanevekComboBox.js',
 'lib/tools/felhasznalok/FelhasznalokComboBox.js'],
function()
{

/**
 * Tantárgyelszámolások kezelésére szolgáló objektum osztálya.
 * NOTE: - megadhatjuk, hogy az adott felhasználó adott óráját milyen típúsunak számolják el       
 */
Tantargyelsz = TableTool.extend(
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
    this.modifyDataBtnText = 'Tant\u00e1rgyelsz. meghat./m\u00f3dos\u00edt.';
    this.removeDataBtnText = 'Tant\u00e1rgyelsz. t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Tant\u00e1rgyelsz\u00e1mol\u00e1s meghat\u00e1roz\u00e1sa';
    this.modifyDataDialogTitle = 'Tant\u00e1rgyelsz\u00e1mol\u00e1s m\u00f3dos\u00edt\u00e1sa';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = TantargyelszForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = TantargyelszRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = TantargyelszPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TantargyelszScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = TantargyelszGetDataListAction;
    
    var tool = this;
    
    // Jelentések szűrőinek a létrehozása
    
    var createFelhasznalokFieldFunc = function(field)
    {
      tool.appendFilter(
        new FelhasznalokComboBox(
        {
          id:'felhasznaloID',
          loading:true,
          index:'first',
          onChange:function(field,valid){tool.update(true);},
          onSuccess:function(field){tool.update(true);}
        }),
        new Label({text:'Tan\u00e1r:'})
      );
    };
    
    tool.appendFilter(
      new TanevekComboBox(
      {
        id:'tanevID',
        loading:true,
        index:'last',
        onChange:function(field,valid){tool.update(true);},
        onSuccess:function(field){createFelhasznalokFieldFunc();}
      }),
      new Label({text:'Tan\u00e9v:'})
    );
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'tantargyNev',text:'Tant\u00e1rgy neve'}));
    this.appendColumn(new TableColumn({id:'tipus',text:'Tant\u00e1rgyelsz\u00e1mol\u00e1s t\u00edpusa'}));
  },
  
  // @override
  showData : function(data,modify)
  {  
    // A tantárgyelszámolás létezésétől függően létrehozzuk a megfelelő dialógust
    var tool = this;
  
    // Szűrők listájának az elkészítése
    var filtersObj = new Object();
    for (var i = 0; i < this.filters.length; i++)
    {
      var filter = this.filters[i];
      filtersObj[filter.id] = filter.getValue();
      
      // A formon feltüntetjük a tanév nevét...
      if ('tanevID' === filter.id)
        filtersObj['tanevNev'] = filter.getText();
      // ...és a felhasználó nevét is
      if ('felhasznaloID' === filter.id)
        filtersObj['felhasznaloNev'] = filter.getText();
    }  
    filtersObj['tantargyID'] = data['tantargyID'];
    filtersObj['tantargyNev'] = data['tantargyNev'];
    
    var b = ('-' !== data['tipus']);
    var formType = (b) ? 'modify' : 'insert';
    
    var form = new this.formClass(
    {
      id:data[this.primaryField],
      type:formType,
      initalValues:filtersObj,
      oraado:(('undefined' !== typeof(tool.data[0])) ? (1 == tool.data[0].oraado ? true : false) : false)
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
  getDataListFromServer : function(onSuccess)
  {
    var tool = this;
    
    var onSuccess2 = function(response)
    {
      var oraado = ('undefined' !== typeof(tool.data[0])) ? (1 == tool.data[0].oraado ? true : false) : false;
      
      // Ha óraadóról van szó, akkor beszúrjuk a megfelelő oszlopokat...
      if (true == oraado)
      {
        tool.appendColumn(new TableColumn({id:'szakfelsz',text:'Szakfeladatelsz\u00e1mol\u00e1s t\u00edpusa (\u00f3raad\u00f3k eset\u00e9n)'}));
        tool.updateTableData();
      }
      else
      // ...egyébként töröljük
      {
        tool.removeColumn('szakfelsz');
        tool.updateTableData();
      }
      
      if ('function' === typeof(onSuccess)) 
        onSuccess(response);
    };
    
    tool.base(onSuccess2);
  },
    
  // @override
  toString : function()
  {
    return 'Tantargyelsz';
  }
});

ModuleManager.ready('Tantargyelsz');

});