var OsztalyokComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/osztalyok/OsztalyokForm.js'],
function()
{

/**
 * Osztályok listájának a kiválasztására alkalmas objektum osztálya.      
 */
OsztalyokComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = OsztalyokGetDataListCBAction;
    o.FIELDS = OsztalyokPrimaryField+',osztalyNev';
    o.url = OsztalyokScript;
    
    o.valueField = OsztalyokPrimaryField;
    o.textField = 'osztalyNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'OsztalyokComboBox';
  }
});

ModuleManager.ready('OsztalyokComboBox');

});