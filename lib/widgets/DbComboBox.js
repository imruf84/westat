var DbComboBox = null;

ModuleManager.load(
['lib/widgets/ComboBoxField.js','lib/Ajax.js'],
function()
{

/**
 * Adatbázisból való lekérdezés eredményének megjelenítésére alkalmas objektum osztálya.      
 */
DbComboBox = ComboBoxField.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property onSuccess {function(field:DbComboBox)} a sikeres letöltés utáni esemény  
   *   #property index {string} a letöltés utáni elem indexe, ha nem kap értéket (['first'],'last')    
   *   #property filters {Object} szűrők mezőinek nevei és értékei    
   *   #property loading {boolean?undefined} ha igaz akkor megjelenik a töltőképernyő ([false])     
   */
  constructor : function(args)
  { 
    this.base(args);
    
    // Betöltés utáni esemény
    var onSuccess = (this.argsExist && 'function' === typeof(args.onSuccess)) ? 
      args.onSuccess : function(field){};
      
    var index = (this.argsExist && 'string' === typeof(args.index)) ? args.index : 'value';
    
    var filters = (this.argsExist && args.filters instanceof Object) ? 
      args.filters : null;
    
    this.doAjax(onSuccess,index,filters,args.loading);
    
  },
  
  /**
   * Ajax kérés elindítása.
   * 
   * @param onSuccess {function(field:DbComboBox)?null} a sikeres letöltés utáni esemény  
   * @param index {string?null} a letöltés utáni elem indexe, ha nem kap értéket ('first','last',['value'])    
   * @param filters {Object} szűrők mezőinek nevei és értékei
   * @param loading {boolean?undefined} ha igaz akkor megjelenik a töltőképernyő ([false])          
   */     
  doAjax : function(onSuccess,index,filters,loading)
  {
    // A letöltés alatt nem használható a mező
    this.domelement.disabled = true;
    
    // Betöltés utáni esemény
    var lOnSuccess = ('function' === typeof(onSuccess)) ? 
      onSuccess : function(field){};
    
    // A lista kezdőindexe
    // NOTE: - az adatok letöltése után tárolja majd az érték indexét    
    var startIndex = -1;
    
    // Elindítjuk a lista letöltését
    var field = this;
    
    // Paraméter elkészítése
    param = this.createAjaxParam();
    
    // Sikeres művelet utáni esemény hozzáadása
    param.onSuccess = function(response)
    { 
      for (var i = 0; i < response.RESPONSE.length; i++)
      {
        var value = response.RESPONSE[i][param.valueField];
        var text = response.RESPONSE[i][param.textField];
        field.appendItem(value,text);
                    
        // Ha rátalálunk a lista elemére, akkor eltároljuk az indexét
        if (('undefined' !== typeof(value)) && 
            (field.value == value) && ('value' === index))
          startIndex = i;
      }

      // Ha nincs megadva kezdőérték akkor kiválasztjuk a megfelelő elemet
      if (-1 !== startIndex)        
        field.domelement.selectedIndex = startIndex;
      else
      {
        var l = -1;
        switch (index)
        {
          case 'first':
            l = 0;
          break;
          case 'last':
            l = field.domelement.options.length-1;
          break;
        }
        
        field.domelement.selectedIndex = l;
        if ((0 < field.domelement.options.length) && !(0 > l))
          field.value = field.domelement.options[l].value;
      }
      
      // Ha nincs egyetlen elem sem, akkor adunk kezdőértéket
      if (!(0 < field.domelement.options.length)) {
        field.value = '__null__';
      }
        
      field.domelement.disabled = false;
      
      // A mező készen áll a használatra
      field.ready = true;
      // Készenlét utáni esemény futtatása
      field.callOnReady();
                
      // Betöltés utáni esemény lefuttatása
      lOnSuccess(field);
    };
    
    // Hibakezelő függvény hozzáadása
    param.onError = function(response){alert(response.ERROR_MSG);};
    
    // Szűrők hozzáadása
    // NOTE: - azért kell két fázisban ellenőrizni az adatok helyességét, mert
    //         bizonyos esetekben nincsenek megadva szűrők
    if (filters instanceof Object)
    { 
      var idFilters = new Array();
        
      for (filter in filters)
      {
        var value = filters[filter];
        
        // Ha nem megfelelő az érték akkor tovább haladunk
        if ('undefined' === typeof(value)) continue;
        
        idFilters[idFilters.length] = filter;   
      }
      
      // Ha vannak használható szűrők akkor hozzáadjuk a paraméterlistához
      if (0 < idFilters.length)
      {
        param.FILTERS = new Array();
        
        for (var i = 0; i < idFilters.length; i++)
        {
          var id = idFilters[i];
          param.FILTERS[i] = id;
          param[id] = filters[id];
        }
      }
      
    }
    
    // Lista elemeinek törlése
    // HACK: ez az értéket is nullázná, ami miatt sok űrlapnál beszúráskor nem 
    //       jelenne meg a kívánt érték. Ezért egyedi értéket adunk, ami hatására 
    //       egy lekérdezés sem térne vissza éredménnyel
    var idvalue = this.value;
    this.removeAllItems();
    this.value = idvalue;
    //this.value = '"__null__"';
    
    // A letöltés végéig a mező nem áll készen a használatra
    this.ready = false;
        
    param.loading = loading;
    Ajax.post(param);
  },
  
  /**
   * Ajax kérés bemenő paraméterének a létrehozása.
   * 
   * @return {Object} az ajax kérés paraméterobjektuma      
   */     
  createAjaxParam : function()
  {    
    return new Object();
  },
    
  // @override
  toString : function()
  {
    return 'DbComboBox';
  }
});

ModuleManager.ready('DbComboBox');

});