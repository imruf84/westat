<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Tantárgyak kezelését megvalósító osztály.
   */
  class CTantargyak extends CService
  { 
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_TANTARGY_LIST';
      $this->getDataListCBAction = 'GET_TANTARGY_LIST_CB';
      $this->getDataAction = 'GET_TANTARGY_DATA';
      $this->insertDataAction = 'INSERT_TANTARGY_DATA';
      $this->modifyDataAction = 'MODIFY_TANTARGY_DATA';
      $this->removeDataAction = 'REMOVE_TANTARGY_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'tantargyak';
      $this->primaryField = 'tantargyID';
      $this->orderByFields = array('tantargyNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tantargyNev'] = new CField('string','nWordSepBySpaceSpec',$this->response,1,100);
    }
    
    // @override
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Szűrők listájának lekérdezése, tesztelése
      // Ha nem adunk meg típust a szűrőben, akkor mindenféle tantárgy le lesz kérdezve 
      $rs = null;
      $tipusok = $_POST['tipusok'];
      if (isset($tipusok))
      {
        $tipusok = explode(',',$tipusok);
        for ($i = 0; $i < count($tipusok); $i++)
          $tipusok[$i] = '"'.$tipusok[$i].'"';
        
        $rs = $this->db->execute('SELECT '.implode(',',$fields).' FROM '.
          $this->tableName.' WHERE tipus IN('.implode(',',$tipusok).')'.
          $this->getOrderByExpression());
      }
      else      
        $rs = $this->getDataListQuery($fields);
      
      if (true != $rs)
        $this->response->sendError('Hiba a tantárgyak lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $tantargyak = array();
      while ($record = $rs->FetchRow())
      {
        $tantargy = array();
        foreach ($record as $field => $value)
          $tantargy[$field] = utf8ToLatin2($value);
          
        // Egyéni elnevezések megadása
        $tantargy['tipus'] = $this->tipusNames[$tantargy['tipus']];
        
        $tantargyak[] = $tantargy;
      }
        
      // Órarendlista hozzáadása a válaszhoz
      $this->response->addArray($tantargyak);
    }
    
  }   
?>
