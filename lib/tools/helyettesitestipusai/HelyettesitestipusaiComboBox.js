var HelyettesitestipusaiComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/helyettesitestipusai/HelyettesitestipusaiForm.js'],
function()
{

/**
 * Helyettesítés típusainak a listájának a kiválasztására alkalmas objektum osztálya.      
 */
HelyettesitestipusaiComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = HelyettesitestipusaiGetDataListCBAction;
    o.FIELDS = HelyettesitestipusaiPrimaryField+',helyettesitestipusaNev';
    o.url = HelyettesitestipusaiScript;
    
    o.valueField = HelyettesitestipusaiPrimaryField;
    o.textField = 'helyettesitestipusaNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'HelyettesitestipusaiComboBox';
  }
});

ModuleManager.ready('HelyettesitestipusaiComboBox');

});