var IdoszakokComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/idoszakok/IdoszakokForm.js'],
function()
{

/**
 * Időszakok listájának a kiválasztására alkalmas objektum osztálya.      
 */
IdoszakokComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = IdoszakokGetDataListCBAction;
    o.FIELDS = IdoszakokPrimaryField+',idoszakNev';
    o.url = IdoszakokScript;
    
    o.valueField = IdoszakokPrimaryField;
    o.textField = 'idoszakNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'IdoszakokComboBox';
  }
});

ModuleManager.ready('IdoszakokComboBox');

});