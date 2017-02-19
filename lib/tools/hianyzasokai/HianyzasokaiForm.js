var HianyzasokaiForm = null;

var HianyzasokaiPrimaryField = 'hianyzasokaID';
var HianyzasokaiScript = 'lib/tools/hianyzasokai/hianyzasokai.php';
var HianyzasokaiGetDataListAction = 'GET_HIANYZASOKA_LIST';
var HianyzasokaiGetDataListCBAction = 'GET_HIANYZASOKA_LIST_CB';
var HianyzasokaiRemoveDataListAction = 'REMOVE_HIANYZASOKA_LIST';
var HianyzasokaiGetDataAction = 'GET_HIANYZASOKA_DATA';
var HianyzasokaiInsertDataAction = 'INSERT_HIANYZASOKA_DATA';
var HianyzasokaiModifyDataAction = 'MODIFY_HIANYZASOKA_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/InputField.js',
 'lib/widgets/YesNoComboBox.js'],
function()
{

/**
 * Hiányzás okainak a kezelésére szolgáló űrlap osztálya.      
 */
HianyzasokaiForm = Form.extend(
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
    this.primaryField = HianyzasokaiPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HianyzasokaiScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = HianyzasokaiGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = HianyzasokaiInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = HianyzasokaiModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    this.appendField(new InputField(
                     {id:'hianyzasokaNev',
                     value:'',
                      pattern:System.patterns.nWordSepBySpaceDot,
                      minLength:1,
                      maxLength:20,
                      size:20}),
                     new Label({text:'Hi\u00e1nyz\u00e1s ok\u00e1nak megnevez\u00e9se:'}));
    this.appendField(new InputField(
                     {id:'hianyzasokaNevH',
                     value:'',
                      pattern:System.patterns.nWordSepBySpaceDot,
                      minLength:1,
                      maxLength:20,
                      size:20}),
                     new Label({text:'Hi\u00e1nyz\u00e1s ok\u00e1nak \u00e1llom\u00e1nybeli megnevez\u00e9se:'}));
    this.appendField(new YesNoComboBox(
                     {id:'tamogatott',
                      value:1}),
                     new Label({text:'A t\u00e1voll\u00e9t t\u00e1mogatott:'}));
  },
      
  // @override
  toString : function()
  {
    return 'HianyzasokaiForm';
  }
});

ModuleManager.ready('HianyzasokaiForm');

});