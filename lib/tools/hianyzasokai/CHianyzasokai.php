<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Hiányzás okainak a kezelését megvalósító osztály.
   */
  class CHianyzasokai extends CService
  {
    // Hiányzás okainak nevei
    protected $tipusNames = array(0=>'Nem',
                                  1=>'Igen');
                                  
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_HIANYZASOKA_LIST';
      $this->getDataListCBAction = 'GET_HIANYZASOKA_LIST_CB';
      $this->getDataAction = 'GET_HIANYZASOKA_DATA';
      $this->insertDataAction = 'INSERT_HIANYZASOKA_DATA';
      $this->modifyDataAction = 'MODIFY_HIANYZASOKA_DATA';
      $this->removeDataAction = 'REMOVE_HIANYZASOKA_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'hianyzasokai';
      $this->primaryField = 'hianyzasokaID';
      $this->orderByFields = array('hianyzasokaNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['hianyzasokaNev'] = new CField('string','nWordSepBySpaceDot',$this->response,1,20);
      $this->fields['hianyzasokaNevH'] = new CField('string','nWordSepBySpaceDot',$this->response,1,20);
      $this->fields['tamogatott'] = new CField('integer','',$this->response,0,1);
    }
    
    // @override
    function testDbValue2($field,$value)
    {
      if ('tamogatott' == $field)
        return in_array($value,array_keys($this->tipusNames));
        
      return parent::testDbValue2($field,$value);
    }
    
    // @override
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
     // Hiányzás okainak a kilistázása az adatbázisról
      $rs = $this->getDataListQuery($fields);
      
      if (true != $rs)
        $this->response->sendError('Hiba a hiányzás okainak a lekérdezése közben!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $hianyzasokai = array();
      while ($record = $rs->FetchRow())
      {
        $hianyzasoka = array();
        foreach ($record as $field => $value)
          $hianyzasoka[$field] = utf8ToLatin2($value);
          
        // Egyéni elnevezések megadása
        $hianyzasoka['tamogatott'] = $this->tipusNames[$hianyzasoka['tamogatott']];
        
        $hianyzasokai[] = $hianyzasoka;
      }
        
      // Helyettesítés típusainak a hozzáadása a válaszhoz
      $this->response->addArray($hianyzasokai);
    }
            
  }   
?>
