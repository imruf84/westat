<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Kötelező órák kezelését megvalósító osztály.
   */
  class CEgyeniorakedv extends CService
  {    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_EGYENIORAKEDV_LIST';
      $this->getDataAction = 'GET_EGYENIORAKEDV_DATA';
      $this->insertDataAction = 'INSERT_EGYENIORAKEDV_DATA';
      $this->modifyDataAction = 'MODIFY_EGYENIORAKEDV_DATA';
      $this->removeDataAction = 'REMOVE_EGYENIORAKEDV_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'egyeniorakedv';
      $this->primaryField = 'felhasznaloID';
      $this->orderByFields = array('felhasznaloNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tanevID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['oraA'] = new CField('integer','',$this->response,0,24);
      $this->fields['oraKotelezoA'] = new CField('integer','',$this->response,0,24);
      $this->fields['oraB'] = new CField('integer','',$this->response,0,24);
      $this->fields['oraKotelezoB'] = new CField('integer','',$this->response,0,24);
    }
  
    // @override
    function getDataList()
    {
      // Alapadatok lekérdezése
      $value = $this->getDbFieldValues(array('tanevID'));
      
      $tanevID = $value['tanevID'];
        
      // Tanév egyéni órakedvezményeinek a lekérdezése
      $rs = $this->db->execute('SELECT felhasznaloID FROM egyeniorakedv WHERE '.
        'tanevID='.$tanevID);
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba az egyéni órakedvezmények listájának lekérdezése során!',true);
      // Lekérdezés eredményének átalakítása tömbbé
      $egyeniorakedvk = array();
      while ($record = $rs->FetchRow())
        $egyeniorakedvk[] = $record['felhasznaloID'];
            
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
                                'meghatarozva' => (in_array($felhasznaloID,$egyeniorakedvk)) ? 'X' : '-');
      }
               
      // Válasz küldése                 
      $this->response->addArray($felhasznalok);
      
      return $rs;
    }
    
    // @override
    function getData()
    {
      // Alapadatok lekérdezése
      $fields = $this->getDbFields($_POST['FIELDS']);
      $value = $this->getDbFieldValues($fields);
      
      $felhasznaloID = $value['felhasznaloID'];
      $tanevID = $value['tanevID'];
      
      // Felhasználó egyéni órakedvezményeinek a lekérdezése
      $rs = $this->db->execute('SELECT oraA,oraKotelezoA,oraB,oraKotelezoB '.
        'FROM egyeniorakedv WHERE tanevID='.$tanevID.' AND felhasznaloID='.$felhasznaloID);
      
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a felhasználó egyéni órakedvezményeinek a lekérdezése során!',true);
      
      $this->response->addResult($rs);
        
      return $rs;
    }
    
    // @override
    function createModifyExpression($fields,$values,$id)
    {
      $felhasznaloID = $values['felhasznaloID'];
      $tanevID = $values['tanevID'];
      
      return 'tanevID="'.$tanevID.'" AND felhasznaloID='.$felhasznaloID;
    }
    
  }
  
?>
