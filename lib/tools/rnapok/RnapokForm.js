var RnapokForm = null;

var RnapokPrimaryField = 'rnapID';
var RnapokScript = 'lib/tools/rnapok/rnapok.php';
var RnapokGetDataListAction = 'GET_RNAP_LIST';
var RnapokRemoveDataListAction = 'REMOVE_RNAP_LIST';
var RnapokGetDataAction = 'GET_RNAP_DATA';
var RnapokInsertDataAction = 'INSERT_RNAP_DATA';
var RnapokModifyDataAction = 'MODIFY_RNAP_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/DateField.js',
 'lib/widgets/InputField.js','lib/widgets/ComboBoxField.js',
 'lib/tools/rnapok/RnaptipusaiComboBox.js',
 'lib/tools/idoszakok/IdoszakokComboBox.js',
 'lib/tools/orarendek/OrarendBetujeleiComboBox.js'
],
function()
{

/**
 * Rendhagyó napok adatainak kezelésére szolgáló űrlap osztálya.      
 */
RnapokForm = Form.extend(
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
    this.primaryField = RnapokPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = RnapokScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = RnapokGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = RnapokInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = RnapokModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
    var createOtherFieldFunc = function(field)
    {
      // Dátum
      form.appendField(new DateField(
                       {id:'datum',
                        value:'',
                        minLength:10,
                        maxLength:10,
                        size:10}),
                       new Label({text:'D\u00e1tum:'}));
                       
      // Típus
      form.appendField(new RnaptipusaiComboBox(
                       {id:'tipus',
                        value:'ikn',
                        // Különböző típusok esetén különböző extra mezők szükségesek
                        onChange:function(field,valid){form.tipusFieldOnChange();}
                       }),
                       new Label({text:'Rendhagy\u00f3 nap t\u00edpusa:'}));
                       
      // Megjegyzés
      form.appendField(new InputField(
                       {id:'megjegyzes',
                        value:'',
                        pattern:System.patterns.nWordSepBySpaceSpec,
                        minLength:0,
                        maxLength:30,
                        size:30}),
                       new Label({text:'Megjegyz\u00e9s:'}));
      
      // Ideinglenesen minden típusú nap mezőjét létrehozzuk
      var f = new RnaptipusaiComboBox();
      form.createRemoveFields(f.getValuesArray(),new Array());
      
      // Adatok beszúrása esetén törölnünk kell a felesleges mezőket
      // NOTE: - adatok letöltésekor ez automatikusan lefut az adatok mezőbe írása után
      if ('insert' === form.type)
        form.tipusFieldOnChange();
      
    };
                     
    this.appendField(new IdoszakokComboBox(
    {
      id:'idoszakID',
      value:form.initalValues['idoszakID'],
      filters:{tanevID:form.initalValues['tanevID']},
      onReady:createOtherFieldFunc
    }),
    new Label({text:'Id\u0151szak:'}));
    
  },
  
  /**
   * Szükséges/szükségtelen mezők létrehozása/törlése megadott típusú rendhagyó 
   * nap alapján.
   * 
   * @param tipusToCreate {Array as string} a rendhagyó nap létrehozandó típusainak tömbje      
   * @param tipusToRemove {Array as string} a rendhagyó nap eltávolítandó típusainak tömbje   
   */     
  createRemoveFields : function(tipusToCreate,tipusToRemove)
  {
    var form = this;
  
    // Létrehozás
    
    // Helyettesített nap
    if (tipusToCreate.has('hn'))
    { 
      // Dátum2
      if (!this.fieldIsContent(this.getFieldById('hnDatum')))
      {
        this.appendField(new DateField(
                         {id:'hnDatum',
                          value:'',
                          minLength:10,
                          maxLength:10,
                          size:10
                         }),
                        new Label({text:'Helyettes\u00edt\u0151 nap d\u00e1tuma:'}));
      }
      
      // Hét sorszáma
      if (!this.fieldIsContent(this.getFieldById('hnHet')))
      {
        this.appendField(new OrarendBetujeleiComboBox(
                         {id:'hnHet',
                          index:'first'
                         }),
                        new Label({text:'H\u00e9t:'}));  
      }
      
    }
    
    
    // Kötelező óraszám szerinti nap adott osztállyal
    if (tipusToCreate.has('kono'))
    { 
      // Osztály neve
      if (!this.fieldIsContent(this.getFieldById('konoOsztyalyNev')))
      {
        this.appendField(new InputField(
                         {id:'konoOsztalyNev',
                          value:'',
                          pattern:System.patterns.nWordSepBySpaceSpec,
                          minLength:1,
                          maxLength:20,
                          size:20
                         }),
                        new Label({text:'Oszt\u00e1ly neve:'}));                        
      }
      
    }
    
    // Adott óraszám szerinti nap adott osztállyal
    if (tipusToCreate.has('aono'))
    { 
      // Osztály neve
      if (!this.fieldIsContent(this.getFieldById('aonoOsztyalyNev')))
      {
        this.appendField(new InputField(
                         {id:'aonoOsztalyNev',
                          value:'',
                          pattern:System.patterns.nWordSepBySpaceSpec,
                          minLength:1,
                          maxLength:20,
                          size:20
                         }),
                        new Label({text:'Oszt\u00e1ly neve:'}));                        
      }
       
      // Óraszám
      if (!this.fieldIsContent(this.getFieldById('aonoOraszam')))
      {                 
        this.appendField(new InputField(
                         {id:'aonoOraszam',
                          value:'',
                          pattern:System.patterns.posInt,
                          minLength:1,
                          maxLength:2,
                          size:2
                         }),
                        new Label({text:'\u00d3rasz\u00e1m:'}));
      }
      
    }
    
    // Órarend szerinti nap adott órától adott óráig
    if (tipusToCreate.has('onaoao'))
    {
      // Órától
      if (!this.fieldIsContent(this.getFieldById('onaoaoOratol')))
      {
        this.appendField(new InputField(
                         {id:'onaoaoOratol',
                          value:'',
                          pattern:System.patterns.posInt,
                          minLength:1,
                          maxLength:2,
                          size:2
                         }),
                        new Label({text:'\u00d3r\u00e1t\u00f3l:'}));
      }
      
      // Óráig
      if (!this.fieldIsContent(this.getFieldById('onaoaoOraig')))
      {
        this.appendField(new InputField(
                         {id:'onaoaoOraig',
                          value:'',
                          pattern:System.patterns.posInt,
                          minLength:1,
                          maxLength:2,
                          size:2
                         }),
                        new Label({text:'\u00d3r\u00e1tig:'}));
      }
      
    }
    
    
    // Törlés
    
    // Helyettesített nap
    if (tipusToRemove.has('hn'))
    {
      this.removeField(this.getFieldById('hnDatum'));
      this.removeField(this.getFieldById('hnHet'));
    }
    
    // Kötelező óraszám szerinti nap adott osztállyal
    if (tipusToRemove.has('kono'))
    {
      this.removeField(this.getFieldById('konoOsztalyNev'));
    }
    
    // Adott óraszám szerinti nap adott osztállyal
    if (tipusToRemove.has('aono'))
    {
      this.removeField(this.getFieldById('aonoOsztalyNev'));
      this.removeField(this.getFieldById('aonoOraszam'));
    }
    
    // Órarend szerinti nap adott órától adott óráig
    if (tipusToRemove.has('onaoao'))
    {
      this.removeField(this.getFieldById('onaoaoOratol'));
      this.removeField(this.getFieldById('onaoaoOraig'));
    }
    
    // Űrlap frissítése
    this.update(true);
    
  },
  
  /**
   * Rendhagyó nap típusának megváltoztatásának az eseménye.
   */     
  tipusFieldOnChange : function()
  {
    // Az adatok betöltése után nem biztos, hogy szükség van minden mezőre
    var tipusField = this.getFieldById('tipus');
    
    if (null == tipusField)
    {
      this.update(true);
      return;
    }
    
    var tipus = tipusField.getValue();
    
    var f = new RnaptipusaiComboBox();
    var tRemove = f.getValuesArray();
    tRemove.splice(tRemove.indexOf(tipus),1);
    
    this.createRemoveFields(new Array(tipus),tRemove);
  },
  
  // @override
  onGetDataAfterAction : function(form,response)
  {
    this.tipusFieldOnChange();
  },
  
  // @override
  isValid : function()
  {
    var valid = this.base();
    
    // onaoao típusú nap esetén az órától nem haladhatja meg az óráig-ot
    var onaoaoOratol = this.getFieldById('onaoaoOratol');
    var onaoaoOraig = this.getFieldById('onaoaoOraig');
    if ((onaoaoOratol instanceof Widget) && 
        (onaoaoOraig instanceof Widget))
    {
      valid = valid && (parseInt(onaoaoOratol.getValue()) <= parseInt(onaoaoOraig.getValue()));
    }
      
    return valid;
  },
  
  // @override
  toString : function()
  {
    return 'RnapokForm';
  }
});

ModuleManager.ready('RnapokForm');

});