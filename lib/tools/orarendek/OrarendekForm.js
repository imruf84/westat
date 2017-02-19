var OrarendekForm = null;

var OrarendekPrimaryField = 'orarendID';
var OrarendekScript = 'lib/tools/orarendek/orarendek.php';
var OrarendekGetDataListAction = 'GET_ORAREND_LIST';
var OrarendekGetDataListDbAction = 'GET_ORAREND_LIST_DB';
var OrarendekGetHetekAction = 'GET_ORAREND_HETEK';
var OrarendekRemoveDataListAction = 'REMOVE_ORAREND_LIST';
var OrarendekGetDataAction = 'GET_ORAREND_DATA';
var OrarendekInsertDataAction = 'INSERT_ORAREND_DATA';
var OrarendekModifyDataAction = 'MODIFY_ORAREND_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/LabelField.js','lib/System.js',
 'lib/tanevek/TanevekComboBox.js'],
function()
{

/**
 * Órarendek kezelésére szolgáló űrlap osztálya.      
 */
OrarendekForm = Form.extend(
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
    this.primaryField = OrarendekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OrarendekScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = OrarendekGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = OrarendekInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = OrarendekModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
                     
    // Tanévek listája
    this.appendField(new TanevekComboBox(
    {
      id:'tanevID',
      index:'last',
      onReady:function(field)
      {
        // Órarend azonosítója
        form.appendField(new LabelField(
        {
          id:'orarendID',
          value:form.initalValues['orarendID'],
          minLength:10,
          maxLength:10,
          size:10,
          onReady:function(field){field.update(true);}
        }),
        new Label({text:'\u00d3rarend azonos\u00edt\u00f3ja:'}));
        
        field.update(true);
      }
    }),
    new Label({text:'Tan\u00e9v:'}));
  },
      
  // @override
  toString : function()
  {
    return 'OrarendekForm';
  }
});

ModuleManager.ready('OrarendekForm');

});