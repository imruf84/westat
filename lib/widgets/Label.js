var Label = null;

ModuleManager.load(
['lib/widgets/NSControl.js'],
function()
{

/**
 * Egysoros szöveg megjelenítésére alkalmas címke osztálya.
 */ 
Label = NSControl.extend(
{
  /**
   * Konstruktor.
   * 
   * @override   
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property text {string} a címke felirata         
   */
  constructor : function(args)
  {
    this.base(args);
    
    this.dom.style.cursor = 'default';
    
    // Elemek létrehozása
    this.text = (this.argsExist && 'string' === typeof(args.text)) ? args.text : '';
    this.font = document.createElement('font');
    this.content.appendChild(this.font);
    this.textNode = document.createTextNode(this.text);
    this.font.appendChild(this.textNode);
  },
  
  /**
   * Címke szövegének a megadása.
   * 
   * @param text {String} a címke szövege      
   */     
  setText : function(text)
  {
    if ('string' !== typeof(text)) return;
    
    this.textNode.nodeValue = this.text = text;
  },
  
  /**
   * Címke szövegének a lekérdezése.
   * 
   * @return {string} a címke szövege      
   */     
  getText : function()
  {
    return this.text;
  },
  
  // @override
  toString : function()
  {
    return 'Label';
  }
});

ModuleManager.ready('Label');

});