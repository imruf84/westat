var Form = null;

ModuleManager.load(
['lib/widgets/Control.js','lib/widgets/Field.js','lib/HelpfulTools.js',
 'lib/widgets/Label.js','lib/Ajax.js'],
function()
{

/**
 * Adatok kezelésére szolgáló vezérlők csoportba foglálására szolgáló űrlap
 * osztálya. 
 * NOTE: - általában az adatbázis egy rekordját érhetjük el vele      
 */
Form = Control.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property type {string} a form típusa (['modify'],'insert','show','empty')
   *   NOTE: - nincs jelentősebb hatással az űrlapra      
   *   #property onChange {function(form:Form,field:Field,isValid:boolean)} form 
   *      egy elemének a változásának eseménye
   *   #property onModifySuccess {function(form:Form,response:Object)} sikeres mentés eseménye   
   *   #property onModifyError {function(form:Form,response:Object)} sikertelen mentés eseménye   
   *   #property onInsertSuccess {function(form:Form,response:Object,newID:number)} sikeres létrehozás eseménye   
   *   #property onInsertError {function(form:Form,response:Object)} sikertelen létrehozás eseménye      
   *   #property id {string} ha adatok lekérdezésére kerül a sor, akkor ez tartalmazza
   *      a lekérdezéshez szükséges adatot
   *   #property initalValues {Object?null} a mezők kezdőértékei              
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Típus tárolása
    this.type = 'modify';
    if (this.argsExist && 'string' === typeof(args.type))
      switch (args.type)
      {
        case 'insert':
        case 'show':
        case 'empty':
          this.type = args.type;
      }
    
    // Mezők közti távolság beállítása
    this.contentTable.cellPadding = 5;
    
    // Adatok frissítését tárolja
    // NOTE: - azon mezők azonosítói kerülnek bele, amelyek értékei már frissítve lettek
    //       - Ajax letöltés szinkronizálása miatt kell, illetve hogy az időközben
    //         már módosított mezők nem íródjenek felül a régi adattal
    this.updatedFields = new Array();
    // Adatok frissítésének engedélyezése/tiltása
    this.updateFieldsEnabled = true;
    
    // Események tárolása
    this.onChange = (this.argsExist && 'function' === typeof(args.onChange)) ?
      args.onChange : function(){};
    this.onModifySuccess = (this.argsExist && 'function' === typeof(args.onModifySuccess)) ?
      args.onModifySuccess : function(){};
    this.onModifyError = (this.argsExist && 'function' === typeof(args.onModifyError)) ?
      args.onModifyError : function(){};
    this.onInsertSuccess = (this.argsExist && 'function' === typeof(args.onInsertSuccess)) ?
      args.onInsertSuccess : function(){};
    this.onInsertError = (this.argsExist && 'function' === typeof(args.onInsertError)) ?
      args.onInsertError : function(){};

    // Az utolsó lekérdezés adatai
    this.data = null;
        
    // Kezdőértékek tárolása
    this.initalValues = (this.argsExist && args.initalValues instanceof Object) ?
      args.initalValues : new Object();
      
    // Ez tárolja az adott rekord elsődleges kulcsának értékét (azonosító)
    this.id = (this.argsExist && 'string' === typeof(args.id)) ? args.id : null;
      
    // Adatbázissal való kapcsolat esetén az elsődleges kulcs azonosítója
    this.primaryField = '';
    // Az eszközt kiszolgáló szerver oldali script neve
    this.script = '';
    // Egy konkrét rekord adatainak a lekérdezési parancsa
    this.getDataAction = '';
    // Adatok beszúrásának a parancsa
    this.insertDataAction = '';
    // Adatok tárolásának a parancsa
    this.modifyDataAction = '';
      
    // Ebben tároljuk majd a mezőket
    this.fields = new Array();
    
    // Árnyék a form alá
    this.dom.style.box_shadow = '10px 10px 5px #888888';
  },
  
  /**
   * Mező hozzáadása a form-hoz.   
   * 
   * @param field {Field} a hozzáadandó mező
   * @param label {Label?undefined} a mezőhöz tartozó címke    
   * @param hidden {boolean?undefined} ha hamis akkor a mező nem jelenik meg   
   * @return {Field?null} a hozzáadott mező, vagy hiba esetén null         
   */     
  appendField : function(field,label,hidden)
  {
    if (!(field instanceof Field)) return null;
    // Ha nincs megadva azonosító, akkor kilépünk
    if ('' === field.id) return null;
    // Ha létezik már ilyen oszlopazonosító, akkor kilépünk
    if (null !== this.getFieldById(field.id)) return null;
    
    this.fields[this.fields.length] = field;
    
    // Szülő tárolása
    field.parentObject = this;
    
    // Csak akkor adjuk hozzá dom szinten ha kell
    if (('undefined' === typeof(hidden)) || (false === hidden))
    {
      var row = this.contentTable.insertRow(this.contentTable.rows.length);
      
      // Címke hozzáadása szinten
      var cell = row.insertCell(row.cells.length);
      if (label instanceof Label)
      {
        label.appendTo(cell);
        label.setContentHAlign('right');
      }
    
      // Mező hozzáadása dom szinten
      cell = row.insertCell(row.cells.length); 
      field.appendTo(cell);
      field.setContentHAlign('left');
    }
    
    // Események megváltoztatása
    var form = this;
    field.onChange2 = field.onChange;
    field.onChange = function(field2,valid2)
    {
      // Mező eredeti eseményének a futtatása
      field2.onChange2(field2,valid2);
      // Űrlap onChange eseményének a futtatása
      form.onChange(form,field2,form.isValid());
    };
    
    
    return field;
  },
  
  /**
   * Mező eltávolítása.
   * 
   * @param field {Field} az eltávolítandó mező
   * @return {Field?null} az eltávolított mező, vagy hiba esetén null         
   */     
  removeField : function(field)
  {
    // Ha nem tartalmazza akkor kilépünk
    if (!this.fieldIsContent(field)) return null;
    
    var index = this.getFieldIndex(field);
    
    // Mező eltávolítása
    this.fields.splice(index,1);
    
    // Eltávolítás dom szinten
    if (null !== field.getParentDom())
      // HACK: ha gáz lenne, akkor index+1 helyett index kell csak
      this.contentTable.deleteRow(index+1);
    
    // Szülő eltávolítása
    field.parentObject = null;
    
    // Események visszaállítása
    field.onChange = field.onChange2;
  },
  
  /**
   * Mező indexének a lekérdezése.
   * 
   * @param field {Field} a lekérdezendő mező
   * @return {number} a mező indexe, vagy hiba esetén -1         
   */
  getFieldIndex : function(field)
  {
    for (var i = 0; i < this.fields.length; i++)
      if (this.fields[i] === field)
        return i;
        
    return -1;
  },     
  
  /**
   * Megmondja egy mezőről, hogy tartalmazza-e az űrlap?
   */
  fieldIsContent : function(field)
  {
    return !(0 > this.getFieldIndex(field));
  },     
  
  /**
   * Űrlap mezőinek helyességének a lekérdezése.
   * 
   * @return {boolean} igaz ha minden mező jól van kitöltve, egyébként hamis      
   */     
  isValid : function()
  {
    var valid = true;
    for (var i = 0; i < this.fields.length; i++)
      valid = valid && this.fields[i].isValid();
      
    return valid;
  },
  
  /**
   * Mező sorszámának lekérdezése azonosító alapján.
   * 
   * @return {number} a mező indexe, vagy hiba esetén -1      
   */     
  getFieldIndexById : function(id)
  {
    if ('string' !== typeof(id)) return -1;
    
    for (var i = 0; i < this.fields.length; i++)
    {
      var field = this.fields[i];
      if (field.id === id) return i;
    }
    
    return -1;
  },
  
  /**
   * Mező megkeresése azonosító alapján.
   * 
   * @param id {string} a keresendő mező azonosítója
   * @return {Field?null} a keresett mező, vagy hiba esetén null         
   */     
  getFieldById : function(id)
  { 
    var index = this.getFieldIndexById(id);
    return (0 > index) ? null : this.fields[index];
  },
  
  /**
   * Mezők azonosítóinak tömbbe rendezése.
   * 
   * @param addPrimaryKey {boolean} ha hamis akkor az elsődleges kulcs nem lesz 
   *   eleme a listának       
   * @return {Array():string} a mezők azonosítóinak tömbje          
   */     
  getFieldsId : function(addPrimaryKey)
  { 
    var fieldsID = new Array();
    // Csak akkor használjuk fel, ha engedélyezve van
    for (var i = 0; i < this.fields.length; i++)
      if (!this.fields[i].unused)
        fieldsID[fieldsID.length] = this.fields[i].id;
    // Az azonosító mindenképpen szerepel benne
    if ('boolean' === typeof(addPrimaryKey) && false !== addPrimaryKey && '' !== this.primaryField)
      fieldsID[fieldsID.length] = this.primaryField;
    // Ismétlődő elemek eltávolítása
    fieldsID = removeDuplicates(fieldsID);
    
    return fieldsID;
  },
  
  /**
   * Form adatainak letöltése utáni esemény.
   * NOTE: - bizonyos plusz információk megjelenítése más osztályokban
   * 
   * @param form {Form} az eseményt kiváltó űrlap
   * @param response {Object} az űrlap adatletöltés válasza            
   */     
  onGetDataAfterAction : function(form,response)
  {
  },
  
  /**
   * Adatok lekérdezéséhez szükséges paraméterlista létrehozása.
   * 
   * @param id {string} a lekérdezendő adat elsődleges kulcsának értéke   
   * @return {Object} a paramétereket tartalmazó objektum      
   */     
  getDataFromDbCreateParam : function(id)
  {
    var form = this;
    var param = new Object();
    
    param.FIELDS = form.getFieldsId(true);    
    param.ACTION = form.getDataAction;
    param[this.primaryField] = id;
    param.url = form.script;
    param.loading = true;
    param.onSuccess = function(response)
    {
      form.setData(response.RESPONSE[0]);
      form.onGetDataAfterAction(form,response);
    };
    param.onError = function(response){alert(response.ERROR_MSG);};
    
    return param;
  },
  
  /**
   * Adatok lekérdezése az adatbázisból.
   * 
   * @param id {string} a lekérdezendő adat elsődleges kulcsának értéke  
   */     
  getDataFromDb : function(id)
  {
    if ('string' !== typeof(id)) return;
    
    var param = this.getDataFromDbCreateParam(id);
    Ajax.post(param);
  },
  
  /**
   * Adatok mentése az adatbázisba.
   * NOTE: - az adatokat az űrlap mezőinek értéke szolgáltatja       
   * 
   * @return {string} az új csoport azonosítója        
   */
  insertDataToDb : function()
  { 
    var form = this;
                                        
    var param = new Object();
    param.ACTION = this.insertDataAction;
    param.FIELDS = this.getFieldsId(false);
    param.url = this.script;
    param.loading = true;
    param.onSuccess = function(response){form.onInsertSuccess(form,response,response.RESPONSE[form.primaryField]);};
    param.onError = function(response){form.onInsertError(form,response);};
    
    // Mezők értékeinek tárolása
    for (var i = 0; i < param.FIELDS.length; i++)
    {
      var field = this.getFieldById(param.FIELDS[i]);
      if (null !== field)
        param[param.FIELDS[i]] = field.getValue();
    }
  
    Ajax.post(param);
  },
  
  /**
   * Adatok módosítása az adatbázisban.
   * NOTE: - az adatokat az űrlap mezőinek értékei adják
   */
  modifyDataInDb : function()
  {
    var form = this;
                                        
    var param = new Object();
    param.ACTION = this.modifyDataAction;
    param.FIELDS = this.getFieldsId(false);
    param[this.primaryField] = this.id;
    param.url = this.script;
    param.loading = true;
    param.onSuccess = function(response){form.onModifySuccess(form,response);};
    param.onError = function(response){form.onModifyError(form,response);};
    
    // Mezők értékeinek tárolása
    for (var i = 0; i < param.FIELDS.length; i++)
    {
      var field = this.getFieldById(param.FIELDS[i]);
      if (null !== field)
        param[param.FIELDS[i]] = field.getValue();
    }
  
    Ajax.post(param);
  },
  
  /**
   * Űrlap adatainak a megadása.
   * 
   * @param data {Object} az űrlap adatai      
   */     
  setData : function(data)
  {
    if ('undefined' === typeof(data)) return;
    
    // Töröljük a frissített mezők listáját
    this.updatedFields.splice(0,this.updatedFields.length);
    
    // Eltároljuk az adatokat
    this.data = data;
    
    // Frissítjük az űrlap mezőinek adatait.
    this.updateFields();
  },
          
  /**
   * Űrlap kitöltése adatokkal.
   * NOTE: - a mezők adatai az azonosítóiknak megfelelő tulajdonság lesz   
   * 
   * @param data {Object} az adat      
   */
  updateFields : function()
  {
    if (null === this.data) return;
    
    for (var i = 0; i < this.fields.length; i++)
    {
      var field = this.fields[i];
      var value = this.data[field.id];
      
      // Ellenőrizzük, hogy a mezőt kell-e frissítenünk?
      var updated = false;
      for (var j = 0; j < this.updatedFields.length; j++)
        if (this.updatedFields[i] === field.id)
        {
          updated = true;
          break;
        }
      
      if ('undefined' !== typeof(value) && !updated && field.ready)
      {
        field.setValue(value);
        // Megjelöljük az adatot, hogy már felhasználtuk
        this.updatedFields[this.updatedFields.length] = field.id;
      }
    }
    
    // Az azonosítót külön tároljuk
    // NOTE: - az azonosító ugyanis nem jelenik meg adatként a felhasználó
    //         számára, így nincs ilyen azonosítójú mező
    var id = this.data[this.primaryField];
    this.id = ('undefined' !== typeof(id)) ? id : null;
  },    
  
  // @override
  activate : function()
  {
    for (var i = 0; i < this.fields.length; i++)
      this.fields[i].activate();
  },
  
  /**
   * Űrlap kitöltésének engedélyezése/tiltása.
   * 
   * @param enabled {Boolean} ha igaz, akkor engedélyezzük, egyébként nem      
   */     
  enableUpdateFields : function(enabled)
  {
    this.updateFieldsEnabled = enabled;
  },
  
  // @override
  updateFunction : function()
  {
    // Ha engedélyezve van a mezők frissítése, akkor frissítjük
    if (true == this.updateFieldsEnabled)
      this.updateFields();
      
    this.base();
  },
  
  // @override     
  inactivate : function()
  {
    for (var i = 0; i < this.fields.length; i++)
      this.fields[i].inactivate();
  }, 
  
  // @override
  isReady : function()
  {
    var b = true;
    for (var i = 0; i < this.fields.length; i++)
      b = b && this.fields[i].isReady();
      
    return b;
  },
      
  // @override
  toString : function()
  {
    return 'Form';
  }
});

ModuleManager.ready('Form');

});