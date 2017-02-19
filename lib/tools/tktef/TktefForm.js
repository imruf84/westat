var TktefForm = null;

var TktefPrimaryField = 'tktefID';
var TktefScript = 'lib/tools/tktef/tktef.php';
var TktefGetDataListAction = 'GET_TKTEF_LIST';
var TktefRemoveDataListAction = 'REMOVE_TKTEF_LIST';
var TktefGetDataAction = 'GET_TKTEF_DATA';
var TktefInsertDataAction = 'INSERT_TKTEF_DATA';
var TktefModifyDataAction = 'MODIFY_TKTEF_DATA';
var TktefLoadLessonsAction = 'LOAD_TKTEF_LESSONS';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/DateField.js',
 'lib/widgets/InputField.js',
 'lib/tools/tantargyak/TantargyakComboBox.js',
 'lib/tools/felhasznalok/FelhasznalokComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js',
 'lib/widgets/YesNoComboBox.js'
],
function()
{

/**
 * Tanórán kívüli tevékenységek adatainak kezelésére szolgáló űrlap osztálya.      
 */
TktefForm = Form.extend(
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
    this.primaryField = TktefPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TktefScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = TktefGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = TktefInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = TktefModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
    var createTantargyakFieldFunc = function(field)
    {
      form.appendField(new TantargyakComboBox(
      {
        id:'tantargyID',
        // A tipusok szűrő használatakor több érték is adható (speckó módon leprogramozva)
        //filters:{tipusok:'tkt,ef,tktgy,efgy'},
        onReady:function(field){field.update(true);},
        index:'first'
      }),
      new Label({text:'Megnevez\u00e9s:'}));
                     
      field.update(true);
    };
    
    var createFelhasznalokFieldFunc = function(field)
    {
      form.appendField(new FelhasznalokComboBox(
      {
        id:'felhasznaloID',
        value:form.initalValues['felhasznaloID'],
        onReady:createTantargyakFieldFunc
      }),
      new Label({text:'Tan\u00e1r:'}));
      
      form.appendField(new DateField(
                       {id:'datum',
                        value:'',
                        minLength:10,
                        maxLength:10,
                        size:10}),
                       new Label({text:'D\u00e1tum:'}));
      form.appendField(new InputField(
                       {id:'oraszam',
                        value:'',
                        pattern:System.patterns.posInt,
                        minLength:1,
                        maxLength:2,
                        size:2}),
                       new Label({text:'\u00d3rasz\u00e1m:'}));
      form.appendField(new YesNoComboBox(
                       {id:'csoportos',
                        value:1}),
                       new Label({text:'A tev\u00e9kenys\u00e9g csoportos:'}));
      form.appendField(new YesNoComboBox(
                       {id:'dijazott',
                        value:1}),
                       new Label({text:'A tev\u00e9kenys\u00e9g d\u00edjazott:'}));
                     
      field.update(true);
    };
                     
    this.appendField(new IdoszakokComboBox(
    {
      id:'idoszakID',
      value:form.initalValues['idoszakID'],
      filters:{tanevID:form.initalValues['tanevID']},
      onReady:createFelhasznalokFieldFunc
    }),
    new Label({text:'Id\u0151szak:'}));
    
  },
      
  // @override
  toString : function()
  {
    return 'TktefForm';
  }
});

ModuleManager.ready('TktefForm');

});