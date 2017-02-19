var Button = null;

ModuleManager.load(
['lib/widgets/Label.js','lib/System.js'],
function()
{

/**
 * Gombot megvalósító objektum osztálya.
 */
Button = Label.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum      
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Események létrehozása
    this.content.onclick = this.dom.onclick;
    this.dom.onclick = function(){};
    
    // Gomb állapotának a beállítása
    // NOTE: - azért kell így elbonyolítani, hogy működjön
    var state = !this.state;
    this.state = state;
    this.setState(!state);
  },
  
  // @override
  activate : function()
  {
    this.font.style.color = System.colors.buttonActive;
    this.font.style.textDecoration = 'none';
    
    var button = this;
    this.content.onmouseover = function(){button.font.style.textDecoration = 'underline';};
    this.content.onmouseout = function(){button.font.style.textDecoration = 'none';};
    
    // Kurzor beállítása
    this.content.style.cursor = 'pointer';
  },
  
  // @override     
  inactivate : function()
  {
    this.font.style.color = System.colors.buttonInactive;
    this.font.style.textDecoration = 'none';
    
    var button = this;
    this.content.onmouseover = function(){};
    this.content.onmouseout = function(){};
    
    // Kurzor beállítása
    this.content.style.cursor = 'default';
  },
  
  // @override
  toString : function()
  {
    return 'Button';
  }
});

ModuleManager.ready('Button');

});