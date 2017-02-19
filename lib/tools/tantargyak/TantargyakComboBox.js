var TantargyakComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/tantargyak/TantargyakForm.js'],
function()
{

/**
 * Tantárgyak listájának a kiválasztására alkalmas objektum osztálya.      
 */
TantargyakComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = TantargyakGetDataListCBAction;
    o.FIELDS = TantargyakPrimaryField+',tantargyNev';
    o.url = TantargyakScript;
    
    o.valueField = TantargyakPrimaryField;
    o.textField = 'tantargyNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'TantargyakComboBox';
  }
});

ModuleManager.ready('TantargyakComboBox');

});