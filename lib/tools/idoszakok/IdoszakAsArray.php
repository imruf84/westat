<?php
  require_once('../../dbExec.php');

  /**
   * Megadott id�szak napjainak a t�mbj�t �ll�tja el�.
   */
  function IdoszakDataAsArray($db,$idoszakID)
  {
    // Id�szak adatai
    $a = dbExec($db,'SELECT * FROM idoszakok WHERE idoszakID='.$idoszakID);
    
    // Tan�v azonos�t�ja
    $tanevID = $a[0]['tanevID'];
    
    // H�t els� napja
    $kezdoHetElsoNap = $a[0]['kezdoHetElsoNap'];
    // Kezd� h�t bet�jele
    $kezdoHetBetujel = $a[0]['kezdoHetBetujel'];
    // NOTE: - a k�s�bbiekben csak sz�mokra lesz sz�ks�g�nk (A->0, B->1, stb.)
    $hetBetui = array('A','B','C','D','E');
    $kezdoHet = array_search($kezdoHetBetujel,$hetBetui);

    // El��ll�tjuk a d�tumok t�mbj�t
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
    
    
    // V�lasz el��ll�t�sa
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
   * Megadott id�szak napjainak �s azok adatainak a t�mbj�t �ll�tja el�.
   * NOTE: - IdoszakDataAsArray-jal el��ll�tjuk a d�tumok t�mbj�t, majd hozz��rjuk
   *         a d�tumhoz tartoz� adatokat      
   */     
  function IdoszakAsArray($db,$idoszakID)
  {
    $d = IdoszakDataAsArray($db,$idoszakID);
    
    $kezdoHet = $d['kezdoHetValtozat'];
    $hetBetui = array('A','B','C','D','E');
    
    // Elt�roljuk a d�tumok t�mbj�t
    $dates = $d['dates'];
    
    $dateDatas = array();
    
    // V�gig haladunk a napokon �s megadjuk a vele kapcsolatos adatokat
    foreach ($dates as $dateIndex=>$dateValue)
    {
      // Lok�lis v�ltoz� t�rolja a d�tumot
      // NOTE: - helyettes�tett nap eset�n az �j d�tum lesz az �rt�ke
      // TIPP: - a $date v�ltoz� tartalmazza a megtartott nap d�tum�t, m�g a
      //         $dateValue bizonyos esetekben a helyettes�tett napot jelenti 
      $date = $dateValue;
      
      // Nap sz�m�nak a meghat�roz�sa (H�tf�=0)
      $nap = $dateIndex % 5;
      // �rarend v�ltozat�nak a meghat�roz�sa (A=0,B=1 h�t)
      $het = abs($kezdoHet - ((int)($dateIndex / 5) % 2));
    
      // Rendhagy� napok
      
      // Ezek t�rolj�k a rendhagy� napok adatait
      // NOTE: - az�rt kell t�mb, mert ugyanaz a nap lehet t�bbf�le t�p�s� is
      $aNapTipus = array('');
      // Volt-e munka aznap?
      $aNoWork = array(false);
      // K�telez� �ra szerinti nap?
      $aKonDay = array(false);
      // Megjegyz�s
      $aMegjegyzes = array('');
      // Adott oszt�ly
      $aSpecClass = array(false);
      
      
      // NOTE: - a rendez�s az�rt kell, hogy pl a kon nap megel�zze a hn-et a sorban,
      //         mert ha nem, akkor nem a k�telez� �rasz�m ker�l az elsz�mol�sba,
      //         hanem az aznapi �rarendi �ra
      $a = dbExec($db,'SELECT * FROM rnapok WHERE idoszakID='.$idoszakID.' AND datum="'.$date.'" ORDER BY tipus DESC');
      foreach ($a as $i=>$val)
      {
        $napTipus = '';
        // Volt-e munka aznap?
        $noWork = false;
        // K�telez� �ra szerinti nap?
        $konDay = false;
        // Megjegyz�s
        $megjegyzes = '';
        // Adott oszt�ly
        $specClass = false;
      
        $napTipus = $val['tipus'];
      
        if (is_string($napTipus))
        {
          // T�pus (Napok)
          switch ($napTipus)
          {
            case 'ikn':
            case 'mszn':
            case 'tnm':
              // Ezeken a t�pus� napokon nincs munka
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
              // a helyettes�t� d�tummal dolgozunk tov�bb
              //$date = $val['hnDatum'];
            
              $dateOriginal = $date;
              $date = $val['hnDatum'];
              // a helyettes�t� nap het�nek a sorsz�ma is kell
              $hetOriginal = $het;
              $het = array_search($val['hnHet'],$hetBetui);

              // NOTE: - ez nem kell, mert az eredeti d�tummal dolgozunk tov�bb
              /*$napNevek = array('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday');
              $d = explode('-',$date);
              $month = $d[1];
              $day = $d[2];
              $year = $d[0];
              $nap = array_search(date("l", mktime(0,0,0,$month,$day,$year)),$napNevek);*/
            
            
              // NOTE: - az eredeti nappal dolgozunk tov�bb
              $date = $dateValue;
            
            break;
            case 'onaoao':
              $onaoaoOratol = $val['onaoaoOratol'];
              $onaoaoOraig = $val['onaoaoOraig'];
            break;
          }
          
          
          // Megjegyz�s (40 �ra)
          $megjegyzes = (is_string($val['megjegyzes']) && $val['megjegyzes'] != '') ? $val['megjegyzes'] : '';
        } // if tipus string
        
        // Rendhagy� nap adatainak a t�rol�sa
        $aNapTipus[$i] = $napTipus;
        $aNoWork[$i] = $noWork;
        $aKonDay[$i] = $konDay;
        $aMegjegyzes[$i] = $megjegyzes;
        $aSpecClass[$i] = $specClass;
      
      } // foreach $a
     
      // Naphoz tartoz� �rarend azonos�t�j�nak lek�rdez�se
      // NOTE: - helyettes�tett nap eset�n is a helyettes�tett nap d�tum�val dolgozunk
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
   * Megadott id�szak egy napj�nak az adatainak a t�mbj�t �ll�tja el� �gy, hogy visszaadja az index�t
   * NOTE: - IdoszakAsArray-jal el��ll�tjuk a d�tumok adatainak a t�mbj�t, majd 
   *         a keresett d�tumot adjuk eredm�ny�l   
   */     
  function IdoszakDayAsArray($db,$idoszakID,$date)
  {
    // Lek�rdezz�k az adatokat
    $d = IdoszakAsArray($db,$idoszakID);
    
    // Csak a k�rt d�tum maradhat a t�mbben
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
   * Az IdoszakAsArray �ltal visszaadott t�mbben kereshet�nk d�tum szerint.
   */     
  function FindInIdoszakAsArrayByDate($arr,$date)
  {
    foreach($arr as $dateIndex=>$dateValue)
      if ($dateValue['date'] == $date)
        return $dateValue;
  }
  
?>
