var FelhasznalotipusaiComboBox = null;

ModuleManager.load(
['lib/widgets/ComboBoxField.js'],
function()
{

/**
 * Felhasználó típusának a kiválasztására alkalmas legördülő lista osztálya.      
 */
FelhasznalotipusaiComboBox = ComboBoxField.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    this.base(args);
    
    this.appendItem('user','user');
    this.appendItem('operator','operator');
    this.appendItem('guest','guest');
    this.appendItem('admin','admin');
    this.appendItem('leader','leader');
  },
    
  // @override
  toString : function()
  {
    return 'FelhasznalotipusaiComboBox';
  }
});

ModuleManager.ready('FelhasznalotipusaiComboBox');

});