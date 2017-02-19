var Helyettesitesek = null;

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/helyettesitesek/HelyettesitesekForm.js',
 'lib/tools/tanevek/TanevekComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js',
 'lib/tools/felhasznalok/FelhasznalokComboBox.js'
],
function()
{

/**
 * Helyettesítések adatainak kezelésére szolgáló objektum osztálya.      
 */
Helyettesitesek = TableTool.extend(
{
  /**                
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Gombfeliratok megadása
    this.insertDataBtnText = 'Helyettes\u00edt\u00e9s l\u00e9trehoz\u00e1sa';
    this.modifyDataBtnText = 'Helyettes\u00edt\u00e9s adatainak m\u00f3dos\u00edt\u00e1sa';
    this.removeDataBtnText = 'Kijel\u00f6lt helyettes\u00edt\u00e9s(ek) t\u00f6rl\u00e9se';
    
    // Dialógus ablak címsorfeliratok
    this.insertDataDialogTitle = 'Helyettes\u00edt\u00e9s l\u00e9trehoz\u00e1sa';
    this.modifyDataDialogTitle = 'Helyettes\u00edt\u00e9s adatai';
    
    // Az adatokat kezelő űrlap osztálya
    this.formClass = HelyettesitesekForm;
    
    // Adatok törlésének parancsa
    this.removeDataListAction = HelyettesitesekRemoveDataListAction;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = HelyettesitesekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HelyettesitesekScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = HelyettesitesekGetDataListAction;
    
    // Helyettesítések szűrőinek létrehozása
    var tool = this;
    
    // Ebből az osztályból származtatjuk a helyettesítési napló eszközt, ahol
    // nincs szükség ezekre a szűrőkre, így csak akkor hozzuk létre ha szükséges
    
    if ('boolean' === typeof(this.dontCreateFilters) && this.dontCreateFilters) return;
    
    var idoszakField = null;
    
    var createFelhasznalokFieldFunc = function(field)
    {
      tool.appendFilter(
        new FelhasznalokComboBox(
        {
          id:'helyettesitoID',
          loading:true,
          index:'first',
          onChange:function(field,valid){tool.update(true);},
          onSuccess:function(field)
          {
            // A szűrő segítségével szűrhetjük a törölt és nem törölt helyettesítéseket
            var torolveCB = new ComboBoxField({id:'torolve'});
            torolveCB.appendItem(0,'Nem t\u00f6r\u00f6lt');
            torolveCB.appendItem(1,'T\u00f6r\u00f6lt');
            torolveCB.appendItem(-1,'Minden');
            torolveCB.setValue(0);
            
            torolveCB.onChange = function(field,valid){tool.update(true);};
      
            tool.appendFilter(torolveCB,new Label({text:'\u00c1llapot:'}));
            
            tool.update(true);
          }
          
        }),
        new Label({text:'Tan\u00e1r:'})
      );
      
    };
    
    var createIdoszakokFieldFunc = function(field)
    {
      tool.appendFilter(
        idoszakField = new IdoszakokComboBox(
        {
          id:'idoszakID',
          loading:true,
          index:'last',
          filters:{tanevID:tanevekField.getValue()},
          onChange:function(field,valid){tool.update(true);},
          // Felhasználók szűrőjének létrehozása
          onSuccess:createFelhasznalokFieldFunc
        }),
        new Label({text:'Id\u0151szak:'})
      );
      
    };
    
    var tanevekField = this.appendFilter(
      new TanevekComboBox(
      {
        id:'tanevID',
        loading:true,
        unused:true,
        index:'last',
        onChange:function(field,valid)
        {
          idoszakField.doAjax(
            function(field,valid){tool.update(true);},
            'last',
            {tanevID:tanevekField.getValue()}
          );
        },
        // Időszakok szűrőjének létrehozása
        onSuccess:createIdoszakokFieldFunc
      }),
      new Label({text:'Tan\u00e9v:'})
    );
 
  },
  
  // @override
  createElements : function()
  {
    // Oszlopok létrehozása
    this.appendColumn(new TableColumn({id:'datum',text:'D\u00e1tum'}));
    this.appendColumn(new TableColumn({id:'ora',text:'\u00d3ra'}));
    this.appendColumn(new TableColumn({id:'osztalyNev',text:'Oszt\u00e1ly'}));
    this.appendColumn(new TableColumn({id:'tantargyNev',text:'Tant\u00e1rgy'}));
    this.appendColumn(new TableColumn({id:'felhasznaloNev',text:'Helyettes\u00edtett tan\u00e1r'}));
    this.appendColumn(new TableColumn({id:'helyettesitestipusaNev',text:'Helyettes\u00edt\u00e9s t\u00edpusa'}));
    this.appendColumn(new TableColumn({id:'torolve',text:'\u00c1llapot'}));
  },
  
  // @override
  removeDataListConfirm : function()
  {
    return confirm('Val\u00f3ban t\u00f6r\u00f6lni k\u00edv\u00e1nja a '+
                   'kijel\u00f6lt adatokat? A t\u00f6r\u00f6lt \u00e1llapot\u00fa '+
                   'adatok v\u00e9glegesen t\u00f6rl\u0151dnek!');
  },
  
  // @override
  toString : function()
  {
    return 'Helyettesitesek';
  }
});

ModuleManager.ready('Helyettesitesek');

});