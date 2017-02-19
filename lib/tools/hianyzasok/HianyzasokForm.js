var HianyzasokForm = null;

var HianyzasokPrimaryField = 'hianyzasID';
var HianyzasokScript = 'lib/tools/hianyzasok/hianyzasok.php';
var HianyzasokGetDataListAction = 'GET_HIANYZAS_LIST';
var HianyzasokRemoveDataListAction = 'REMOVE_HIANYZAS_LIST';
var HianyzasokGetDataAction = 'GET_HIANYZAS_DATA';
var HianyzasokInsertDataAction = 'INSERT_HIANYZAS_DATA';
var HianyzasokModifyDataAction = 'MODIFY_HIANYZAS_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/DateField.js',
 'lib/widgets/InputField.js','lib/tools/hianyzasokai/HianyzasokaiComboBox.js',
 'lib/widgets/YesNoComboBox.js',
 //'lib/tools/osztalycimkek/OsztalyCimkekComboBox.js',
 'lib/tools/osztalyok/OsztalyokComboBox.js',
 'lib/tools/tantargyak/TantargyakComboBox.js',
 'lib/tools/felhasznalok/FelhasznalokComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js'
],
function()
{

/**
 * Hiányzások adatainak kezelésére szolgáló űrlap osztálya.      
 */
HianyzasokForm = Form.extend(
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
    this.primaryField = HianyzasokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = HianyzasokScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = HianyzasokGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = HianyzasokInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = HianyzasokModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
    // A form típusa beszúrás?
    var isTypeInsert = ('insert' == this.type);
                     
    var createHianyzasokaiFieldFunc = function(field)
    {
      form.appendField(new HianyzasokaiComboBox(
      {
        id:'hianyzasokaID',
        onReady:function(field){field.update(true);},
        index:'first'
      }),
      new Label({text:'Hi\u00e1nyz\u00e1s oka:'}));
      
      
      form.appendField(new YesNoComboBox(
      {
        id:'igazolt',
        value:1
      }),
      new Label({text:'A hi\u00e1nyz\u00e1s igazolt:'}));
      
      if (true == isTypeInsert)
        form.appendField(new YesNoComboBox(
        {
          id:'egesznapos',
          unused:true,
          value:1,
          // Nem egész napos hiányzás esetén extra mezők szükségesek
          onChange:function(field,valid){form.egesznaposFieldOnChange();}
        }),
        new Label({text:'A hi\u00e1nyz\u00e1s eg\u00e9sz napos:'}));
        
      // Ideinglenesen minden típusú nap mezőjét létrehozzuk
      var f = new YesNoComboBox();
      form.egesznaposFieldOnChange(f.getValuesArray(),new Array());
      
      // Adatok beszúrása esetén törölnünk kell a felesleges mezőket (oratol,oraig)
      form.egesznaposFieldOnChange();
      
    };
    
    var createTantargyakFieldFunc = function(field)
    {
      if (!isTypeInsert)
      {
        form.appendField(new TantargyakComboBox(
        {
          id:'tantargyID',
          onReady:createHianyzasokaiFieldFunc,
          index:'first'
        }),
        new Label({text:'Tant\u00e1rgy:'}));
                     
        field.update(true);
      }
      else
        createHianyzasokaiFieldFunc(field);
    };
    
    var createOsztalyokFieldFunc = function(field)
    {
      if (!isTypeInsert)
      {
        //form.appendField(new OsztalyCimkekComboBox(
        form.appendField(new OsztalyokComboBox(
        {
          id:'osztalyID',
          onReady:createTantargyakFieldFunc,
          filters:{tanevID:form.initalValues['tanevID']},
          index:'first'
        }),
        new Label({text:'Oszt\u00e1ly:'}));
                     
        field.update(true);
      }
      else
        createTantargyakFieldFunc(field);
    };
    
    var createFelhasznalokFieldFunc = function(field)
    {
      form.appendField(new FelhasznalokComboBox(
      {
        id:'felhasznaloID',
        value:form.initalValues['felhasznaloID'],
        onReady:createOsztalyokFieldFunc
      }),
      new Label({text:'Tan\u00e1r:'}));
      
      form.appendField(new DateField(
                       {id:'datum',
                        value:'',
                        minLength:10,
                        maxLength:10,
                        size:10}),
                       new Label({text:'D\u00e1tum:'}));
                     
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
  
  /**
   * Szükséges/szükségtelen mezők létrehozása/törlése egésznapos hiányzás esetén
   * 
   * @param tipusToCreate {Array as string} a hiányzás létrehozandó mezőinek tömbje      
   * @param tipusToRemove {Array as string} a hiányzás eltávolítandó típusainak tömbje   
   */     
  createRemoveFields : function(tipusToCreate,tipusToRemove)
  {
    // Létrehozás
    
    // A form típusa beszúrás?
    var isTypeInsert = ('insert' == this.type);
    
    // Helyettesített nap
    if (tipusToCreate.has(0) || !isTypeInsert)
    { 
      // óra/órától
      if (!this.fieldIsContent(this.getFieldById('ora')))
      {
        var f = this.appendField(new InputField(
                       {id:'ora',
                        value:'',
                        pattern:System.patterns.posInt,
                        minLength:1,
                        maxLength:2,
                        size:2}),
                       new Label({text:isTypeInsert?'\u00d3r\u00e1t\u00f3l:':'\u00d3ra:'}));
      }
      
      if (!this.fieldIsContent(this.getFieldById('oraig')) && isTypeInsert)
      {
        var f = this.appendField(new InputField(
                         {id:'oraig',
                          value:'',
                          pattern:System.patterns.posInt,
                          minLength:0,
                          maxLength:2,
                          size:2}),
                         new Label({text:'\u00d3r\u00e1ig:'}));
      }
      
    }
    
    
    // Törlés
    
    // Helyettesített nap
    if (tipusToRemove.has(0))
    {
      this.removeField(this.getFieldById('ora'));
      this.removeField(this.getFieldById('oraig'));
    }
  
    // Űrlap frissítése
    this.update(true);
    
  },   
  
  /**
   * Hiányzás egész naposságának a megváltoztatásának az eseménye.
   */     
  egesznaposFieldOnChange : function()
  {
    // Az adatok betöltése után nem biztos, hogy szükség van minden mezőre
    var egesznaposField = this.getFieldById('egesznapos');
    
    if (null == egesznaposField)
    {
      this.createRemoveFields(new Array(0),new Array());
      
      return;
    }
    
    var egesznapos = egesznaposField.getValue();
    
    var f = new YesNoComboBox();
    var tRemove = f.getValuesArray();
    tRemove.splice(tRemove.indexOf(egesznapos),1);
    
    this.createRemoveFields(new Array(egesznapos),tRemove);
  },
  
  // @override
  onGetDataAfterAction : function(form,response)
  {
    this.egesznaposFieldOnChange();
  },
      
  // @override
  toString : function()
  {
    return 'HianyzasokForm';
  }
});

ModuleManager.ready('HianyzasokForm');

});