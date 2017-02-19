var IdoszakokForm = null;

var IdoszakokPrimaryField = 'idoszakID';
var IdoszakokScript = 'lib/tools/idoszakok/idoszakok.php';
var IdoszakokGetDataListAction = 'GET_IDOSZAK_LIST';
var IdoszakokGetDataListCBAction = 'GET_IDOSZAK_LIST_CB';
var IdoszakokRemoveDataListAction = 'REMOVE_IDOSZAK_LIST';
var IdoszakokGetDataAction = 'GET_IDOSZAK_DATA';
var IdoszakokInsertDataAction = 'INSERT_IDOSZAK_DATA';
var IdoszakokModifyDataAction = 'MODIFY_IDOSZAK_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/widgets/DateField.js','lib/System.js',
 'lib/tools/orarendek/OrarendBetujeleiComboBox.js'],
function()
{

/**
 * Időszakok adatainak kezelésére szolgáló űrlap osztálya.      
 */
IdoszakokForm = Form.extend(
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
    this.primaryField = IdoszakokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = IdoszakokScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = IdoszakokGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = IdoszakokInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = IdoszakokModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    
    var form = this;
    
    // Ez a metódus frissíti az elnevezést a beírt adatok alapján
    var func = function(field,valid)
    {
      if (!valid) return;
      
      var h = new Array('jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec');
            
      var honap1 = parseInt(field1.getValue().substr(5,2),10);
      var honap2 = parseInt(field2.getValue().substr(5,2),10);
      field0.setValue(
        ((('number' === typeof(honap1)) && (0 < honap1) && (13 > honap1))?h[honap1-1]:'')+
        '-'+
        ((('number' === typeof(honap2)) && (0 < honap2) && (13 > honap2))?h[honap2-1]:''));
    };
    
    var field0 = this.appendField(new LabelField(
                                   {id:'idoszakNev',
                                    value:'',
                                    pattern:System.patterns.idoszakNev}),
                                   new Label({text:'Id\u0151szak megnevez\u00e9se:'}));
    this.appendField(new TanevekComboBox(
                     {
                       id:'tanevID',
                       value:form.initalValues['tanevID'],
                       onReady:function(field){field.update(true);}
                     }),
                     new Label({text:'Tan\u00e9v:'}));
                     
    var field1 = this.appendField(new DateField(
                                  {id:'elsoNap',
                                   value:'',
                                   minLength:10,
                                   maxLength:10,
                                   size:10,
                                   onChange:func}),
                                  new Label({text:'Els\u0151 nap:'}));
    var field2 = this.appendField(new DateField(
                                  {id:'utolsoNap',
                                   value:'',
                                   minLength:10,
                                   maxLength:10,
                                   size:10,
                                   onChange:func}),
                                  new Label({text:'Utols\u00f3 nap:'}));
                                  
    var field3 = this.appendField(new DateField(
                                  {id:'kezdoHetElsoNap',
                                   value:'',
                                   minLength:10,
                                   maxLength:10,
                                   size:10,
                                   onChange:func}),
                                  new Label({text:'Kezd\u0151 h\u00e9t els\u0151 napja:'}));
    this.appendField(new InputField(
                     {id:'kezdoHetSorszam',
                      value:'',
                      pattern:System.patterns.posInt,
                      minLength:1,
                      maxLength:2,
                      size:2}),
                     new Label({text:'Kezd\u0151 h\u00e9t napt\u00e1ri sorsz\u00e1ma:'}));
    this.appendField(new OrarendBetujeleiComboBox(
                     {id:'kezdoHetBetujel',
                      value:'A'}),
                     new Label({text:'Kezd\u0151 h\u00e9t bet\u0171jele:'}));
  },
  
  // @override
  isValid : function()
  { 
    if (false === this.base()) return false;
    
    // Az űrlap csak akkor helyes, ha az utolsó tanítási nap nincs hamarabb, mint
    // az első tanítási nap és a kezdő hét első napja kisebb vagy egyenlő az első nappal
    var d1 = this.getFieldById('kezdoHetElsoNap').toDateObject();
    var d2 = this.getFieldById('elsoNap').toDateObject();
    var d3 = this.getFieldById('utolsoNap').toDateObject();
    
    return ((d1 <= d2) && (d2 < d3));
  },
      
  // @override
  toString : function()
  {
    return 'IdoszakokForm';
  }
});

ModuleManager.ready('IdoszakokForm');

});