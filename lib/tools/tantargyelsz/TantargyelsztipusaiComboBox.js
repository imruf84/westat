var TantargyelsztipusaiComboBox = null;

ModuleManager.load(
['lib/widgets/ComboBoxField.js'],
function()
{

/**
 * Tantárgyelszámolás típusának a kiválasztására alkalmas legördülő lista osztálya.      
 */
TantargyelsztipusaiComboBox = ComboBoxField.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    this.base(args);
    
    this.appendItem('elm','Elm\u00e9let');
    this.appendItem('gyak','Gyakorlat');
    this.appendItem('tkt','Tan\u00f3r\u00e1n k\u00edv\u00fcli tev\u00e9kenys\u00e9g');
    this.appendItem('ef','Egy\u00e9ni foglalkoz\u00e1s');
    this.appendItem('tktgy','Tan\u00f3r\u00e1n k\u00edv\u00fcli tev\u00e9kenys\u00e9g (gyakorlat)');
    this.appendItem('efgy','Egy\u00e9ni foglalkoz\u00e1s (gyakorlat)');
  },
    
  // @override
  toString : function()
  {
    return 'TantargyelsztipusaiComboBox';
  }
});

ModuleManager.ready('TantargyelsztipusaiComboBox');

});