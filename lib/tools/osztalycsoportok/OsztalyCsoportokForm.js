var OsztalyCsoportokForm = null;

var OsztalyCsoportokPrimaryField = 'osztalyCsoportID';
var OsztalyCsoportokScript = 'lib/tools/osztalycsoportok/osztalycsoportok.php';
var OsztalyCsoportokGetDataListAction = 'GET_OSZTALY_CSOPORTOK_LIST';
var OsztalyCsoportokGetDataListCBAction = 'GET_OSZTALY_CSOPORTOK_LIST_CB';
var OsztalyCsoportokRemoveDataListAction = 'REMOVE_OSZTALY_CSOPORTOK_LIST';
var OsztalyCsoportokGetDataAction = 'GET_OSZTALY_CSOPORTOK_DATA';
var OsztalyCsoportokInsertDataAction = 'INSERT_OSZTALY_CSOPORTOK_DATA';
var OsztalyCsoportokModifyDataAction = 'MODIFY_OSZTALY_CSOPORTOK_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/InputField.js','lib/System.js',
 'lib/tools/tanevek/TanevekComboBox.js','lib/tools/osztalyok/OsztalyokComboBox.js',
 'lib/tools/szakmacsoportok/SzakmaCsoportokComboBox.js'
],
function()
{

/**
 * Osztálycsoportok adatainak kezelésére szolgáló űrlap osztálya.      
 */
OsztalyCsoportokForm = Form.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum 
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = OsztalyCsoportokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OsztalyCsoportokScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = OsztalyCsoportokGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = OsztalyCsoportokInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = OsztalyCsoportokModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    var form = this;
    
    // Mezők létrehozása
    
    this.appendField(new LabelField(
    {
      id:'tanevNev',
      unused:true,
      value:form.initalValues['tanevNev'],
      pattern:System.patterns.tanevNev,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Tan\u00e9v neve:'}));
    
    this.appendField(new LabelField(
    {
      id:'tanevID',
      value:form.initalValues['tanevID'],
      pattern:System.patterns.posInt,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Tan\u00e9v azonos\u00edt\u00f3ja:'}),
    true);
                
                
    var createSzakmaCsoportokFieldFunc = function(field)
    {
      form.appendField(new SzakmaCsoportokComboBox(
        {
          id:'szakmaCsoportID',
          onReady:function(field){field.update(true);},
          index:'first'
        }),
        new Label({text:'Szakmacsoport:'}));
        
    };
                     
    this.appendField(new OsztalyokComboBox(
        {
          id:'osztalyID',
          value:form.initalValues['osztalyID'],
          filters:{tanevID:form.initalValues['tanevID']},
          onReady:createSzakmaCsoportokFieldFunc
        }),
        new Label({text:'Oszt\u00e1ly:'})
      );
    
  },
      
  // @override
  toString : function()
  {
    return 'OsztalyCsoportokForm';
  }
});

ModuleManager.ready('OsztalyCsoportokForm');

});