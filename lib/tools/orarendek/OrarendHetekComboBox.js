var OrarendHetekComboBox = null;

ModuleManager.load(
['lib/widgets/DbComboBox.js','lib/tools/orarendek/OrarendekForm.js'],
function()
{

/**
 * Órarend heteinek a listájának a kiválasztására alkalmas objektum osztálya.
 * NOTE: - segítségével lekérdezhetjük, hogy az adott órarendek változatait
 */
OrarendHetekComboBox = DbComboBox.extend(
{ 
  // @override
  createAjaxParam : function()
  {    
    var o = new Object();
    
    o.ACTION = OrarendekGetHetekAction;
    o.FIELDS = OrarendekPrimaryField;
    o.url = OrarendekScript;
    
    o.valueField = 'het';
    o.textField = 'het';
      
    return o;
  },
    
  // @override
  toString : function()
  {
    return 'OrarendHetekComboBox';
  }
});

ModuleManager.ready('OrarendHetekComboBox');

});