var SzakmaCsoportokComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/szakmacsoportok/SzakmaCsoportokForm.js'],
function()
{

/**
 * Szakmacsoportok listájának a kiválasztására alkalmas objektum osztálya.      
 */
SzakmaCsoportokComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = SzakmaCsoportokGetDataListCBAction;
    o.FIELDS = SzakmaCsoportokPrimaryField+',szakmaCsoportNev';
    o.url = SzakmaCsoportokScript;
    
    o.valueField = SzakmaCsoportokPrimaryField;
    o.textField = 'szakmaCsoportNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'SzakmaCsoportokComboBox';
  }
});

ModuleManager.ready('SzakmaCsoportokComboBox');

});