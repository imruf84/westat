<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../kiadottparancsok/Kiadottparancsok.php');
   
  /**                                                        
   * Helyettesítések kezelését megvalósító osztály.
   */
  class CHelyettesitesek extends CService
  {
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_HELYETTESITES_LIST';
      $this->getDataAction = 'GET_HELYETTESITES_DATA';
      $this->insertDataAction = 'INSERT_HELYETTESITES_DATA';
      $this->modifyDataAction = 'MODIFY_HELYETTESITES_DATA';
      $this->removeDataAction = 'REMOVE_HELYETTESITES_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'helyettesitesek';
      $this->primaryField = 'helyettesitesID';
      $this->orderByFields = array('datum','ora');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['helyettesitoID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['helyettesitettID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['idoszakID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['osztalyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tantargyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['ora'] = new CField('integer','',$this->response,0,13);
      $this->fields['datum'] = new CField('string','date',$this->response,10,10);
      $this->fields['helyettesitestipusaID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['torolve'] = new CField('integer','',$this->response,-1,1);
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
        $this->response->sendError('Hiba a helyettesítések lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $helyettesitesek = array();
      $torolveNames = array(0=>'Nem törölt',1=>'Törölt');
      while ($record = $rs->FetchRow())
      {
        $helyettesites = array();
        foreach ($record as $field => $value)
          $helyettesites[$field] = utf8ToLatin2($value);
          
        // Egyéni elnevezések megadása
        $helyettesites['torolve'] = $torolveNames[$helyettesites['torolve']];
        
        $helyettesitesek[] = $helyettesites;
      }
        
      // Helyettesítés típusainak a hozzáadása a válaszhoz
      $this->response->addArray($helyettesitesek);
      
      
      // Mivel ebből származtatunk más osztályokat, ahol nincs szükség a parancs tárolására,
      // ezért megvizsgáljuk ezt
      if (isset($this->dontLogAction) && $this->dontLogAction) return $rs;
      
      // Eltároljuk a parancs lekérését
      $value = $this->getDbFieldValues(array('idoszakID','helyettesitoID'));
      logAction($this->db,$value['helyettesitoID'],$value['idoszakID'],$_POST['ACTION']);
      
      return $rs;
    } 
    
    // @override
    function getDataListQuery($fields,$filterFields,$filterValues)
    { 
      // Eltároljuk a törölve státuszt
      $torolve = $filterValues['torolve'];

      // Ha szükséges, akkor töröljük a törölve státuszt a szűrők listájából
      if (0 > $torolve)
      {
        unset($filterFields[array_search('torolve',$filterFields)]);
        unset($filterValues['torolve']);
      }
      
      $filterExpr = $this->createFilterExpr($filterFields,$filterValues,true);
      
      $expr = '';
      if (in_array('osztalyNev',$fields)) {
        //$expr .= ' LEFT JOIN osztaly_cimkek ON osztaly_cimkek.osztalyCimkeID='.$this->tableName.'.osztalyID';
        $k = array_search('osztalyNev', $fields);
        $fields[$k] = ' GET_OSZTALY_NEV_BY_IDOSZAK('.$this->tableName.'.osztalyID,'.$this->tableName.'.idoszakID) AS osztalyNev ';
      }
      if (in_array('tantargyNev',$fields))
        $expr .= ' LEFT JOIN tantargyak ON tantargyak.tantargyID='.$this->tableName.'.tantargyID';
      if (in_array('felhasznaloNev',$fields))
        $expr .= ' LEFT JOIN felhasznalok ON felhasznalok.felhasznaloID='.$this->tableName.'.helyettesitettID';
      if (in_array('helyettesitestipusaNev',$fields))
        $expr .= ' LEFT JOIN helyettesitestipusai ON helyettesitestipusai.helyettesitestipusaID='.
          $this->tableName.'.helyettesitestipusaID';
     
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
    function createRemoveExpression($ids)
    {
      $a = $this->getFilters($_POST['FILTERS']);
      
      // Töröljük a törölve mezőt a szűrőkből
      unset($a['fields'][array_search('torolve',$a['fields'])]);
      unset($a['values']['torolve']);
      
      $filterExpr = $this->createFilterExpr($a['fields'],$a['values'],false);
      if ('' != $filterExpr)
        $filterExpr = ' AND '.$filterExpr;
      
      return $this->primaryField.' IN ('.implode(',',$ids).')'.$filterExpr;
    }
    
    // @override
    // NOTE: - tényleges törlés helyett csak megjelöljük a sorokat
    function forceRemoveDataList($ids)
    {
      // Feltétel létrehozása
      $expr = $this->createRemoveExpression($ids);
      
      // Lekérdezés elindítása
      
      // Először véglegesen töröljük a már megjelölt elemeket...
      $this->db->Execute('DELETE FROM '.$this->tableName.' WHERE '.$expr.' AND torolve=1');
      // ...majd megjelöljük törlésre a még nem törölt elemeket
      return $this->db->Execute('UPDATE '.$this->tableName.' SET torolve=1 WHERE '.$expr);
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
