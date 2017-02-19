var OsztalyCimkekForm = null;

var OsztalyCimkekPrimaryField = 'osztalyCimkeID';
var OsztalyCimkekScript = 'lib/tools/osztalycimkek/osztalycimkek.php';
var OsztalyCimkekGetDataListAction = 'GET_OSZTALY_CIMKEK_LIST';
var OsztalyCimkekGetDataListCBAction = 'GET_OSZTALY_CIMKEK_LIST_CB';
var OsztalyCimkekRemoveDataListAction = 'REMOVE_OSZTALY_CIMKEK_LIST';
var OsztalyCimkekGetDataAction = 'GET_OSZTALY_CIMKEK_DATA';
var OsztalyCimkekInsertDataAction = 'INSERT_OSZTALY_CIMKEK_DATA';
var OsztalyCimkekModifyDataAction = 'MODIFY_OSZTALY_CIMKEK_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/InputField.js','lib/System.js',
 'lib/tools/tanevek/TanevekComboBox.js'
],
function()
{

/**
 * Osztálycímkék adatainak kezelésére szolgáló űrlap osztálya.      
 */
OsztalyCimkekForm = Form.extend(
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
    this.primaryField = OsztalyCimkekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OsztalyCimkekScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = OsztalyCimkekGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = OsztalyCimkekInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = OsztalyCimkekModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    var form = this;
    
    // Mezők létrehozása
    this.appendField(new TanevekComboBox(
                     {
                       id:'tanevID',
                       value:form.initalValues['tanevID'],
                       onReady:function(field){field.update(true);}
                     }),
                     new Label({text:'Tan\u00e9v:'}));
    
    this.appendField(new InputField(
                     {id:'osztalyCimkeNev',
                      value:'',
                      pattern:System.patterns.nWordSepBySpaceSpec,
                      minLength:1,
                      maxLength:20,
                      size:20}),
                     new Label({text:'Oszt\u00e1lyc\u00edmke neve:'}));
    this.appendField(new InputField(
                     {id:'osztalyCimkeNevO',
                      value:'',
                      pattern:System.patterns.nWordSepBySpaceSpec,
                      minLength:1,
                      maxLength:20,
                      size:20}),
                     new Label({text:'Oszt\u00e1lyc\u00edmke \u00f3rarendi neve:'}));
    this.appendField(new InputField(
                     {id:'osztalyCimkeNevH',
                      value:'',
                      pattern:System.patterns.nWordSepBySpaceSpec,
                      minLength:1,
                      maxLength:20,
                      size:20}),
                     new Label({text:'Oszt\u00e1lyc\u00edmke helyettes\u00edt\u00e9si neve:'}));
  },
      
  // @override
  toString : function()
  {
    return 'OsztalyCimkekForm';
  }
});

ModuleManager.ready('OsztalyCimkekForm');

});