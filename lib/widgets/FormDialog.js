var FormDialog = null;

ModuleManager.load(
['lib/widgets/Dialog.js','lib/widgets/Form.js','lib/widgets/Button.js',
 'lib/widgets/LoadingDialog.js'],
function()
{

/**
 * Űrlapot tartalmazó dialógus ablakot megvalósító osztály.
 * NOTE: - a tartalom hozzáadása után az űrlap típusától függően automatikusan
 *         létrehozz a gombokat, valamint beállítja az eseményeket   
 */ 
FormDialog = Dialog.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property type {string} az űrlap típusa ('insert'|'modify'|'remove'|['show'])
   *   NOTE: - a 'load' típus csak néhány eszköz esetében használatos
   *   #property button1Text {string?undefined} ha meg van adva, akkor az első gomt ezt
   *     a szöveget veszi majd fel értékként      
   *   #property onSuccess {function(dialog:FormDialog)} sikeres művelet utáni esemény
   *   #property onError {function(dialog:FormDialog)} hiba utáni esemény             
   */
  constructor : function(args)
  {
    // Típus tárolása
    this.type = 'show';
    if ('undefined' !== typeof(args) && 'string' === typeof(args.type))
    {
      switch (args.type)
      {
        case 'insert':
        case 'modify':
        case 'remove':
          this.type = args.type;
        break;
      }
    }
    
    this.button1Text = args.button1Text;
        
    this.base(args);
    
    this.onSuccess = (this.argsExist && 'function' === typeof(args.onSuccess)) ? 
      args.onSuccess : function(){};
    this.onError = (this.argsExist && 'function' === typeof(args.onError)) ? 
      args.onError : function(){};
  },
  
  // @override
  setContent : function(content,update)
  {
    if (!(content instanceof Form)) return;
    
    // A form elemeinek betöltése közben megjelenítjük a töltőképernyőt
    var loadingDialog = new LoadingDialog();
    
    this.base(content,update);
    
    // Gombok létrehozása, események beállítása
    
    // Régi gombok törlése
    this.removeAllButtons();
    
    // Új gombok létrehozása
    var dialog = this;
    var getData = true;
    
    this.onReady = function(widget)
    {
      if (getData && dialog.dialogContent)
        content.getDataFromDb(content.id);
        
      loadingDialog.destroy();
    }
    
    var closeFunc = function(widget){dialog.destroy();}
    
    // Események módosítása
    content.onChange2 = content.onChange;
    content.onChange = function(form,field,valid)
    {
      // Űrlap eredeti eseményének a lefuttatása
      content.onChange2(form,field,valid);  
      // Gombok állapotának beállítása
      dialog.setButtonsState();
    };
    
    content.onModifySuccess2 = content.onModifySuccess;
    content.onModifySuccess = function(form,response)
    {
      content.onModifySuccess2(form,response);
      dialog.onSuccess(dialog);
      closeFunc();
    };
    content.onModifyError2 = content.onModifyError;
    content.onModifyError = function(form,response)
    {
      alert(response.ERROR_MSG);
      content.onModifyError2(form,response);
      dialog.onError(dialog);
    };
    
    content.onInsertSuccess2 = content.onInsertSuccess;
    content.onInsertSuccess = function(form,response,newID)
    {
      content.onInsertSuccess2(form,response,newID);
      dialog.onSuccess(dialog);
      closeFunc();
    };
    content.onInsertError2 = content.onInsertError;
    content.onInsertError = function(form,response)
    {
      alert(response.ERROR_MSG);
      content.onInsertError2(form,response);
      dialog.onError(dialog);
    };
        
    switch (this.type)
    {
      case 'modify':
        this.appendButton(this.modifyBtn = new Button({text:('string'===typeof(this.button1Text))?this.button1Text:'Ment\u00e9s',
          onClick:function(widget){content.modifyDataInDb();}}));
      break;
      case 'insert':
        this.appendButton(this.insertBtn = new Button({text:('string'===typeof(this.button1Text))?this.button1Text:'L\u00e9trehoz',
          onClick:function(widget){content.insertDataToDb();}}));
        getData = false;
      break;
    }
      
    this.appendButton(this.cancelBtn = new Button({text:('show' === this.type) ? 'Ok' : 'M\u00e9gsem',
      onClick:closeFunc}));
    
    this.setButtonsState();
    
    // Készenléti esemény lefuttatása
    this.callOnReady();
  },
  
  /**
   * Gombok állapotának beállítása a tartalom alapján.
   */     
  setButtonsState : function()
  {
    var form = this.getContent();
    var valid = (form instanceof Form) ? form.isValid() : false;
    
    if (this.modifyBtn instanceof Button)
      this.modifyBtn.setState(valid);
    if (this.insertBtn instanceof Button)
      this.insertBtn.setState(valid);
    if (this.cancelBtn instanceof Button)
      this.cancelBtn.setState(true);
  },
  
  // @override
  removeContent : function()
  {
    // Tartalom eredeti eseményének visszaállítása
    if (this.dialogContent instanceof Form)
    {
      this.dialogContent.onChange = this.dialogContent.onChange2;
      this.dialogContent.onModifySuccess = this.dialogContent.onModifySuccess2;
      this.dialogContent.onModifyError = this.dialogContent.onModifyError2;
      this.dialogContent.onInsertSuccess = this.dialogContent.onInsertSuccess2;
      this.dialogContent.onInsertError = this.dialogContent.onInsertError2;
    }
      
    this.base();
  },
  
  // @override
  updateFunction : function()
  {
    this.setButtonsState();
    this.base();
  },
    
  // @override
  toString : function()
  {
    return 'FormDialog';
  }
});

ModuleManager.ready('FormDialog');

});