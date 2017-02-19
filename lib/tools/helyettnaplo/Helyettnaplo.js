var Helyettnaplo = null;

// Az adatlista lekérésének a parancsa változik csak, így emiatt nem hozunk létre
// új állományt.
var HelyettnaploGetDataListAction = 'GET_HELYETTNAPLO_LIST';
var HelyettnaploScript = 'lib/tools/helyettnaplo/helyettnaplo.php';

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/helyettesitesek/Helyettesitesek.js'
],
function()
{

/**
 * Helyettesítési naplót megvalósító osztály.
 * NOTE: - a helyettesítések osztályból származtatjuk       
 */
Helyettnaplo = Helyettesitesek.extend(
{
  /**                
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    // Nincs szükségünk az eredeti szűrőkre, ezért jelezzük, hogy nem kell létrehozni
    this.dontCreateFilters = true;
    
    // Ősosztály konstruktora
    this.base(args);
    
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HelyettnaploScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = HelyettnaploGetDataListAction;
    
    // Helyettesítések szűrőinek létrehozása
    var tool = this;
    
    var idoszakField = null;
    
    var createCsoportokFieldFunc = function(field)
    {
      var filter = tool.appendFilter(
        new CsoportokComboBox(
        {
          id:'csoportID',
          loading:true,
          index:'first',
          onChange:function(field,valid){tool.update(true);},
          onSuccess:function(field)
          {
            // Kézzel adjuk hozzá az intézményi szintű lekérdezést
            filter.appendItem(-1,'Minden');
            
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
        new Label({text:'Munkak\u00f6z.:'})
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
          onSuccess:createCsoportokFieldFunc
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
    this.appendColumn(new TableColumn({id:'helyettesitoNev',text:'Helyettes\u00edt\u0151 tan\u00e1r'}));
    this.appendColumn(new TableColumn({id:'osztalyNev',text:'Oszt\u00e1ly'}));
    this.appendColumn(new TableColumn({id:'ora',text:'\u00d3ra'}));
    this.appendColumn(new TableColumn({id:'tantargyNev',text:'Tant\u00e1rgy'}));
    this.appendColumn(new TableColumn({id:'helyettesitettNev',text:'Helyettes\u00edtett tan\u00e1r'}));
    this.appendColumn(new TableColumn({id:'helyettesitestipusaNev',text:'Helyettes\u00edt\u00e9s t\u00edpusa'}));
    this.appendColumn(new TableColumn({id:'torolve',text:'\u00c1llapot'}));   
  },
  
  // @override
  toString : function()
  {
    return 'Helyettnaplo';
  }
});

ModuleManager.ready('Helyettnaplo');

});