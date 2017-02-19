<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../idoszakok/IdoszakAsArray.php');
  require_once('../../dateDiff.php');
  require_once('../kiadottparancsok/Kiadottparancsok.php');
  
  
  /**
   * Hiányzás beszúrása.
   * NOTE: - azért kell külön függvénybe rakni az osztályon kívül, mert
   *         pl. a hihebetölt-ben is meghívjuk      
   **/      
  function insertHianyzasData($db,$response,$idoszakID,$felhasznaloID,$datum,$oratol,$oraig,$hianyzasokaID,$igazolt)
  {
    $d = IdoszakDayAsArray($db,$idoszakID,$datum);
      
    if (!(isset($d['dateDatas']))) 
    {
      $response->sendError('A megadott nap nem tartozik a megadott időszakba!',true);
      return;
    }
         
    // Nap meghatározása
    $kezdoHetElsoNap = $d['kezdoHetElsoNap'];
    $nap = $d['dateDatas'][0]['nap'];
    $het = $d['dateDatas'][0]['het'];
    
    // Rendhagyó nap
    $a = dbExec($db,'SELECT * FROM rnapok WHERE idoszakID='.$idoszakID.' AND datum="'.$datum.'"');
    // Nap típusa
    $napTipus = $d['dateDatas'][0]['napTipus'];
    // Volt-e munka aznap?
    $noWork = (1==$d['dateDatas'][0]['noWork'])?true:false;
    // Kötelező óra szerinti nap?
    $konDay = (1==$d['dateDatas'][0]['konDay'])?true:false;
      
    // Ha nem volt ezen a napon munka, akkor kilépünk
    if (true == $noWork) 
    {
      $response->sendError('A megadott napon nem volt tanítás!',true);
      return;
    }
      
    $orarendID = $d['dateDatas'][0]['orarendID'];

    // Ha nem találtunk megfelelő órarendet, akkor kilépünk
    if (!is_string($orarendID)) 
    {
      $response->sendError('A megadott naphoz nem található órarend!',true);
      return;
    }
        
    // TODO: - kezelni azt az esetet, amikor kevesebb, vagy több óra volt aznap
    for ($ora = min($oratol,$oraig); $ora <= max($oratol,$oraig); $ora++)
    {
      $b = dbExec($db,'SELECT osztalyID,tantargyID FROM orak WHERE
        orarendID="'.$orarendID.'" AND felhasznaloID='.$felhasznaloID.' AND 
        het='.$het.' AND nap='.$nap.' AND ora='.$ora.' AND tantargyID NOT IN
        (
          SELECT tantargyID FROM tantargyelsz WHERE 
            tantargyelsz.tanevID IN (
              SELECT tanevID
              FROM orarendek
              WHERE orarendek.orarendID = orak.orarendID
            ) AND
            tantargyelsz.felhasznaloID=orak.felhasznaloID AND
            tipus IN ("tkt","ef","tktgy","efgy")
          )' 
        );
          
      $osztalyID = $b[0]['osztalyID'];
      $tantargyID = $b[0]['tantargyID'];
        
      if (is_numeric($osztalyID) && is_numeric($tantargyID))
        $db->Execute('INSERT INTO hianyzasok 
          (felhasznaloID,idoszakID,osztalyID,tantargyID,ora,datum,hianyzasokaID,igazolt) 
           VALUES ('.$felhasznaloID.','.$idoszakID.','.$osztalyID.','.$tantargyID.','.
           $ora.',"'.$datum.'",'.$hianyzasokaID.','.$igazolt.')');
    }
    
  }
   
  /**                                                        
   * Hiányzások kezelését megvalósító osztály.
   */
  class CHianyzasok extends CService
  {
    // Hiányzás igazoltságának nevei
    protected $tipusNames = array(0=>'Nem',
                                  1=>'Igen');
                                  
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_HIANYZAS_LIST';
      $this->getDataAction = 'GET_HIANYZAS_DATA';
      $this->insertDataAction = 'INSERT_HIANYZAS_DATA';
      $this->modifyDataAction = 'MODIFY_HIANYZAS_DATA';
      $this->removeDataAction = 'REMOVE_HIANYZAS_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'hianyzasok';
      $this->primaryField = 'hianyzasID';
      $this->orderByFields = array('datum','ora');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['felhasznaloID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['idoszakID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['osztalyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tantargyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['ora'] = new CField('integer','',$this->response,0,13);
      $this->fields['oraig'] = new CField('string','posInt',$this->response,0,2);
      $this->fields['datum'] = new CField('string','date',$this->response,10,10);
      $this->fields['hianyzasokaID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['igazolt'] = new CField('integer','',$this->response,0,1);
    }
    
    // @override
    function testDbValue2($field,$value)
    {
      if ('igazolt' == $field)
        return in_array($value,array_keys($this->tipusNames));
        
      return parent::testDbValue2($field,$value);
    }
    
    // @override
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Hiányzások kilistázása az adatbázisról
      $a = $this->getFilters($_POST['FILTERS']);
      $filterFields = $a['fields'];
      $filterValues = $a['values'];
      
      $rs = $this->getDataListQuery($fields,$filterFields,$filterValues);
      
      if (true != $rs)
        $this->response->sendError('Hiba a hiányzások lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $hianyzasok = array();
      while ($record = $rs->FetchRow())
      {
        $hianyzas = array();
        foreach ($record as $field => $value)
          $hianyzas[$field] = utf8ToLatin2($value);
          
        // Egyéni elnevezések megadása
        $hianyzas['igazolt'] = $this->tipusNames[$hianyzas['igazolt']];
        
        $hianyzasok[] = $hianyzas;
      }
        
      // Helyettesítés típusainak a hozzáadása a válaszhoz
      $this->response->addArray($hianyzasok);
      
      // Eltároljuk a parancs lekérését
      $value = $this->getDbFieldValues(array('idoszakID','felhasznaloID'));
      logAction($this->db,$value['felhasznaloID'],$value['idoszakID'],$_POST['ACTION']);
    }
           
    // @override
    function getDataListQuery($fields,$filterFields,$filterValues)
    { 
      $filterExpr = $this->createFilterExpr($filterFields,$filterValues,true);
      
      $expr = '';
      if (in_array('osztalyNev',$fields))
      {
        //$expr .= ' LEFT JOIN osztaly_cimkek ON osztaly_cimkek.osztalyCimkeID='.$this->tableName.'.osztalyID';
        //$expr2 = ' GET_OSZTALY_NEV() AS osztalyNev ';
        $k = array_search('osztalyNev', $fields);
        $fields[$k] = ' GET_OSZTALY_NEV_BY_IDOSZAK('.$this->tableName.'.osztalyID,'.$this->tableName.'.idoszakID) AS osztalyNev ';
      }
      if (in_array('tantargyNev',$fields))
        $expr .= ' LEFT JOIN tantargyak ON tantargyak.tantargyID='.$this->tableName.'.tantargyID';
      if (in_array('hianyzasokaNev',$fields))
        $expr .= ' LEFT JOIN hianyzasokai ON hianyzasokai.hianyzasokaID='.$this->tableName.'.hianyzasokaID';
     
      // Ha szükségünk van extra adatokra akkor... 
      if ('' != $expr) {
      
        // ...új lekérdezést készítünk
        return $this->db->execute('SELECT '.implode(',',$fields).' FROM '.
          $this->tableName.$expr.$filterExpr.$this->getOrderByExpression());
      } else
        // Egyébként az eredeti lekérdezést futtatjuk
        return parent::getDataListQuery($fields,$filterFields,$filterValues);
    }
    
    // @override
    function insertData()
    {
      // Mezők listája
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Mezők értékei
      $values = $this->getDbFieldValues($fields);
      
      $idoszakID = $values['idoszakID'];
      $felhasznaloID = $values['felhasznaloID'];
      
      // Ellenőrizzük, hogy lezárt-e az időszak?
      checkAction(
        $this->db,$_POST['ACTION'],
        $idoszakID,
        $_SESSION['felhasznaloID'],
        $this->getFelhasznaloTipus($_SESSION['felhasznaloID']),
        $this->response
      );
      
      $datum = str_replace('.','-',substr($values['datum'],1,-1));
      
      $oratol = $values['ora'];
      $oraig = $values['oraig'];
      // Eltávolítjuk az idézőjeleket
      $oraig = (int)substr($oraig,1,-1);
      // Ha nem adtuk meg az 'óráig' mezőt, akkor az 'órától' mező lesz az értéke
      if ('' == $oraig || !is_numeric($oraig))
        $oraig = $oratol;
        
      // Ha nincs megadva az órától, akkor egész napos hiányzást nézünk
      if (!isset($oratol))
      {
        $oratol = 0;
        // Ideinglenesen egy nagy számot adunk meg
        // TODO: - kijavítani egy elengásabb megoldásra
        $oraig = 24;
      }
      
      // Lekérdezés elindítása  
      insertHianyzasData($this->db,$this->response,$idoszakID,$felhasznaloID,$datum,$oratol,$oraig,$values['hianyzasokaID'],$values['igazolt']);
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
