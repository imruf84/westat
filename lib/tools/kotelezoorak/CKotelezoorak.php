<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Kötelező órák kezelését megvalósító osztály.
   */
  class CKotelezoorak extends CService
  {    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_KOTELEZOORA_LIST';
      $this->getDataAction = 'GET_KOTELEZOORA_DATA';
      $this->insertDataAction = 'INSERT_KOTELEZOORA_DATA';
      $this->modifyDataAction = 'MODIFY_KOTELEZOORA_DATA';
      $this->removeDataAction = 'REMOVE_KOTELEZOORA_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'kotelezoorak';
      $this->primaryField = 'felhasznaloID';
      $this->orderByFields = array('felhasznaloNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['orarendID'] = new CField('string','date',$this->response,10,10);
      $this->fields['het'] = new CField('string','oneChar',$this->response,1,1);
      
      // NOTE: - azért tároljuk string-ben, mert így tudjuk kezelni csak az üres értékeket
      for ($i = 0; $i < 5; $i++)
      {
        // Kötelező óra
        $this->fields['ora'.$i] = new CField('string','posInt',$this->response,0,2);
        
        // Túlórák (2db)
        for ($j = 0; $j < 2; $j++)
          $this->fields['tulora'.$i.$j] = new CField('string','posInt',$this->response,0,2);
      }
    }
    
    /**
     * A függvény átalakítja a betűvel megadott hetet számmá.
     */         
    function hetCharToNumber($c)
    {
      $hetNapjai = array('A'=>0,'B'=>1,'C'=>2,'D'=>3,'E'=>4,'F'=>5);
      
      return $hetNapjai[$c];
    }
    
    // @override
    function getDataList()
    {
      // Alapadatok lekérdezése
      $value = $this->getDbFieldValues(array('orarendID','het'));
      
      $orarendID = mb_substr($value['orarendID'],1,-1,'UTF-8');
      $het = $this->hetCharToNumber(mb_substr($value['het'],1,-1,'UTF-8'));
        
      // Órarend kötelező óráinak a lekérdezése
      $rs = $this->db->execute('SELECT felhasznaloID FROM kotelezoorak WHERE '.
        'orarendID="'.$orarendID.'" AND het='.$het);
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a kötelező órák listájának lekérdezése során!',true);
      // Lekérdezés eredményének átalakítása tömbbé
      $kotelezoorak = array();
      while ($record = $rs->FetchRow())
        $kotelezoorak[] = $record['felhasznaloID'];
            
      // Felhasználók neveinek a lekérdezése
      // NOTE: - csak az adott vezetőhöz tartozó felhasználók neveit tartalmazza
      $rs = $this->db->execute('SELECT felhasznaloID,felhasznaloNev FROM felhasznalok '.
        'WHERE felhasznaloID IN ('.
        implode(',',$this->getFelhasznalokList($_SESSION['felhasznaloID'])).')'.
        $this->getOrderByExpression());
      
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a felhasználók listájának lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      // NOTE: - automatikusan hozzáadjuk a 'meghatarozva' mező értékeit is
      $felhasznalok = array();
      while ($record = $rs->FetchRow())
      {
        $felhasznaloID = $record['felhasznaloID'];
        $felhasznalok[] = array('felhasznaloID' => $felhasznaloID,
                                'felhasznaloNev' => utf8ToLatin2($record['felhasznaloNev']),
                                'meghatarozva' => (in_array($felhasznaloID,$kotelezoorak)) ? 'X' : '-');
      }
               
      // Válasz küldése                 
      $this->response->addArray($felhasznalok);
      
      return $rs;
    }
    
    /**
     * A függvény lecseréli az üres órákat NULL-ra
     * 
     * @param value {Array} az értékeket tartalmazó tömb           
     */         
    function changeEmptyToNull(&$values)
    {
      for ($i = 0; $i < 5; $i++)
      {
        if ('""' == $values['ora'.$i])
          $values['ora'.$i] = 'NULL';
          
        for ($j = 0; $j < 2; $j++)
          if ('""' == $values['tulora'.$i.$j])
            $values['tulora'.$i.$j] = 'NULL';
      }
    }
    
    // @override
    function insertDataQuery($fields,$values)
    {
      // Megváltoztatjuk a hét betűjelét számra.
      $values['het'] = $this->hetCharToNumber(mb_substr($values['het'],1,-1,'UTF-8'));
      
      // Ha nem adtunk meg órát, akkor NULL-t szúrunk be
      $this->changeEmptyToNull($values);
      
      return parent::insertDataQuery($fields,$values);
    }
    
    // @override
    function getData()
    {
      // Alapadatok lekérdezése
      $fields = $this->getDbFields($_POST['FIELDS']);
      $value = $this->getDbFieldValues($fields);
      
      $felhasznaloID = $value['felhasznaloID'];
      $orarendID = mb_substr($value['orarendID'],1,-1,'UTF-8');
      $het = $this->hetCharToNumber(mb_substr($value['het'],1,-1,'UTF-8'));
      
      // Felhasználó kötelező óráinak a lekérdezése
      $rs = $this->db->execute('SELECT ora0,ora1,ora2,ora3,ora4,'.
        'tulora00,tulora01,tulora10,tulora11,tulora20,tulora21,tulora30,tulora31,tulora40,tulora41 '.
        'FROM kotelezoorak WHERE orarendID="'.$orarendID.'" AND het='.$het.
        ' AND felhasznaloID='.$felhasznaloID);
      
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a felhasználó kötelező óráinak a lekérdezése során!',true);
      
      $this->response->addResult($rs);
        
      return $rs;
    }
    
    // @override
    function createModifyPairs($values)
    {
      $values['het'] = $this->hetCharToNumber(mb_substr($values['het'],1,-1,'UTF-8'));
      
      // Ha nem adtunk meg órát, akkor NULL-t szúrunk be
      $this->changeEmptyToNull($values);
      
      return parent::createModifyPairs($values);
    }
    
    // @override
    function createModifyExpression($fields,$values,$id)
    {
      $felhasznaloID = $values['felhasznaloID'];
      $orarendID = mb_substr($values['orarendID'],1,-1,'UTF-8');
      $het = $this->hetCharToNumber(mb_substr($values['het'],1,-1,'UTF-8'));
      
      return 'orarendID="'.$orarendID.'" AND felhasznaloID='.$felhasznaloID.' AND het='.$het;
    }
    
    // @override
    function createFilterExpr($filterFields,$filterValues,$addWhere)
    {
      $filterValues['het'] = $this->hetCharToNumber(mb_substr($filterValues['het'],1,-1,'UTF-8'));
      
      return parent::createFilterExpr($filterFields,$filterValues,$addWhere);
    }
          
    
  }
  
?>
