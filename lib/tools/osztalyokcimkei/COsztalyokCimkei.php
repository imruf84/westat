<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../../dbExec.php');
   
  /**                                                        
   * Osztályok címkéinek a kezelését megvalósító osztály.
   */
  class COsztalyokCimkei extends CService
  {    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_OSZTALYOK_CIMKEI_LIST';
      $this->getDataAction = 'GET_OSZTALYOK_CIMKEI_DATA';
      $this->insertDataAction = 'ASSIGN_OSZTALYOK_CIMKEI_LIST';
      $this->modifyDataAction = 'MODIFY_OSZTALYOK_CIMKEI_DATA';
      $this->removeDataAction = 'UNASSIGN_OSZTALYOK_CIMKEI_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'osztalyokcimkei';
      $this->primaryField = 'osztalyCimkeID';
      $this->orderByFields = array('osztalyCimkeNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['osztalyID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tanevID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
    }
  
    // @override
    function getDataList()
    {
      $value = $this->getDbFieldValues(array('osztalyID','tanevID'));
      // Osztály azonosítójának a lekérdezése
      $osztalyID = $value['osztalyID'];
      // Tanév azonosítójának a lekérdezése
      $tanevID = $value['tanevID'];
        
      // Osztály adott tanévéhez tartozó osztálycímkéinek a lekérdezése
      $rs = $this->db->execute('SELECT osztalyCimkeID FROM osztalyokcimkei WHERE tanevID='.
        $tanevID.' AND osztalyID='.$osztalyID);
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba az osztály osztálycímkéinek a listájának a lekérdezése során!',true);
      // Lekérdezés eredményének átalakítása tömbbé
      $osztalycimkek = array();
      while ($record = $rs->FetchRow())
        $osztalycimkek[] = $record['osztalyCimkeID'];
            
      // Tanév osztálycímkéinek a lekérdezése
      //$rs = $this->db->execute('SELECT osztalyCimkeID,osztalyCimkeNev FROM osztaly_cimkek WHERE tanevID='.$tanevID.' ORDER BY osztalyCimkeNev');
      
      $rs = $this->db->execute(
        'SELECT osztaly_cimkek.osztalyCimkeID,osztaly_cimkek.osztalyCimkeNev FROM osztaly_cimkek  
         WHERE osztaly_cimkek.tanevID='.$tanevID.' AND osztalyCimkeID NOT IN (SELECT osztalyokcimkei.osztalyCimkeID FROM osztalyokcimkei WHERE osztalyokcimkei.tanevID='.$tanevID.')
         OR osztaly_cimkek.osztalyCimkeID IN (SELECT osztalyokcimkei.osztalyCimkeID FROM osztalyokcimkei WHERE osztalyID='.$osztalyID.' AND osztalyokcimkei.tanevID='.$tanevID.') 
         ORDER BY osztalyCimkeNev');
      
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a tanév osztálycímkéinek a listájának a lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      // NOTE: - automatikusan hozzáadjuk a 'letrehozva' mező értékeit is
      $osztalycimkek_teljes = array();
      while ($record = $rs->FetchRow())
      {
        $osztalyCimkeID = $record['osztalyCimkeID'];
        $osztalycimkek_teljes[] = array('osztalyCimkeID' => $osztalyCimkeID,
                                'osztalyCimkeNev' => utf8ToLatin2($record['osztalyCimkeNev']),
                                'hozzarendelve' => (in_array($osztalyCimkeID,$osztalycimkek)) ? 'X' : '-');
      }
               
      // Válasz küldése                 
      $this->response->addArray($osztalycimkek_teljes);
      
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
      $osztalyID = $data['filterValues']['osztalyID'];
      $tanevID = $data['filterValues']['tanevID'];
      
      foreach ($ids as $id)
      {
        $rs = $this->db->execute('INSERT INTO osztalyokcimkei (osztalyCimkeID,osztalyID,tanevID) VALUES ('.$id.','.$osztalyID.','.$tanevID.')');
      }
      
    }
    
    function removeDataList()
    {
      // Alap adatok lekérdezése
      $data = $this->getStandardParams();
      $ids = $data['ids'];
      $osztalyID = $data['filterValues']['osztalyID'];
      $tanevID = $data['filterValues']['tanevID'];
      
      // Időszakok megnyitása
      $rs = $this->db->execute('DELETE FROM osztalyokcimkei WHERE osztalyCimkeID IN ('.implode(',',$ids).') 
                                AND osztalyID='.$osztalyID.' AND tanevID='.$tanevID);
    }
    
  }
  
?>
