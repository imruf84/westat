var OsztalyCimkekComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/osztalycimkek/OsztalyCimkekForm.js'],
function()
{

/**
 * Osztályok listájának a kiválasztására alkalmas objektum osztálya.      
 */
OsztalyCimkekComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = OsztalyCimkekGetDataListCBAction;
    o.FIELDS = OsztalyCimkekPrimaryField+',osztalyCimkeNev';
    o.url = OsztalyCimkekScript;
    
    o.valueField = OsztalyCimkekPrimaryField;
    o.textField = 'osztalyCimkeNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'OsztalyCimkekComboBox';
  }
});

ModuleManager.ready('OsztalyCimkekComboBox');

});