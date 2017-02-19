var LoginComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/login/LoginConstants.js'],
function()
{

/**
 * Felhasználók listájának a kiválasztására alkalmas objektum osztálya.      
 */
LoginComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = LoginGetDataListAction;
    o.url = LoginScript;
    
    o.valueField = 'felhasznaloID';
    o.textField = 'felhasznaloNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'LoginComboBox';
  }
});

ModuleManager.ready('LoginComboBox');

});