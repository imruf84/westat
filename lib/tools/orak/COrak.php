<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../../dbExec.php');
   
   
  /**
   * A függvény visszaadja egy felhasználó órarendi óráinak a számát adott nap és hét esetében.
   * 
   * @return {number ? Array of number} az órák száma, vagy az órák sorszáma       
   */     
  function getFelhasznaloOrai($db,$response,$felhasznaloID,$orarendID,$het,$nap,$kotelezo=true,$count=true)
  {
    // Ebben különbözik csak a kötelező és a nem kötelező órák lekérdezése
    $not = (true == $kotelezo) ? 'NOT' : '';
    // Az órák számára, vagy az órák sorszámára van-e szükségünk?
    $lCount = (true == $count) ? 'COUNT(*) AS orak' : 'ora';
    $orderBy = (true == $count) ? '' : 'ORDER BY ora';
    
    //$rs = $db->execute('SELECT COUNT(*) AS orak FROM orak WHERE '.
    $rs = $db->execute('SELECT '.$lCount.' FROM orak WHERE '.
          'orak.orarendID="'.$orarendID.'" AND orak.felhasznaloID='.$felhasznaloID.
          ' AND orak.het='.$het.' AND orak.nap='.$nap.
          ' AND orak.tantargyID '.$not.' IN (
            SELECT tantargyID FROM tantargyelsz WHERE 
              tantargyelsz.tanevID IN (
                SELECT tanevID
                FROM orarendek
                WHERE orarendek.orarendID = orak.orarendID
              ) AND
              tantargyelsz.felhasznaloID=orak.felhasznaloID AND
              tipus IN ("tkt","ef","tktgy","efgy")
            )'.$orderBy);
                        
    if (true != $rs)
      $response->sendError('Hiba a felhasználó óráinak lekérdezése közben '.
        '(órarend:'.$orarendID.',hét:'.$het.
        ',felhasználó azonosító:'.$felhasznaloID.')!',true);
        
    // Ha csak az órák számára van szükség akkor kilépünk...
    if (true == $count)
    {
      // Átalakítjuk az eredményt tömbbé
      $record = $rs->FetchRow();
      
      return $record['orak'];
    }
    
    // ...egyébként átalakítjuk az órák sorszámár tömbbé
    $rows = array();
    // Átalakítjuk utf8-ról latin2-re az adatokat...
    while ($record = $rs->FetchRow())
      $rows[] = $record['ora'];
    
    return $rows;
  }
   
  /**                                                        
   * Órák kezelését megvalósító osztály.
   */
  class COrak extends CService
  {
    // @override
    function addFields()
    {
      // Parancsok
      $this->getFelhasznaloHetiOraiAction = 'GET_FELHASZNALO_HETI_ORAI';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = '';
      $this->primaryField = '';
      
      // Mezők
      $this->fields['orarendID'] = new CField('string','date',$this->response,10,10);
      $this->fields['felhasznaloID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['osztalyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tantargyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['het'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['nap'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['ora'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
    }
    
    // @override
    // NOTE: - egyenlőre csak néhány funkció érhető el
    //       - az alapfunkciók nem használhatóak
    function doActionFunc($action)
    {
      switch ($action)
      {
        // Felhasználó óraszámainak a lekérdezése
        case $this->getFelhasznaloHetiOraiAction:
          $this->getfelhasznaloHetiOrai();
        break;
        default:
          $this->response->sendError('Ismeretlen parancs: '.$action,true);
      }
    }
    
    /**
     * Felhasználó adott órarendi óráinak a számának lekérdezése napi bontásban.
     * NOTE: - az egyszerűség kedvéért itt kérdezzük le az időszakhoz tartozó
     *         többi órarend adatait is       
     *       - az egyszerűség kedvéért lekérdezzük a kötelező órák sorszámát is,
     *         így kliens oldalon tudjuk elvégezni az adatok ellenörzését                  
     */         
    function getfelhasznaloHetiOrai()
    {
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      // Mezők értékei
      $values = $this->getDbFieldValues($fields);
      // Órarend azonosítója idézőjelek nélkül
      $orarendID = mb_substr($values['orarendID'],1,-1,'UTF-8');
      // Felhasználó azonosítója
      $felhasznaloID = $values['felhasznaloID'];
      // Órarend változata
      $het = $values['het'];
      
      // Napok óraszámai
      $orak = array();
      
      for ($i = 0; $i < 5; $i++)
      {
        $nap = 'nap'.$i;
        
        // Felhasználó kötelező óráinak az összeszámolása
        $orak[$nap.'k'] = getFelhasznaloOrai($this->db,$this->response,$felhasznaloID,$orarendID,$het,$i,true,true);
        // Felhasználó nem kötelező óráinak az összeszámolása
        $orak[$nap] = getFelhasznaloOrai($this->db,$this->response,$felhasznaloID,$orarendID,$het,$i,false,true);
        
        // Órák sorszámainak a lekérdezése
        // NOTE: - a kötelező órák túlóra kijelöléseinél van szerepe
        $orak[$nap.'k_orak'] = getFelhasznaloOrai($this->db,$this->response,$felhasznaloID,$orarendID,$het,$i,true,false);
      }
      
      // Válasz küldése                 
      $this->response->addArray($orak);
      
      
      // Időszak többi órarendjéhez tartozó órarendek lekérdezése
      
      // Órarendek listájának a lekérdezése
      $a = dbExec($this->db,
        'SELECT orarendID FROM orarendek WHERE tanevID IN
         (
           SELECT tanevID FROM orarendek WHERE orarendID="'.$orarendID.'"
         )
         AND NOT orarendID > "'.$orarendID.'"
         ORDER BY orarendID DESC
         LIMIT 0,5');
      
      // Órarend heteinek a száma
      
      // Ez tárolja majd a végeredményet
      $result = array();
      
      // Végig haladunk az órarendeken
      foreach ($a as $iOrarend)
      {
        $lOrarendID = $iOrarend['orarendID'];
        $result['orarendek'][$lOrarendID] = 0;
        
        // Adott órarend heteinek a lekérdezése
        $b = dbExec($this->db,'SELECT het FROM orak WHERE orarendID="'.$lOrarendID.'" GROUP BY het');
        $result['hetek_'.$lOrarendID] = count($b);
        
        foreach ($b as $iHet)
        {
          $lHet = $iHet['het'];
          for ($i = 0; $i < 5; $i++)
          {
            // Felhasználó kötelező óráinak az összeszámolása
            $result['ora'.$lHet.'_'.$i.'k_'.$lOrarendID] = getFelhasznaloOrai($this->db,$this->response,$felhasznaloID,$lOrarendID,$lHet,$i,true,true);
            // Felhasználó nem kötelező óráinak az összeszámolása
            $result['ora'.$lHet.'_'.$i.'_'.$lOrarendID] = getFelhasznaloOrai($this->db,$this->response,$felhasznaloID,$lOrarendID,$lHet,$i,false,true);
            // Felhasználó megadott kötelező órái
            $c = dbExec($this->db,'SELECT ora'.$i.' FROM kotelezoorak WHERE 
              felhasznaloID='.$felhasznaloID.' AND orarendID="'.$lOrarendID.'" AND het='.$lHet);
            $result['kotora'.$lHet.'_'.$i.'_'.$lOrarendID] = $c[0]['ora'.$i];
          }
        }
          
      }
      
      // Válasz küldése                 
      $this->response->addArray($result);
      
      // Elküldjük azt is, hogy a felhasználó óraadó és szakoktató-e?
      // NOTE: - óraadó esetén a kötelező óra 0, így le kell tiltani a kliens oldali vizsgálatokat
      $result = dbExec($this->db,'SELECT oraado,szakoktato FROM felhasznalok WHERE felhasznaloID='.$felhasznaloID);
                       
      $this->response->addElement('oraado', $result[0]['oraado']);
      $this->response->addElement('szakoktato', $result[0]['szakoktato']);
      
      // Elküldjük a felhasználó adott tanévre vonatkozó tantárgyelszámolását
      // NOTE: - ez az automatikus kötelezőórakijelöléshez kell, hogy el tudjuk dönteni a felhasználóról,
      //         hogy gyakorlati oktató-e (ebben az esetben már a heti kötelező óraszáma, mint a sima tanároknak)
      $result = dbExec($this->db,
        'SELECT 0 < COUNT(tipus) AS gyak FROM tantargyelsz WHERE 
         felhasznaloID='.$felhasznaloID.' 
         AND tipus="gyak"
         AND tanevID IN (SELECT tanevID FROM orarendek WHERE orarendID="'.$orarendID.'")');
                          
      $this->response->addElement('gyak', $result[0]['gyak']);
      
    }
    
  }   
?>
