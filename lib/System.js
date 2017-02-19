var System = null;

ModuleManager.load(
['lib/BrowserDetect.js'],
function()
{


/**
 * Rendszer beállításaival kapcsolatos függvények, változók. 
 */
System = 
{
  // Rendszer színei
  colors:
  {
    divBase:          'white',
    mouseOver:        'lightsteelblue',
    mouseClick:       'steelblue',
    buttonActive:     'blue',
    buttonInactive:   'cadetblue',
    tableColumn:      'steelblue',
    tableRow1:        'white',
    tableRow2:        'aliceblue',
    tableSelectedRow: 'cornflowerblue',
    loadingBig:       'steelblue', //http://www.preloaders.net/en/horizontal (Squares wave)
    dialogTitle:      'cornflowerblue',
    dialogBody:       'white',
    dialogSeparator:  'gray'
  },
  
  // Ablak tulajdonságai
  window:
  {
    width: function()
           {
             var w = window.innerWidth != null ? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body != null ? document.body.clientWidth : null;
             return (null == w) ? 0 : parseInt(w);
           },
    height: function()
            {
              var h = window.innerHeight != null? window.innerHeight : document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body != null? document.body.clientHeight : null;
              return (null == h) ? 0 : parseInt(h);
            },
    top: function()
         {
           var top = typeof window.pageYOffset != 'undefined' ? window.pageYOffset : document.documentElement && document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop ? document.body.scrollTop : null;
           return (null == top) ? 0 : parseInt(top);
         },
    left: function()
          {
            var left = typeof window.pageXOffset != 'undefined' ? window.pageXOffset : document.documentElement && document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft ? document.body.scrollLeft : null;
            return (null == left) ? 0 : parseInt(left);
          },
    scrollBarWidth: function()
                    {
                      //BUG: IE alatt nem működik
                      if ('Explorer' == BrowserDetect.browser)
                        return 17;
  
                      var scr = null;
                      var inn = null;
                      var wNoScroll = 0;
                      var wScroll = 0;

                      // Outer scrolling div
                      scr = document.createElement('div');
                      scr.style.position = 'absolute';
                      scr.style.top = '-1000px';
                      scr.style.left = '-1000px';
                      scr.style.width = '100px';
                      scr.style.height = '50px';
                      // Start with no scrollbar
                      scr.style.overflow = 'hidden';

                      // Inner content div
                      inn = document.createElement('div');
                      inn.style.width = '100%';
                      inn.style.height = '200px';

                      // Put the inner div in the scrolling div
                      scr.appendChild(inn);
                      // Append the scrolling div to the doc
                      document.body.appendChild(scr);

                      // Width of the inner div sans scrollbar
                      wNoScroll = inn.offsetWidth;
                      // Add the scrollbar
                      scr.style.overflow = 'auto';
                      // Width of the inner div width scrollbar
                      wScroll = inn.offsetWidth;

                      // Remove the scrolling div from the doc
                      document.body.removeChild(document.body.lastChild);

                      // Pixel width of the scroller
                      return (wNoScroll - wScroll);
                    }  
  },
  /** Szöveges adatok teszteléséhez szükséges minták
   *  NOTE: - a TestString.php állomány ugyanezeket a definíciókat tartalmazza a
   *          szerveroldali vizsgálathoz 
   *        - tesztelésre: 
   *          http://www.switchplane.com/utilities/preg_match-regular-expression-tester.php?pattern=//u&subject=abc   
   *  #property pattern {RegExpPattern} a teszteléshez szükséges minta
   *  #property help {string} a felismerendő szöveghez mellékelt szöveges segítség
   *    NOTE: - hiba esetén segítheti a felhasználót
   */   
  patterns:
  {
    // Bármilyen karakterlánc
    anyWord: 
    {
      pattern:/.*/,
      help:'B\u00e1rmilyen karakter megengedett!'
    },
    // Pozitív egész szám
    posInt:
    {
      pattern:/^\d*\.{0,1}\d+$/,
      help:'Csak pozit\u00edv eg\u00e9sz sz\u00e1m a megengedett!'
    },
    // Egész szám
    posNegInt:
    {
      pattern:/^-{0,1}\d*\.{0,1}\d+$/,
      help:'Csak eg\u00e9sz sz\u00e1m a megengedett!'
    },
    // Pozitív tizedes tört
    fraction:
    {
      pattern:/^\d*\.?\d*$/,
      help:'Csak pozit\u00edv tizedes t\u00f6rt a megengedett!'
    },
    // Tetszőleges betűt tartalmazó, tetszőleges hosszúságú, szóközökkel tagolt szavak
    nWordSepBySpace:
    {
      pattern:/^[a-zA-Z\u00c1\u00e1\u00c9\u00e9\u00cd\u00ed\u00d3\u00f3\u00d6\u00f6\u00da\u00fa\u00dc\u00fc\u0150\u0151\u0170\u0171]{1,}([\s][a-zA-Z\u00c1\u00e1\u00c9\u00e9\u00cd\u00ed\u00d3\u00f3\u00d6\u00f6\u00da\u00fa\u00dc\u00fc\u0150\u0151\u0170\u0171]{1,})*$/,
      help:'Csak egyszeres sz\u00f3k\u00f6z\u00f6kkel tagolt szavak adhat\u00f3ak meg!'
    },
    // Tetszőleges betűt és pontot tartalmazó, tetszőleges hosszúságú, szóközökkel tagolt szavak
    nWordSepBySpaceDot:
    {
      pattern:/^[a-zA-Z\u00c1\u00e1\u00c9\u00e9\u00cd\u00ed\u00d3\u00f3\u00d6\u00f6\u00da\u00fa\u00dc\u00fc\u0150\u0151\u0170\u0171]{1,}[\.]?([\s][a-zA-Z\u00c1\u00e1\u00c9\u00e9\u00cd\u00ed\u00d3\u00f3\u00d6\u00f6\u00da\u00fa\u00dc\u00fc\u0150\u0151\u0170\u0171]{1,}[\.]?)*$/,
      help:'Csak egyszeres sz\u00f3k\u00f6z\u00f6kkel tagolt szavak adhat\u00f3ak meg!'
    },
    // Betűket, számokat, vesszőt, pontot és kötőjelet tartalmazó, tetszőleges hosszúságú, szóközökkel tagolt szavak
    nWordSepBySpaceSpec:
    {
      pattern:/^[0-9a-zA-Z\u00c1\u00e1\u00c9\u00e9\u00cd\u00ed\u00d3\u00f3\u00d6\u00f6\u00da\u00fa\u00dc\u00fc\u0150\u0151\u0170\u0171\.\/-]{1,}[\,]?([\s][0-9a-zA-Z\u00c1\u00e1\u00c9\u00e9\u00cd\u00ed\u00d3\u00f3\u00d6\u00f6\u00da\u00fa\u00dc\u00fc\u0150\u0151\u0170\u0171\.\/-]{1,}[\,]?)*$/,
      help:'Csak egyszeres sz\u00f3k\u00f6z\u00f6kkel, vagy vessz\u0151vel tagolt szavak adhat\u00f3ak meg!'
    },
    // Angol abc betűit és alulvonást tartalmazó tetszőleges hosszúságú szó
    oneWord:
    {
      pattern:/^[a-zA-Z\_]{1,}$/,
      help:'Csak az angol abc bet\u0171it \u00e9s alulvon\u00e1st (_) tartalmaz\u00f3 sz\u00f3 adhat\u00f3 meg!'
    },
    // Tetszőleges betűket tartalmazó tetszőleges hosszúságú szó 
    oneWord2:
    {
      pattern:/^[a-zA-Z\u00c1\u00e1\u00c9\u00e9\u00cd\u00ed\u00d3\u00f3\u00d6\u00f6\u00da\u00fa\u00dc\u00fc\u0150\u0151\u0170\u0171]{1,}$/,
      help:'Csak tetsz\u0151leges bet\u0171ket tartalmaz\u00f3 sz\u00f3 adhat\u00f3 meg!'
    },
    // Az angol ABC egy betűje
    oneChar:
    {
      pattern:/^[a-zA-Z]{1,1}$/,
      help:'Csak egy bet\u0171 adhat\u00f3 meg!'
    },
    // Az angol ABC egy betűje vagy száma
    oneCharOrNumber:
    {
      pattern:/^[a-zA-Z0-9]{1,1}$/,
      help:'Csak egy bet\u0171 adhat\u00f3 meg!'
    },
    // Osztály neve 
    osztalyNev:
    {
      pattern:/^[1-9][0-9]?[\.\,][1-9a-zA-Z]$/,
      help:'Csak ponttal elv\u00e1lasztott k\u00e9t sz\u00f3 adhat\u00f3 meg ([egy vagy k\u00e9tjegy\u0171 sz\u00e1m].[bet\u0171 A-tól Z-ig] pl. 12.F vagy 9.4 stb.)!'
    },
    // Órarend azonosítója 
    orarendID:
    {
      pattern:/^orarend\d{6}$/,
      help:'Csak "orarend" felirat, ut\u00e1na hat sz\u00e1mmal a megfelel\u0151 (pl. orarend123456)!'
    },
    // Tanév elnevezése
    tanevNev:
    {
      pattern:/^[1-9][0-9]{3}\/[1-9][0-9]{3}$/,
      help:'Csak k\u00e9t n\u00e9gy sz\u00e1mjegyb\u0151l \u00e1ll\u00f3 perrel elv\u00e1lasztott azonos\u00edt\u00f3 adhat\u00f3 meg (pl. 2010/2011)!'
    },
    // Dátum
    date:
    {
      pattern:/^([1-9][0-9]{3})(\.|\-)(([0][1-9])|([1][0-2]))(\.|\-)(([0][1-9])|([12][0-9])|([3][01]))$/,
      help:'Csak az al\u00e1bbi form\u00e1tumban megadott d\u00e1tum \u00e9rv\u00e9nyes:\u00e9\u00e9\u00e9\u00e9-hh-nn!'
    },
    // Időszak neve
    idoszakNev:
    {
      pattern:/^(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\-(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)$/,
      help:'Csak az al\u00e1bbi form\u00e1tumban megadott n\u00e9v \u00e9rv\u00e9nyes:h\u00f3napn\u00e9v-h\u00f3napn\u00e9v (pl. jav-feb)!'
    },
    // Exel fájl
    excelFile:
    {
      pattern:/.*/,
      help:'Bármilyen karakter megengedett!'
    }
    
  }
};

ModuleManager.ready('System');

});