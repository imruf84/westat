<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Osztálycsoportok kezelését megvalósító osztály.
   */
  class COsztalyCsoportok extends CService
  {
    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_OSZTALY_CSOPORTOK_LIST';
      $this->getDataListCBAction = 'GET_OSZTALY_CSOPORTOK_LIST_CB';
      $this->getDataAction = 'GET_OSZTALY_CSOPORTOK_DATA';
      $this->insertDataAction = 'INSERT_OSZTALY_CSOPORTOK_DATA';
      $this->modifyDataAction = 'MODIFY_OSZTALY_CSOPORTOK_DATA';
      $this->removeDataAction = 'REMOVE_OSZTALY_CSOPORTOK_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'osztalycsoportok';
      $this->primaryField = 'osztalyCsoportID';
      $this->orderByFields = array('szakmaCsoportNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tanevID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      // A -1-et is megengedjük értékként
      $this->fields['osztalyID'] = new CField('integer','',$this->response,-1,PHP_INT_MAX);
      $this->fields['szakmaCsoportID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
    }
    
    // @override
    function getDataListQuery($fields,$filterFields,$filterValues)
    {
      $tanevID = $filterValues['tanevID'];
      $osztalyID = $filterValues['osztalyID'];
      
      // Alapértelmezésben a kért mezőnevekkel dolgozunk.
      return $this->db->execute(
        'SELECT osztalycsoportok.osztalyCsoportID, GET_OSZTALY_NEV(osztalycsoportok.osztalyID,osztalycsoportok.tanevID) AS osztalyNev, szakmaCsoportNev FROM osztalycsoportok
         LEFT JOIN szakmacsoportok ON osztalycsoportok.szakmaCsoportID=szakmacsoportok.szakmaCsoportID
         LEFT JOIN osztalyok ON osztalycsoportok.osztalyID=osztalyok.osztalyID
         WHERE 
         osztalycsoportok.tanevID='.$tanevID.(-1 == $osztalyID ? '' : ' AND osztalycsoportok.osztalyID='.$osztalyID).
         ' ORDER BY szakmaCsoportNev,osztalyNev');
    }
    
  }   
?>
