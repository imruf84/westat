var Ajax = null;

ModuleManager.load(
['lib/AjaxRequest.js','lib/json2.js','lib/widgets/LoadingDialog.js'],
function()
{

/**
 * AjaxRequest modul kiegészítése saját funkciókkal. 
 */
Ajax = 
{
  /**
   * Ajax post kérés küldése.
   * 
   * @param args (lásd. AjaxRequest)
   *   #property loading {boolean?undefined} ha igaz akkor megjelenik a 
   *     töltőképernyő ([false])        
   */     
  post : function(args)
  {
    // Ha adtunk meg onSuccess eseményet, akkor lementjük...
    var argsExist = ('undefined' !== typeof(args));
    var onSuccess = (argsExist && 'function' === typeof(args.onSuccess)) ? 
                      args.onSuccess : function(){}; 
    var onError = (argsExist && 'function' === typeof(args.onError)) ? 
                    args.onError : function(){};
                    
    // Töltőképernyő létrehozása
    var loading = (argsExist && 'boolean' === typeof(args.loading) && 
                   args.loading) ? 
                    new LoadingDialog() : null;
                    
    var closeDialog = function(){if (null !== loading) loading.destroy();};
                    
    //...majd beiktatjuk a sajátunkat
    var param = args;
    param.onSuccess = function(request)
    {
      var response = null;
      try
      {
        response = JSON.parse(request.responseText);
      }
      catch(err)
      {
        onError({ERROR_MSG:'A szerver v\u00e1lasz\u00e1nak a '+ 
                           'feldolgoz\u00e1sa sikertelen!['+request.responseText+']'});
        closeDialog();
        return;
      }
      
      if (('NO_ERROR' !== response.RESPONSE_TYPE))
      {                           
        onError(response);
        
        // Ha nem kell lefuttatni a sikerres végrehajtás eseményét akkor kilépünk
        if ('NO' === response.RUN_ON_SUCCESS)
        {
          closeDialog();
          return;
        }
      }
      
      onSuccess(response);
      
      closeDialog();
    };
    param.onError = function(request)
    {
      onError({ERROR_MSG:'Sikertelen kapcsol\u00f3d\u00e1s a szerverhez!['+
                         request.statusText+','+request.responseText+']'});
        
      closeDialog();
    };
                    
    AjaxRequest.post(param);
  }
    
};

ModuleManager.ready('Ajax');

});