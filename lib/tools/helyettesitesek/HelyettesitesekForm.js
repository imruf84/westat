var HelyettesitesekForm = null;

var HelyettesitesekPrimaryField = 'helyettesitesID';
var HelyettesitesekScript = 'lib/tools/helyettesitesek/helyettesitesek.php';
var HelyettesitesekGetDataListAction = 'GET_HELYETTESITES_LIST';
var HelyettesitesekRemoveDataListAction = 'REMOVE_HELYETTESITES_LIST';
var HelyettesitesekGetDataAction = 'GET_HELYETTESITES_DATA';
var HelyettesitesekInsertDataAction = 'INSERT_HELYETTESITES_DATA';
var HelyettesitesekModifyDataAction = 'MODIFY_HELYETTESITES_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/DateField.js',
 'lib/widgets/InputField.js','lib/tools/helyettesitestipusai/HelyettesitestipusaiComboBox.js',
 'lib/tools/osztalyok/OsztalyokComboBox.js',
 'lib/tools/tantargyak/TantargyakComboBox.js',
 'lib/tools/felhasznalok/FelhasznalokComboBox.js',
 'lib/tools/felhasznalok/FelhasznalokAllComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js'
],
function()
{

/**
 * Hiányzások adatainak kezelésére szolgáló űrlap osztálya.      
 */
HelyettesitesekForm = Form.extend(
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
    this.primaryField = HelyettesitesekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HelyettesitesekScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = HelyettesitesekGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = HelyettesitesekInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = HelyettesitesekModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
    var createHelyettesitestipusaiFieldFunc = function(field)
    {
      form.appendField(new HelyettesitestipusaiComboBox(
      {
        id:'helyettesitestipusaID',
        onReady:function(field){field.update(true);},
        index:'first'
      }),
      new Label({text:'Helyettes\u00edt\u00e9s t\u00edpusa:'}));
                           
      field.update(true);
    };
    
    var createTantargyakFieldFunc = function(field)
    {
      form.appendField(new TantargyakComboBox(
      {
        id:'tantargyID',
        onReady:createHelyettesitestipusaiFieldFunc,
        index:'first'
      }),
      new Label({text:'Tant\u00e1rgy:'}));
                     
      field.update(true);
    };
    
    var createOsztalyokFieldFunc = function(field)
    {
      form.appendField(new OsztalyokComboBox(
      {
        id:'osztalyID',
        onReady:createTantargyakFieldFunc,
        filters:{tanevID:form.initalValues['tanevID']},
        index:'first'
      }),
      new Label({text:'Oszt\u00e1ly:'}));
                     
      field.update(true);
    };
    
    var createHelyettesitettFieldFunc = function(field)
    {
      form.appendField(new FelhasznalokAllComboBox(
      {
        id:'helyettesitettID',
        onReady:createOsztalyokFieldFunc
      }),
      new Label({text:'Helyettes\u00edtett tan\u00e1r:'}));
      
      form.appendField(new DateField(
                       {id:'datum',
                        value:'',
                        minLength:10,
                        maxLength:10,
                        size:10}),
                       new Label({text:'D\u00e1tum:'}));
      form.appendField(new InputField(
                       {id:'ora',
                        value:'',
                        pattern:System.patterns.posInt,
                        minLength:1,
                        maxLength:2,
                        size:2}),
                       new Label({text:'\u00d3ra:'}));
                     
      field.update(true);
    };
    
    var createFelhasznalokFieldFunc = function(field)
    {
      form.appendField(new FelhasznalokComboBox(
      {
        id:'helyettesitoID',
        value:form.initalValues['helyettesitoID'],
        onReady:createHelyettesitettFieldFunc
      }),
      new Label({text:'Tan\u00e1r:'}));
                     
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
    return 'HelyettesitesekForm';
  }
});

ModuleManager.ready('HelyettesitesekForm');

});