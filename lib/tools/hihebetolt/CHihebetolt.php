<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../../excel/reader/reader.php');
  require_once('../../dbExec.php');
  require_once('../../arrayFromQuery.php');
  // NOTE: - ez az insertHianyzasData miatt kell
  require_once('../hianyzasok/CHianyzasok.php');
   
  /**                                                        
   * Hiányzások és helyettesítések állományból való betőltésének a kezelését 
   * megvalósító osztály.
   */
  class CHihebetolt extends CService
  {
    protected $path;
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_HIHEBETOLT_LIST';
      $this->getDataAction = 'GET_HIHEBETOLT_DATA';
      $this->insertDataAction = 'INSERT_HIHEBETOLT_DATA';
      $this->modifyDataAction = 'MODIFY_HIHEBETOLT_DATA';
      $this->removeDataAction = 'REMOVE_HIHEBETOLT_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = '';
      $this->primaryField = 'allomanyNev';
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('string','excelFile',$this->response,1,100);
      $this->fields['idoszakID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      
      // Állományok elérési útja
      $this->path = '../../../uploads/hihebetolt/';
    }
    
    /**
     * Állományok listájának lekérdezése a szerverről.
     * 
     * @return {Array():string} az állományok nevei          
     */         
    function getListFromServer()
    {
      // Állományok kilistázása a szerverről
      $a = scandir($this->path);
      // Kiszedjük a felesleges elemeket        
      $a = array_diff($a,array('.','..'));
      
      $i = 0;
      $files = array();
      foreach ($a as $file)
        $files[$i++] = $file;
        
      return $files;
    }
    
    // @override
    function getDataList()
    { 
      // Ha nem létezik az állományok könyvtára akkor létrehozzuk
      if (!is_dir($this->path))
       mkdir($this->path,0,true);
       
      // Állományok kilistázása a szerverről
      $files = $this->getListFromServer();
                    
      // Válasz elkészítése
      $fileArray = array();
      $i = 0;
      foreach ($files as $file)
        $fileArray[$i++] = array($this->primaryField => utf8ToLatin2($file));
            
      // Állománylista hozzáadása a válaszhoz
      $this->response->addArray($fileArray);
              
      return $rs;
    }
    
    // @override
    function insertData()
    {
      $this->response->sendError('A funkció jelenleg nem elérhető!',true,true);
    }
    
    // @override
    function modifyData()
    {
      // Hiányzások, helyettesítések hozzáadása
      
      // Mezők listája
      $fields = $this->getDbFields($_POST['FIELDS']);
      // Mezők értékei
      $values = $this->getDbFieldValues($fields);
      
      // Állomány neve azonosítója idézőjelek nélkül
      $fileName = mb_substr($values[$this->primaryField],1,-1,'UTF-8');
      // Állomány neve elérési úttal
      $filePath = $this->path.$fileName;
      
      // Adatok beolvasása
      $data = $this->getDataFromXLS($filePath);
      
      if (!is_array($data))
      {
        $this->response->sendError('Hiba az állomány ('.utf8ToLatin2($fileName).
          ') megnyitása közben! Az állomány nem található!',true,true);
      }
      
      // Időszak azonosítója
      $idoszakID = $values['idoszakID'];
      
      
      // Adatok adatbázisba írása
      $this->db->Execute('START TRANSACTION');
      
      // Ez a tömb tárolja majd az adatbázisból hiányzó tanárok neveit
      $hianyzoTanarok = array();
      // Ez a tömb tárolja majd az adatbázisból hiányzó tantárgyak neveit
      $hianyzoTantargyak = array();
      // Ez a tömb tárolja majd az adatbázisból hiányzó osztályok neveit
      $hianyzoOsztalyok = array();
      
      // A hiányzások dátumait tartalmazó tömb
      // NOTE: - ezek alapján adjuk majd hozzá az egész napos hiányzásokat
      //       - a kulcsok tartalmazzák a dátumokat
      $hianyzasDatumok = array();
      
      
      // Különböző adatok lekérdezése keresés céljából
      // NOTE: - az SQL nem tesz különbséget pl. 'a' és 'á' között, ezért
      //         a keresést egy tömb segítségével végzünk majd el, kikerülve az SQL-t
      $tanarok = arrayFromQuery($this->db,'felhasznalok','felhasznaloNevH','felhasznaloID');
      
      //$osztalyok = arrayFromQuery($this->db,'osztaly_cimkek','osztalyCimkeNevH','osztalyCimkeID');
      $osztalyok = arrayFromQuery($this->db,'osztalyokcimkei LEFT JOIN osztaly_cimkek ON osztaly_cimkek.osztalyCimkeID=osztalyokcimkei.osztalyCimkeID ','osztalyCimkeNevH','osztalyID','osztalyokcimkei.tanevID IN (SELECT tanevID FROM idoszakok WHERE idoszakID='.$idoszakID.')');
      
      $tantargyak = arrayFromQuery($this->db,'tantargyak','tantargyNevH','tantargyID');
      $okok = array(
        'hianyzasokai'=>arrayFromQuery($this->db,'hianyzasokai','hianyzasokaNevH','hianyzasokaID'),
        'helyettesitestipusai'=>arrayFromQuery($this->db,'helyettesitestipusai','helyettesitestipusaNevH','helyettesitestipusaID'));  
      
      foreach ($data as $tanar => $tanarVal)
      {
        // Ha nincs ilyen tanár az adatbázisban, akkor tároljuk a nevét, majd továbblépünk             
        if (!in_array(utf8ToLatin2($tanar),array_keys($tanarok)) && !in_array($tanar,$hianyzoTanarok))
        {
          $hianyzoTanarok[] = $tanar;
          continue;
        }
         
        foreach ($tanarVal as $table => $tableVal)
        {
          foreach ($tableVal as $datum => $datumVal)
          {
            foreach ($datumVal as $ora => $oraVal)
            {
              foreach ($oraVal as $d)
              {
                $tantargy = $d['tantargy'];
              
                // Ha nincs ilyen tantárgy az adatbázisban, akkor tároljuk a nevét, majd továbblépünk             
                if (!in_array(utf8ToLatin2($tantargy),array_keys($tantargyak)) && !in_array($tantargy,$hianyzoTantargyak))
                {
                  $hianyzoTantargyak[] = $tantargy;
                  continue;
                }
              
                $osztaly = $d['osztaly'];
              
                // Ha nincs ilyen osztaly az adatbázisban, akkor tároljuk a nevét, majd továbblépünk             
                if (!in_array(utf8ToLatin2($osztaly),array_keys($osztalyok)) && !in_array($osztaly,$hianyzoOsztalyok))
                {
                  $hianyzoOsztalyok[] = $osztaly;
                  continue;
                }
                
                // TODO: - helyettesítéseknél megkeresni, hogy kit helyettesített, mert
                //         ezt is tárolni kell a helyettesítések táblában
              
                $fieldID;
                $fieldNevH;
                $table2;
                $fieldFelhasznaloID;
                $helyettesitettIDfield = '';
                $helyettesitettIDvalue = '';
                switch ($table)
                {
                  case 'hianyzasok':
                    $fieldID = 'hianyzasokaID';
                    $fieldNev = 'hianyzasokaNev';
                    $fieldNevH = 'hianyzasokaNevH';
                    $table2 = 'hianyzasokai';
                    $fieldFelhasznaloID = 'felhasznaloID';
                  break;
                  case 'helyettesitesek':
                    $fieldID = 'helyettesitestipusaID';
                    $fieldNev = 'helyettesitestipusaNev';
                    $fieldNevH = 'helyettesitestipusaNevH';
                    $table2 = 'helyettesitestipusai';
                    $fieldFelhasznaloID = 'helyettesitoID';
                    $helyettesitettIDfield = ',helyettesitettID';
                    $helyettesitettIDvalue = ',NULL';
                    
                    // Megkeressük a helyettesített tanár nevét
                    // NOTE: - nem a legelegánsabb megoldás, de működik
                    foreach ($data as $lTanarKey=>$lTanarVal)
                      foreach ($lTanarVal['hianyzasok'] as $lDatumKey=>$lDatumVal)
                        foreach ($lDatumVal as $lOraKey=>$lOraVal)
                        {
                          $lTantargy = $lOraVal[0]['tantargy'];
                          $lOsztaly = $lOraVal[0]['osztaly'];
                          
                          if (($lOsztaly==$osztaly) && ($lDatumKey==$datum) && ($lOraKey==$ora))
                            $helyettesitettIDvalue = ',(SELECT felhasznaloID FROM felhasznalok WHERE felhasznaloNevH="'.$lTanarKey.'")';
                        }
                    
                  break;
                }
                $ok = $d[$fieldID];
              
                // Hozzáadjuk az okot/típust az adatbázishoz ha még nem létezne
                if (!in_array(utf8ToLatin2($ok),array_keys($okok[$table2])))
                {
                  $this->db->Execute('INSERT INTO '.$table2.' ('.$fieldNev.','.$fieldNevH.') VALUES ("'.
                    $ok.'","'.$ok.'")');
                  
                  $okok = array(
                    'hianyzasokai'=>arrayFromQuery($this->db,'hianyzasokai','hianyzasokaNevH','hianyzasokaID'),
                    'helyettesitestipusai'=>arrayFromQuery($this->db,'helyettesitestipusai','helyettesitestipusaNevH','helyettesitestipusaID'));
                }
              
                // Adatok hozzáadása az adatbázishoz
                // NOTE: - csak a helyettesítéseket adjuk hozzá, mert van olyan eset, amikor
                //         az állomány adatai nem egyeznek meg az órarend adataival
                //       - a hiányzásokat, majd később adjuk hozzá
                if ('helyettesitesek' == $table)
                {
                  $query = 'INSERT INTO '.$table.' ('.$fieldFelhasznaloID.',idoszakID,osztalyID,tantargyID,ora,datum,'.$fieldID.$helyettesitettIDfield.') VALUES('.
                    $tanarok[utf8ToLatin2($tanar)].','.
                    $idoszakID.','.
                    $osztalyok[utf8ToLatin2($osztaly)].','.
                    $tantargyak[utf8ToLatin2($tantargy)].','.
                    $ora.','.
                    '"'.$datum.'",'.
                    $okok[$table2][utf8ToLatin2($ok)].
                    // helyettesítések esetén a helyettesített nevére is szükség van
                    $helyettesitettIDvalue.
                    ')';
                
                  $this->db->Execute($query);
                }
                
                // NOTE: - hiányzás esetén csak a dátumot jegyezzük meg
                if ('hianyzasok' == $table)
                {
                  $lFelhID = $tanarok[utf8ToLatin2($tanar)];
                  $lHianyzokaID = $okok[$table2][utf8ToLatin2($ok)];
                  
                  // Lekérdezzük a hiányzás okának az azonosítóját
                  $hianyzasDatumok[$lFelhID][$datum] = array('hianyzasokaID'=>$lHianyzokaID,
                                                             // alapból minden hiányzás igazolt
                                                             'igazolt'=>1);
                }
                
              } //d
            } // ora
          } // datum
        } // table
      } // tanar
      
      // NOTE: - a hiányzások betöltése után hozzáadjuk a teljes napok hiányzásait
      foreach($hianyzasDatumok as $keyFelhID=>$valueFelhID)
        foreach($valueFelhID as $keyDatum=>$valueDatum)
          insertHianyzasData($this->db,$this->response,$idoszakID,
                             $keyFelhID,$keyDatum,
                             0,24,$valueDatum['hianyzasokaID'],$valueDatum['igazolt']);
            
      $this->db->Execute('COMMIT');
      
      // Esetleges hibák esetén ez tárolja a hiba üzenetét
      $infoMsg = '';
      // Ha vannak az adatbázisból hiányzó tanárok, akkor hozzáadjuk a hibaüzenethez
      if (0 < count($hianyzoTanarok))
        $infoMsg .= 'Tanárok:['.utf8ToLatin2(implode(',',$hianyzoTanarok)).']';
      if (0 < count($hianyzoTantargyak))
        $infoMsg .= 'Tantárgyak:['.utf8ToLatin2(implode(',',$hianyzoTantargyak)).']';
      if (0 < count($hianyzoOsztalyok))
        $infoMsg .= 'Osztályok:['.utf8ToLatin2(implode(',',$hianyzoOsztalyok)).']';
      
      if ('' != $infoMsg)
        $this->response->sendError('Az alábbi adatok hiánya miatt előfordulhat, '.
          'hogy nem töltődött be minden adat:'.$infoMsg,true,true);
    }
    
    /**
     * Cella tartalmának átalakítása dátummá.
     * 
     * @param cell {string} a cella tartalma
     * @return {string} a dátum               
     */         
    function datum($cell)
    {
      // Hónapok és sorszámaik összerendelése
      $honapIndex = array(
        latin2ToUtf8('január')     => '01',
        latin2ToUtf8('február')    => '02',
        latin2ToUtf8('március')    => '03',
        latin2ToUtf8('április')    => '04',
        latin2ToUtf8('május')      => '05',
        latin2ToUtf8('június')     => '06',
        latin2ToUtf8('július')     => '07',
        latin2ToUtf8('augusztus')  => '08',
        latin2ToUtf8('szeptember') => '09',
        latin2ToUtf8('október')    => '10',
        latin2ToUtf8('november')   => '11',
        latin2ToUtf8('december')   => '12'
      );
      
      $d = explode(' ',$cell);
      
      $nap = substr($d[1],0,-1);
      // Kiegészítés nullával
      if (1 == strlen($nap))
        $nap = '0'.$nap;
      
      return $d[3].'-'.$honapIndex[$d[2]].'-'.$nap;
    }
    
    /**
     * Cella tartalmának átalakítása órává és tantárgyá.
     * 
     * @param cell {string} a cella tartalma
     * @return {Array(2):number,string} az óra és a tantárgy               
     */         
    function oraTantargy($cell)
    {
      $d = explode(' ',$cell);
      
      $ora = (int)substr($d[0],0,-1);
      unset($d[0]);
      
      return array($ora,implode(' ',$d));
    }
    
    /**
     * Adatok kinyerése xls állományból.
     * NOTE: - az asszociatív tömb kulcsainak utf8-ba kódolása is egyúttal megtörténik     
     * 
     * @param fileName {string} a feldolgozandó fájl neve
     * @return {array?null} a kinyert adatok asszociatív tömbbe rendezve, vagy
     *   hiba esetén null                    
     */         
    function getDataFromXLS($fileName)
    {
      // Ha a fájl nem létezik akkor kilépünk
      if (!file_exists($fileName)) 
        return null;
      
      // Ebben tároljuk majd az adatokat
      $data = array();
      
      $xls = new Spreadsheet_Excel_Reader();
      $xls->setOutputEncoding('ISO-8859-2');
      $xls->setRowColOffset(0);
      $xls->read($fileName);
            
      // Munkafüzet
      $sheet = $xls->sheets[0];
      // Cellák
      $cells = $sheet['cells'];
      
      // A hasznos adatok a 3. sortól kezdődnek
      $row = 3;
      // Első tanár nevének beolvasása
      $tanar = $cells[$row][0];
      
      // Automatizáláshoz szükséges tömbök
      $colIndex = array(1,5);
      $idKey = array('hianyzasokaID','helyettesitestipusaID');
      $hiheKey = array('hianyzasok','helyettesitesek');
            
      // Amíg van tanárnév
      while ('' != $tanar)
      {
        // Tanár nevének tárolása
        $data[$tanar] = array();
        // Megfelelő tevékenységek létrehozása
        $data[$tanar][$hiKey] = array();
        $data[$tanar][$heKey] = array();
        
        // Az adatok két sorral lentébb kezdődnek
        $row += 2;
        
        // Adatok első sorának a beolvasása
        $dataRow = $cells[$row];
        
        // Addig haladunk, amíg el nem érjük az 'Összesen:' tartalmú cellát
        while (latin2ToUtf8('Összesen:') != $dataRow[1])
        {
          // Hiányzás adatainak a beolvasása
          for ($i = 0; $i < count($hiheKey); $i++)
          {
            $index = $colIndex[$i];
            $key = $hiheKey[$i];
            // Ha tartalmaz adatokat a sor akkor beolvassuk
            if ('' != $dataRow[$index])
            { 
              $datum = $this->datum($dataRow[$index++]);
            
              if (!is_array($data[$tanar][$key][$datum]))
                $data[$tanar][$key][$datum] = array();
              
              $OT = $this->oraTantargy($dataRow[$index++]);
              $ora = $OT[0];
            
              if (!is_array($data[$tanar][$key][$datum][$ora]))
                $data[$tanar][$key][$datum][$ora] = array();
              
              $d = array('tantargy' => $OT[1],
                         'osztaly' => $dataRow[$index++],
                         $idKey[$i] => $dataRow[$index++]);
              $data[$tanar][$key][$datum][$ora][] = $d;
            }
          }
          
          // Következő adatsor beolvasása
          $row++;
          $dataRow = $cells[$row]; 
        }
        
        // A következő tanár neve három sorral lentébb van
        $row += 3;
        $tanar = $cells[$row][0];
      }
      
      return $data;
      
    }
    
    // @override         
    function removeDataList()
    {
      // Az állományok nevei
      $fileNames = $_POST[$this->primaryField];
      
      // Ha nem adtunk meg állományneveket akkor kilépünk
      if (!isset($fileNames))
        $this->response->sendError('Nem adott meg állományneveket!',true);
        
      // Állománynevek tömbjének elkészítése
      $fileNames = explode(',',$fileNames);
      
      // Ez a tömb tárolja azoknak a fájloknak a nevét, amelyeket nem lehetett törölni
      $undeletedFiles = array();
      
      for ($i = 0; $i < count($fileNames); $i++)
      {
        // Állománynév formátumának ellenörzése
        $this->testDbValue($this->primaryField,$fileNames[$i]);
        // Állomány nevének utf8-ba kódolása
        $fileName = latin2ToUtf8($fileNames[$i]);
        // Állomány törlése
        if (false == unlink($this->path.$fileName))
          $undeletedFiles[] = $fileName;
      }
      
      // Ha voltak olyan állományok, amelyeket nem lehetett törölni, akkor jelezzük
      if (0 < count($undeletedFiles))
        $this->response->sendError('Az alábbi állományok törlése meghiusúlt:'.utf8ToLatin2(implode(',',$undeletedFiles)),true,true);  
    }
    
  }
  
?>
