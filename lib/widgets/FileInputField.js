var FileInputField = null;

ModuleManager.load(
['lib/widgets/InputField.js','lib/System.js'],
function()
{

/**
 * Fájl kiválasztására alkalmas mező osztálya.  
 */
FileInputField = InputField.extend(
{ 
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  {
    this.base(args);
  },
  
  // @override
  createDomElement : function()
  {
    this.base();
    
    // Mező típusának átállítása fájlra
    this.domelement.type = 'file';
  },
  
  // @override
  toString : function()
  {
    return 'FileInputField';
  }
});

ModuleManager.ready('FileInputField');

});