var SzakfeladattipusaiComboBox = null;

ModuleManager.load(
['lib/widgets/ComboBoxField.js'],
function()
{

/**
 * Szakfeladat típusának a kiválasztására alkalmas legördülő lista osztálya (óraadó esetén).      
 */
SzakfeladattipusaiComboBox = ComboBoxField.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  { 
    this.base(args);
    
    this.appendItem(0,'Szakfeladat n\u00e9lk\u00fcl');
    this.appendItem(1,'Feln\u0151ttk\u00e9pz\u00e9s');
    this.appendItem(2,'Szakk\u00f6z\u00e9piskola');
    this.appendItem(3,'Szakiskola');
    this.appendItem(4,'Szakk\u00e9pz\u00e9s');
    this.appendItem(5,'Koll\u00e9gium');
  },
    
  // @override
  toString : function()
  {
    return 'SzakfeladattipusaiComboBox';
  }
});

ModuleManager.ready('SzakfeladattipusaiComboBox');

});