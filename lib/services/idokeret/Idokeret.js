var Idokeret = null;

ModuleManager.load(
['lib/services/Service.js',
 'lib/tools/csoportok/Csoportok.js',
 'lib/tools/felhasznalok/Felhasznalok.js',
 'lib/tools/tantargycimkek/TantargyCimkek.js',
 'lib/tools/tantargyakcimkei/TantargyakCimkei.js',
 'lib/tools/tantargyak/Tantargyak.js',
 'lib/tools/osztalycimkek/OsztalyCimkek.js',
 'lib/tools/osztalyokcimkei/OsztalyokCimkei.js',
 'lib/tools/osztalyok/Osztalyok.js',
 'lib/tools/osztalycsoportok/OsztalyCsoportok.js',
 'lib/tools/szakmacsoportok/SzakmaCsoportok.js',
 'lib/tools/orarendek/Orarendek.js',
 'lib/tools/tanevek/Tanevek.js',
 'lib/tools/idoszakok/Idoszakok.js',
 'lib/tools/hianyzasokai/Hianyzasokai.js',
 'lib/tools/hianyzasok/Hianyzasok.js',
 'lib/tools/helyettesitestipusai/Helyettesitestipusai.js',
 'lib/tools/helyettesitesek/Helyettesitesek.js',
 'lib/tools/helyettnaplo/Helyettnaplo.js',
 'lib/tools/hihebetolt/Hihebetolt.js',
 'lib/tools/jelentesek/Jelentesek.js',
 'lib/tools/kotelezoorak/Kotelezoorak.js',
 'lib/tools/jelszavak/Jelszavak.js',
 'lib/tools/egyeniorakedv/Egyeniorakedv.js',
 'lib/tools/rnapok/Rnapok.js',
 'lib/tools/tktef/Tktef.js',
 'lib/tools/tktefnaplo/Tktefnaplo.js',
 'lib/tools/lezarasok/Lezarasok.js',
 'lib/tools/tantargyelsz/Tantargyelsz.js'
],
function()
{

Idokeret = Service.extend(
{
  /**
   * Konstruktor.
   * 
   * @param args {Object?undefined} a létrehozáshoz szükséges adatokat tároló objektum
   *   #property onExit {function(service:Service)} a szolgáltatásból való kilépés eseménye           
   */
  constructor : function(args)
  {
    this.base(args);
    
    this.onExit = (this.argsExist && 'function' === typeof(args.onExit)) ? 
      args.onExit : function(service){service.destroy();};
    
    // Menüpontok hozzáadása
    var s = this;
    // Parancsok listája
    var a = s.actions;
    
    // Eszközök létrehozása
    if (a.has(CsoportokGetDataListAction))
      this.addMenuItem('Munkak\u00f6z\u00f6ss\u00e9gek',function(){s.setTool(new Csoportok({actions:a}));});
    if (a.has(FelhasznalokGetDataListAction))
      this.addMenuItem('Felhaszn\u00e1l\u00f3k',function(){s.setTool(new Felhasznalok({actions:a}));});
    if (a.has(JelszavakGetDataListAction))
      this.addMenuItem('Jelszavak',function(){s.setTool(new Jelszavak({actions:a}));});
    if (a.has(HianyzasokGetDataListAction))
      this.addMenuItem('Hi\u00e1nyz\u00e1sok',function(){s.setTool(new Hianyzasok({actions:a}));});
    if (a.has(HianyzasokaiGetDataListAction))
      this.addMenuItem('Hi\u00e1nyz\u00e1sok okai',function(){s.setTool(new Hianyzasokai({actions:a}));});
    if (a.has(HelyettesitesekGetDataListAction))
      this.addMenuItem('Helyettes\u00edt\u00e9sek',function(){s.setTool(new Helyettesitesek({actions:a}));});
    if (a.has(HelyettesitestipusaiGetDataListAction))
      this.addMenuItem('Helyettes\u00edt\u00e9sek t\u00edpusai',function(){s.setTool(new Helyettesitestipusai({actions:a}));});
    if (a.has(HelyettnaploGetDataListAction))
      this.addMenuItem('Helyettes\u00edt\u00e9si napl\u00f3',function(){s.setTool(new Helyettnaplo({actions:a}));});
    if (a.has(HihebetoltGetDataListAction))
      this.addMenuItem('Hi\u00e1nyz., helyett. \u00e1llom\u00e1nyb\u00f3l',function(){s.setTool(new Hihebetolt({actions:a}));});
    if (a.has(TktefGetDataListAction))  
      this.addMenuItem('Tan\u00f3r\u00e1n k\u00edv\u00fcli tev\u00e9kenys\u00e9gek',function(){s.setTool(new Tktef({actions:a}));});
    if (a.has(TktefnaploGetDataListAction))  
      this.addMenuItem('Tkt., ef. napl\u00f3',function(){s.setTool(new Tktefnaplo({actions:a}));});
    if (a.has(TanevekGetDataListAction))
      this.addMenuItem('Tan\u00e9vek',function(){s.setTool(new Tanevek({actions:a}));});
    if (a.has(IdoszakokGetDataListAction))
      this.addMenuItem('Id\u0151szakok',function(){s.setTool(new Idoszakok({actions:a}));});
    if (a.has(RnapokGetDataListAction))
      this.addMenuItem('Rendhagy\u00f3 napok',function(){s.setTool(new Rnapok({actions:a}));});
    if (a.has(OrarendekGetDataListAction))
      this.addMenuItem('\u00d3rarendek',function(){s.setTool(new Orarendek({actions:a}));});
    if (a.has(KotelezoorakGetDataListAction))
      this.addMenuItem('K\u00f6telez\u0151 \u00f3r\u00e1k',function(){s.setTool(new Kotelezoorak({actions:a}));});
    if (a.has(TantargyelszGetDataListAction))
      this.addMenuItem('Tant\u00e1rgyelsz\u00e1mol\u00e1sok',function(){s.setTool(new Tantargyelsz({actions:a}));});
    if (a.has(EgyeniorakedvGetDataListAction))
      this.addMenuItem('Egy\u00e9ni \u00f3rakedvezm\u00e9nyek',function(){s.setTool(new Egyeniorakedv({actions:a}));});
    if (a.has(SzakmaCsoportokGetDataListAction))
      this.addMenuItem('Szakmacsoportok',function(){s.setTool(new SzakmaCsoportok({actions:a}));});
    if (a.has(OsztalyokGetDataListAction))
      this.addMenuItem('Oszt\u00e1lyok',function(){s.setTool(new Osztalyok({actions:a}));});
    if (a.has(OsztalyCsoportokGetDataListAction))
      this.addMenuItem('Oszt\u00e1lycsoportok',function(){s.setTool(new OsztalyCsoportok({actions:a}));});
    if (a.has(OsztalyCimkekGetDataListAction))
      this.addMenuItem('Oszt\u00e1lyc\u00edmk\u00e9k',function(){s.setTool(new OsztalyCimkek({actions:a}));});
    if (a.has(OsztalyokCimkeiGetDataListAction))
      this.addMenuItem('Oszt\u00e1lyok c\u00edmk\u00e9i',function(){s.setTool(new OsztalyokCimkei({actions:a}));});
    if (a.has(TantargyakGetDataListAction))
      this.addMenuItem('Tant\u00e1rgyak',function(){s.setTool(new Tantargyak({actions:a}));});
    if (a.has(TantargyCimkekGetDataListAction))
      this.addMenuItem('Tant\u00e1rgyc\u00edmk\u00e9k',function(){s.setTool(new TantargyCimkek({actions:a}));});
    if (a.has(TantargyakCimkeiGetDataListAction))
      this.addMenuItem('Tant\u00e1rgyak c\u00edmk\u00e9i',function(){s.setTool(new TantargyakCimkei({actions:a}));});
    if (a.has(JelentesekGetDataListAction))
      this.addMenuItem('Jelent\u00e9sek',function(){s.setTool(new Jelentesek({actions:a}));});
    if (a.has(LezarasokGetDataListAction))
      this.addMenuItem('Lez\u00e1r\u00e1sok',function(){s.setTool(new Lezarasok({actions:a}));})
    this.addExitMenuItem();
  },
  
  // @override
  toString : function()
  {
    return 'Idokeret';
  }
});

ModuleManager.ready('Idokeret');

});