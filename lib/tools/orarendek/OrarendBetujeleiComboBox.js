var OrarendBetujeleiComboBox = null;

ModuleManager.load(
['lib/widgets/ComboBoxField.js'],
function()
{

/**
 * Órarend betűjeleinek a kiválasztására alkalmas legördülő lista osztálya.      
 */
OrarendBetujeleiComboBox = ComboBoxField.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    this.base(args);
    
    this.appendItem('A','A');
    this.appendItem('B','B');
  },
    
  // @override
  toString : function()
  {
    return 'OrarendBetujeleiComboBox';
  }
});

ModuleManager.ready('OrarendBetujeleiComboBox');

});