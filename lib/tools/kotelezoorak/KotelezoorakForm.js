var KotelezoorakForm = null;
var KotelezoorakPrimaryField = 'felhasznaloID';
var KotelezoorakScript = 'lib/tools/kotelezoorak/kotelezoorak.php';
var KotelezoorakGetDataListAction = 'GET_KOTELEZOORA_LIST';
var KotelezoorakRemoveDataListAction = 'REMOVE_KOTELEZOORA_LIST';
var KotelezoorakGetDataAction = 'GET_KOTELEZOORA_DATA';
var KotelezoorakInsertDataAction = 'INSERT_KOTELEZOORA_DATA';
var KotelezoorakModifyDataAction = 'MODIFY_KOTELEZOORA_DATA';
ModuleManager.load(
['lib/widgets/Form.js','lib/System.js','lib/widgets/LabelField.js',
 'lib/widgets/InputField.js','lib/tools/orak/OrakForm.js',
 'lib/Ajax.js','lib/widgets/ComboBoxField.js','lib/HelpfulTools.js'],
function()
{
/**
 * Kötelező órák kezelésére szolgáló űrlap osztálya.      
 */
KotelezoorakForm = Form.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum 
   */
  constructor : function(args)
  {
    this.base(args);
    // Elsődleges kulcs megadása
    // NOTE: - ez a mező minden esetben részt vesz a lekérdezésekben
    this.primaryField = KotelezoorakPrimaryField;
    // Eszközhöz tartozó szerveroldali script neve
    this.script = KotelezoorakScript;
    // Konkrét adat lekérdezésének a parancsa
    this.getDataAction = KotelezoorakGetDataAction;
    // Adatok beszúrásának a parancsa
    this.insertDataAction = KotelezoorakInsertDataAction;
    // Adatok tárolásának a parancsa
    this.modifyDataAction = KotelezoorakModifyDataAction;
    // Ha üres űrlapot szeretnénk akkor kilépünk
    if ('empty' === this.type) return;
    // Mezők létrehozása
    var form = this;
    // Tájékoztató jellegű adatok
    // Felhasználó neve
    this.appendField(new LabelField(
    {
      id:'felhasznaloNev',
      unused:true,
      value:form.initalValues['felhasznaloNev'],
      pattern:System.patterns.anyWord,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Felhaszn\u00e1l\u00f3 neve:'}));
    // Felhasználó azonosítója
    this.appendField(new LabelField(
    {
      id:'felhasznaloID',
      value:form.initalValues['felhasznaloID'],
      pattern:System.patterns.posInt,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'Felhaszn\u00e1l\u00f3 azonos\u00edt\u00f3ja:'}),
    true);
    // Órarend azonosítója
    this.appendField(new LabelField(
    {
      id:'orarendID',
      value:form.initalValues['orarendID'],
      minLength:10,
      maxLength:10,
      size:10,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'\u00d3rarend azonos\u00edt\u00f3ja:'}));
    // Hét sorszáma
    // NOTE: - esztétikai okokból a szám helyett betűt írunk ki, amit küldés előtt
    //         visszaalakítunk
    this.hetBetui = new Array('A','B','C','D','E','F');
    var hetField = this.appendField(new LabelField(
    {
      id:'het',
      value:form.initalValues['het'],
      pattern:System.patterns.oneChar,
      onReady:function(field){field.update(true);}
    }),
    new Label({text:'H\u00e9t:'}));
    // Kötelező óraszámok
    // NOTE: - a felhasználó tényleges óraszámainak letöltése, majd megjelenítése
    //         a kötelező óraszámok letöltése és megjelenítése után hajtódik végre
    var napok = daysOfWeekArray();
    var fields = new Array();
    
    // Kötelező órák mezőinek a frissítési eseménye
    var changeFunc = function(pField,isValueValid)
    {
      // Kötelező órák összegének a meghatározása
      var osszeg = 0;
      for (var i = 0; i < 5; i++)
      {
        var field = form.getFieldById('ora'+i);
        if (null != field)
        {
          var value = parseInt(field.getValue());
          osszeg += (isNaN(value) ? 0 : value);
        }
      }
      var osszField = form.getFieldById('ossz');
      if (null != osszField)
      {
        osszField.setValue(osszeg.toString());
        // Ideinglenesen le kell tiltanunk a form mezőinek az értékeinek a frissítését
        form.enableUpdateFields(false);
        form.update(true);
        form.enableUpdateFields(true);
      }
      
      // Túlórák automatikus kijelölése (csak ha a mező értéke érvényes és a felhasználó nem óraadó)
      var value = (null != pField) ? pField.getValue() : null;
      if (false == form.oraado && !isNaN(value) && (true == isValueValid))
      {
        // Mező indexe (melyik napról van szó)
        var fieldIndex = pField.id.substring(new String('ora').length,pField.id.length);
        
        // ...egyébként kijelöljük a túlórákat
        // Ennyi túlórát kell kijelölnünk
        var tulorak = Math.min(2, Math.max(0, form.tenylegesOra[parseInt(fieldIndex)] - parseInt(value)));
        
        var field0 = form.getFieldById('tulora'+fieldIndex+'0');
        var field1 = form.getFieldById('tulora'+fieldIndex+'1');
        
        // Ha léteznek a mezők, akkor kijelöljük a túlórákat
        if ((null != field0) && (null != field1))
        {
          // Értékek törlése
          field0.setValue('');
          field1.setValue('');
          
          // Csak akkor haladunk tovább, ha meg van adva kötelező óra
          if ('' != value)
          {
            if (0 < tulorak)
              field0.setValue(field0.getValuesArray()[field0.getValuesArray().length-1]);
            if (1 < tulorak)
              field1.setValue(field1.getValuesArray()[field1.getValuesArray().length-2]);
          }
          
        }

      }
    }
    
    // A saját bejárási sorrend megváltoztatásához kell
    var myTabIndex = 1;
    // Kötelező órák mezőinek létrehozása
    for (var i = 0; i < napok.length; i++)
    {
      // Kötelező óra
      var nap = 'ora'+i;
      fields[i] = form.appendField(new InputField(
        {id:nap,
         value:'',
         pattern:System.patterns.posInt,
         minLength:0,
         maxLength:2,
         size:2,
         // A mező megváltozásakor összegezzük az óraszámokat
         onChange:function(field,isValueValid){changeFunc(field,isValueValid);}
         }),
         new Label({text:napok[i]+':'}));
      // Bejárási sorrend megváltoztatása
      fields[i].domelement.tabIndex = myTabIndex++;
      // Ideinglenesen letiltjuk, hogy az összes adat letöltése előtt ne lehessen módosítani semmit
      fields[i].domelement.disabled = true;
    }
    // Túlórák
    for (var i = 0; i < napok.length; i++)
    {
      fields[i].mainTable.style.width = 'auto';
      var row = fields[i].contentTable.rows[fields[i].contentTable.rows.length-1];
      // Létrehozunk egy kis szóközt tartalmazó címkét, hogy áttekinthetőbb legyen minden
      var cell = row.insertCell(row.cells.length);
      var l = new Label({text:'\u00a0\u00a0'});
      l.appendTo(cell);
      // NOTE: - legfeljebb naponta csak két túlóra lehet, ezért csak ennyi mezőt hozunk létre
      for (var j = 0; j < 2; j++)
      {
        var cell = row.insertCell(row.cells.length);
        // NOTE: - létrehozzuk a mezőt, de nem adjuk hozzá a form-hoz dom szinten
        var tuloraField = form.appendField(new ComboBoxField({id:'tulora'+i+''+j}),null,true);
        // NOTE: - itt adjuk hozzá a mezőt a form-hoz dom szinten
        tuloraField.appendTo(cell);
        // Az egységesség miatt fix szélességet állítunk be
        tuloraField.domelement.style.width = '50px';
        // Ideinglenesen letiltjuk, hogy az összes adat letöltése előtt ne lehessen módosítani semmit
        tuloraField.domelement.disabled = true;
        // Legördülő lista feltöltése elemekkel
        // NOTE: - ez azért kell, hogy bármilyen letöltött adatot meg lehessen adni
        //       - a szükségtelen adatok (amikor nem volt óra) az onGetDataAfterAction-ben lesz törölve
        tuloraField.appendItem('','-');
        for (var k = 0; k < 14; k++)
          tuloraField.appendItem(k,''+k);
        tuloraField.setValue('');
        // Bejárási sorrend megváltoztatása
        tuloraField.domelement.tabIndex = myTabIndex++;
      }
    }
    // Bejárási sorrend megváltoztatása
    // NOTE: - elsőként a kötelező órákat járjuk be, majd a kötelező órákat
    form.getFieldById('tulora41').domelement.onblur = function(){form.getFieldById('ora0').domelement.select();};
    // Összesítő mező hozzáadása
    fields[fields.length]=this.appendField(new LabelField(
    {
      id:'ossz',
      unused:true,
      value:'0',
      size:2
    }),
    new Label({text:'\u00d6sszesen:'}));
    // Ha nem történt meg a felhasználó óráinak a lekérdezése, akkor megtesszük
    // NOTE: - modify típusnál automatikusan megtörténik a letöltés, a többi típusnál nem
    if (('insert' === this.type) || ('show' === this.type))
      this.onGetDataAfterAction(this);
  },
  // @override
  // NOTE: - felhasználó óraszámainak a megjelenítése
  onGetDataAfterAction : function(form,response)
  {
    // Napi óraszámok lekérdezésének az elindítása
    var param = new Object();
    param.ACTION = OrakGetFelhasznaloHetOraiAction;
    param.url = OrakScript;
    param.FIELDS = 'orarendID,felhasznaloID,het';
    param['felhasznaloID'] = form.initalValues['felhasznaloID'];
    param['orarendID'] = form.initalValues['orarendID'];
    param['het'] = this.hetBetui.indexOf(form.initalValues['het']);
    param.onError = function(response){alert(response.ERROR_MSG);};
    param.onSuccess = function(response)
    {
      // Az óraadókra más szabályok vonatkoznak, ezért tároljuk ezt is
      // NOTE: - óraadók esetén minden óra túlóra
      form.oraado = (1 == response.RESPONSE['oraado'] ? true : false);
      // A szakoktatókra más szabályok vonatkoznak, ezért tároljuk ezt is
      form.szakoktato = (1 == response.RESPONSE['szakoktato'] ? true : false);
      // Óraszámok összege (kötelező,tanórán kívüli)
      var ossz = new Array(0,0);
      form.tenylegesOra = new Array();
      for (var i = 0; i < 5; i++)
      {
        // Adott nap órarendi óraszámának a megjelenítése
        var oraszamk = response.RESPONSE['nap'+i+'k'];
        var oraszam = response.RESPONSE['nap'+i];
        ossz[0] += parseInt(oraszamk);
        ossz[1] += parseInt(oraszam);
        var field = form.getFieldById('ora'+i);
        // Kötelező óra mező engedélyezése
        field.domelement.disabled = false;
        // A plusz dolgok amiatt kellenek, hogy label használata esetén
        // a feliratok ne új sorba kerüljenek
        field.mainTable.style.width = 'auto';
        var row = field.contentTable.rows[field.contentTable.rows.length-1];
        var cell = row.insertCell(row.cells.length);
        var l = new Label({text:'\u00a0('+oraszamk+'+'+oraszam+')'});
        l.appendTo(cell);
        // Későbbi felhasználás céljából tárolunk egy példányt az objektumban is
        form.tenylegesOra[i] = oraszamk;
        // Órák sorszámainak a feldolgozása
        // NOTE: - a túlórák kijelölése miatt kell
        var orak = response.RESPONSE['nap'+i+'k_orak'];
        for (var j = 0; j < 2; j++)
        {
          var tuloraField = form.getFieldById('tulora'+i+''+j);
          // Felesleges elemek törlése
          var values = tuloraField.getValuesArray();
          // NOTE: - azért 1-től kezdjük a ciklust, hogy az első elem (üres karakter) 
          //         ne vegyen részt a vizsgálatban, így ne törlődjön
          for (var k = 1; k < values.length; k++)
            if (!orak.has(values[k]))
              tuloraField.removeItemByValue(values[k]);
          // Óraadó esetén nincs szükség a túlóra kijelölésre alkalmas legördülő menükre,
          // ezért a péntek kötelező óra beviteli mezője után újra a hétfő következik
          if (true == form.oraado)
          {
            form.getFieldById('ora4').domelement.onblur = function(){form.getFieldById('ora0').domelement.select();};
            tuloraField.setValue('');
          }
          // Túlóra mező engedélyezése
          // NOTE: - óraadók esetében nincs szükség rájuk, ezért felesleges engedélyezni
          if (false == form.oraado)
            tuloraField.domelement.disabled = false;
        }
      }
      // Összesítés hozzáadása
      var field = form.getFieldById('ossz');
      // A plusz dolgok amiatt kellenek, hogy label használata esetén
      // a feliratok ne új sorba kerüljenek
      field.mainTable.style.width = 'auto';
      var row = field.contentTable.rows[field.contentTable.rows.length-1];
      var cell = row.insertCell(row.cells.length);
      var l = new Label({text:'\u00a0\u00a0('+
                         ossz[0]+'+'+ossz[1]+')='+(ossz[0]+ossz[1])});
                         
      // További felhasználás céljából (pl. kötelező órák automatikus kijelölése) eltároljuk az eredményeket
      form.sumOraK = ossz[0];
                         
      l.appendTo(cell);
      // Előző órarendek kötelező óráinak a lekérdezése
      // Ez majd a cím colSpan-jához kell
      var hetColumns = 0;
      var orarendIsFirst = true;
      // Az órák tárolásához kell
      form.tenylegesOra2 = new Array();
      for (var orarend in response.RESPONSE['orarendek'])
      {
        // Órarend heteinek a száma
        var hetek = response.RESPONSE['hetek_'+orarend];
        // Órarend azonosítójának a cellája
        row = form.contentTable.rows[2];
        cell = row.insertCell(row.cells.length);
        l = new Label({text:orarend});
        l.appendTo(cell);
        cell.style.borderLeft = '1px solid black';
        if (orarend != form.initalValues['orarendID'])
          cell.colSpan = hetek;
        else
          cell.colSpan = hetek-1;
        // Órarend hetei
        var hetekBetui = new Array('A','B','C','D','E');
        var hetIsFirst = true;
        for (var i = 0; i < hetek; i++)
        {
          // Ha az adott órarend adott heténél járunk, akkor tovább lépünk
          if (orarend == form.initalValues['orarendID'] && 
              i == form.hetBetui.indexOf(form.initalValues['het']))
              continue;
          row = form.contentTable.rows[3];
          cell = row.insertCell(row.cells.length);
          l = new Label({text:hetekBetui[i]});
          l.appendTo(cell);
          cell.style.borderLeft = '1px solid black';
          // Órák
          var sumOraK = 0;
          var sumOra = 0;
          var sumKotOra = 0;
          for (var j = 0; j < 5; j++)
          {
            var lOraK = response.RESPONSE['ora'+i.toString()+'_'+j.toString()+'k_'+orarend];
            var lOra = response.RESPONSE['ora'+i.toString()+'_'+j.toString()+'_'+orarend];
            var key = 'kotora'+i.toString()+'_'+j.toString()+'_'+orarend;
            var lKotOra = (null == response.RESPONSE[key]) ? '-' : response.RESPONSE[key];
            var str = lKotOra.toString()+' ('+lOraK.toString()+'+'+lOra.toString()+')';
            row = form.contentTable.rows[4+j];
            cell = row.insertCell(row.cells.length);
            l = new Label({text:str});
            l.appendTo(cell);
            cell.style.borderLeft = '1px solid black';
            // Hozzáadás az összeghez
            sumOraK += (isNaN(parseInt(lOraK)) ? 0 : parseInt(lOraK)); 
            sumOra += (isNaN(parseInt(lOra)) ? 0 : parseInt(lOra));
            sumKotOra += (isNaN(parseInt(lKotOra)) ? 0 : parseInt(lKotOra));
            
            // Ha a jelenlegi órarendnél járunk, akkor későbbi felhasználás céljából eltároljuk az adatokat
            if (true == orarendIsFirst)
              form.tenylegesOra2[j] = lOraK;
          } // j
          // Összeg
          var str = sumKotOra.toString()+' ('+sumOraK.toString()+'+'+sumOra.toString()+')';
          
          row = form.contentTable.rows[9];
          cell = row.insertCell(row.cells.length);
          l = new Label({text:str});
          l.appendTo(cell); 
          cell.style.borderLeft = '1px solid black';
          hetColumns++;
          hetIsFirst = false;
        } // i
        orarendIsFirst = false;
      }
      // Cím
      row = form.contentTable.rows[1];
      cell = row.insertCell(row.cells.length);
      l = new Label({text:'K\u00f6telez\u0151 \u00f3r\u00e1k visszamen\u0151leg'});
      l.appendTo(cell);
      cell.colSpan = hetColumns;
      cell.style.borderLeft = '1px solid black';
      form.update(true);
      
      // Ha még nincs megadva kötelező óra, akkor automatikusan felajánljuk az órákat
      if ('insert' === form.type)
      {
        // Jelen hét óráinak a számának a tárolása (csak a kötelező órák)
        var orakObject = new Array();
        orakObject[0] = new Object();
        orakObject[1] = new Object();
        
        orakObject[0].orak = new Array();
        orakObject[1].orak = new Array();
        for (var i = 0; i < 5; i++)
        {
          orakObject[0].orak[i] = new Object();
          orakObject[0].orak[i].index = i;
          orakObject[0].orak[i].ora = parseInt(form.tenylegesOra[i]);
          orakObject[0].orak[i].tulora = 0;
          orakObject[1].orak[i] = new Object();
          orakObject[1].orak[i].index = i;
          orakObject[1].orak[i].ora = parseInt(form.tenylegesOra2[i]);
          orakObject[1].orak[i].tulora = 0;
        }
        
        
        // Óraadó esetén a nullás napok üresek, egyébként nullások
        if (true == form.oraado)
        {
          for (var i = 0; i < 5; i++)
            if (0 < orakObject[0].orak[i].ora) 
              form.getFieldById('ora'+i).setValue('0');
        }
        // Egyébként a normál eljárást folytatjuk
        else
        {
          // Óraszámok összegei
          orakObject[0].orakSum = 0;
          orakObject[1].orakSum = 0;
          for (var i = 0; i < 5; i++)
          {
            orakObject[0].orakSum += orakObject[0].orak[i].ora;
            orakObject[1].orakSum += orakObject[1].orak[i].ora;
          }
          var orakFullSum = orakObject[0].orakSum+orakObject[1].orakSum;
          
          // Meghatározzuk, hogy milyen típusú a felhasználó, azaz mennyi a heti kötelező óraszáma
          // NOTE: - alapból igazgatóból indulunk ki
          //       - két heti kötelező órát jelent
          var oraKot = 4;
          // A nulla órás napok uresek legyenek
          // NOTE: - ig és igh esetén az üres napokat kinullázzuk, egyébként nem
          //       - alapesetben nem hagyjuk üresen
          var emptyNullDay = false;
          
          // Igazgató
          if ((4 <= orakFullSum) && (8 > orakFullSum))
          {
            oraKot = 4;
            emptyNullDay = false;
          }
          else
          // Igazgatóhelyettes
          if ((8 <= orakFullSum) && (30 > orakFullSum))
          {
            oraKot = 8;
            emptyNullDay = false;
          }
          else
          // Szakoktató
          if (true == form.szakoktato)
          {
            oraKot = 50;
            emptyNullDay = true;
          }
          else
          // Sima tanár
          {
            oraKot = 44;
            emptyNullDay = true;
          }
          
          // Adatok későbbi tesztelése céljából eltároljuk a heti maximálisan kijelölhető kötelező órák számát
          form.oraKot = oraKot;
          
          // Csak akkor jelöljük ki a túlórákat, ha van ténylegesen túlóra
          // NOTE: - az asszimetrikus heteket is figyelembe kell venni
          if (orakFullSum > oraKot)
          {
            // Ennyi túlórát kell kijelölni
            var tulorak = Math.max(0, Math.min(10, orakObject[0].orakSum - (oraKot/2)));
            
            // Innen indul a kijelölés
            var orakMax = Math.max(orakObject[0].orak[0].ora,orakObject[0].orak[1].ora,
                                   orakObject[0].orak[2].ora,orakObject[0].orak[3].ora,
                                   orakObject[0].orak[4].ora);
            // Itt kezdődik a kijelölés
            var limit = orakMax - 1;
            
            // Addig fut a ciklus, amíg minden túlórát ki nem jelöltünk, vagy el nem értük a nulla limitet
            while ((0 < tulorak) && (0 < limit))
            {
              // Napok rendezése
              // NOTE: - túlóra szerint növekvő, óraszám szerint csökkenő
              orakObject[0].orak.sort(function(a,b)
                {return (0 == a.tulora - b.tulora) ? (b.ora - a.ora) : (a.tulora - b.tulora);});
                
              // Végig haladunk a napokon
              for (var i = 0; i < 5; i++)
              {
                // Ha olyan naphoz értünk, ami még nem tartalmaz két túlórát, és a limit felett van az óraszáma,
                // akkor kijelöljük számára a túlórát
                if ((orakObject[0].orak[i].ora >= limit) && (2 > orakObject[0].orak[i].tulora))
                {
                  orakObject[0].orak[i].tulora++;
                  tulorak--;
                  
                  // Ha elfogytak a túlórák, akkor kilépünk
                  if (0 >= tulorak) break;
                }
                
              }
              
              // Csökkentjük a limitet
              limit--;
            }
            // TESZT
            /*var s = '';
            for (var i = 0; i < 5; i++)
            {
              var index = orakObject[0].orak[i].index;
              s += index + '(' + orakObject[0].orak[i].ora + ' ' + orakObject[0].orak[i].tulora + ') ';
            }*/
            //alert(s);
            
            //alert(orakMax+' '+orakObject[0].orakSum+' '+orakObject[0].orakMax);
          }
          
          // Óraszámok beírása
          for (var i = 0; i < 5; i++)
          {
            var index = orakObject[0].orak[i].index;
            form.getFieldById('ora'+index).setValue((orakObject[0].orak[i].ora-orakObject[0].orak[i].tulora).toString());
          }
           
        
          //alert(oraKot+' '+emptyNullDay);
          //alert(orakSum[0]+'+'+orakSum[1]+'='+orakFullSum);
        }
        
      }
      
      // Az adatok letöltése után, a hétfői órát tartalmazó beviteli mezőre visszük 
      // a fókuszt, majd kijelöljük a tartalmát
      var field = form.getFieldById('ora0');
      field.domelement.select();
    };
    Ajax.post(param);
  },
  // @override
  // NOTE: - mivel itt nincs kitüntetett elsődleges kulcs, ezért küldenünk kell 
  //         minden mezőértéket a szervernek
  getDataFromDbCreateParam : function(id)
  {
    var param = this.base(id);
    // Mezők értékeinek tárolása
    for (var i = 0; i < param.FIELDS.length; i++)
    {
      var field = this.getFieldById(param.FIELDS[i]);
      if (null !== field)
        param[param.FIELDS[i]] = field.getValue();
    }
    return param;
  },
  /**
   * Adatok helyességének az ellenörzése.
   * NOTE: - adott nap csak a túlórák számának megfelelő számú órát lehet kijelölni
   *       - egy órát csak egyszer lehet túlórának kijelölni
   *       
   * @return {boolean} igaz ha az adatok helyesek, egyébként hamis               
   */     
  validateData : function()
  {
    // Ideinglenesen nem végzünk teszteket!
    return true;
  
    // Napok tömbje a hibaüzenetek miatt
    var napok = daysOfWeekArray();
    // Óraadók tesztje
    if (true == this.oraado)
    {
      for (var i = 0; i < 5; i++)
      {
        var kotelezoOra = this.getFieldById('ora'+i).getValue();
        var iKotelezoOra = parseInt(('' == kotelezoOra) ? 0 : kotelezoOra);
        if (0 != iKotelezoOra)
        {
          alert(napok[i]+': a k\u00f6telez\u0151 \u00f3r\u00e1k sz\u00e1ma nulla vagy \u00fcres lehet!');
          return false;
        }
      }
      return true;
    }
    
    // Nem óraadók tesztje
    
    // Maximálisan kijelölhető órák tesztelése
    if (parseInt(this.getFieldById('ora0').getValue())+
        parseInt(this.getFieldById('ora1').getValue())+
        parseInt(this.getFieldById('ora2').getValue())+
        parseInt(this.getFieldById('ora3').getValue())+
        parseInt(this.getFieldById('ora4').getValue()) > (this.oraKot / 2))
    {
      alert('A kijel\u00f6lt t\u00fal\u00f3r\u00e1k sz\u00e1ma nem haladhatja meg a heti ' + 
        (this.oraKot / 2) + ' \u00f3r\u00e1t!');
        
      return false;
    }
    
    for (var i = 0; i < 5; i++)
    {
      var kotelezoOra = this.getFieldById('ora'+i).getValue();
      var tenylegesOra = parseInt(this.tenylegesOra[i]);
      var tulora0 = this.getFieldById('tulora'+i+'0').getValue();
      var tulora1 = this.getFieldById('tulora'+i+'1').getValue();
      // A kötelező óra lehet üres karakter is, ami szerepet játszik a vizsgálatokban is,
      // ezért eltároljuk a számértékét is
      var iKotelezoOra = parseInt(('' == kotelezoOra) ? 0 : kotelezoOra);
      // Túlórák száma
      var tulorak = Math.max(0, tenylegesOra - iKotelezoOra);
      // A kötelező órák száma nem haladhatja meg a tényleges órák számát
      // NOTE: - ez ki lett véve, hogy pl. a 19 órás embereknek is ki lehessen jelölni a 22 óra kötelezőt
      /*if (iKotelezoOra > tenylegesOra)
      {
        alert(napok[i]+': a k\u00f6telez\u0151 \u00f3r\u00e1k sz\u00e1ma nem haladhatja meg a t\u00e9nyleges \u00f3r\u00e1k sz\u00e1m\u00e1t!');
        return false;
      }*/
      
      // A napi túlóra nem haladhatja meg a kettőt
      if (2 < tulorak)
      {
        alert(napok[i]+': a napi t\u00fal\u00f3r\u00e1k sz\u00e1ma nem haladhatja meg a kett\u0151t!');
        return false;
      }
      // Ha nincs túlóránk, akkor nem jelölhetünk ki túlórákat
      if ((0 == tulorak) && (('' != tulora0) || ('' != tulora1)))
      {
        alert(napok[i]+': erre a napra nem jel\u00f6lhet\u0151 ki t\u00fal\u00f3ra!');
        return false;
      }
      // Egy túlóra esetén csak egy óra jelölhető ki
      if ((1 == tulorak) && ((('' == tulora0) && ('' == tulora1)) || (('' != tulora0) && ('' != tulora1))))
      {
        alert(napok[i]+': erre a napra kiz\u00e1r\u00f3lag egy t\u00fal\u00f3ra jel\u00f6lhet\u0151 ki!');
        return false;
      }
      // Két túlóra esetén két (nem ugyanaz) órát kell kijelölni
      if (2 == tulorak)
      {
        if (('' == tulora0) || ('' == tulora1))
        {
          alert(napok[i]+': erre a napra kiz\u00e1r\u00f3lag k\u00e9t t\u00fal\u00f3ra jel\u00f6lhet\u0151 ki!');
          return false;
        }
        if (tulora0 == tulora1)
        {
          alert(napok[i]+': nem jel\u00f6lhet\u0151 ki ugyanazon \u00f3ra k\u00e9tszer t\u00fal\u00f3r\u00e1nak!');
          return false;
        }
      }
    }
    return true;
  },
  // @override
  insertDataToDb : function()
  {
    if (false === this.validateData()) return;
    return this.base();
  },
  // @override
  modifyDataInDb : function()
  {
    if (false === this.validateData()) return;
    this.base();
  },
  // @override
  toString : function()
  {
    return 'KotelezoorakForm';
  }
});
ModuleManager.ready('KotelezoorakForm');
});