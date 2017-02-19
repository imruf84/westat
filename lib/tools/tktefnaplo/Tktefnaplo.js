var Tktefnaplo = null;

// Az adatlista lekérésének a parancsa változik csak, így emiatt nem hozunk létre
// új állományt.
var TktefnaploGetDataListAction = 'GET_TKTEFNAPLO_LIST';
var TktefnaploScript = 'lib/tools/tktefnaplo/tktefnaplo.php';

ModuleManager.load(
['lib/tools/TableTool.js','lib/tools/tktef/Tktef.js'
],
function()
{

/**
 * Tanórán kívüli tevékenységek és egyéni foglalkozások naplóját megvalósító osztály.
 * NOTE: - a tktef osztályból származtatjuk       
 */
Tktefnaplo = Tktef.extend(
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
    this.script = TktefnaploScript;
    // Táblázatot feltöltő alapvető adatok listájának a lekérdezésének a parancsa
    this.getDataListAction = TktefnaploGetDataListAction;
    
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
    this.appendColumn(new TableColumn({id:'felhasznaloNev',text:'Foglalkoz\u00e1st v\u00e9gz\u0151 neve'}));
    this.appendColumn(new TableColumn({id:'oraszam',text:'\u00d3rasz\u00e1m'}));
    this.appendColumn(new TableColumn({id:'tantargyNev',text:'Megnevez\u00e9s'}));
    this.appendColumn(new TableColumn({id:'csoportos',text:'Csoportos'}));   
    this.appendColumn(new TableColumn({id:'dijazott',text:'D\u00edjazott'})); 
  },
  
  // @override
  toString : function()
  {
    return 'Tktefnaplo';
  }
});

ModuleManager.ready('Tktefnaplo');

});