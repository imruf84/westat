var DateField = null;


// Dátum objektum
var Calendar = null;
// Legutoljára használt beviteli mező
var LastDateField = null;
// Dátum tárolója
var CalendarDiv = null;
// Dátum kiválasztásának az eseménye
// NOTE: - csak egy dátumválasztó objektumot kezel a rendszer
function setCalendarValues(y,m,d) 
{
  if (null !== LastDateField)
    LastDateField.setValue(y+'-'+LZ(m)+'-'+LZ(d));
    
  LastDateField = null;
}


ModuleManager.load(
['lib/widgets/InputField.js','lib/System.js','lib/CalendarPopup.js'],
function()
{


// Dátumválasztó létrehozása
var Calendar = new CalendarPopup();
Calendar.setMonthNames('Janu\u00e1r','Febru\u00e1r','M\u00e1rcius','\u00c1prilis',
                       'M\u00e1jus','J\u00fanius','J\u00falius','Augusztus',
                       'Szeptember','Okt\u00f3ber','November','December');
Calendar.setDayHeaders('V','H','K','Sze','Cs','P','Szo');
Calendar.setWeekStartDay(1);
Calendar.setTodayText('Mai nap');
Calendar.setReturnFunction('setCalendarValues');
Calendar.showNavigationDropdowns();

/**
 * Dátum megjelenítésére, módosítására szolgáló beviteli mező osztálya.
 */
DateField = InputField.extend(
{ 
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   */
  constructor : function(args)
  {
    this.base(args);
    
    this.pattern = System.patterns.date;
  },
  
  /**
   * Dátum objektum előálllítása a tartalomból.
   */      
  toDateObject : function()
  {
    return new Date(parseInt(this.value.substr(0,4),10),
                    parseInt(this.value.substr(5,2),10)-1,
                    parseInt(this.value.substr(8,2),10));
  },
  
  // @override
  validateValue : function(value)
  {
    // Ha nem megfelelő a formátum akkor kilépünk
    if (!this.base(value)) return false;
    
    // Dátum érvényességének a vizsgálata
    var ev = parseInt(value.substr(0,4),10);
    var honap = parseInt(value.substr(5,2),10)-1;
    var nap = parseInt(value.substr(8,2),10);
    var date = new Date(ev,honap,nap);
        
    return ((nap == date.getDate()) && 
            (honap == date.getMonth()) && 
            (ev == date.getFullYear()));
  },
  
  // @override
  createDomElement : function()
  {
    // Beviteli mező létrehozása
    this.base();
    
    // Létrehozzuk a szükséges tárolót
    var table = document.createElement('table');
    table.style.width =
    table.style.height = '100%'; 
    table.cellPadding =
    table.cellSpacing = 0;
    table.border = 0;
    
    var row = table.insertRow(0);
    row.style.width =
    row.style.height = '100%';
    
    var cell = row.insertCell(0);
    cell.style.width =
    cell.style.height = '100%';
    cell.align = 'center';
    cell.vAlign = 'center';
    
    this.calInput = this.domelement;
    cell.appendChild(this.calInput);
    
    // A beviteli mező után létrehozzuk a naptár gombot
    var cell = row.insertCell(1);
    cell.style.width =
    cell.style.height = '100%';
    cell.align = 'center';
    cell.vAlign = 'center';
    
    var button = new Image();
    button.id = 'calAnchor1';
    button.name = 'calAnchor1';
    button.src = 'lib/cal.gif';
    button.style.cursor = 'pointer';
    
    var field = this;
    button.onclick = function()
    {
      LastDateField = field;
      
      var time = getDateFromFormat(field.getValue(),'yyyy-MM-dd');
      if (0 == time)
        Calendar.currentDate=new Date();
      else
        Calendar.currentDate=new Date(time);
      
      Calendar.showCalendar('calAnchor1');
      
      return false;
    };
    
    cell.appendChild(button);
    
    this.domelement = table;
    
    // Események beállítása az új domelement-re
    this.calInput.onchange = 
    this.calInput.onblur = 
    this.calInput.onkeyup = function(){field.setValue(field.calInput.value);};
    // Méretek beállítása
    this.calInput.maxLength = 10;
    this.calInput.size = 10;
  },
  
  // @override
  setValueDom : function(value)
  {
    if (this.calInput.value !== value)
      this.calInput.value = value;
  },
  
  // @override
  toString : function()
  {
    return 'DateField';
  }
});

ModuleManager.ready('DateField');

});