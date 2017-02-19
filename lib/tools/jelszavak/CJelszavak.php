<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Jelszavak kezelését megvalósító osztály.
   */
  class CJelszavak extends CService
  {    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_JELSZO_LIST';
      $this->getDataAction = 'GET_JELSZO_DATA';
      $this->insertDataAction = 'INSERT_JELSZO_DATA';
      $this->modifyDataAction = 'MODIFY_JELSZO_DATA';
      $this->removeDataAction = 'REMOVE_JELSZO_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'felhasznalok';
      $this->primaryField = 'felhasznaloID';
      $this->orderByFields = array('felhasznaloNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['jelszo1'] = new CField('string','anyWord',$this->response,0,35);
      $this->fields['jelszo2'] = new CField('string','anyWord',$this->response,0,35);
    }
  
    // @override
    function getDataList()
    {
      // Jelszóval rendelkező felhasználók lekérdezése
      $rs = $this->db->execute('SELECT felhasznaloID FROM felhasznalok WHERE jelszo IS NOT NULL');
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a jelszavak listájának lekérdezése során!',true);
      // Lekérdezés eredményének átalakítása tömbbé
      $jelszavak = array();
      while ($record = $rs->FetchRow())
        $jelszavak[] = $record['felhasznaloID'];
            
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
      // NOTE: - automatikusan hozzáadjuk a 'letrehozva' mező értékeit is
      $felhasznalok = array();
      while ($record = $rs->FetchRow())
      {
        $felhasznaloID = $record['felhasznaloID'];
        $felhasznalok[] = array('felhasznaloID' => $felhasznaloID,
                                'felhasznaloNev' => utf8ToLatin2($record['felhasznaloNev']),
                                'meghatarozva' => (in_array($felhasznaloID,$jelszavak)) ? 'X' : '-');
      }
               
      // Válasz küldése                 
      $this->response->addArray($felhasznalok);
      
      return $rs;
    }
    
    // @override
    // NOTE: - azért nem csinálunk semmit, mert nem szeretnénk kiadni a jelszó mező tartalmát
    function getData()
    {
      $rs = $this->db->execute('SELECT FROM felhasznalok');
      
      return $rs;
    }
    
    // @override
    function modifyData()
    {
      // Alapadatok lekérdezése
      $value = $this->getDbFieldValues(array('felhasznaloID','jelszo1','jelszo2'));
      
      $felhasznaloID = $value['felhasznaloID'];
      
      $jelszo1 = $value['jelszo1'];
      $jelszo2 = $value['jelszo2'];
      
      // Jelszavak egyezésének vizsgálata
      if (!(0 === strcmp($jelszo1,$jelszo2)))
        $this->response->sendError('A megadott jelszavak nem egyeznek meg!',true);
        
      // Ha üresen hagytuk a mezőt, akkor nincs jelszó
      $jelszo = (0 === strcmp($jelszo1,'""')) ? 'NULL' : 'MD5('.utf8ToLatin2($jelszo1).')';
      
      $rs = $this->db->execute('UPDATE felhasznalok SET jelszo='.$jelszo.
        ' WHERE felhasznaloID='.$felhasznaloID);
      
      if (true != $rs)
        $this->response->sendError('Hiba a jelszó mentése közben!',true);
        
      return $rs;
    }
    
    // @override
    function insertData()
    {
      return $this->modifyData();
    }
    
    function removeDataList()
    {
      // Az elsődleges kulcsok értékei
      $ids = $_POST[$this->primaryField];
      
      // Ha nem adtunk meg elsődleges kulcsokat akkor kilépünk
      if (!isset($ids))
        $this->response->sendError('Nem adott meg azonosítókat!',true);
        
      // Elsődleges kulcsok tömbjének elkészítése
      $ids = explode(',',$ids);
      
      // Elsődleges kulcsok formátumának ellenörzése
      for ($i = 0; $i < count($ids); $i++)
        $this->testDbValue($this->primaryField,$ids[$i]);
        
      $rs = $this->db->Execute('UPDATE felhasznalok SET jelszo=NULL WHERE '.
        'felhasznaloID IN ('.implode(',',$ids).')');
            
      if (true != $rs)
        $this->response->sendError('Hiba az jelszavak törlése közben!',true);
                
      return $rs;  
    }
    
  }
  
?>
