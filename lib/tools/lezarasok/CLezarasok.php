<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../../dbExec.php');
  require_once('../kiadottparancsok/Kiadottparancsok.php');
   
  /**                                                        
   * Jelszavak kezelését megvalósító osztály.
   */
  class CLezarasok extends CService
  {    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_LEZARAS_LIST';
      $this->getDataAction = 'GET_LEZARAS_DATA';
      $this->insertDataAction = 'LOCK_LEZARAS_LIST';
      $this->modifyDataAction = 'MODIFY_LEZARAS_DATA';
      $this->removeDataAction = 'UNLOCK_LEZARAS_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'lezarasok';
      $this->primaryField = 'felhasznaloID';
      $this->orderByFields = array('felhasznaloNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['idoszakID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
    }
  
    // @override
    function getDataList()
    {
      // Időszak azonosítójának a lekérdezése
      $value = $this->getDbFieldValues(array('idoszakID'));
      $idoszakID = $value['idoszakID'];
        
      // Időszak jelentéseinek a lekérdezése
      $rs = $this->db->execute('SELECT felhasznaloID FROM lezarasok WHERE idoszakID='.$idoszakID);
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a lezárások listájának lekérdezése során!',true);
      // Lekérdezés eredményének átalakítása tömbbé
      $lezarasok = array();
      while ($record = $rs->FetchRow())
        $lezarasok[] = $record['felhasznaloID'];
            
      // Felhasználók neveinek a lekérdezése
      // NOTE: - csak az adott vezetőhöz tartozó felhasználók neveit tartalmazza
      $rs = $this->db->execute('SELECT felhasznaloID,felhasznaloNev FROM felhasznalok'.
        ' WHERE felhasznaloID IN ('.
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
                                'lezarva' => (in_array($felhasznaloID,$lezarasok)) ? 'X' : '-');
      }
               
      // Válasz küldése                 
      $this->response->addArray($felhasznalok);
      
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
      $idoszakID = $data['filterValues']['idoszakID'];
      
      $db = $this->db;
      
      $loggedActions = getLoggedActions();
      $loggedActionNames = getLoggedActionNames();
      
      // Felhasználó típusának a lekérdezése
      // Leader, Operátor és Admin mindenre jogosult
      $tipus = $this->getFelhasznaloTipus($_SESSION['felhasznaloID']);
      
      // Csak akkor zárhatunk le időszakot, ha minden kérdéses menüpontot meglátogattunk
      $a = dbExec($db,
          'SELECT parancs FROM kiadottparancsok WHERE felhasznaloID IN('.implode(',',$ids).') 
           AND idoszakID='.$idoszakID);
           
      // Átalakítjuk a tömböt sima tömbbé
      $actionsFound = array();
      foreach ($a as $actions)
        $actionsFound[] = $actions['parancs'];
          
      // Megszámoljuk, hogy hány parancs szerepel a tárolt parancsok közül
      // Hiányzó parancsok neveinek a listája
      $missingActions = array();
      foreach ($loggedActions as $index=>$action)
        if (!in_array($action,$actionsFound)) 
          $missingActions[] = $loggedActionNames[$index];
        
      // Ha minden szükséges parancs szerepel az adatbázisban, akkor lezárjuk az időszakot
      if (0 < count($missingActions) && !in_array($tipus,array('admin','leader','operator')))
        $this->response->sendError('Az időszak lezárásához előbb látogassa meg az alábbi menüpontokat:'.
          implode(',',$missingActions),true);
      
      foreach ($ids as $id)
      {
        // Lezárás előtti hibaellenőrzés
        // NOTE: - hibás adatok esetén a lezárás nem lehetséges
        
        // Hiányzott napon nem lehet helyettesítés
        $a = dbExec($db,
          'SELECT helyettesitesek.datum AS datum 
           FROM helyettesitesek
           WHERE helyettesitesek.datum IN
           (
             SELECT datum FROM hianyzasok
             WHERE 
             hianyzasok.felhasznaloID=helyettesitesek.helyettesitoID AND 
             hianyzasok.idoszakID=helyettesitesek.idoszakID
             GROUP BY datum
           )
           AND helyettesitesek.helyettesitoID='.$id.' 
           AND helyettesitesek.idoszakID='.$idoszakID.'
           AND helyettesitesek.torolve=0
           GROUP BY datum');
           
        // Ha találtunk dátumokat akkor hibával leállunk
        if (0 < count($a))
        {
          $dates = array();
          foreach($a as $aVal)
            $dates[] = str_replace('-','.',$aVal['datum']);
            
          // Felhasználó nevének a lekérdezése
          $a = dbExec($db,'SELECT felhasznaloNev FROM felhasznalok WHERE felhasznaloID='.$id);
          $this->response->sendError('A '.$a[0]['felhasznaloNev'].' nevű felhasználó az alábbi nap(ok)on hiányzott: '.
            implode(', ',$dates).'. Az időszak lezárásához törölje a felsorolt dátum(ok)hoz tartozó helyettesítéseket!',true,true);
        }
        
        // Hiányzott napon nem lehet díjazott tkt,ef
        $a = dbExec($db,
          'SELECT tktef.datum
           FROM tktef
           WHERE tktef.datum
           IN 
           (
             SELECT datum
             FROM hianyzasok
             WHERE 
             hianyzasok.felhasznaloID=tktef.felhasznaloID AND 
             hianyzasok.idoszakID=tktef.idoszakID
             GROUP BY datum
           )
           AND tktef.felhasznaloID='.$id.'
           AND tktef.idoszakID='.$idoszakID.'
           AND tktef.dijazott=1
           GROUP BY datum');
           
        // Ha találtunk dátumokat akkor hibával leállunk
        if (0 < count($a))
        {
          $dates = array();
          foreach($a as $aVal)
            $dates[] = str_replace('-','.',$aVal['datum']);
            
          // Felhasználó nevének a lekérdezése
          $a = dbExec($db,'SELECT felhasznaloNev FROM felhasznalok WHERE felhasznaloID='.$id);
          $this->response->sendError('A '.$a[0]['felhasznaloNev'].' nevű felhasználó az alábbi nap(ok)on hiányzott: '.
            implode(', ',$dates).'. Az időszak lezárásához törölje a felsorolt dátum(ok)hoz tartozó tanórán kívüli'. 
            'tevékenységeket/egyéni foglalkozásokat!',true,true);
        }
           
        // Ha találtunk dátumokat akkor hibával leállunk
        if (0 < count($a))
        {
          $dates = array();
          foreach($a as $aVal)
            $dates[] = str_replace('-','.',$aVal['datum']);
            
          // Felhasználó nevének a lekérdezése
          $a = dbExec($db,'SELECT felhasznaloNev FROM felhasznalok WHERE felhasznaloID='.$id);
          $this->response->sendError('A '.$a[0]['felhasznaloNev'].' nevű felhasználó az alábbi nap(ok)on hiányzott: '.
            implode(', ',$dates).'. Az időszak lezárásához törölje a felsorolt dátum(ok)hoz tartozó helyettesítéseket!',true,true);
        }
        
        // Lezárás elindítása
        $rs = $this->db->execute('INSERT INTO lezarasok (felhasznaloID,idoszakID) VALUES ('.$id.','.$idoszakID.')');
      }
      
    }
    
    function removeDataList()
    {
      // Alap adatok lekérdezése
      $data = $this->getStandardParams();
      $ids = $data['ids'];
      $idoszakID = $data['filterValues']['idoszakID'];
      
      // Időszakok megnyitása
      $rs = $this->db->execute('DELETE FROM lezarasok WHERE felhasznaloID IN ('.implode(',',$ids).') 
                                AND idoszakID='.$idoszakID);
    }
    
  }
  
?>
