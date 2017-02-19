<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../../dbExec.php');
   
  /**                                                        
   * Tantárgyak címkéinek a kezelését megvalósító osztály.
   */
  class CTantargyakCimkei extends CService
  {    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_TANTARGYAK_CIMKEI_LIST';
      $this->getDataAction = 'GET_TANTARGYAK_CIMKEI_DATA';
      $this->insertDataAction = 'ASSIGN_TANTARGYAK_CIMKEI_LIST';
      $this->modifyDataAction = 'MODIFY_TANTARGYAK_CIMKEI_DATA';
      $this->removeDataAction = 'UNASSIGN_TANTARGYAK_CIMKEI_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'tantargyakcimkei';
      $this->primaryField = 'tantargyCimkeID';
      $this->orderByFields = array('tantargyCimkeNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tantargyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tantargyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
    }
  
    // @override
    function getDataList()
    {
      $value = $this->getDbFieldValues(array('tantargyID','tantargyID'));
      // Tantárgy azonosítójának a lekérdezése
      $tantargyID = $value['tantargyID'];
        
      // Tantárgy tantárgycímkéinek a lekérdezése
      $rs = $this->db->execute('SELECT tantargyCimkeID FROM tantargyakcimkei WHERE tantargyID='.$tantargyID);
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a tantárgy tantárgycímkéinek a listájának a lekérdezése során!',true);
      // Lekérdezés eredményének átalakítása tömbbé
      $tantargycimkek = array();
      while ($record = $rs->FetchRow())
        $tantargycimkek[] = $record['tantargyCimkeID'];
            
      // Tantárgycímkék lekérdezése
      //$rs = $this->db->execute('SELECT tantargyCimkeID,tantargyCimkeNev FROM tantargy_cimkek ORDER BY tantargyCimkeNev');
      
      $rs = $this->db->execute(
        'SELECT tantargyCimkeID,tantargyCimkeNev FROM tantargy_cimkek  
         WHERE tantargyCimkeID NOT IN (SELECT tantargyCimkeID FROM tantargyakcimkei)
         OR tantargyCimkeID IN (SELECT tantargyCimkeID FROM tantargyakcimkei WHERE tantargyID='.$tantargyID.') 
         ORDER BY tantargyCimkeNev');
      
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a tantárgycímkék listájának lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      // NOTE: - automatikusan hozzáadjuk a 'letrehozva' mező értékeit is
      $tantargycimkek_teljes = array();
      while ($record = $rs->FetchRow())
      {
        $tantargyCimkeID = $record['tantargyCimkeID'];
        $tantargycimkek_teljes[] = array('tantargyCimkeID' => $tantargyCimkeID,
                                'tantargyCimkeNev' => utf8ToLatin2($record['tantargyCimkeNev']),
                                'hozzarendelve' => (in_array($tantargyCimkeID,$tantargycimkek)) ? 'X' : '-');
      }
               
      // Válasz küldése                 
      $this->response->addArray($tantargycimkek_teljes);
      
      return $rs;
    }
    
    /**
     * Általánosan használt paraméterek lekérdezése.
     * NOTE: - ha nem talál semmit a _POST tömbben, akkor a _GET tömbben keresi     
     * 
     * @return {Array():any type} a paraméterek asszociatív tömbje          
     */         
    function getStandardParams()
    {
      // Szűrők adatainak a lekérdezése (ha vannak)
      $filterFields = array();
      $filterValues = array();
      $filters = $_POST['FILTERS'];
      if (!isset($filters))
        $filters = $_GET['FILTERS'];
         
      if (isset($filters))
      {
        $filterFields = $this->getDbFields($filters);
        $filterValues = $this->getDbFieldValues($filterFields);
      }
      
      // Az elsődleges kulcsok értékei
      $ids = $_POST[$this->primaryField];
      if (!isset($ids))
        $ids = $_GET[$this->primaryField];
      
      // Ha nem adtunk meg elsődleges kulcsokat akkor kilépünk
      if (!isset($ids))
        $this->response->sendError('Nem adott meg azonosítókat!',true);
        
      // Elsődleges kulcsok tömbjének elkészítése
      $ids = explode(',',$ids);
      
      // Elsődleges kulcsok formátumának ellenörzése
      for ($i = 0; $i < count($ids); $i++)
        $this->testDbValue($this->primaryField,$ids[$i]);
        
      return array('filterFields' => $filterFields,
                   'filterValues' => $filterValues,
                   'ids' => $ids);
    }
    
    // @override
    function insertData()
    {
      // Alap adatok lekérdezése
      $data = $this->getStandardParams();
      $ids = $data['ids'];
      $tantargyID = $data['filterValues']['tantargyID'];
      
      foreach ($ids as $id)
      {
        $rs = $this->db->execute('INSERT INTO tantargyakcimkei (tantargyCimkeID,tantargyID) VALUES ('.$id.','.$tantargyID.')');
      }
      
    }
    
    function removeDataList()
    {
      // Alap adatok lekérdezése
      $data = $this->getStandardParams();
      $ids = $data['ids'];
      $tantargyID = $data['filterValues']['tantargyID'];
      
      // Időszakok megnyitása
      $rs = $this->db->execute('DELETE FROM tantargyakcimkei WHERE tantargyCimkeID IN ('.implode(',',$ids).') 
                                AND tantargyID='.$tantargyID);
    }
    
  }
  
?>
