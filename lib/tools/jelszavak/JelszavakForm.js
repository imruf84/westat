var JelszavakForm = null;

var JelszavakPrimaryField = 'felhasznaloID';
var JelszavakScript = 'lib/tools/jelszavak/jelszavak.php';
var JelszavakGetDataListAction = 'GET_JELSZO_LIST';
var JelszavakRemoveDataListAction = 'REMOVE_JELSZO_LIST';
var JelszavakGetDataAction = 'GET_JELSZO_DATA';
var JelszavakInsertDataAction = 'INSERT_JELSZO_DATA';
var JelszavakModifyDataAction = 'MODIFY_JELSZO_DATA';

ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/LabelField.js',
 'lib/widgets/PasswordInputField.js'],
function()
{

/**
 * Jelszó kezelésére szolgáló űrlap osztálya.      
 */
JelszavakForm = Form.extend(
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
    this.primaryField = JelszavakPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = JelszavakScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = JelszavakGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = JelszavakInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = JelszavakModifyDataAction;
    
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    
    // Mezők létrehozása
    var form = this;
    
    // Tájékoztató jellegű adatok
    
    // Felhasználó neve
    this.appendField(new LabelField(
    {
      id:'felhasznaloNev',
      unused:true,
      value:form.initalValues['felhasznaloNev'],
      //pattern:System.patterns.nWordSepBySpaceDot,
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
    
    // Új jelszó
    this.appendField(new PasswordInputField(
                     {id:'jelszo1',
                      value:'',
                      pattern:System.patterns.anyWord,
                      minLength:0,
                      maxLength:35,
                      size:35}),
                     new Label({text:'\u00daj jelsz\u00f3:'}));
    
    // Új jelszó mégegyszer
    this.appendField(new PasswordInputField(
                     {id:'jelszo2',
                      value:'',
                      pattern:System.patterns.anyWord,
                      minLength:0,
                      maxLength:35,
                      size:35}),
                     new Label({text:'\u00daj jelsz\u00f3 m\u00e9gegyszer:'}));
    
  },
      
  // @override
  toString : function()
  {
    return 'JelszavakForm';
  }
});

ModuleManager.ready('JelszavakForm');

});