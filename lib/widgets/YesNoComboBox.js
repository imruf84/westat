var YesNoComboBox = null;

ModuleManager.load(
['lib/widgets/ComboBoxField.js'],
function()
{

/**
 * Logikai érték kiválasztására alkalmas legördülő lista osztálya.      
 */
YesNoComboBox = ComboBoxField.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    this.base(args);
    
    this.appendItem(1,'Igen');
    this.appendItem(0,'Nem');
  },
    
  // @override
  toString : function()
  {
    return 'YesNoComboBox';
  }
});

ModuleManager.ready('YesNoComboBox');

});