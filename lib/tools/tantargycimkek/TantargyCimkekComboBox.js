var TantargyCimkekComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/tantargycimkek/TantargyCimkekForm.js'],
function()
{

/**
 * Tantárgycímkék listájának a kiválasztására alkalmas objektum osztálya.      
 */
TantargyCimkekComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = TantargyCimkekGetDataListCBAction;
    o.FIELDS = TantargyCimkekPrimaryField+',tantargyCimkeNev';
    o.url = TantargyCimkekScript;
    
    o.valueField = TantargyCimkekPrimaryField;
    o.textField = 'tantargyCimkeNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'TantargyCimkekComboBox';
  }
});

ModuleManager.ready('TantargyCimkekComboBox');

});