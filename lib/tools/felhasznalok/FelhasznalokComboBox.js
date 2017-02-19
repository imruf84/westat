var FelhasznalokComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/felhasznalok/FelhasznalokForm.js'],
function()
{

/**
 * Felhasználók listájának a kiválasztására alkalmas objektum osztálya.   
 * NOTE: - csak a felhasználó által látható felhasználókat jeleníti meg    
 */
FelhasznalokComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = FelhasznalokGetDataListCBAction;
    o.FIELDS = FelhasznalokPrimaryField+',felhasznaloNev';
    o.url = FelhasznalokScript;
    
    o.valueField = FelhasznalokPrimaryField;
    o.textField = 'felhasznaloNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'FelhasznalokComboBox';
  }
});

ModuleManager.ready('FelhasznalokComboBox');

});