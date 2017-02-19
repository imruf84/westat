var OsztalyokForm = null;

var OsztalyokPrimaryField = 'osztalyID';
var OsztalyokScript = 'lib/tools/osztalyok/osztalyok.php';
var OsztalyokGetDataListAction = 'GET_OSZTALYOK_LIST';
var OsztalyokGetDataListCBAction = 'GET_OSZTALYOK_LIST_CB';
var OsztalyokRemoveDataListAction = 'REMOVE_OSZTALYOK_LIST';
var OsztalyokGetDataAction = 'GET_OSZTALYOK_DATA';
var OsztalyokInsertDataAction = 'INSERT_OSZTALYOK_DATA';
var OsztalyokModifyDataAction = 'MODIFY_OSZTALYOK_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/InputField.js','lib/System.js',
 'lib/tools/tanevek/TanevekComboBox.js','lib/tools/osztalyok/OsztalytipusaiComboBox.js'
],
function()
{

/**
 * Osztályok adatainak kezelésére szolgáló űrlap osztálya.      
 */
OsztalyokForm = Form.extend(
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
    this.primaryField = OsztalyokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = OsztalyokScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = OsztalyokGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = OsztalyokInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = OsztalyokModifyDataAction;
    
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
                     new Label({text:'Indul\u00e1s tan\u00e9ve:'}));
                     
    this.appendField(new InputField(
                     {id:'kezdoevfolyam',
                      value:'',
                      pattern:System.patterns.posInt,
                      minLength:1,
                      maxLength:2,
                      size:5}),
                     new Label({text:'Oszt\u00e1ly kezd\u0151\u00e9vfolyama:'}));
    
    this.appendField(new InputField(
                     {id:'betujel',
                      value:'',
                      pattern:System.patterns.oneCharOrNumber,
                      minLength:1,
                      maxLength:1,
                      size:5}),
                     new Label({text:'Oszt\u00e1ly bet\u0171jele:'}));
                     
    this.appendField(new InputField(
                     {id:'idotartam',
                      value:'',
                      pattern:System.patterns.posInt,
                      minLength:1,
                      maxLength:2,
                      size:5}),
                     new Label({text:'Oszt\u00e1ly id\u0151tartama (\u00e9vekben):'}));
    
    this.appendField(new OsztalytipusaiComboBox(
                     {id:'tipus',
                      value:'szi'}),
                     new Label({text:'Oszt\u00e1ly t\u00edpusa:'}));
  },
      
  // @override
  toString : function()
  {
    return 'OsztalyokForm';
  }
});

ModuleManager.ready('OsztalyokForm');

});