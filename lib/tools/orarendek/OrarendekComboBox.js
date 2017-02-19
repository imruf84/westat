var OrarendekComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/orarendek/OrarendekForm.js'],
function()
{

/**
 * Órarendek listájának a kiválasztására alkalmas objektum osztálya.      
 */
OrarendekComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = OrarendekGetDataListDbAction;
    o.FIELDS = OrarendekPrimaryField;
    o.url = OrarendekScript;
    
    o.valueField = OrarendekPrimaryField;
    o.textField = OrarendekPrimaryField;
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'OrarendekComboBox';
  }
});

ModuleManager.ready('OrarendekComboBox');

});