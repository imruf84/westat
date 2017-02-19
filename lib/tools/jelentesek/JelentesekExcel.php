<?php

  require_once('../../CharCoding.php');
  require_once('../../CResponse.php');
  require_once('../idoszakok/IdoszakAsArray.php');
  require_once('../orak/COrak.php');
  
  /**
   * Jelentés állományának konstansai.
   * NOTE: - a konstansok az állományok létrehozásában és letöltésében kapnak szerepet   
   */     
  define('JELENTES_MIME_TYPE','application/vnd.ms-excel');
  // Létrehozandó fájl kiterjesztése
  define('JELENTES_EXTENSION','xls');
  
  /**
   * Segédfüggvények a rövidebb kódok miatt. 
   * @param from {string?number} a sor első eleme
   * @param to {string?number?undefined} a sor utolsó eleme
   * @param step {number?undefined} a lépésköz mértéke ([1])
   * NOTE: - az alábbi paraméterek a következő sorozatokat állítják elő:
   *  from | to | step | sorozat
   *    A  |  F |   1  |  A,B,C,D,E,F         
   *    A  |  F |   3  |  A,C,F         
   */
  function array_range($from,$to,$step=1)
  {
    if (!isset($to)) return array($from);
    
    $a = array();
    
    $j = 0;
    for ($i = $from; $i != $to; $i++)
    {
      if (0 == $j % $step)
        $a[] = $i;
          
      $j++;
    }
      
    if (0 == $j % $step)
      $a[] = $to;
    
    return $a;
  }
  
  /**
   * Kulcsokat és értékeket rendez össze egy új tömbbé. 
   */     
  function array_range_keys($keys,$values)
  {
    $a = array();
    
    for ($i = 0; $i < count($keys); $i++)
      $a[$keys[$i]] = $values[$i];
      
    return $a; 
  }
  
  /**
   * Tömbök elemeit fűzi össze.
   * NOTE: - olyan mint a Descartes-szorzat
   *
   * @param reverse {boolean} ha igaz, akkor fordítva fűzi össze az elemeket
   *   
   * pl. a1=(a,b,c),a2=(1,2,3,4) = (a1,a2,a3,a4,b1,b2,b3,b4,c1,c2,c3,c4)         
   */     
  function array_cross($array1,$array2,$reverse=false)
  {
    $a = array();
    
    foreach ($array1 as $a1)
      foreach ($array2 as $a2)
        $a[] = (true == $reverse) ? $a2.$a1 : $a1.$a2;
        
    return $a;
  }
  
  /**
   * Tömb elemeinek a sokszorozása.
   * NOTE: - a függvény nem veszi figyelembe a kulcsokat, csak az értékeket
   *       - a végeredmény nem tartalmazza az eredeti kulcsokat                  
   */     
  function array_manifold($array,$count=1,$separate=false)
  {
    if (!is_array($array)) return array();
    
    $a = array();
    
    $n1 = (true == $separate) ? 1 : $count;
    $n2 = $count / $n1;
    for ($i = 0; $i < $n1; $i++)
      foreach ($array as $arr)
        for ($j = 0; $j < $n2; $j++)
          $a[] = $arr;
          
    return $a;
  }
  
  /**
   * Tömbök és egyéb értékekből állít össze egy új tömböt.
   * 
   * pl. array1    str1 array2    str2... =
   * 
   *  1. array1[0].str1.array2[0].str2...
   *        .
   *        .
   *        .
   *  n. array1[n].str1.array2[n].str2...
   */     
  function array_mix()
  {
    $a = array();
    
    $args = func_get_args();
    
    // Meghatározzuk a leghoszabb tömb hosszát
    $n = 0;
    foreach ($args as $arg)
      if (is_array($arg))
        $n = max($n,count($arg));
        
    for ($i = 0; $i < $n; $i++)
    {
      $e = '';
      foreach ($args as $arg)
      {
        if (!isset($arg)) continue;
        
        if (is_array($arg) && (count($arg) > $i))
        {
          $e .= $arg[$i];
          continue;
        }
        
        $e .= $arg;
      }
      
      $a[] = $e;
    }
    
    return $a;
  }
  
  /**
    * Jelentés állományának az elkészítése.
    * 
    * @param fileName {string} az állomány neve
    * NOTE: - a névnek tartalmaznia kell az elérési utat is
    * @param db {AdoDBObject} adatbázis referencia objektuma    
    * @param idoszakID {number?undefined} az időszak azonosítója     
    * @param felhasznaloID {number?undefined} a felhasználó azonosítója                    
    * @param rClass {CService} az osztályra mutató referencia
    * @param datumtol {string} az a dátum amettől szeretnénk elkészíteni a jelentést
    * NOTE: - ha nincs megadva, vagy ha kívül esik az időszakon akkor a teljes 
    *         időszakra elkészül a jelentés        
    * @param datumig {string} az a dátum ameddig szeretnénk elkészíteni a jelentést
    * NOTE: - ha nincs megadva, vagy ha kívül esik az időszakon akkor a teljes 
    *         időszakra elkészül a jelentés    
    */         
  function createReportExcel($fileName,$db,$idoszakID,$felhasznaloID,$rClass,$datumtol,$datumig)
  {
    //$GLOBALS['RESPONSE']->sendError($datumig,true);
    
    // Ellenőrizzük a dátum formátumát (ha meg van adva)
    $datumMettol = (isset($datumtol)) ? substr(utf8ToLatin2($datumtol),1,-1) : '';
    if ('' !== $datumMettol && (0 != CTestString::test($datumMettol,'date',10,10)))
      $GLOBALS['RESPONSE']->sendError('A megadott dátum ('.$datumMettol.') formátuma, vagy hossza nem megfelelő!',true);
    
    // Ellenőrizzük a dátum formátumát (ha meg van adva)
    $datumMeddig = (isset($datumig)) ? substr(utf8ToLatin2($datumig),1,-1) : '';
    if ('' !== $datumMeddig && (0 != CTestString::test($datumMeddig,'date',10,10)))
      $GLOBALS['RESPONSE']->sendError('A megadott dátum ('.$datumMeddig.') formátuma, vagy hossza nem megfelelő!',true);
    
    // Lekérdezzük, hogy a felhasználó óraadó-e? (kivéve akkor, ha üres jelentést akarunk generálni)
    $oraado = false;
    if (isset($felhasznaloID))
    {
      $a = dbExec($db,'SELECT oraado FROM felhasznalok WHERE felhasznaloID='.$felhasznaloID);
      $oraado = (1 == $a[0]['oraado']) ? true : false;
    }
    
    
    // Üres jelentés létrehozása
    // Sablon beolvasása (óraadók esetében más sablont használunk)
    //$content = file_get_contents(true == $oraado ? 'report_tempelate_oraado.xml' : 'report_tempelate.xml');
    $content = file_get_contents('report_tempelate_oraado.xml');
    
    // Jelentés kitöltése
    kitolt($content,$db,$idoszakID,$felhasznaloID,$rClass,$datumMettol,$datumMeddig,$oraado);
    
    // Üres jelzések eltávolítása
    // NOTE: - az eltávolítás két lépésben történik
    // Első körben eltávolítjuk a függvényes celllákat...
    // NOTE: - az =ÉRTÉK("") függvény hibát ad vissza
    $content = preg_replace('/=VALUE.*{[^{}]*}.*[)]/u','',$content);
    $content = preg_replace('/=DATEVALUE.*{[^{}]*}.*[)]/u','',$content);
    // ...majd ezt követik a nem függvényes cellák.
    $content = preg_replace('/{[^{}]*}/u','',$content);
    // Végezetül eltávolítjuk a hibát jelző cellaértékeket....
    $content = preg_replace('/#VALUE!/u','',$content);
    // ...és a hibát jelző cella típusokat
    $content = preg_replace('/Type="Error"/u','Type="String"',$content);
    
    // Jelentés állományba írása
    file_put_contents($fileName,$content);
    
    unset($content);
  }
  
  /**
   * Cella értékének megadása sor és oszlopazonosítók alapján.
   * 
   * @param content {string} a jelentés tartalma
   * @param sheet {string?numbber} munkafüzet indexe   
   * @param cell {string} cella azonosító         
   * @param value {string?number} a cella értéke     
   * @param value2 {string?number} a cella alternatív értéke
   * @return {string?number} a beállított érték      
   */
  function setValue(&$content,$sheet,$cell,$value,$value2=0)
  {
    $v = isset($value)?$value:$value2;
    $content = preg_replace('/{'.$sheet.'[|]'.$cell.'}/u',$v,$content);
    
    return $v;
  }
  
  /**
   * Adatbázisból lekért dátum átalakítása az excelnek megfelelő módon.
   * NOTE: - a függvény lecseréli a kötőjeleket pontokra
   * 
   * @param date {string} az átalakítandó dátum
   * @return {string} az átalakított dátum            
   */     
  function toDate($date)
  {
    if (!isset($date)) return $date;
    
    return str_replace('-','.',$date);
  }
  
  /**
   * Üres jelentés kitöltése.
   * 
   * @param c {string} a jelentés állományának tartalma
   * @param db {AdoDBObject} adatbázis referencia objektuma   
   * @param idoszakID {number} az időszak azonosítója
   * @param felhasznaloID {number} a felhasználó azonosítója
   * @param rClass {CService} az osztályra mutató referencia  
   * @param datumig {string} az a dátum ameddig szeretnénk elkészíteni a jelentést
   * NOTE: - ha nincs megadva, vagy ha kívül esik az időszakon akkor a teljes 
   *         időszakra elkészül a jelentés
   * @param oraado {bool} igaz ha a felhasználó óraadó, egyébként hamis       
   * @return {string} a jelentés tartalma
   */     
  function kitolt(&$c,$db,$idoszakID,$felhasznaloID,$rClass,$datumtol,$datumig,$oraado)
  {
    // Ha nincsenek megadva a megfelelő adatok akkor kilépünk
    if (!(isset($idoszakID) && isset($felhasznaloID))) return;
    
    // Időszak adatai
    $d = IdoszakAsArray($db,$idoszakID);
    
    // Ha nem adtuk meg, hogy meddig szeretnénk generálni, akkor végig generálunk
    $datumMettol = ('' !== $datumtol) ? $datumtol : $d['dateDatas'][0]['date'];
    $datumMettolWhere = ' AND datum <= "'.$datumMettol.'"';
    
    // Ha nem adtuk meg, hogy meddig szeretnénk generálni, akkor végig generálunk
    $datumMeddig = ('' !== $datumig) ? $datumig : $d['dateDatas'][count($d['dateDatas'])-1]['date'];
    $datumMeddigWhere = ' AND datum <= "'.$datumMeddig.'"';
    
    // *tanév azonosítója
    $tanevID = $d['tanevID'];
    
    // *hét első napja
    $kezdoHetElsoNap = $d['kezdoHetElsoNap'];
    setValue($c,11,'B3',toDate($kezdoHetElsoNap));
    // *időszak első napja
    setValue($c,11,'B5',toDate($d['elsoNap']));
    // *időszak utolsó napja
    setValue($c,11,'B7',toDate($d['utolsoNap']));
    // *kezdő hét sorszáma
    $kezdoHetSorszama = $d['kezdoHetSorszam'];
    setValue($c,11,'C2',$kezdoHetSorszama);
    // *kezdő hét betűjele
    $hetBetui = array('A','B','C','D','E');
    $kezdoHet = $d['kezdoHetValtozat'];
    $kezdoHetBetujel = $hetBetui[$kezdoHet];
    setValue($c,11,'E2',$kezdoHetBetujel);
    
    // *a felhasználó által tanított osztályok lekérdezése
    /*$a = dbExec($db,'
      SELECT osztalyCimkeNev
      FROM orak
      LEFT JOIN osztaly_cimkek ON osztaly_cimkek.osztalyCimkeID = orak.osztalyID
      WHERE osztaly_cimkek.tanevID = '.$tanevID.' AND  
      orarendID
      IN (
        SELECT orarendID
        FROM orarendek,idoszakok
        WHERE orarendek.tanevID=orarendek.tanevID AND idoszakok.idoszakID='.$idoszakID.')
        AND felhasznaloID='.$felhasznaloID.'
        AND orak.tantargyID NOT 
        IN (
          SELECT tantargyID FROM tantargyelsz WHERE 
              tantargyelsz.tanevID IN (
                SELECT tanevID
                FROM orarendek
                WHERE orarendek.orarendID = orak.orarendID
              ) AND
              tantargyelsz.felhasznaloID=orak.felhasznaloID AND
              tipus IN ("tkt","ef","tktgy","efgy")
        )
        GROUP BY osztalyCimkeNev
        ORDER BY osztalyCimkeNev');*/
    $a = dbExec($db,'
      SELECT GET_OSZTALY_NEV(orak.osztalyID,'.$tanevID.') AS osztalyCimkeNev
      FROM orak
      WHERE   
      orarendID
      IN (
        SELECT orarendID
        FROM orarendek,idoszakok
        WHERE orarendek.tanevID=idoszakok.tanevID AND idoszakok.idoszakID='.$idoszakID.')
        AND felhasznaloID='.$felhasznaloID.'
        AND orak.tantargyID NOT 
        IN (
          SELECT tantargyID FROM tantargyelsz WHERE 
              tantargyelsz.tanevID IN (
                SELECT tanevID
                FROM orarendek
                WHERE orarendek.orarendID = orak.orarendID
              ) AND
              tantargyelsz.felhasznaloID=orak.felhasznaloID AND
              tipus IN ("tkt","ef","tktgy","efgy")
        )
        GROUP BY osztalyCimkeNev
        ORDER BY osztalyCimkeNev');
        
    // *osztály listájának tárolása tömbben+állományba írása
    $osztalyok = array();
    foreach ($a as $index=>$value)
    {
      $osztaly = $value['osztalyCimkeNev'];
      $osztalyok[] = $osztaly;
      $row = $index+4;
      setValue($c,0,'A'.$row,$osztaly);
      setValue($c,1,'A'.$row,$osztaly);
      /* 2 havi
      $row = $index + 57;
      setValue($c,0,'A'.$row,$osztaly);
      setValue($c,1,'A'.$row,$osztaly);*/
    }
    
    //$GLOBALS['RESPONSE']->sendError(implode(',',$osztalyok),true);
    
    // Oszlopazonosítókat tartalmazó tömb
    $columns = array_range('A','BB');
    
    // Óraadóval kapcsolatos adatok
    // NOTE: - ezek az adatok a teljesítménymutató fülön lévő óraadóval kapcsolatos 
    //         szakfeladat elszámolásokat tartalmazza
    //       - az óraszámok folyamatosan összegződnek, majd a kitöltés végén
    //         egyszerre kerülnek beírásra
    $oraadoSzf = array();
    $oraadoSzf['elm']  = array(0,0,0,0,0,0);
    $oraadoSzf['gyak'] = array(0,0,0,0,0,0);
    // Ledolgozott túlórák száma
    // NOTE: - teljesítménymutató fülre lesz beírva
    $ledolgTulorak = 0;
    
    // *végig haladunk a napokon és megadjuk a vele kapcsolatos adatokat
    foreach ($d['dateDatas'] as $dateValue)
    {
      // Lokális változó tárolja a dátumot
      // NOTE: - helyettesített nap esetén az új dátum lesz az értéke
      // TIPP: - a $date változó tartalmazza a megtartott nap dátumát, míg a
      //         $dateValue bizonyos esetekben a helyettesített napot jelenti 
      $date = $dateValue['date'];
      
      $dateIndex = array_search($date,$d['dates']);
      
      // Nap számának a meghatározása (Hétfő=0)
      $nap = $dateValue['nap'];
      // Órarend változatának a meghatározása (A=0,B=1 hét)
      $het = $dateValue['het'];
    
      // Nap típusa
      $napTipus = $dateValue['napTipus'];
      // Volt-e munka aznap?
      $noWork = (1==$dateValue['noWork'])?true:false;
      // Kötelező óra szerinti nap?
      $konDay = (1==$dateValue['konDay'])?true:false;
      // Adott osztály
      $specClass = (1==$dateValue['specClass'])?true:false;
      
      if (is_string($napTipus))
      {
        switch ($napTipus)
        {
          case 'ikn':
          case 'mszn':
          case 'tnm':
            setValue($c,11,'M'.($dateIndex+2),'X');
          break;
          case 'hn':
            setValue($c,11,'N'.($dateIndex+2),toDate($date));
          break;
        }
        
        
        // Megjegyzés (40 óra)
        $megjegyzes = $dateValue['megjegyzes'];
        if (is_string($megjegyzes) && '' !== $megjegyzes)
          setValue($c,9,'K'.($dateIndex+4),$megjegyzes);
      }
      
      // Csak a megadott dátumtól töltjük ki
      if (strtotime($date) < strtotime($datumMettol)) continue;
      
      // Csak a megadott dátumig töltjük ki
      if (strtotime($date) > strtotime($datumMeddig)) continue;
      
      // Ha nem volt ezen a napon munka, akkor tovább lépünk a következőre
      if (true == $noWork) continue;
      
      // Naphoz tartozó órarend azonosítójának lekérdezése
      // NOTE: - helyettesített nap esetén is a helyettesített nap dátumával dolgozunk
      $a = dbExec($db,'SELECT orarendID '.
          'FROM orarendek HAVING orarendID<="'.$dateValue['date'].'" ORDER BY orarendID DESC LIMIT 1');
        
      $orarendID = $dateValue['orarendID'];
      // Ha nem találtunk megfelelő órarendet, akkor tovább lépünk
      if (!is_string($orarendID)) continue;
      
      // Kötelező óra (Órák)
      // NOTE: - az ora0 tartalmazza a hétfői órát, az ora1 a keddit, stb.
      $a = dbExec($db,'SELECT ora'.$nap.' AS ora FROM kotelezoorak '.
        'WHERE felhasznaloID='.$felhasznaloID.' AND orarendID="'.$orarendID.'" AND het='.$het);
      
      $kotelezoora = $a[0]['ora'];
      
      $a = array('C','H','M','R','W');
      $cell = $a[$nap].((int)($dateIndex/5)*2+6);
      // Ellenőrizzük, hogy van-e megadva kötelező óra
      if (isset($kotelezoora))
        // Óraaók esetén 0 a kötelező óra, hogy mindent túlórába számoljon el
        //setValue($c,10,$cell,$kotelezoora);
        setValue($c,10,$cell,(true == $oraado) ? 0 : $kotelezoora);
      
      // Tényleges órák
      $a = array('B','G','L','Q','V');
      $cell = $a[$nap].((int)($dateIndex/5)*2+6);
      setValue($c,10,$cell,getFelhasznaloOrai($db,$GLOBALS['RESPONSE'],$felhasznaloID,$orarendID,$het,$nap,true));
      
      // Osztályonkénti bontás
      
      
      // Volt-e ezen a napon hiányzás?
      // NOTE: - csak tesztelésre van használva, ezért nem veszi figyelembe a hiányzás típusát
      $b2 = dbExec($db,
          'SELECT hianyzasok.datum 
           FROM hianyzasok
           WHERE
           hianyzasok.felhasznaloID='.$felhasznaloID.' AND
           hianyzasok.datum="'.$date.'" AND
           hianyzasok.idoszakID='.$idoszakID.'
           GROUP BY datum');
      $voltHianyzas = isset($b2[0]['datum']);
      
      // Órarend szerinti nap adott órától adott óráig
      // Csak akkor írjuk jóvá az órákat, ha aznap nem volt hiányzás
      // Ez a változó tartalmazza az óraadó szakfeladat elszámolásához szükséges
      //  lekérdezés feltételét adott órától adott óráig tartó nap esetén
      $onaoaoWhere = '';
      if ('onaoao' == $napTipus && !$voltHianyzas)
      {
        // Módosítjuk a feltételt
        $onaoaoWhere = ' AND (('.$dateValue['onaoaoOratol'].' <= orak.ora) AND ('.$dateValue['onaoaoOraig'].' >= orak.ora)) ';
      }
      
      // Osztályok és óraszámok lekérdezése
      // NOTE: - a tanótán kívüli tevékenységek és az egyéni foglalkozások nem tartoznak bele,
      //         mert azokat külön fülre kell majd beírni
      //       - a lekérdezés során külön lekérdezzük a gyakorlati, majd az elméleti órákat és
      //         a kettőt uniózzuk
      //       - a lekérdezés tartalmazza az adott órától adott óráig típusú nap feltételét
      //       - DISTINCT azért kell, mert pl Pécsi Iminél minden sor duplán szerepelt, így kétszer annyi órát
      //         számolt el B héten (a "DISTINCT" parancs törli a dupla sorokat, hogy csak egy maradjon)
      /*$a = dbExec($db,
        '(SELECT osztaly_cimkek.osztalyCimkeNev, COUNT(DISTINCT orak.ora) AS oraszam, "elm" AS tipus,
         # Óraadó esetén minden óra túlóra
         IF(1=felhasznalok.oraado,COUNT(DISTINCT orak.ora),SUM(orak.ora<=>kotelezoorak.tulora'.$nap.'0)+SUM(orak.ora<=>kotelezoorak.tulora'.$nap.'1)) AS tulora
         FROM orak
         LEFT JOIN osztaly_cimkek ON osztaly_cimkek.osztalyCimkeID = orak.osztalyID
         LEFT JOIN tantargyak ON tantargyak.tantargyID = orak.tantargyID
         LEFT JOIN felhasznalok ON felhasznalok.felhasznaloID = orak.felhasznaloID
         LEFT JOIN kotelezoorak ON kotelezoorak.felhasznaloID = orak.felhasznaloID AND kotelezoorak.orarendID = orak.orarendID AND kotelezoorak.het = orak.het
         WHERE orak.orarendID = "'.$orarendID.'"
         AND orak.het = '.$het.'
         AND orak.nap = '.$nap.
         $onaoaoWhere.'
         AND orak.felhasznaloID = '.$felhasznaloID.'
         AND orak.tantargyID NOT IN (
            SELECT tantargyID FROM tantargyelsz WHERE 
              tantargyelsz.tanevID IN (
                SELECT tanevID
                FROM orarendek
                WHERE orarendek.orarendID = orak.orarendID
              ) AND
              tantargyelsz.felhasznaloID=orak.felhasznaloID AND
              tipus IN ("gyak","tkt","ef","tktgy","efgy")
            )
         AND orak.ora NOT IN
         (
           SELECT hianyzasok.ora
           FROM hianyzasok
           WHERE hianyzasok.felhasznaloID = orak.felhasznaloID
           AND hianyzasok.idoszakID = '.$idoszakID.'
           AND datum = "'.$date.'"
         )
         GROUP BY osztaly_cimkek.osztalyCimkeNev
         ORDER BY osztaly_cimkek.osztalyCimkeNev)
         
         UNION ALL
         
         (SELECT osztaly_cimkek.osztalyCimkeNev, COUNT(DISTINCT orak.ora) AS oraszam, "gyak" AS tipus,
          # Óraadó esetén minden óra túlóra
          IF(1=felhasznalok.oraado,COUNT(DISTINCT orak.ora),SUM(orak.ora<=>kotelezoorak.tulora'.$nap.'0)+SUM(orak.ora<=>kotelezoorak.tulora'.$nap.'1)) AS tulora
          FROM orak
          LEFT JOIN osztaly_cimkek ON osztaly_cimkek.osztalyCimkeID = orak.osztalyID
          LEFT JOIN tantargyak ON tantargyak.tantargyID = orak.tantargyID
          LEFT JOIN felhasznalok ON felhasznalok.felhasznaloID = orak.felhasznaloID
          LEFT JOIN kotelezoorak ON kotelezoorak.felhasznaloID = orak.felhasznaloID AND kotelezoorak.orarendID = orak.orarendID AND kotelezoorak.het = orak.het
          WHERE orak.orarendID = "'.$orarendID.'"
          AND orak.het = '.$het.'
          AND orak.nap = '.$nap.
          $onaoaoWhere.'
          AND orak.felhasznaloID = '.$felhasznaloID.'
          AND orak.tantargyID IN (
            SELECT tantargyID FROM tantargyelsz WHERE 
              tantargyelsz.tanevID IN (
                SELECT tanevID
                FROM orarendek
                WHERE orarendek.orarendID = orak.orarendID
              ) AND
              tantargyelsz.felhasznaloID=orak.felhasznaloID AND
              tipus IN ("gyak")
            )
          AND orak.ora NOT IN
         (
           SELECT hianyzasok.ora
           FROM hianyzasok
           WHERE hianyzasok.felhasznaloID = orak.felhasznaloID
           AND hianyzasok.idoszakID = '.$idoszakID.'
           AND datum = "'.$date.'"
         )
         GROUP BY osztaly_cimkek.osztalyCimkeNev
         ORDER BY osztaly_cimkek.osztalyCimkeNev)
      ');*/
      
      $a = dbExec($db,
        '(SELECT GET_OSZTALY_NEV(orak.osztalyID,'.$tanevID.') AS osztalyCimkeNev, COUNT(DISTINCT orak.ora) AS oraszam, "elm" AS tipus,
         # Óraadó esetén minden óra túlóra
         IF(1=felhasznalok.oraado,COUNT(DISTINCT orak.ora),SUM(orak.ora<=>kotelezoorak.tulora'.$nap.'0)+SUM(orak.ora<=>kotelezoorak.tulora'.$nap.'1)) AS tulora
         FROM orak
         LEFT JOIN tantargyak ON tantargyak.tantargyID = orak.tantargyID
         LEFT JOIN felhasznalok ON felhasznalok.felhasznaloID = orak.felhasznaloID
         LEFT JOIN kotelezoorak ON kotelezoorak.felhasznaloID = orak.felhasznaloID AND kotelezoorak.orarendID = orak.orarendID AND kotelezoorak.het = orak.het
         WHERE orak.orarendID = "'.$orarendID.'"
         AND orak.het = '.$het.'
         AND orak.nap = '.$nap.
         $onaoaoWhere.'
         AND orak.felhasznaloID = '.$felhasznaloID.'
         AND orak.tantargyID NOT IN (
            SELECT tantargyID FROM tantargyelsz WHERE 
              tantargyelsz.tanevID IN (
                SELECT tanevID
                FROM orarendek
                WHERE orarendek.orarendID = orak.orarendID
              ) AND
              tantargyelsz.felhasznaloID=orak.felhasznaloID AND
              tipus IN ("gyak","tkt","ef","tktgy","efgy")
            )
         AND orak.ora NOT IN
         (
           SELECT hianyzasok.ora
           FROM hianyzasok
           WHERE hianyzasok.felhasznaloID = orak.felhasznaloID
           AND hianyzasok.idoszakID = '.$idoszakID.'
           AND datum = "'.$date.'"
         )
         GROUP BY osztalyCimkeNev
         ORDER BY osztalyCimkeNev)
         
         UNION ALL
         
         (SELECT GET_OSZTALY_NEV(orak.osztalyID,'.$tanevID.') AS osztalyCimkeNev, COUNT(DISTINCT orak.ora) AS oraszam, "gyak" AS tipus,
          # Óraadó esetén minden óra túlóra
          IF(1=felhasznalok.oraado,COUNT(DISTINCT orak.ora),SUM(orak.ora<=>kotelezoorak.tulora'.$nap.'0)+SUM(orak.ora<=>kotelezoorak.tulora'.$nap.'1)) AS tulora
          FROM orak
          LEFT JOIN tantargyak ON tantargyak.tantargyID = orak.tantargyID
          LEFT JOIN felhasznalok ON felhasznalok.felhasznaloID = orak.felhasznaloID
          LEFT JOIN kotelezoorak ON kotelezoorak.felhasznaloID = orak.felhasznaloID AND kotelezoorak.orarendID = orak.orarendID AND kotelezoorak.het = orak.het
          WHERE orak.orarendID = "'.$orarendID.'"
          AND orak.het = '.$het.'
          AND orak.nap = '.$nap.
          $onaoaoWhere.'
          AND orak.felhasznaloID = '.$felhasznaloID.'
          AND orak.tantargyID IN (
            SELECT tantargyID FROM tantargyelsz WHERE 
              tantargyelsz.tanevID IN (
                SELECT tanevID
                FROM orarendek
                WHERE orarendek.orarendID = orak.orarendID
              ) AND
              tantargyelsz.felhasznaloID=orak.felhasznaloID AND
              tipus IN ("gyak")
            )
          AND orak.ora NOT IN
         (
           SELECT hianyzasok.ora
           FROM hianyzasok
           WHERE hianyzasok.felhasznaloID = orak.felhasznaloID
           AND hianyzasok.idoszakID = '.$idoszakID.'
           AND datum = "'.$date.'"
         )
         GROUP BY osztalyCimkeNev
         ORDER BY osztalyCimkeNev)
      ');
      
      
      // Óraszámok állományba írása
      /* 2 havi
      $columnIndex = ($dateIndex % 25) + 1;*/
      $columnIndex = ($dateIndex % 30) + 1;
      $column = $columns[$columnIndex];
      /* 2 havi
      $row = ($dateIndex < 25) ? 4 : 57;*/
      $row = 4;
      
      // Ha nincs órája, de a kötelező óra meg van adva (nem üres) és nem hiányzott, 
      // akkor 0 órával jelezzük, hogy aznap van suliban
      // NOTE: - a 0-át az elmélet fülre írjuk
      /*if (isset($kotelezoora) && 0 == $kotelezoora)*/
      if (isset($kotelezoora) && !(0 < count($a)) && (false == $voltHianyzas))
        setValue($c,0,$column.$row,0);
        
      
      // Kötelező óra szerinti nap van?
      if ($konDay)
      {
        // Kötelező óraszám lekérdezése
        $b = dbExec($db,
          'SELECT ora'.$nap.' AS kotelezoora 
           FROM kotelezoorak 
           WHERE felhasznaloID='.$felhasznaloID.' AND het='.$het.' AND orarendID="'.$orarendID.'"');
        $kotelezoora = (isset($b[0]['kotelezoora']) ? $b[0]['kotelezoora'] : 0);
        
        // Ha sima kon nap van, akkor a megtartott órák számítanak
        // NOTE: - mivel ezen a napon kötelező órákat számolunk el, ezért ezen a napon senkinek sincs túlórája
        // TODO: - megírni, hogy csak a nem túlórák legyenek jóvá írva (elvileg így sincs gond, 
        //         de a pontosság kedvéért jobb lenne úgy)
        if ('kon' == $napTipus && isset($b[0]['kotelezoora']))
        {
          $orak = array();
          foreach ($a as $index=>$value)
          {
            $orak[$index] = min($kotelezoora,$value['oraszam']);
            $kotelezoora -= $orak[$index];
          }
        
          // A maradékot az első elem kapja
          // NOTE: - ha nincs első elem, akkor készítünk
          if (!isset($orak[0])) $orak[0] = 0;
          $orak[0] += $kotelezoora;
          
          // Órák állományba írása
          foreach ($a as $index=>$value)
          {
            $lRow = array_search($value['osztalyCimkeNev'],$osztalyok);
                
            $cell = $column.($row+$lRow);
            $sheet = ('elm'==$value['tipus'])?0:1;
            setValue($c,$sheet,$cell,$orak[$index]);
          }
        
        }
        
        
        // Kon nap adott osztály esetén a nap adott osztályához írjuk a kötelező óraszámot
        // Csak akkor írjuk jóvá az órákat, ha aznap nem volt hiányzás
        if ('kono' == $napTipus && isset($b[0]['kotelezoora']) && false == $voltHianyzas)
        {
          $lOsztaly = $dateValue['konoOsztalyNev'];
          // Új osztály hozzáadása az osztályokhoz+állományba írása
          if (!in_array($lOsztaly,$osztalyok))
          {
            $osztalyok[] = $lOsztaly;
            
            $lRow = count($osztalyok)+4-1;
            setValue($c,0,'A'.$lRow,$lOsztaly);
            setValue($c,1,'A'.$lRow,$lOsztaly);
            $lRow = count($osztalyok)+57-1;
            setValue($c,0,'A'.$lRow,$lOsztaly);
            setValue($c,1,'A'.$lRow,$lOsztaly);
          }
          
          // Óraszám állományba írása
          $lRow = array_search($lOsztaly,$osztalyok);
          $cell = $column.($row+$lRow);
          // Adott osztály esetén (mivel nem tudjuk beazonosítani a tantárgyelszámolás
          // elszámolás típusát) mindenkinek az elmélet fülön tüntetjük fel az órákat
          setValue($c,0,$cell,$kotelezoora);
        }
        
        // Továbblépünk a következő napra
        continue;
      }
      
      // Adott óraszám szerinti nap van adott osztállyal
      // Csak akkor írjuk jóvá az órákat, ha aznap nem volt hiányzás
      // TODO: - átgondolni, hogy ebben az esetben kell-e túlórákat számolni? (elvileg szerintem nem)
      if ('aono' == $napTipus && !$voltHianyzas)
      {
        $lOsztaly = $dateValue['aonoOsztalyNev'];
        // Új osztály hozzáadása az osztályokhoz+állományba írása
        if (!in_array($lOsztaly,$osztalyok))
        {
          $osztalyok[] = $lOsztaly;
            
          $lRow = count($osztalyok)+4-1;
          setValue($c,0,'A'.$lRow,$lOsztaly);
          setValue($c,1,'A'.$lRow,$lOsztaly);
          $lRow = count($osztalyok)+57-1;
          setValue($c,0,'A'.$lRow,$lOsztaly);
          setValue($c,1,'A'.$lRow,$lOsztaly);
        }
          
        // Óraszám állományba írása
        $lRow = array_search($lOsztaly,$osztalyok);
        $cell = $column.($row+$lRow);
        $lOraszam = $dateValue['aonoOraszam'];
        // Adott osztály esetén (mivel nem tudjuk beazonosítani a tantárgyelszámolás
        // elszámolás típusát) mindenkinek az elmélet fülön tüntetjük fel az órákat
        if (isset($lOraszam))
          setValue($c,0,$cell,$lOraszam);
      
        // Tovább lépünk a következő napra
        continue;
      }      
        
      // Normál nap esetén az órarendi órákat írjuk be,...
      // NOTE: - ez egyúttal lefedi az adott órától adott óráig történő napot is
      foreach ($a as $index=>$value)
      {
        $lRow = array_search($value['osztalyCimkeNev'],$osztalyok);
                
        $cell = $column.($row+$lRow);
        $sheet = ('elm'==$value['tipus']) ? 0 : 1;
        setValue($c,$sheet,$cell,$value['oraszam']);
        
        // Ledolgozott túlórák számának növelése
        $ledolgTulorak += $value['tulora'];
      }
      
      
      // Címke, ami a napok utáni eseményeket jelöli
      _after_normal_day:
      
      
      // ... továbbá óraadó esetén ha nem volt ezen a napon hiányzás, akkor 
      // tároljuk az óraszámokat a szakfeladatelszámoláshoz a teljesítménymutató fülön
      // NOTE: - az $onaoaoWhere változó extra feltételt tartalmaz az adott órától
      //         adott óráig tartó napok esetén
      if (true == $oraado && false == $voltHianyzas)
      {
        $a = dbExec($db,
         'SELECT COUNT(orak.ora) AS oraszam, tantargyelsz.tipus, tantargyelsz.szakfelsz
          FROM orak
          LEFT JOIN tantargyelsz ON 
            tantargyelsz.tantargyID = orak.tantargyID AND 
            tantargyelsz.felhasznaloID = orak.felhasznaloID AND
            tantargyelsz.tanevID = '.$tanevID.'
          WHERE orak.felhasznaloID = '.$felhasznaloID.'
          AND orak.orarendID = "'.$orarendID.'"
          AND orak.nap = '.$nap.'
          AND orak.het = '.$het.
          $onaoaoWhere.'
          AND orak.orarendID
          IN 
          (
            SELECT orarendek.orarendID
            FROM orarendek
            WHERE orarendek.tanevID = '.$tanevID.'
          )
          GROUP BY tantargyelsz.tipus, tantargyelsz.szakfelsz'
        );
        
        foreach ($a as $szf)
        {
          $oraadoSzf[(NULL == $szf['tipus']) ? 'elm' : $szf['tipus']][(NULL == $szf['szakfelsz']) ? 0 : $szf['szakfelsz']] += $szf['oraszam'];
        }
        
      }
      
    }
    
    
    
    // Helyettesítések
          
    // TIPP: - ha gond lenne, akkor érdemes beszúrni az első WHERE-be a 
    //         hianyzasok.tantargyID = helyettesitesek.tantargyID -t is
    /*$a = dbExec($db,
      'SELECT datum, helyettesitesek.ora, osztalyCimkeNev, tantargyNev, helyettesitesek.helyettesitettID, helyettesitesek.tantargyID, helyettesitestipusaNev, osszevont, felhasznaloNev '.
       'FROM helyettesitesek
        LEFT JOIN osztaly_cimkek ON helyettesitesek.osztalyID = osztaly_cimkek.osztalyCimkeID
        LEFT JOIN tantargyak ON helyettesitesek.tantargyID = tantargyak.tantargyID
        LEFT JOIN helyettesitestipusai ON helyettesitesek.helyettesitestipusaID = helyettesitestipusai.helyettesitestipusaID
        LEFT JOIN felhasznalok ON helyettesitesek.helyettesitettID = felhasznalok.felhasznaloID
        WHERE helyettesitoID='.$felhasznaloID.' AND idoszakID='.$idoszakID.$datumMeddigWhere.' AND torolve=0 ORDER BY datum,ora');*/
    
    $a = dbExec($db,
      'SELECT datum, helyettesitesek.ora, GET_OSZTALY_NEV(helyettesitesek.osztalyID,'.$tanevID.') AS osztalyCimkeNev, tantargyNev, helyettesitesek.helyettesitettID, helyettesitesek.tantargyID, helyettesitestipusaNev, osszevont, felhasznaloNev '.
       'FROM helyettesitesek
        LEFT JOIN tantargyak ON helyettesitesek.tantargyID = tantargyak.tantargyID
        LEFT JOIN helyettesitestipusai ON helyettesitesek.helyettesitestipusaID = helyettesitestipusai.helyettesitestipusaID
        LEFT JOIN felhasznalok ON helyettesitesek.helyettesitettID = felhasznalok.felhasznaloID
        WHERE helyettesitoID='.$felhasznaloID.' AND idoszakID='.$idoszakID.$datumMeddigWhere.' AND torolve=0 ORDER BY datum,ora');
        
    foreach ($a as $index=>$value)
    {
      /* 2 havi
      $row = $index+((46 > $index) ? 7 : 16);*/
      $row = $index+7;
      
      // A tantárgy típusa és a helyettesítés típusa határozza meg, hogy melyik
      // oszlopba kerül az óraszám
      // TODO: - megkérdezni, hogy a tantárgyat a helyettesítettel kapcsolatos
      //         tantárgyelszámolás szerint számolják-e el?
      //         Alapból ezt feltételezzük
      $tantargyTipus = $rClass->getTantargyelszTipus($tanevID,$value['helyettesitettID'],$value['tantargyID']);
      
      
      $column = '';
      if ('gyak'==$tantargyTipus)
        if ('1'==$value['osszevont']) $column = 'I';
        else $column = 'H';
      else
        if ('1'==$value['osszevont']) $column = 'G';
        else $column = 'F';
      
      // Ha van megfelelő oszlop, akkor beírjuk az adatokat
      if ('' != $column)
      {
        setValue($c,2,'A'.$row,toDate($value['datum']));
        setValue($c,2,'B'.$row,$value['ora']);
        setValue($c,2,'C'.$row,$value['osztalyCimkeNev']);
        setValue($c,2,'D'.$row,$value['tantargyNev']);
        setValue($c,2,'E'.$row,$value['felhasznaloNev'],'');
        setValue($c,2,$column.$row,1);
      }
      
    }
    
    // Hiányzások
    
    $a = dbExec($db,
      'SELECT datum,COUNT(ora) AS oraszam,hianyzasokaNev,tamogatott,igazolt
       FROM hianyzasok 
       LEFT JOIN hianyzasokai ON hianyzasokai.hianyzasokaID=hianyzasok.hianyzasokaID
       WHERE felhasznaloID='.$felhasznaloID.' AND idoszakID='.$idoszakID.$datumMeddigWhere.
      ' GROUP BY datum,tamogatott,igazolt ORDER BY datum,hianyzasokaNev');
        
    foreach ($a as $index=>$value)
    {
      /* 2 havi
      $row = $index+((50 > $index) ? 6 : 15);*/
      $row = $index+6;
      
      // A hiányzás típusa határozza meg, hogy melyik oszlopba kerül az óraszám
      $column = '';
      if (1==$value['igazolt'])
        if (1==$value['tamogatott']) $column = 'C';
        else $column = 'D';
      else
        $column = 'E';
      
      // Ha van megfelelő oszlop, akkor beírjuk az adatokat
      if ('' != $column)
      {
        setValue($c,3,'A'.$row,toDate($value['datum']));
        setValue($c,3,'B'.$row,$value['hianyzasokaNev']);
        
        // Az időszak napjai közül megkeressük az adott dátumot
        $currentDate = FindInIdoszakAsArrayByDate($d['dateDatas'],$value['datum']);
      
        // Hiányzás okának megnevezése a 40 órás fülön
        setValue($c,9,'K'.($currentDate['index']+4),$value['hianyzasokaNev']);
            
        // Kötelező óraszám lekérdezése
        $b = dbExec($db,
          'SELECT ora'.$currentDate['nap'].' AS kotelezoora 
           FROM kotelezoorak 
           WHERE felhasznaloID='.$felhasznaloID.' AND het='.$currentDate['het'].' AND orarendID="'.$currentDate['orarendID'].'"');
        $kotelezoora = (isset($b[0]['kotelezoora']) ? $b[0]['kotelezoora'] : 0);
        
        $lOra = min($value['oraszam'],$kotelezoora);
        
        // NOTE: - a legújabb változatban a hiányzás óraszáma helyett csak egy X-et írunk a megfelelő helyre
        setValue($c,3,$column.$row,'X');
          
      }
      
    }
    
    // Tanórán kívüli tevékenységek, egyéni foglalkozások
    
    $a = dbExec($db,
      'SELECT datum,oraszam,tktef.tantargyID,tantargyNev,csoportos,dijazott
       FROM tktef
       LEFT JOIN tantargyak ON tantargyak.tantargyID = tktef.tantargyID
       WHERE felhasznaloID = '.$felhasznaloID.'
       AND idoszakID = '.$idoszakID.$datumMeddigWhere.' ORDER BY datum,tantargyNev');
        
    foreach ($a as $index=>$value)
    {
      $row = $index+8;
      
      $csoportos = (1 == $value['csoportos']);
      $dijazott = (1 == $value['dijazott']);
      
      // A tantárgy típusa határozza meg, hogy melyik oszlopba kerül az óraszám
      
      $tantargyTipus = $rClass->getTantargyelszTipus($tanevID,$felhasznaloID,$value['tantargyID']);
      
      // TODO: - több típust is támogatni (pl tkt,ef)
      $column = '';
      // elmélet
      if (in_array($tantargyTipus,array('elm','tkt','ef')))
      {
        // díjazott
        if ($dijazott)
          // csoportos
          if ($csoportos)
            $column = 'D';
          // egyéni
          else
            $column = 'C';
        // kötelező
        else
          // csoportos
          if ($csoportos)
            $column = 'F';
          // egyéni
          else
            $column = 'E';
      }
      // gyakorlat
      else
      {
        // díjazott
        if ($dijazott)
          // csoportos
          if ($csoportos)
            $column = 'H';
          // egyéni
          else
            $column = 'G';
        // kötelező
        else
          // csoportos
          if ($csoportos)
            $column = 'J';
          // egyéni
          else
            $column = 'I';
      }
      
      // Ha van megfelelő oszlop, akkor beírjuk az adatokat
      if ('' != $column)
      {
        setValue($c,4,'A'.$row,toDate($value['datum']));
        setValue($c,4,'B'.$row,$value['tantargyNev']);
        setValue($c,4,$column.$row,$value['oraszam']);
      }
      
    }
    
    // Felhasználó adatai
    
    // *név
    $a = dbExec($db,'SELECT felhasznaloNev FROM felhasznalok WHERE felhasznaloID='.$felhasznaloID);
    setValue($c,5,'F1',$a[0]['felhasznaloNev'],'Ismeretlen');
    // *egyéni órakedvezmény
    $a = dbExec($db,'SELECT oraA,oraKotelezoA,oraB,oraKotelezoB FROM egyeniorakedv WHERE felhasznaloID='.$felhasznaloID.
      ' AND tanevID='.$tanevID);
    setValue($c,8,'I5',$a[0]['oraA']);
    setValue($c,8,'J5',$a[0]['oraB']);
    // A kötelező órakedvezmény tizedes tört is lehet
    // NOTE: - excelben vessző kell pont helyett
    $kk = str_replace('.',',',isset($a[0]['oraKotelezoA'])?$a[0]['oraKotelezoA']:'0');
    setValue($c,8,'K5',$kk);
    $kk = str_replace('.',',',isset($a[0]['oraKotelezoB'])?$a[0]['oraKotelezoB']:'0');
    setValue($c,8,'L5',$kk);
    // *ledolgozott túlórák száma
    setValue($c,8,'I20',$ledolgTulorak);
    
    // Óraadó esetén néhány dolgot beírunk a teljesítménymutató fülre
    // *a felhasználó óraadó (ez egy rejtett cella)
    if (true == $oraado)
    {
      setValue($c,8,'O24','X');
      
      // Szakfeladat elszámolások beírása
      $cols = array('Q', 'R', 'S', 'T', 'U', 'V');
      foreach ($oraadoSzf['elm'] as $i=>$szf)
        setValue($c,8,$cols[$i].'21',$oraadoSzf['elm'][$i]);
      foreach ($oraadoSzf['gyak'] as $i=>$szf)
        setValue($c,8,$cols[$i].'22',$oraadoSzf['gyak'][$i]);
    }
        
  }
    
?>
