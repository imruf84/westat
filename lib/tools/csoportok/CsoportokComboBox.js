var CsoportokComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/csoportok/CsoportokForm.js'],
function()
{

/**
 * Csoportok listájának a kiválasztására alkalmas objektum osztálya.      
 */
CsoportokComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = CsoportokGetDataListCBAction;
    o.FIELDS = CsoportokPrimaryField+',csoportNev';
    o.url = CsoportokScript;
    
    o.valueField = CsoportokPrimaryField;
    o.textField = 'csoportNev';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'CsoportokComboBox';
  }
});

ModuleManager.ready('CsoportokComboBox');

});