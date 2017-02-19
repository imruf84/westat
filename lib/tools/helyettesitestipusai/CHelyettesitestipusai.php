<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Helyettesítés típusainak a kezelését megvalósító osztály.
   */
  class CHelyettesitestipusai extends CService
  {
    // Helyettesítés típusainak nevei
    protected $tipusNames = array(0=>'Nem',
                                  1=>'Igen');
                                  
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_HELYETTESITESTIPUSA_LIST';
      $this->getDataListCBAction = 'GET_HELYETTESITESTIPUSA_LIST_CB';
      $this->getDataAction = 'GET_HELYETTESITESTIPUSA_DATA';
      $this->insertDataAction = 'INSERT_HELYETTESITESTIPUSA_DATA';
      $this->modifyDataAction = 'MODIFY_HELYETTESITESTIPUSA_DATA';
      $this->removeDataAction = 'REMOVE_HELYETTESITESTIPUSA_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'helyettesitestipusai';
      $this->primaryField = 'helyettesitestipusaID';
      $this->orderByFields = array('helyettesitestipusaNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['helyettesitestipusaNev'] = new CField('string','nWordSepBySpaceDot',$this->response,1,20);
      $this->fields['helyettesitestipusaNevH'] = new CField('string','nWordSepBySpaceDot',$this->response,1,20);
      $this->fields['osszevont'] = new CField('integer','',$this->response,0,1);
    }
    
    // @override
    function testDbValue2($field,$value)
    {
      if ('osszevont' == $field)
        return in_array($value,array_keys($this->tipusNames));
        
      return parent::testDbValue2($field,$value);
    }
    
    // @override
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
     // Helyettesítések típusainak a kilistázása az adatbázisról
      $rs = $this->getDataListQuery($fields);
      
      if (true != $rs)
        $this->response->sendError('Hiba a helyettesítések típusainak a lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $helytipusok = array();
      while ($record = $rs->FetchRow())
      {
        $helytipus = array();
        foreach ($record as $field => $value)
          $helytipus[$field] = utf8ToLatin2($value);
          
        // Egyéni elnevezések megadása
        $helytipus['osszevont'] = $this->tipusNames[$helytipus['osszevont']];
        
        $helytipusok[] = $helytipus;
      }
        
      // Helyettesítés típusainak a hozzáadása a válaszhoz
      $this->response->addArray($helytipusok);
    }
            
  }   
?>
