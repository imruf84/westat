var OsztalytipusaiComboBox = null;

ModuleManager.load(
['lib/widgets/ComboBoxField.js'],
function()
{

/**
 * Osztály típusának a kiválasztására alkalmas legördülő lista osztálya.      
 */
OsztalytipusaiComboBox = ComboBoxField.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    this.base(args);
    
    this.appendItem('szi','Szakiskola');
    this.appendItem('szki','Szakk\u00f6z\u00e9piskola');
    this.appendItem('int','Intenz\u00edv');
    this.appendItem('est','Esti');
    this.appendItem('egy','Egy\u00e9b');
  },
    
  // @override
  toString : function()
  {
    return 'OsztalytipusaiComboBox';
  }
});

ModuleManager.ready('OsztalytipusaiComboBox');

});