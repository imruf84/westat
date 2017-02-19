<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Osztálycímkék kezelését megvalósító osztály.
   */
  class COsztalyCimkek extends CService
  {
    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_OSZTALY_CIMKEK_LIST';
      $this->getDataListCBAction = 'GET_OSZTALY_CIMKEK_LIST_CB';
      $this->getDataAction = 'GET_OSZTALY_CIMKEK_DATA';
      $this->insertDataAction = 'INSERT_OSZTALY_CIMKEK_DATA';
      $this->modifyDataAction = 'MODIFY_OSZTALY_CIMKEK_DATA';
      $this->removeDataAction = 'REMOVE_OSZTALY_CIMKEK_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'osztaly_cimkek';
      $this->primaryField = 'osztalyCimkeID';
      $this->orderByFields = array('osztalyCimkeNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tanevID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['osztalyCimkeNev'] = new CField('string','nWordSepBySpaceSpec',$this->response,1,20);
      $this->fields['osztalyCimkeNevO'] = new CField('string','nWordSepBySpaceSpec',$this->response,1,20);
      $this->fields['osztalyCimkeNevH'] = new CField('string','nWordSepBySpaceSpec',$this->response,1,20);
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
        $this->response->sendError('Hiba az osztály címkék lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $osztalyok = array();
      while ($record = $rs->FetchRow())
      {
        $osztaly = array();
        foreach ($record as $field => $value)
          $osztaly[$field] = utf8ToLatin2($value);
          
        $osztalyok[] = $osztaly;
      }
        
      // Órarendlista hozzáadása a válaszhoz
      $this->response->addArray($osztalyok);
    }
    
  }   
?>
