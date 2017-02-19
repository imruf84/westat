<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Szakmacsoportok kezelését megvalósító osztály.
   */
  class CSzakmaCsoportok extends CService
  { 
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_SZAKMACSOPORTOK_LIST';
      $this->getDataListCBAction = 'GET_SZAKMACSOPORTOK_LIST_CB';
      $this->getDataAction = 'GET_SZAKMACSOPORTOK_DATA';
      $this->insertDataAction = 'INSERT_SZAKMACSOPORTOK_DATA';
      $this->modifyDataAction = 'MODIFY_SZAKMACSOPORTOK_DATA';
      $this->removeDataAction = 'REMOVE_SZAKMACSOPORTOK_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'szakmacsoportok';
      $this->primaryField = 'szakmaCsoportID';
      $this->orderByFields = array('szakmaCsoportNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['szakmaCsoportNev'] = new CField('string','nWordSepBySpaceSpec',$this->response,1,50);
    }
    
  }   
?>
