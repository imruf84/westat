<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../../CWorkingDir.php');
  require_once('../../zip/pclzip.lib.php');
  require_once('JelentesekExcel.php');
   
   
  define('JELENTES_ARCHIVE_MIME_TYPE','application/zip');
  define('JELENTES_ARCHIVE_EXTENSION','zip');
   
  /**                                                        
   * Jelentés kezelését megvalósító osztály.
   */
  class CJelentesek extends CService
  {
    protected $path;
    // Jelentés állománynveének prefixuma
    protected $jelentesPrefix = 'report';
    
    // Jelentés típusának lehetséges értékei
    protected $tipusValues = array('szov','bin');
    
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_JELENTES_LIST';
      $this->getDataAction = 'GET_JELENTES_DATA';
      $this->insertDataAction = 'INSERT_JELENTES_DATA';
      $this->modifyDataAction = 'MODIFY_JELENTES_DATA';
      $this->removeDataAction = 'REMOVE_JELENTES_LIST';
      $this->prepareDownloadDataAction = 'PREPARE_DOWNLOAD_JELENTES_LIST';
      $this->downloadDataAction = 'DOWNLOAD_JELENTES_LIST';
      $this->prepareDownloadEmptyAction = 'PREPARE_DOWNLOAD_JELENTES_EMPTY';
      $this->downloadEmptyAction = 'DOWNLOAD_JELENTES_EMPTY';
      $this->clearTempDirAction = 'CLEAR_TEMP_DIR';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = '';
      $this->primaryField = 'felhasznaloID';
      $this->orderByFields = array('felhasznaloNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('string','excelFile',$this->response,1,100);
      $this->fields['idoszakID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['datumtol'] = new CField('string','anyWord',$this->response,0,10);
      $this->fields['datumig'] = new CField('string','anyWord',$this->response,0,10);
      $this->fields['tipus'] = new CField('string','oneWord',$this->response,1,5);
      
      
      // Jelentések ideinglenes tárolóhenyének osztálya
      // NOTE: - egyenlőre nem használt
      $workingDir = null;
    }
    
    // @override
    function doActionFunc($action)
    {
      switch ($action)
      {
        // Adatok listájának a letöltésének az előkészítése
        case $this->prepareDownloadDataAction:
          $this->prepareDownloadDataList();
        break;
        // Adatok listájának letöltése
        case $this->downloadDataAction:
          $this->downloadDataList();
        break;
        // Üres időkeret letöltése
        case $this->downloadEmptyAction:
          $this->downloadEmpty();
        break;
        // Temp könyvtár tisztítása
        case $this->clearTempDirAction:
          $this->clearTempDir();
        break;
        default:
          parent::doActionFunc($action);
      }
    }
    
    // @override
    function testDbValue2($field,$value)
    {
      if ('tipus' == $field)
        return in_array($value,$this->tipusValues);
        
      return parent::testDbValue2($field,$value);
    }
    
    // @override
    function getDataList()
    {
      // Időszak azonosítójának a lekérdezése
      $value = $this->getDbFieldValues(array('idoszakID'));
      $idoszakID = $value['idoszakID'];
        
      // Időszak jelentéseinek a lekérdezése
      $rs = $this->db->execute('SELECT felhasznaloID FROM jelentesek WHERE idoszakID='.$idoszakID);
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a jelentések listájának lekérdezése során!',true);
      // Lekérdezés eredményének átalakítása tömbbé
      $jelentesek = array();
      while ($record = $rs->FetchRow())
        $jelentesek[] = $record['felhasznaloID'];
            
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
                                'letrehozva' => (in_array($felhasznaloID,$jelentesek)) ? 'X' : '-');
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
      // Ideinglenes munkaterület létrehozása
      $this->workingDir = new CWorkingDir();
      
      // Alap adatok lekérdezése
      $data = $this->getStandardParams();
      $ids = $data['ids'];
      $idoszakID = $data['filterValues']['idoszakID'];
      $datumtol = $data['filterValues']['datumtol'];
      $datumig = $data['filterValues']['datumig'];
      
      // Állomány adatbázisba írása
      
      // Jelentések elkészítése
      foreach ($ids as $id)
      {
        $this->createReport($idoszakID,$id,$datumtol,$datumig);
      }
      
    }
    
    /**
     * Jelentés állományának az elkészítése.
     * NOTE: - az adatbázisba írás is egyúttal megtörténik 
     *       - az adatbázisba az állomány tömörítve kerül         
     * 
     * @param idoszakID {number} az időszak azonosítója     
     * @param felhasznaloID {number} a felhasználó azonosítója  
     * @param datumtol {string} az a dátum amettől szeretnénk elkészíteni a jelentést
     * NOTE: - ha nincs megadva, vagy ha kívül esik az időszakon akkor a teljes
     *         időszakra elkészül a jelentés               
     * @param datumig {string} az a dátum ameddig szeretnénk elkészíteni a jelentést
     * NOTE: - ha nincs megadva, vagy ha kívül esik az időszakon akkor a teljes 
     *         időszakra elkészül a jelentés          
     * @return {string} a létrehozott jelentés állományának a neve
     * NOTE: - a név az elérési utat nem tartalmazza                        
     */         
    function createReport($idoszakID,$felhasznaloID,$datumtol,$datumig)
    {
      // A dátumban a pontokat lecserljük kötőjelekre
      $lDatumtol = str_replace('.', '-', $datumtol);
      $lDatumig = str_replace('.', '-', $datumig);
      
      // Felhasználó jogainak a tesztelése
      $this->testAction($this->insertDataAction);
    
      $path = $this->workingDir->getFullWorkingDir();
      
      // Állomány létrehozása
      $reportFileName = $this->workingDir->generateValidWorkingFileName(
        $this->jelentesPrefix,JELENTES_EXTENSION);
      $pathReportFileName = $path.$reportFileName;
      // NOTE: - paraméterként küldjük az osztályt is, hogy meg tudjuk hívni néhány metódusát
      createReportExcel($pathReportFileName,$this->db,$idoszakID,$felhasznaloID,$this,$lDatumtol,$lDatumig);
      
      // Állomány betömörítése
      $zipFileName = $this->workingDir->generateValidWorkingFileName(
        $this->jelentesPrefix,JELENTES_ARCHIVE_EXTENSION);
      $pathZipFileName = $path.$zipFileName;
      $zip = new PclZip($pathZipFileName);
      $zip->add($pathReportFileName,PCLZIP_OPT_REMOVE_PATH,$path);
      
      // Ha már létezik ilyen bejegyzés az adatbázisban, akkor töröljük
      $rs = $this->db->Execute('SELECT felhasznaloID FROM jelentesek WHERE '.
        'felhasznaloID='.$felhasznaloID.' AND idoszakID='.$idoszakID);
      if (0 < $rs->RecordCount())
        $this->db->Execute('DELETE FROM jelentesek WHERE '.
          'felhasznaloID='.$felhasznaloID.' AND idoszakID='.$idoszakID);
          
      // Új jelentés mentése
      $file = fopen($pathZipFileName,'rb');
      $content = fread($file,filesize($pathZipFileName));
      $content = addslashes($content);
      fclose($file);

      $this->db->Execute('INSERT INTO jelentesek (felhasznaloID,idoszakID,content) VALUES ('.
        $felhasznaloID.','.$idoszakID.',"'.$content.'")');
        
      // Állomány törlése
      unlink($pathReportFileName);
      unlink($pathZipFileName);
        
      return $fileName;
    }
    
    // @override
    function removeDataList()
    {
      // Alap adatok lekérdezése
      $data = $this->getStandardParams();
      $ids = $data['ids'];
      $idoszakID = $data['filterValues']['idoszakID'];
      
      $this->db->Execute('DELETE FROM jelentesek WHERE '.
        'idoszakID='.$idoszakID.' AND felhasznaloID IN ('.implode(',',$ids).')');
    }
    
    /**
     * Jelentések letöltésének előkészítése.
     * NOTE: - ha egy jelentés nem létezik akkor létrehozzuk
     *       - a függvény gyakorlatilag a hibakeresést végzi előkészítve a
     *         zavartalan letöltést, amit egy másik hívás hajt majd végre               
     */
    function prepareDownloadDataList()
    {
      $this->workingDir = new CWorkingDir();
    
      // Alap adatok lekérdezése
      $data = $this->getStandardParams();
      $ids = $data['ids'];
      $idoszakID = $data['filterValues']['idoszakID'];
      $datumtol = $data['filterValues']['datumtol'];
      $datumig = $data['filterValues']['datumig'];
      
      foreach ($ids as $id)
      {
        // Lekérdezzük a felhasználó jelentését
        $rs = $this->db->execute('SELECT * FROM jelentesek WHERE '.
          'felhasznaloID='.$id.' AND idoszakID='.$idoszakID);
          
        // Hiba esetén kilépünk
        if (true != $rs)
          $this->response->sendError('Hiba a jelentések listájának lekérdezése során!',true);
          
        // Ha nem található a jelentés, akkor elkészítjük
        if (!(0 < $rs->RecordCount()))
          $this->createReport($idoszakID,$id,$datumtol,$datumig);
      }
        
    }
    
    /**
     * Állomány letöltésének az elindítása.
     * NOTE: - a metódus a dolga végeztével leállítja a script futását
     *       - a metódus megnyitja a fájl, betölti a tartalmát a memóriába,
     *         és ezt küldi letöltésre               
     * 
     * @param fileName {string} az állomány neve  
     * NOTE: - a név nem tartalmazza az ideinglenes munkaterület nevét
     * @param mimeType {string} az állomány típusa             
     */
    function forceDownload($fileName,$mimeType)
    {
      $path = $this->workingDir->getFullWorkingDir();
      $filePathName = $path.$fileName;
      if (!is_file($filePathName))
      {
        echo 'Az kért állomány nem található:'.$fileName;
        exit;
      }
      
      // Letöltés elindítása
      
      // Fejléc létrehozása
      header('Pragma: public');
      header('Expires: 0');
      header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
      header('Cache-Control: maxage=1');
      header('Cache-Control: public');
      header('Content-Description: File Transfer');
      header('Content-Type: '.$mimeType);
      header('Content-Disposition: attachment; filename='.$fileName);
      header('Content-Transfer-Encoding: binary');
      header('Content-Length:'.filesize($filePathName));
      header('Connection: close');
      
      // Fájl tartalmának küldése
      $file = fopen($filePathName,'rb');
      fpassthru($file);
      fclose($file);
      
      exit;
    }   
    
    /**
     * Állomány készítése adatbázisból.
     * NOTE: - az állomány neveéhez szükséges adatok is letöltődnek     
     * 
     * @param idoszakID {number} időszak azonosítója
     * @param felhasznaloID {number} felhasználó azonosítója  
     * @param tipus {string} a jelentés típusa      
     * @return {string} a létrehozott állomány neve                 
     */         
    function createFileFromDb($idoszakID,$felhasznaloID,$tipus)
    {
      // Lekérdezzük a jelentést és az állománynévhez szükséges adatokat az adatbázisból
      $rs = $this->db->execute('SELECT oraado,felhasznaloNev,idoszakNev,tanevNev,content '.
        'FROM felhasznalok,idoszakok,tanevek,jelentesek WHERE '.
        'felhasznalok.felhasznaloID='.$felhasznaloID.' AND '.
        'idoszakok.idoszakID='.$idoszakID.' AND '.
        'tanevek.tanevID=idoszakok.tanevID AND '.
        'jelentesek.idoszakID=idoszakok.idoszakID AND '.
        'jelentesek.felhasznaloID=felhasznalok.felhasznaloID');
      
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a jelentés lekérdezése során!',true);
        
      // Ha nem találtunk semmit akkor kilépünk
      if (!(0 < $rs->RecordCount()))
        $this->response->sendError('A kért jelentés nem található!',true);
        
      $record = $rs->FetchRow();
      $felhasznaloNev = str_replace(' ','',$record['felhasznaloNev']);
      // A tömörítést végző osztály nem kezeli jól az ékezetes karaktereket 
      // tartalmazó fájlok neveit, ezért kicseréljük ezeket nem ékezetesekre
      $felhasznaloNev = changeSpecChars($felhasznaloNev);
      $idoszakNev = str_replace('-','',$record['idoszakNev']);
      $tanevNev = str_replace('/','',$record['tanevNev']);
          
      // Állomány előállítása

      $path = $this->workingDir->getFullWorkingDir();
      // Tömörtett állománynév előállítása
      $fileName = $felhasznaloNev.$tanevNev.$idoszakNev;
      $zipFileName = $this->workingDir->generateValidWorkingFileName(
        $fileName,JELENTES_ARCHIVE_EXTENSION,false);
      $pathZipFileName = $path.$zipFileName;
        
      // Tömörített állomány létrehozása
      $file = fopen($pathZipFileName,'w');
      fwrite($file,$record['content']);
      fclose($file); 
      
      
      // A tömörített állományon belül a jelentés neve report0.xls, amit át kell
      // neveznünk a megfelelő névre
      
      // Kicsomagolás   
      $zipWorkingDir = new CWorkingDir();
      $zipPath = $zipWorkingDir->getFullWorkingDir();
      $zip = new PclZip($pathZipFileName);
      $zipList = $zip->extract(PCLZIP_OPT_PATH,$zipPath,
                               PCLZIP_OPT_REMOVE_ALL_PATH);
                               
      // Kicsomagolt állomány átnevezése
      $reportFileName = $fileName.'.'.JELENTES_EXTENSION;
      
      // A konvertálást végző állomány neve (az óraadóknak külön konvertálót használunk)
      //$converterFileNamme = (1 == $record['oraado']) ? 'converter_oraado.xls' : 'converter.xls';
      $converterFileNamme = 'converter_oraado.xls';
      
      // Ha szükséges, akkor átkonvertáljuk a szöveges állományt binárissá
      if ('bin' == $tipus)
      {
        // bemásoljuk a converter.xls-t a munkamappába
        // az új formátum csak egy x-ben különbözik
        $newExtDiff = '';
        if (copy($converterFileNamme,$zipPath.$converterFileNamme))
        {
          // elindítjuk az excelt és megnyitjuk a convert.xls-t
          exec('excel "'.$zipPath.$converterFileNamme.'"');
          
          // az új kiterjesztés xlsx lesz
          $newExtDiff = 'x';
          
          // Ha nem létezik az új állomány, akkor másképp futtatjuk az excelt
          if (!file_exists($zipList[0]['filename'].$newExtDiff))
            exec('"C:\Program Files\Microsoft Office\Office12\excel" "'.$zipPath.$converterFileNamme.'"');
            
          if (!file_exists($zipList[0]['filename'].$newExtDiff))
            exec('"C:\Program Files\Microsoft Office\Office14\excel" "'.$zipPath.$converterFileNamme.'"');
          
          // Ha nem sikerült a konvertálás, akkor visszaállítjuk a kiterjesztést
          if (!file_exists($zipList[0]['filename'].$newExtDiff))
            $newExtDiff = '';
           
        }
      }
      
      
      // Átnevezés
      $pathReportFileName = $path.$reportFileName.$newExtDiff;
      rename($zipList[0]['filename'].$newExtDiff,$pathReportFileName);
      
      
      // Ideinglenes dolgok törlése
      unset($zipWorkingDir);
      unlink($pathZipFileName);
      unset($zip);
      
      // Az átnevezett jelentés betömörítése
      $zip = new PclZip($pathZipFileName);
      $zip->add($pathReportFileName,PCLZIP_OPT_REMOVE_PATH,$path);
      
      // Ideinglenes dolgok törlése
      unlink($pathReportFileName);
      unset($zip);
      
      return $zipFileName;
    }      
    
    /**
     * Jelentések letöltése.
     */
    function downloadDataList()
    {
      $data = $this->getStandardParams();
      $ids = $data['ids'];
      $idoszakID = $data['filterValues']['idoszakID'];
      $tipus = $data['filterValues']['tipus'];
      $tipus = mb_substr($tipus,1,-1,'UTF-8');
      
      // Ideinglenes munkaterület létrehozása
      $this->workingDir = new CWorkingDir();
      
      // Elkészítjük az állományokat
      $fileNames = array();
      foreach ($ids as $id)
        $fileNames[] = $this->createFileFromDb($idoszakID,$id,$tipus);
        
      // Ha csak egy jelentést akarunk letölteni, akkor simán letöltjük
      if (1 == count($fileNames))
      {
        $this->forceDownload($fileNames[0],JELENTES_ARCHIVE_MIME_TYPE);
      }
        
      // Ha több jelentést szeretnénk letölteni...
      
      // Archivum létrehozása
      $path = $this->workingDir->getFullWorkingDir();
      $zipFileName = 'reports.'.JELENTES_ARCHIVE_EXTENSION;
      $zip = new PclZip($path.$zipFileName);
      
      // Fájlok hozzáadása a tömörített állományhoz
      $zip->add($path,PCLZIP_OPT_REMOVE_PATH,$path);
      
      // Letöltés elindítása
      $this->forceDownload($zipFileName,JELENTES_ARCHIVE_MIME_TYPE);
      
    }       
    
    /**
     * Üres időkeret letöltése.
     */
    function downloadEmpty()
    {
      $this->workingDir = new CWorkingDir();
    
      // Fájlnév generálása
      $path = $this->workingDir->getFullWorkingDir();                 
      $reportFileName = $this->workingDir->generateValidWorkingFileName(
        'idokeret_ures',JELENTES_EXTENSION,false);                          
      $pathReportFileName = $path.$reportFileName;
      
      // Állomány létrehozása
      createReportExcel($pathReportFileName,$this->db);
      
      // Fájl betömörítése
      $zipFileName = $reportFileName.'.'.JELENTES_ARCHIVE_EXTENSION;
      $pathZipFileName = $path.$zipFileName;
      $zip = new PclZip($pathZipFileName);
      $zip->add($pathReportFileName,PCLZIP_OPT_REMOVE_PATH,$path);
      
      // Letöltés elindítása
      $this->forceDownload($zipFileName,JELENTES_ARCHIVE_MIME_TYPE);
    }
    
    /**
     * Temp könyvtár tisztítása.
     * NOTE: - az összes westat könytárat törli a temp könyvtárból
     */         
    function clearTempDir()
    {
      $workingDir = new CWorkingDir('westat',false);
      $dirs = $workingDir->clearTempDir();
      
      // Ebben az esetben hiba küldésével egyszerűbb közölni az üzeneteket
      $torolve = 'Könyvtárak törölve:['.((count($dirs['removed'])>0)?implode(',',$dirs['removed']):'semmi').'];';
      $nemTorolve = 'Könyvtárak nem törölve:['.((count($dirs['notremoved'])>0)?implode(',',$dirs['notremoved']):'semmi').']';
      $this->response->sendError($torolve.$nemTorolve,true);
    }
    
  }
  
?>
