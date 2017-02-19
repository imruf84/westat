var TantargyelszForm = null;

var TantargyelszPrimaryField = 'tantargyID';
var TantargyelszScript = 'lib/tools/tantargyelsz/tantargyelsz.php';
var TantargyelszGetDataListAction = 'GET_TANTARGYELSZ_LIST';
var TantargyelszRemoveDataListAction = 'REMOVE_TANTARGYELSZ_LIST';
var TantargyelszGetDataAction = 'GET_TANTARGYELSZ_DATA';
var TantargyelszInsertDataAction = 'INSERT_TANTARGYELSZ_DATA';
var TantargyelszModifyDataAction = 'MODIFY_TANTARGYELSZ_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/LabelField.js',
 'lib/tools/tantargyelsz/TantargyelsztipusaiComboBox.js',
 'lib/tools/tantargyelsz/SzakfeladattipusaiComboBox.js',
 'lib/widgets/InputField.js',
 'lib/Ajax.js'
 ],
function()
{

/**
 * Tantárgyelszámolások kezelésére szolgáló űrlap osztálya.      
 */
TantargyelszForm = Form.extend(
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
    this.primaryField = TantargyelszPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = TantargyelszScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = TantargyelszGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = TantargyelszInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = TantargyelszModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
    // Tájékoztató jellegű adatok
    
    // Tanév neve
    this.appendField(new LabelField(
    {
      id:'tanevNev',
      unused:true,
      value:form.initalValues['tanevNev'],
      pattern:System.patterns.tanevNev,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Tan\u00e9v neve:'}));
    
    // Tanév azonosítója
    this.appendField(new LabelField(
    {
      id:'tanevID',
      value:form.initalValues['tanevID'],
      pattern:System.patterns.posInt,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Tan\u00e9v azonos\u00edt\u00f3ja:'}),
    true);
    
    // Felhasználó neve
    this.appendField(new LabelField(
    {
      id:'felhasznaloNev',
      unused:true,
      value:form.initalValues['felhasznaloNev'],
      pattern:System.patterns.anyWord,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Felhaszn\u00e1l\u00f3 neve:'}));
    
    // Felhasználó azonosítója
    this.appendField(new LabelField(
    {
      id:'felhasznaloID',
      value:form.initalValues['felhasznaloID'],
      pattern:System.patterns.posInt,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Felhaszn\u00e1l\u00f3 azonos\u00edt\u00f3ja:'}),
    true);
    
    // Tantárgy neve
    this.appendField(new LabelField(
    {
      id:'tantargyNev',
      unused:true,
      value:form.initalValues['tantargyNev'],
      pattern:System.patterns.anyWord,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Tant\u00e1rgy neve:'}));
    
    // Felhasználó azonosítója
    this.appendField(new LabelField(
    {
      id:'tantargyID',
      value:form.initalValues['tantargyID'],
      pattern:System.patterns.posInt,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Tant\u00e1rgy azonos\u00edt\u00f3ja:'}),
    true);
    
    this.appendField(new TantargyelsztipusaiComboBox(
    {
      id:'tipus',
      value:'elm'
    }),
    new Label({text:'Tant\u00e1rgy t\u00edpusa:'}));
    
    // Óraadó esetén jelenítjük csak meg ezt a mezőt
    if (true === args.oraado)
      this.appendField(new SzakfeladattipusaiComboBox(
      {
        id:'szakfelsz',
        value:0
      }),
      new Label({text:'Szakfeladat elsz\u00e1mol\u00e1s:'}));
    
  },
  
  // @override
  // NOTE: - mivel itt nincs kitüntetett elsődleges kulcs, ezért küldenünk kell 
  //         minden mezőértéket a szervernek
  getDataFromDbCreateParam : function(id)
  {
    var param = this.base(id);
    
    // Mezők értékeinek tárolása
    for (var i = 0; i < param.FIELDS.length; i++)
    {
      var field = this.getFieldById(param.FIELDS[i]);
      if (null !== field)
        param[param.FIELDS[i]] = field.getValue();
    }
    
    return param;
  },
      
  // @override
  toString : function()
  {
    return 'TantargyelszForm';
  }
});

ModuleManager.ready('TantargyelszForm');

});