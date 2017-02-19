var LoadingDialog = null;

ModuleManager.load(
['lib/widgets/Dialog.js','lib/widgets/NSControl.js'],
function()
{

/**
 * Töltőképernyőt megvalósító osztály.
 */ 
LoadingDialog = Dialog.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Objektumok háttérszínének kikapcsolása
    this.dom.style.backgroundColor = '';
    this.dialogTitleRow.style.backgroundColor = '';
    this.dialogFooterCell.style.borderTop = '0px';
    
    // Elemek létrehozása
    anim = new Image();
    //anim.style.zIndex='0';
    var control = new NSControl();
    this.setContent(control,false);
    control.content.appendChild(anim);
    
    // Betöltési metódus létrehozása
    var dialog = this;
    anim.onload = function()
    {
      anim.onload = null;
      dialog.update();
    };
    
    // Animáció betöltése
    anim.src = 'lib/pic/loadingAnimBig.gif';
  },
    
  // @override
  toString : function()
  {
    return 'LoadingDialog';
  }
});

ModuleManager.ready('LoadingDialog');

});