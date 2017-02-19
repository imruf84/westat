var TanevekForm = null;

var TanevekPrimaryField = 'tanevID';
var TanevekScript = 'lib/tools/tanevek/tanevek.php';
var TanevekGetDataListAction = 'GET_TANEV_LIST';
var TanevekGetDataListCBAction = 'GET_TANEV_LIST_CB';
var TanevekRemoveDataListAction = 'REMOVE_TANEV_LIST';
var TanevekGetDataAction = 'GET_TANEV_DATA';
var TanevekInsertDataAction = 'INSERT_TANEV_DATA';
var TanevekModifyDataAction = 'MODIFY_TANEV_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/DateField.js','lib/System.js'],
function()
{

/**
 * Tanévek adatainak kezelésére szolgáló űrlap osztálya.      
 */
TanevekForm = Form.extend(
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
    this.primaryField = TanevekPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TanevekScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = TanevekGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = TanevekInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = TanevekModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    
    // Ez a metódus frissíti az elnevezést a beírt adatok alapján
    var func = function(field,valid)
    {
      if (!valid) return;
      
      field0.setValue(field1.getValue().substr(0,4)+'/'+field2.getValue().substr(0,4));
    };
    
    var field0 = this.appendField(new LabelField(
                                   {id:'tanevNev',
                                    value:'',
                                    pattern:System.patterns.tanevNev}),
                                   new Label({text:'Tan\u00e9v megnevez\u00e9se:'}));
    var field1 = this.appendField(new DateField(
                                  {id:'elsoNap',
                                   value:'',
                                   minLength:10,
                                   maxLength:10,
                                   size:10,
                                   onChange:func}),
                                  new Label({text:'Els\u0151 tan\u00edt\u00e1si nap:'}));
    var field2 = this.appendField(new DateField(
                                  {id:'utolsoNap',
                                   value:'',
                                   minLength:10,
                                   maxLength:10,
                                   size:10,
                                   onChange:func}),
                                  new Label({text:'Utols\u00f3 tan\u00edt\u00e1si nap:'}));
  },
  
  // @override
  isValid : function()
  { 
    if (false === this.base()) return false;
    
    // Az űrlap csak akkor helyes, ha az utolsó tanítási nap nincs hamarabb, mint
    // az első tanítási nap
    var d1 = this.getFieldById('elsoNap').toDateObject();
    var d2 = this.getFieldById('utolsoNap').toDateObject();
    
    if (d1.getFullYear() < d2.getFullYear()) return true;
    if (d1.getMonth() < d2.getMonth()) return true;
    if (d1.getDay() < d2.getDay()) return true;
      
    return false;
  },
      
  // @override
  toString : function()
  {
    return 'TanevekForm';
  }
});

ModuleManager.ready('TanevekForm');

});