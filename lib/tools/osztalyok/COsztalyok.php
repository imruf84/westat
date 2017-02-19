<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**
   * A függvény visszaadja az adott tanévben még aktív osztály(ok) adatait.
   * @param db {AdoDB} adatbáziskapcsolat
   * @param tanevID {number} tanév azonosítója
   * @param osztalyID {number?null} osztály azonosítója      
   * @return {Array():any type?null} az eredmény tömbbé alakítva, vagy hiba esetén null   
   */     
  function OsztalyokGetOsztalyAsResult($db, $tanevID, $osztalyID = null)
  {
      return $db->execute(
        'SELECT 
          osztalyID,
          IF(IS_OSZTALY_INDULO(osztalyID,t2.tanevID),"X","") AS indulo,t1.tanevNev,
          GET_OSZTALY_NEV(osztalyID,t2.tanevID) AS osztalyNev,
          tipus 
         FROM osztalyok 
         LEFT JOIN tanevek t1 ON t1.tanevID=osztalyok.tanevID 
         LEFT JOIN tanevek t2 ON t2.tanevID='.$tanevID.'
         WHERE 
          IS_OSZTALY_AKTIV(osztalyID,t2.tanevID) '.
        (null == $osztalyID ? '' : ' AND osztalyID='.$osztalyID).'  
          ORDER BY osztalyNev');
          
  }
   
  /**                                                        
   * Osztályok kezelését megvalósító osztály.
   */
  class COsztalyok extends CService
  {
    // Osztály típusainak nevei
    protected $tipusNames = array('szi'=>'Szakiskola',
                                  'szki'=>'Szakközépiskola',
                                  'int'=>'Intenzív',
                                  'est'=>'Esti',
                                  'egy'=>'Egyéb');
    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_OSZTALYOK_LIST';
      $this->getDataListCBAction = 'GET_OSZTALYOK_LIST_CB';
      $this->getDataAction = 'GET_OSZTALYOK_DATA';
      $this->insertDataAction = 'INSERT_OSZTALYOK_DATA';
      $this->modifyDataAction = 'MODIFY_OSZTALYOK_DATA';
      $this->removeDataAction = 'REMOVE_OSZTALYOK_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'osztalyok';
      $this->primaryField = 'osztalyID';
      $this->orderByFields = array('osztalyNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tanevID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['kezdoevfolyam'] = new CField('integer','',$this->response,9,15);
      $this->fields['betujel'] = new CField('string','oneCharOrNumber',$this->response,1,1);
      $this->fields['idotartam'] = new CField('integer','',$this->response,1,6);
      $this->fields['tipus'] = new CField('string','oneWord',$this->response,1,5);
    }
    
    // @override
    function testDbValue2($field,$value)
    {
      if ('tipus' == $field)
        return in_array($value,array_keys($this->tipusNames));
        
      return parent::testDbValue2($field,$value);
    }
    
    // @override
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Szűrők listájának lekérdezése, tesztelése
      $a = $this->getFilters($_POST['FILTERS']);
      $filterFields = $a['fields'];
      $filterValues = $a['values'];
      
      // Osztályok kilistázása az adatbázisról
      $rs = $this->getDataListQuery($fields,$filterFields,$filterValues);
      
      if (true != $rs)
        $this->response->sendError('Hiba az osztályok lekérdezése során! ['.$this->db->ErrorMsg().']',true);
      
      // Átalakítjuk az eredményt tömbbé
      $osztalyok = array();
      while ($record = $rs->FetchRow())
      {
        $osztaly = array();
        foreach ($record as $field => $value)
          $osztaly[$field] = utf8ToLatin2($value);
          
        // Egyéni elnevezések megadása
        $osztaly['tipus'] = $this->tipusNames[$osztaly['tipus']];
        
        $osztalyok[] = $osztaly;
      }
        
      // Órarendlista hozzáadása a válaszhoz
      $this->response->addArray($osztalyok);
    }
    
    // @override
    function getDataListQuery($fields,$filterFields,$filterValues)
    {
      $tanevID = $filterValues['tanevID'];
      
      // Alapértelmezésben a kért mezőnevekkel dolgozunk.
      return OsztalyokGetOsztalyAsResult($this->db, $tanevID, null);
    }
    
  }   
?>
