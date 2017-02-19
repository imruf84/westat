<?php
  require_once('../../dbExec.php');

  /**
   * Megadott idõszak napjainak a tömbjét állítja elõ.
   */
  function IdoszakDataAsArray($db,$idoszakID)
  {
    // Idõszak adatai
    $a = dbExec($db,'SELECT * FROM idoszakok WHERE idoszakID='.$idoszakID);
    
    // Tanév azonosítója
    $tanevID = $a[0]['tanevID'];
    
    // Hét elsõ napja
    $kezdoHetElsoNap = $a[0]['kezdoHetElsoNap'];
    // Kezdõ hét betûjele
    $kezdoHetBetujel = $a[0]['kezdoHetBetujel'];
    // NOTE: - a késõbbiekben csak számokra lesz szükségünk (A->0, B->1, stb.)
    $hetBetui = array('A','B','C','D','E');
    $kezdoHet = array_search($kezdoHetBetujel,$hetBetui);

    // Elõállítjuk a dátumok tömbjét
    $date = $kezdoHetElsoNap;
    $dates = array($date);
    /* 2 havi
    for ($i = 1; $i < 50; $i++)*/
    for ($i = 1; $i < 30; $i++)
    {
      $day = (0 == ($i % 5)) ? 3 : 1;
      $date = date('Y-m-d',strtotime('+'.$day.' day',strtotime($date)));
      $dates[] = $date;
    }
    
    
    // Válasz elõállítása
    $result = array();
    $result['tanevID'] = $tanevID;
    $result['kezdoHetElsoNap'] = $kezdoHetElsoNap;
    $result['elsoNap'] = $a[0]['elsoNap'];
    $result['utolsoNap'] = $a[0]['utolsoNap'];
    $result['kezdoHetSorszam'] = $a[0]['kezdoHetSorszam'];
    $result['kezdoHetValtozat'] = $kezdoHet;
    $result['dates'] = $dates;
    
    return $result;
  }
        
  /**
   * Megadott idõszak napjainak és azok adatainak a tömbjét állítja elõ.
   * NOTE: - IdoszakDataAsArray-jal elõállítjuk a dátumok tömbjét, majd hozzáírjuk
   *         a dátumhoz tartozó adatokat      
   */     
  function IdoszakAsArray($db,$idoszakID)
  {
    $d = IdoszakDataAsArray($db,$idoszakID);
    
    $kezdoHet = $d['kezdoHetValtozat'];
    $hetBetui = array('A','B','C','D','E');
    
    // Eltároljuk a dátumok tömbjét
    $dates = $d['dates'];
    
    $dateDatas = array();
    
    // Végig haladunk a napokon és megadjuk a vele kapcsolatos adatokat
    foreach ($dates as $dateIndex=>$dateValue)
    {
      // Lokális változó tárolja a dátumot
      // NOTE: - helyettesített nap esetén az új dátum lesz az értéke
      // TIPP: - a $date változó tartalmazza a megtartott nap dátumát, míg a
      //         $dateValue bizonyos esetekben a helyettesített napot jelenti 
      $date = $dateValue;
      
      // Nap számának a meghatározása (Hétfõ=0)
      $nap = $dateIndex % 5;
      // Órarend változatának a meghatározása (A=0,B=1 hét)
      $het = abs($kezdoHet - ((int)($dateIndex / 5) % 2));
    
      // Rendhagyó napok
      
      // Ezek tárolják a rendhagyó napok adatait
      // NOTE: - azért kell tömb, mert ugyanaz a nap lehet többféle típúsú is
      $aNapTipus = array('');
      // Volt-e munka aznap?
      $aNoWork = array(false);
      // Kötelezõ óra szerinti nap?
      $aKonDay = array(false);
      // Megjegyzés
      $aMegjegyzes = array('');
      // Adott osztály
      $aSpecClass = array(false);
      
      
      // NOTE: - a rendezés azért kell, hogy pl a kon nap megelõzze a hn-et a sorban,
      //         mert ha nem, akkor nem a kötelezõ óraszám kerül az elszámolásba,
      //         hanem az aznapi órarendi óra
      $a = dbExec($db,'SELECT * FROM rnapok WHERE idoszakID='.$idoszakID.' AND datum="'.$date.'" ORDER BY tipus DESC');
      foreach ($a as $i=>$val)
      {
        $napTipus = '';
        // Volt-e munka aznap?
        $noWork = false;
        // Kötelezõ óra szerinti nap?
        $konDay = false;
        // Megjegyzés
        $megjegyzes = '';
        // Adott osztály
        $specClass = false;
      
        $napTipus = $val['tipus'];
      
        if (is_string($napTipus))
        {
          // Típus (Napok)
          switch ($napTipus)
          {
            case 'ikn':
            case 'mszn':
            case 'tnm':
              // Ezeken a típusú napokon nincs munka
              $noWork = true;
            break;
            case 'kono':
              $konoOsztalyNev = $val['konoOsztalyNev'];
              $specClass = true;
            case 'kon':
              $konDay = true;
            break;
            case 'aono':
              $aonoOsztalyNev = $val['aonoOsztalyNev'];
              $aonoOraszam = $val['aonoOraszam'];
              $specClass = true;
            break;
            case 'hn':
              // a helyettesítõ dátummal dolgozunk tovább
              //$date = $val['hnDatum'];
            
              $dateOriginal = $date;
              $date = $val['hnDatum'];
              // a helyettesítõ nap hetének a sorszáma is kell
              $hetOriginal = $het;
              $het = array_search($val['hnHet'],$hetBetui);

              // NOTE: - ez nem kell, mert az eredeti dátummal dolgozunk tovább
              /*$napNevek = array('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday');
              $d = explode('-',$date);
              $month = $d[1];
              $day = $d[2];
              $year = $d[0];
              $nap = array_search(date("l", mktime(0,0,0,$month,$day,$year)),$napNevek);*/
            
            
              // NOTE: - az eredeti nappal dolgozunk tovább
              $date = $dateValue;
            
            break;
            case 'onaoao':
              $onaoaoOratol = $val['onaoaoOratol'];
              $onaoaoOraig = $val['onaoaoOraig'];
            break;
          }
          
          
          // Megjegyzés (40 óra)
          $megjegyzes = (is_string($val['megjegyzes']) && $val['megjegyzes'] != '') ? $val['megjegyzes'] : '';
        } // if tipus string
        
        // Rendhagyó nap adatainak a tárolása
        $aNapTipus[$i] = $napTipus;
        $aNoWork[$i] = $noWork;
        $aKonDay[$i] = $konDay;
        $aMegjegyzes[$i] = $megjegyzes;
        $aSpecClass[$i] = $specClass;
      
      } // foreach $a
     
      // Naphoz tartozó órarend azonosítójának lekérdezése
      // NOTE: - helyettesített nap esetén is a helyettesített nap dátumával dolgozunk
      $a = dbExec($db,'SELECT orarendID '.
        'FROM orarendek HAVING orarendID<="'.$dateValue.'" ORDER BY orarendID DESC LIMIT 1');
        
      $orarendID = $a[0]['orarendID'];
        
      for ($i = 0; $i < count($aNapTipus); $i++)
      {
        $dateDatas[] = array(
          'index'=>$dateIndex,
          'date'=>$date,
          'nap'=>$nap,
          'het'=>$het,
          'napTipus'=>$aNapTipus[$i],
          'noWork'=>(true == $aNoWork[$i])?1:0,
          'konDay'=>(true == $aKonDay[$i])?1:0,
          'specClass'=>(true == $aSpecClass[$i])?1:0,
          'orarendID'=>$orarendID,
          'megjegyzes'=>$aMegjegyzes[$i],
          'dateOriginal'=>(isset($dateOriginal)?$dateOriginal:$date),
          'hetOriginal'=>(isset($hetOriginal)?$hetOriginal:$het),
          'konoOsztalyNev'=>(isset($konoOsztalyNev)?$konoOsztalyNev:''),
          'aonoOsztalyNev'=>(isset($aonoOsztalyNev)?$aonoOsztalyNev:''),
          'aonoOraszam'=>(isset($aonoOraszam)?$aonoOraszam:''),
          'onaoaoOratol'=>(isset($onaoaoOratol)?$onaoaoOratol:''),
          'onaoaoOraig'=>(isset($onaoaoOraig)?$onaoaoOraig:'')
        );
      }
    
    }
    
    $d['dateDatas'] = $dateDatas;
    
    
    return $d;
  }
  
  /**
   * Megadott idõszak egy napjának az adatainak a tömbjét állítja elõ úgy, hogy visszaadja az indexét
   * NOTE: - IdoszakAsArray-jal elõállítjuk a dátumok adatainak a tömbjét, majd 
   *         a keresett dátumot adjuk eredményül   
   */     
  function IdoszakDayAsArray($db,$idoszakID,$date)
  {
    // Lekérdezzük az adatokat
    $d = IdoszakAsArray($db,$idoszakID);
    
    // Csak a kért dátum maradhat a tömbben
    $idData = null;
    for ($i = 0; $i < count($d['dateDatas']); $i++)
    {
      if ($date == $d['dateDatas'][$i]['date'])
        $idData = $d['dateDatas'][$i];
    }
    
    unset($d['dateDatas']);
    
    if (null !== $idData)
      $d['dateDatas'][0] = $idData;
    
    return $d;
  }
  
  /**
   * Az IdoszakAsArray által visszaadott tömbben kereshetünk dátum szerint.
   */     
  function FindInIdoszakAsArrayByDate($arr,$date)
  {
    foreach($arr as $dateIndex=>$dateValue)
      if ($dateValue['date'] == $date)
        return $dateValue;
  }
  
?>
