var HihebetoltForm = null;

var HihebetoltPrimaryField = 'allomanyNev';
var HihebetoltScript = 'lib/tools/hihebetolt/hihebetolt.php';
var HihebetoltGetDataListAction = 'GET_HIHEBETOLT_LIST';
var HihebetoltRemoveDataListAction = 'REMOVE_HIHEBETOLT_LIST';
var HihebetoltGetDataAction = 'GET_HIHEBETOLT_DATA';
var HihebetoltInsertDataAction = 'INSERT_HIHEBETOLT_DATA';
var HihebetoltModifyDataAction = 'MODIFY_HIHEBETOLT_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/LabelField.js','lib/System.js',
 'lib/idoszakok/IdoszakokComboBox.js'],
function()
{

/**
 * Hiányzésok és helyettesítések állományból való betöltésének kezelésére 
 * szolgáló űrlap osztálya.      
 */
HihebetoltForm = Form.extend(
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
    this.primaryField = HihebetoltPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HihebetoltScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = HihebetoltGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = HihebetoltInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = HihebetoltModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    // Idoszakok listája
    this.appendField(new IdoszakokComboBox(
    {
      id:'idoszakID',
      value:form.initalValues['idoszakID'],
      filters:{tanevID:form.initalValues['tanevID']},
      onReady:function(field)
      {
        // Állomány neve
        form.appendField(new LabelField(
                          {id:'allomanyNev', 
                           value:form.initalValues['allomanyNev'],
                           pattern:System.patterns.excelFile,
                           onReady:function(field){field.update(true);}}),
                         new Label({text:'\u00c1llom\u00e1ny neve:'}));
        field.update(true);
      }
    }),
    new Label({text:'Id\u0151szak:'}));
  },
      
  // @override
  toString : function()
  {
    return 'HihebetoltForm';
  }
});

ModuleManager.ready('HihebetoltForm');

});