var PasswordInputField = null;

ModuleManager.load(
['lib/widgets/InputField.js','lib/System.js'],
function()
{

/**
 * Jelszó megadására alkalmas mező osztálya.  
 */
PasswordInputField = InputField.extend(
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
    this.domelement.type = 'password';
    
    var field = this;
    
  },
  
  // @override
  toString : function()
  {
    return 'PasswordInputField';
  }
});

ModuleManager.ready('PasswordInputField');

});