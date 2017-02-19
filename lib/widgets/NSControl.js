var NSControl = null;

ModuleManager.load(
['lib/widgets/Control.js','lib/HelpfulTools.js'],
function()
{

/**
 * Felhasználói felület vezérlő elemeinek alaposztálya.
 * NOTE: - a vezérlő nem reagál a vonszolásra, így szöveges tartalma nem kijelölhető
 *       - az elnevezés a Non Selectable Control-ból származik  
 */ 
NSControl = Control.extend(
{
  /**
   * Konstruktor.
   * 
   * @override   
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum      
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Szöveg kijelölésének a letiltása
    disableSelection(this.dom);
  },
  
  // @override
  toString : function()
  {
    return 'NSControl';
  }
});

ModuleManager.ready('NSControl');

});