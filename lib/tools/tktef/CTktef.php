<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../idoszakok/IdoszakAsArray.php');
  require_once('../kiadottparancsok/Kiadottparancsok.php');
   
  /**                                                        
   * Tanórán kívüli tevékenységek kezelését megvalósító osztály.
   */
  class CTktef extends CService
  {
    // Díjazottság nevei
    protected $dijazottNames = array(0=>'Nem',
                                     1=>'Igen');
    protected $csoportosNames = array(0=>'Nem',
                                      1=>'Igen');
                                  
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_TKTEF_LIST';
      $this->getDataAction = 'GET_TKTEF_DATA';
      $this->insertDataAction = 'INSERT_TKTEF_DATA';
      $this->modifyDataAction = 'MODIFY_TKTEF_DATA';
      $this->removeDataAction = 'REMOVE_TKTEF_LIST';
      $this->loadLessonsAction = 'LOAD_TKTEF_LESSONS';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'tktef';
      $this->primaryField = 'tktefID';
      $this->orderByFields = array('datum');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['felhasznaloID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['idoszakID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tantargyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['oraszam'] = new CField('integer','',$this->response,1,13);
      $this->fields['datum'] = new CField('string','date',$this->response,10,10);
      $this->fields['csoportos'] = new CField('integer','',$this->response,0,1);
      $this->fields['dijazott'] = new CField('integer','',$this->response,0,1);
    }
    
    // @override
    function doActionFunc($action)
    {
      switch ($action)
      {
        // Tevékenységek betöltése
        case $this->loadLessonsAction:
          $this->loadLessons();
        break;
        default:
          parent::doActionFunc($action);
      }
    }
    
    // @override
    function testDbValue2($field,$value)
    {
      if ('dijazott' == $field)
        return in_array($value,array_keys($this->dijazottNames));
      if ('csoportos' == $field)
        return in_array($value,array_keys($this->csoportosNames));
        
      return parent::testDbValue2($field,$value);
    }
    
    // @override
    function getDataListQuery($fields,$filterFields,$filterValues)
    { 
      $filterExpr = $this->createFilterExpr($filterFields,$filterValues,true);
      
      $expr = '';
      if (in_array('tantargyNev',$fields))
        $expr .= ' LEFT JOIN tantargyak ON tantargyak.tantargyID='.$this->tableName.'.tantargyID';
     
      // Ha szükségünk van extra adatokra akkor... 
      if ('' != $expr)
        // ...új lekérdezést készítünk
        return $this->db->execute('SELECT '.implode(',',$fields).' FROM '.
          $this->tableName.$expr.$filterExpr.$this->getOrderByExpression());
      else
        // Egyébként az eredeti lekérdezést futtatjuk
        return parent::getDataListQuery($fields,$filterFields,$filterValues);
    }
    
    
    // @override
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      $a = $this->getFilters($_POST['FILTERS']);
      $filterFields = $a['fields'];
      $filterValues = $a['values'];
      
     // Hiányzás okainak a kilistázása az adatbázisról
      $rs = $this->getDataListQuery($fields,$filterFields,$filterValues);
      
      if (true != $rs)
        $this->response->sendError('Hiba a tanórán kívüli tevékenységek lekérdezése közben!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $tktefek = array();
      while ($record = $rs->FetchRow())
      {
        $tktef = array();
        foreach ($record as $field => $value)
          $tktef[$field] = utf8ToLatin2($value);
          
        // Egyéni elnevezések megadása
        $tktef['dijazott'] = $this->dijazottNames[$tktef['dijazott']];
        $tktef['csoportos'] = $this->dijazottNames[$tktef['csoportos']];
        
        $tktefek[] = $tktef;
      }
        
      // Helyettesítés típusainak a hozzáadása a válaszhoz
      $this->response->addArray($tktefek);
      
      // Mivel ebből származtatunk más osztályokat, ahol nincs szükség a parancs tárolására,
      // ezért megvizsgáljuk ezt
      if (isset($this->dontLogAction) && $this->dontLogAction) return $rs;
      
      // Eltároljuk a parancs lekérését
      $value = $this->getDbFieldValues(array('idoszakID','felhasznaloID'));
      logAction($this->db,$value['felhasznaloID'],$value['idoszakID'],$_POST['ACTION']);
    }
    
    /**
     * Tevékenységek betöltése.
     * NOTE: - az órarend alapján betölti az adatbázisba az adott időszakhoz
     *         tartozó tevékenységeket     
     */         
    function loadLessons()
    {
      // Alapadatok tárolása
      $filterFields = array();
      $filterValues = array();
      $filters = $_POST['FILTERS'];   
      if (isset($filters))
      {
        $filterFields = $this->getDbFields($filters);
        $filterValues = $this->getDbFieldValues($filterFields);
      }
      
      $idoszakID = $filterValues['idoszakID'];
      $felhasznaloID = $filterValues['felhasznaloID'];
      
      
      $db = $this->db;
      
      $db->Execute('START TRANSACTION');
      
      // Időszak adatai
      $d = IdoszakAsArray($db,$idoszakID);
    
      // Végig haladunk a napokon és megadjuk a vele kapcsolatos adatokat
      //foreach ($d['dateDatas'] as $dateIndex=>$dateValue)
      foreach ($d['dateDatas'] as $dateValue)
      {
        // Lokális változó tárolja a dátumot
        $date = $dateValue['date'];
        
        $dateIndex = array_search($date,$d['dates']);
      
        // Nap száma (Hétfő=0)
        $nap = $dateValue['nap'];
        // Órarend változata (A=0,B=1 hét)
        $het = $dateValue['het'];
    
        // Nap típusa
        $napTipus = $dateValue['napTipus'];
        // Volt-e munka aznap?
        $noWork = (1==$dateValue['noWork'])?true:false;
        // Kötelező óra szerinti nap?
        $konDay = (1==$dateValue['konDay'])?true:false;
        
        // Ha nem volt ezen a napon munka, akkor tovább lépünk a következőre
        if (true == $noWork) continue;
      
        // Naphoz tartozó órarend azonosítója
        $orarendID = $dateValue['orarendID'];

        // Ha nem találtunk megfelelő órarendet, akkor tovább lépünk
        if (!is_string($orarendID)) continue;
      
        // Osztályok és óraszámok lekérdezése
        // NOTE: - csak a tanórán kívüli tevékenységek kellenek
        $a = dbExec($db,
          //'SELECT osztaly_cimkek.osztalyCimkeNev,COUNT(orak.ora) AS oraszam, orak.tantargyID AS tID
          'SELECT COUNT(orak.ora) AS oraszam, orak.tantargyID AS tID
           FROM orak '.
          // LEFT JOIN osztaly_cimkek ON osztaly_cimkek.osztalyCimkeID = orak.osztalyID
          'LEFT JOIN tantargyak ON tantargyak.tantargyID = orak.tantargyID
           WHERE orak.orarendID = "'.$orarendID.'"
           AND orak.het = '.$het.'
           AND orak.nap = '.$nap.'
           AND orak.felhasznaloID = '.$felhasznaloID.'
           AND orak.tantargyID IN (
             SELECT tantargyID FROM tantargyelsz WHERE 
              tantargyelsz.tanevID IN (
                SELECT tanevID
                FROM orarendek
                WHERE orarendek.orarendID = orak.orarendID
              ) AND
              tantargyelsz.felhasznaloID = orak.felhasznaloID AND
              tipus IN ("tkt","ef","tktgy","efgy")
           )
           GROUP BY orak.tantargyID');
           
        // Tevékenységek adatbázisba írása
        foreach ($a as $index=>$value)
        {
          $db->execute(
            'INSERT INTO tktef (felhasznaloID,idoszakID,tantargyID,oraszam,datum) 
             VALUES ('.$felhasznaloID.','.$idoszakID.','.$value['tID'].','.$value['oraszam'].',"'.$date.'")');
        }
      
      }
    
      $db->Execute('COMMIT');
        
    }
    
    // @override
    function insertData()
    {
      $values = $this->getDbFieldValues(array('idoszakID'));
      
      // Ellenőrizzük, hogy lezárt-e az időszak?
      checkAction(
        $this->db,$_POST['ACTION'],
        $values['idoszakID'],
        $_SESSION['felhasznaloID'],
        $this->getFelhasznaloTipus($_SESSION['felhasznaloID']),
        $this->response
      );
      
      return parent::insertData();
    }
    
    // @override
    function removeDataList()
    {
      $filters = $this->getFilters($_POST['FILTERS']);
      
      // Ellenőrizzük, hogy lezárt-e az időszak?
      checkAction(
        $this->db,$_POST['ACTION'],
        $filters['values']['idoszakID'],
        $_SESSION['felhasznaloID'],
        $this->getFelhasznaloTipus($_SESSION['felhasznaloID']),
        $this->response
      );
      
      return parent::removeDataList();  
    }
    
    // @override
    function modifyData()
    {
      $values = $this->getDbFieldValues(array('idoszakID'));
      
      // Ellenőrizzük, hogy lezárt-e az időszak?
      checkAction(
        $this->db,$_POST['ACTION'],
        $values['idoszakID'],
        $_SESSION['felhasznaloID'],
        $this->getFelhasznaloTipus($_SESSION['felhasznaloID']),
        $this->response
      );
           
      return parent::modifyData();  
    }
        
  }   
?>
