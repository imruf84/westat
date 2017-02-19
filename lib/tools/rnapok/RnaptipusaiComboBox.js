var RnaptipusaiComboBox = null;

ModuleManager.load(
['lib/widgets/ComboBoxField.js'],
function()
{

/**
 * Rendhagyó nap típusának a kiválasztására alkalmas legördülő lista osztálya.      
 */
RnaptipusaiComboBox = ComboBoxField.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    this.base(args);
    
    this.appendItem('ikn','Id\u0151szakon k\u00edv\u00fcli nap');
    this.appendItem('mszn','Munkasz\u00fcneti nap');
    this.appendItem('tnm','Tan\u00edt\u00e1s n\u00e9lk\u00fcli munkanap');
    this.appendItem('hn','Helyettes\u00edtett nap');
    this.appendItem('kon','K\u00f6telez\u0151 \u00f3rasz\u00e1m szerinti nap');
    this.appendItem('kono','K\u00f6telez\u0151 \u00f3rasz\u00e1m szerinti nap (adott oszt\u00e1llyal)');
    this.appendItem('aono','Adott \u00f3rasz\u00e1m szerinti nap (adott oszt\u00e1llyal)');
    this.appendItem('onaoao','\u00d3rarend szerinti nap adott \u00f3r\u00e1t\u00f3l adott \u00f3r\u00e1ig');
    this.appendItem('nor','Norm\u00e1l, \u00f3rarend szerinti nap');
  },
    
  // @override
  toString : function()
  {
    return 'RnaptipusaiComboBox';
  }
});

ModuleManager.ready('RnaptipusaiComboBox');

});