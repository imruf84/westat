var HianyzasokaiComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/hianyzasokai/HianyzasokaiForm.js'],
function()
{

/**
 * Hiányzás okainak a listájának a kiválasztására alkalmas objektum osztálya.      
 */
HianyzasokaiComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = HianyzasokaiGetDataListCBAction;
    o.FIELDS = HianyzasokaiPrimaryField+',hianyzasokaNev';
    o.url = HianyzasokaiScript;
    
    o.valueField = HianyzasokaiPrimaryField;
    o.textField = 'hianyzasokaNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'HianyzasokaiComboBox';
  }
});

ModuleManager.ready('HianyzasokaiComboBox');

});