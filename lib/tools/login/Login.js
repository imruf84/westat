var Login = null;

ModuleManager.load(
['lib/BaseClass.js','lib/widgets/Label.js','lib/widgets/Button.js',
 'lib/tools/login/LoginComboBox.js','lib/tools/login/LoginConstants.js',
 'lib/services/idokeret/Idokeret.js','lib/widgets/PasswordInputField.js',
 'lib/BrowserDetect.js'
],
function()
{

/**
 * Bejelentkező ablakot megvalósító objektumok osztálya.
 */
Login = BaseClass.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum 
   */
  constructor : function(args)
  {
    this.base(args);
    
    // Oszlopok száma
    var colSpan = 2;
    
    var login = this;
    
    // Alap tároló létrehozása
    this.mainTable = document.createElement('table');
    this.mainTable.style.width =
    this.mainTable.style.height = '100%';
    document.body.appendChild(this.mainTable);
    
    var row = this.mainTable.insertRow(this.mainTable.rows.length);
    var cell = row.insertCell(row.cells.length);
    cell.align = 'center';
    
    if (('Chrome' === BrowserDetect.browser) || ('Safari' === BrowserDetect.browser))
      cell.vAlign = 'bottom';
    
    
    
    // Előzmények felirat létrehozása
    var row2 = this.mainTable.insertRow(this.mainTable.rows.length);
    var cell2 = row2.insertCell(row2.cells.length);
    cell2.colSpan = colSpan;
    cell2.appendChild(document.createElement('br'));
    
    // Előzmények szövegdoboz létrehozása
    row2 = this.mainTable.insertRow(this.mainTable.rows.length);
    cell2 = row2.insertCell(row2.cells.length);
    cell2.colSpan = colSpan;
    cell2.style.height = '40%';
    cell2.align = 'center';
    
    var elozmenyekTextArea = document.createElement('textarea');
    elozmenyekTextArea.readOnly = true;
    
    elozmenyekTextArea.value += 'Bet\u00f6lt\u00e9s...\n';
      
    elozmenyekTextArea.style.width = '40%';
    elozmenyekTextArea.style.resize = 'none';
    elozmenyekTextArea.style.height = '100%';
    disableSelection(elozmenyekTextArea);
    
    cell2.appendChild(elozmenyekTextArea);
    
    // Előzmények letöltése
    var getHistoryText = function()
    {
      var param = new Object();
      param.ACTION = LoginModifyDataAction;
      param.url = LoginScript;
      param.onSuccess = function(response)
      {
        elozmenyekTextArea.value = response.RESPONSE.HISTORY;
      };
      param.onError = function(response)
      {
        elozmenyekTextArea.value = response.ERROR_MSG;
      };
      
      Ajax.post(param);
    };
    
    
    
    // Tároló táblázat létrehozása
    var table = document.createElement('table');
    
    cell.appendChild(table);
    
    // Főcím létrehozása
    row = table.insertRow(table.rows.length);
    cell = row.insertCell(row.cells.length);
    cell.colSpan = colSpan;
    var felhLabel = new Label({text:'westat'});
    felhLabel.font.style.fontWeight = 'bold';
    felhLabel.font.style.fontSize = 30;
    felhLabel.appendTo(cell);
    
    // Felhasználólista létrehozása
    row = table.insertRow(table.rows.length);
    cell = row.insertCell(row.cells.length);
    var felhLabel = new Label({text:'Felhaszn\u00e1l\u00f3:'});
    felhLabel.setContentHAlign('right');
    felhLabel.appendTo(cell);
    
    cell = row.insertCell(row.cells.length);
    var felhCB = new LoginComboBox(
    {
      index:'first',
      onReady:function()
      {
        // Jelszó mező létrehozása
        var row = table.insertRow(table.rows.length);
        var cell = row.insertCell(row.cells.length);
        var jelszoLabel = new Label({text:'Jelsz\u00f3:'});
        jelszoLabel.setContentHAlign('right');
        jelszoLabel.appendTo(cell);
        
        cell = row.insertCell(row.cells.length);
        var jelszoInput = new PasswordInputField({size:25,minLength:0,maxLength:20});
        jelszoInput.setContentHAlign('left');
        jelszoInput.appendTo(cell);
        
        // Belépés gomb létrehozása
        row = table.insertRow(table.rows.length);
        cell = row.insertCell(row.cells.length);
        cell.colSpan = colSpan;
        cell.appendChild(document.createElement('hr'));
        var bejelBtn = new Button(
        {
          text:'Bel\u00e9p\u00e9s',
          onClick:function(widget)
          {
            // Adatok ellenörzése
            var param = new Object();
            param.ACTION = LoginGetDataAction;
            param.url = LoginScript;
            param.felhasznaloID = felhCB.getValue();
            param.jelszo = jelszoInput.getValue();
            param.loading = true;
            // Sikeres bejelentkezés esetén elindítjuk a megfelelő szolgáltatást
            param.onSuccess = function(response)
            {
              // Szerver válaszának tárolása
              var r = response.RESPONSE[0];
              var actions = response.RESPONSE.ACTIONS;
              
              // Ablak régi címének tárolása
              var oldTitle = document.title;
              // Ablak új címének a beállítása
              document.title = 'westat - '+r.felhasznaloNev+' ('+r.tipus+')';
              
              // Bejelentkező képernyő törlése
              login.destroy();
            
              // Szolgáltatás létrehozása
              new Idokeret(
              {
                menuBarWidth:260,
                actions:actions,
                // A szolgáltatásból való kilépés után újra létrehozzuk a bejelentkező
                // képernyőt
                onExit:function(service)
                {
                  service.destroy();
                  document.title = oldTitle;
                  new Login();
                }
                
              });
              
            };
            param.onError = function(response)
            {
              alert(response.ERROR_MSG);
              jelszoInput.setValue('');
            };
      
            Ajax.post(param);
            
          }
        });
        bejelBtn.appendTo(cell);
        
        // Előzmények szövegének a betöltése
        getHistoryText();
        
      }
    });
    felhCB.setContentHAlign('left');
    felhCB.appendTo(cell);
    
  },
  
  // @override
  destroy : function()
  {
    this.mainTable.parentNode.removeChild(this.mainTable);
    
    this.base();
  },
  
  // @override
  toString : function()
  {
    return 'Login';
  }     
});

ModuleManager.ready('Login');

});
