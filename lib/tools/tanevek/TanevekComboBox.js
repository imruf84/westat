var TanevekComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/tanevek/TanevekForm.js'],
function()
{

/**
 * Tanévek listájának a kiválasztására alkalmas objektum osztálya.      
 */
TanevekComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = TanevekGetDataListCBAction;
    o.FIELDS = TanevekPrimaryField+',tanevNev';
    o.url = TanevekScript;
    
    o.valueField = TanevekPrimaryField;
    o.textField = 'tanevNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'TanevekComboBox';
  }
});

ModuleManager.ready('TanevekComboBox');

});