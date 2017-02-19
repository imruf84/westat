var FelhasznalokAllComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/felhasznalok/FelhasznalokForm.js'],
function()
{

/**
 * Felhasználók teljes listájának a kiválasztására alkalmas objektum osztálya.
 * NOTE: - az admin típust kivéve midnen felhasználót megjelenít       
 */
FelhasznalokAllComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = FelhasznalokGetDataListAllCBAction;
    o.FIELDS = FelhasznalokPrimaryField+',felhasznaloNev';
    o.url = FelhasznalokScript;
    
    o.valueField = FelhasznalokPrimaryField;
    o.textField = 'felhasznaloNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'FelhasznalokAllComboBox';
  }
});

ModuleManager.ready('FelhasznalokAllComboBox');

});