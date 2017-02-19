var JelentestipusaiComboBox = null;

ModuleManager.load(
['lib/widgets/ComboBoxField.js'],
function()
{

/**
 * Jelentés típusának a kiválasztására alkalmas legördülő lista osztálya.      
 */
JelentestipusaiComboBox = ComboBoxField.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    this.base(args);
    
    this.appendItem('szov','Norm\u00e1l');
    this.appendItem('bin','K\u00e9zi kit\u00f6lt\u00e9shez');
  },
    
  // @override
  toString : function()
  {
    return 'JelentestipusaiComboBox';
  }
});

ModuleManager.ready('JelentestipusaiComboBox');

});