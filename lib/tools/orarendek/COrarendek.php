<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../../arrayFromQuery.php');
   
  /**                                                        
   * Órarend kezelését megvalósító osztály.
   */
  class COrarendek extends CService
  {
    protected $path;
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_ORAREND_LIST';
      $this->getDataListDbAction = 'GET_ORAREND_LIST_DB';
      $this->getDataListAction2 = 'GET_ORAREND_HETEK';
      $this->getDataAction = 'GET_ORAREND_DATA';
      $this->insertDataAction = 'INSERT_ORAREND_DATA';
      $this->modifyDataAction = 'MODIFY_ORAREND_DATA';
      $this->removeDataAction = 'REMOVE_ORAREND_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'orarendek';
      $this->primaryField = 'orarendID';
      $this->orderByFields = array('tanevID','orarendID');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('string','date',$this->response,10,10);
      $this->fields['tanevID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      
      // Órarendek elérési útja
      $this->path = '../../../../orarend/';
    }
    
    // @override
    function doActionFunc($action)
    {
      switch ($action)
      {
        // Adatbázisban szereplő órarendek listájának a lekérdezése
        case $this->getDataListDbAction:
          $this->getDataListDb();
        break;
        // Adatbázisban szereplő órarendek listájának a lekérdezése
        case $this->getDataListAction2:
          $this->getDataList2();
        break;
        default:
          parent::doActionFunc($action);
      }
    }
    
    /**
     * Órarendek listájának lekérdezése a szerverről.
     * 
     * @return {Array():string} az órarendek könyvtárainak nevei          
     */         
    function getListFromServer()
    {
      // Órarendek kilistázása a szerverről
      $a = scandir($this->path);
      // Kiszedjük a felesleges elemeket        
      $a = array_diff($a,array('.','..'));
      
      $i = 0;
      $dirs = array();
      foreach ($a as $dir)
      {
        $b = substr($dir,7);
        // Csak a megfelelő könyvtárak jöhetnek (pl orarend101222old már nem jó)
        if (6 == strlen($b))
          $dirs[$i++] = '20'.substr($b,0,2).'-'.substr($b,2,2).'-'.substr($b,4,2);
      }
        
      return $dirs;
    }
    
    /**
     * Órarendek listájának lekérdezése az adatbázisból.
     * 
     * @return {Array():string} az órarendek könyvtárainak nevei          
     */         
    function getListFromDb()
    {
      // Órarendek kilistázása az adatbázisról
      $rs = $this->getDataListQuery(array($this->primaryField));
      
      if (true != $rs)
        $this->response->sendError('Hiba az órarendek lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $dirs = array();
      while ($record = $rs->FetchRow())
        $dirs[] = $record[$this->primaryField];
        
      return $dirs;
    }
    
    /**
     * Tömb elemeinek kombinálása.
     * NOTE: - az órarendek neveinek összefűzése
     * 
     * @param a1 {Array():string} az első tömb
     * @param a2 {Array():string} a második tömb                    
     */         
    function combineLists($a1,$a2)
    {
      $a = array();
      
      // Átmásoljuk az első tömb elemeit
      $i = 0;
      for (; $i < count($a1); $i++)
        $a[$i] = $a1[$i];
        
      // A másodikból csak azokat rakjuk bele, amelyek nincsenek még benne
      for ($j = 0; $j < count($a2); $j++)
        if (!in_array($a2[$j],$a))
          $a[++$i] = $a2[$j];
      
      return $a;
    }
    
    // @override
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Órarendek kilistázása a szerverről
      $dirsServer = $this->getListFromServer();
      // Órarendek kilistázása az adatbázisból
      $dirsDb = $this->getListFromDb();
      
      // A listák kombinálása
      $dirs = $this->combineLists($dirsServer,$dirsDb);
      
      // ABC sorrendbe rendezzük az órarendek neveit
      sort($dirs);
              
      // Válasz elkészítése
      $dirArray = array();
      foreach ($dirs as $dir)
        $dirArray[] = array($this->primaryField => utf8ToLatin2($dir),
                            'letrehozva' => in_array($dir,$dirsDb)?'X':'-');
            
      // Órarendlista hozzáadása a válaszhoz
      $this->response->addArray($dirArray);
    }
    
    /**
     * Adatbázisban szereplő órarendek listájának a lekérdezése.     
     */         
    function getDataListDb()
    { 
      return parent::getDataList();
    }
    
    /**
     * Órarendek változatainak a listájának a lekérdezése.
     */         
    function getDataList2()
    {
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Ha nem adtuk meg az órarend azonosítóját, akkor két változatot küldünk csak vissza
      // TODO: - javítani
      if (!isset($_POST[$this->primaryField]))
      {
        $this->response->addArray(array(
          array('het' => '0','het' => 'A'),
          array('het' => '1','het' => 'B'))
        );
        return;
      }
      
      // Mezők értékei
      $values = $this->getDbFieldValues($fields);
      // Órarend azonosítója idézőjelek nélkül
      $orarendID = mb_substr($values[$this->primaryField],1,-1,'UTF-8');
      
      // Órarend változatainak a lekérdezése
      $rs = $this->db->execute('SELECT het FROM orak WHERE orarendID="'.$orarendID.'" GROUP BY het');        
      
      if (true != $rs)
        $this->response->sendError('Hiba az órarend változatainak a lekérdezése közben!',true);
        
      // Átalakítjuk az eredményt tömbbé
      // Hetek betűjelei
      $hetBetuk = array('A','B','C','D','E');
      
      $hetek = array();
      while ($record = $rs->FetchRow())
        $hetek[] = array('het' => $record['het'],
                         'het' => $record['het']);
               
      // Válasz küldése                 
      $this->response->addArray($hetek);
      
      return $rs;
    }
    
    /**
     * XML szöveg hasznos részének kivágása és tömbbé alakítása.
     * 
     * @param xml {string} az xml szövege     
     * @param from {string} mettől
     * @param to {string} meddig          
     * @param cut {string} vágás     
     * @param removeFirst {boolean} ha igaz, akkor törlődik az első elem ([true])     
     * @return {string} a kivágott rész
     */         
    function cutXml($xml,$from,$to,$cut,$removeFirst=true)
    {
      $a = array();
      
      $lXml = $xml;
      // Eldobjuk a tanárok előtti részt
      $pos = strripos($lXml,$from);
      $lXml = substr($lXml,$pos);
      // Eldobjuk a táblázat utáni részt
      $pos = stripos($lXml,$to);
      $lXml = substr($lXml,0,$pos);
      
      $a = explode($cut,$lXml);
      // Nincs szükségünk az első elemre
      if (true == $removeFirst)
        unset($a[0]);
        
      return $a;
    }
    
    /**
     * XML állomány attribútum értékének a lekérdezése.
     * NOTE: - a hibakezelések nincsenek lekódolva     
     * 
     * @param xml {string} az xml szövege     
     * @param attribName {string} az attribútum neve     
     * @return {string} az attribútum értéke               
     */         
    function getXmlAttribValue($xml,$attribName)
    {
      $lXml = $xml;
      $pos = strpos($lXml,$attribName);
      
      // Ha nem találtuk meg akkor kilépünk
      if (is_bool($pos) && (false == $pos)) return '-';
      
      // Levágjuk az attribútum nevét
      $lXml = substr($lXml,$pos+strlen($attribName));
      
      // Ha az attribútum után közvetlenül ="" szerepel, akkor az attribútumnak nincs értéke
      // pl. olyan esetben, amikor nincs megadva tanár
      if ('=""' == substr($lXml,0,3)) return '';
      
      // Ha van csillag, akkor addig keresünk
      // BUG: - más helyek is tartalmazhatnak *-ot (pl. tantárgynév),
      //        ezért * helyett "*-ra kell rákeresni először, mert az azonosítók
      //        esetében szerepel csak * közvetlenül a legelső helyen 
      //$pos = strpos($lXml,'*');
      $pos = strpos($lXml,'"*');
      // Ennyit ugrunk majd előre
      $posOffset = 2;
      
      // Ha nincs, akkor az idézőelig keresünk
      if (is_bool($pos) && (false == $pos))
      { 
        $pos = strpos($lXml,'"');
        $posOffset = 1;
      }
      
      // Levágjuk a szöveg elejét
      $lXml = substr($lXml,$pos+$posOffset);
      
      // Levágjuk a szöveg végét is
      $lXml = substr($lXml,0,strpos($lXml,'"'));
      
      return $lXml;
    }
    
    /**
     * Adatok beolvasása xml állományból.     
     * 
     * @param fileName {string} a feldolgozandó fájl neve
     * @return {array?null} a kinyert adatok asszociatív tömbbe rendezve, vagy
     *   hiba esetén null                    
     */         
    function getDataFromXML($fileName)
    {
      // Ha a fájl nem létezik akkor kilépünk
      if (!file_exists($fileName)) 
        return null;
        
      $orig_xml = utf8ToLatin2(file_get_contents($fileName));
      
      $data = array();
      
      // Tanárok beolvasása
      $data['tanarok'] = array();
      
      $teachers = $this->cutXml($orig_xml,'<teachers','</teachers>','<teacher ');
      
      foreach ($teachers as $teacher)
      {
        $lTeacher = $teacher;
        
        $id = $this->getXmlAttribValue($lTeacher,'id');
        $name = $this->getXmlAttribValue($lTeacher,'name');
        $short = $this->getXmlAttribValue($lTeacher,'short');
      
        $data['tanarok'][$id] = array('nev'=>latin2ToUtf8($name),'oNev'=>latin2ToUtf8($short));
      }
      
      
      // Osztályok beolvasása
      $data['osztalyok'] = array();
      
      $classes = $this->cutXml($orig_xml,'<classes','</classes>','<class ');
      
      foreach ($classes as $class)
      {
        $lClass = $class;
        
        $id = $this->getXmlAttribValue($lClass,'id');
        $name = $this->getXmlAttribValue($lClass,'name');
        $short = $this->getXmlAttribValue($lClass,'short');
     
        $data['osztalyok'][$id] = array('nev'=>latin2ToUtf8($name),'oNev'=>latin2ToUtf8($short));
      }
      
      
      // Tantárgyak beolvasása
      $data['tantargyak'] = array();
     
      $subjects = $this->cutXml($orig_xml,'<subjects','</subjects>','<subject ');
      
      foreach ($subjects as $subject)
      {
        $lSubject = $subject;
        
        $id = $this->getXmlAttribValue($lSubject,'id');
        $name = $this->getXmlAttribValue($lSubject,'name');
        $short = $this->getXmlAttribValue($lSubject,'short');
       
        $data['tantargyak'][$id] = array('nev'=>latin2ToUtf8($name),'oNev'=>latin2ToUtf8($short));
      }
      
      
      // Órák beolvasása
      $data['orak'] = array();
    
      $cards = $this->cutXml($orig_xml,'<cards','</cards>','<card ');
      
      foreach ($cards as $card)
      {
        $lCard = $card;
        
        // Elképzelhető, hogy ugyanaz a tanár több osztálynak is tart órát (pl osztály összevonásoknál),
        // ezért tömbként kell kezelni
        // NOTE: - akkor van több tanár, ha a string tartalmaz vesszőt
        $class = $this->getXmlAttribValue($lCard,'classids');
        $subject = $this->getXmlAttribValue($lCard,'subjectid');
        // Elképzelhető, hogy több tanár is tartja az órát (pl állandó helyettesítés),
        // ezért tömbként kell kezelni
        // NOTE: - akkor van több tanár, ha a string tartalmaz vesszőt
        $teacher = $this->getXmlAttribValue($lCard,'teacherids');
        $day = $this->getXmlAttribValue($lCard,'day');
        $period = $this->getXmlAttribValue($lCard,'period');
        $duration = $this->getXmlAttribValue($lCard,'durationperiods');
        $weeks = $this->getXmlAttribValue($lCard,'weeks');
         
        // Ha több osztályunk is van, akkor szétdaraboljuk
        $classes = explode(',', $class);
        // Két lehetőség van: 1. minden osztállyal hozzáadjuk az órákat az adatbázishoz,
        //                       majd a lekérdezések során odafigyelünk arra, hogy
        //                       az azonos időben tartott órákat csak egynek vegye, és
        //                       fűzze össze az órákat
        //                    2. az osztályoknak tartott órák közül csak az egyik osztálynak tároljuk
        //                    3. az osztályokat összefűzve létrehozunk egy új osztályt, 
        //                       és annak írjuk be az órát
        //                       NOTE: - ez tűnik a legegyszerűbbnek
        
        if (1 < count($classes))
        {
          // Az első elem már nem tartalmaz *-ot, és tuti, hogy létezik első elem
          $realClasses = array($classes[0]);
        
          for ($i = 1; $i < count($classes); $i++)
            $realClasses[] = substr($classes[$i],strpos($classes[$i],'*')+1);          
        
          // Ez tartalmazza majd az új összefésült osztály nevét
          $realClassNames = array();
          foreach ($realClasses as $c)
          {
            $realClassNames[] = $data['osztalyok'][$c]['oNev'];
          }
          $newClassName = implode('/', $realClassNames);
        
          // Megnézzük, hogy szerepel-e már az osztály a tömbben?
          $class = false;
          foreach ($data['osztalyok'] as $c_key=>$c)
          {
            // Ha igen, akkor tároljuk az azonosítóját
            if ($newClassName === $c['oNev'])
            {
              $class = $c_key;
              break;
            }
          }
        
          // Ha nem szerepel még az összefűzött osztály, akkor azt új osztályként adjuk hozzá
          if (false === $class)
          {
            $class = count($data['osztalyok'])+1;
            $data['osztalyok'][$class] = array('nev'=>latin2ToUtf8($newClassName),'oNev'=>latin2ToUtf8($newClassName));
          }
        }
        
                
        // Ha több tanárunk is van, akkor szétdaraboljuk
        $teachers = explode(',',$teacher);
        // Az első elem már nem tartalmaz *-ot, és tuti, hogy létezik első elem
        $realTeachers = array($teachers[0]);
        if (1 < count($teachers))
        {
          for ($i = 1; $i < count($teachers); $i++)
            $realTeachers[] = substr($teachers[$i],strpos($teachers[$i],'*')+1);          
        }
        
        foreach ($realTeachers as $t)
        {
          $data['orak'][] = array('osztaly'=>$class,'tantargy'=>$subject,'tanar'=>$t,'nap'=>$day,'ora'=>$period,'hossz'=>$duration,'hetek'=>$weeks);
        }
      }
        
      return $data;
    }
    
    // @override
    function insertData()
    {
      // Órarend hozzáadása 
      parent::insertData();
      
      // Órák hozzáadása
      
      // Mezők listája
      $fields = $this->getDbFields($_POST['FIELDS']);
      // Mezők értékei
      $values = $this->getDbFieldValues($fields);
      // Órarend azonosítója idézőjelek nélkül
      $orarendID = mb_substr($values[$this->primaryField],1,-1,'UTF-8');
      // Tanév azonosítója
      $tanevID = $values['tanevID'];
      
      // Órarend fájlnevének a meghatározása
      $dirName = 'orarend'.substr($orarendID,2,2).substr($orarendID,5,2).substr($orarendID,8,2);
      $fileName = $this->path.$dirName.'/orarend.xml';
      $data = $this->getDataFromXML($fileName);
      
      // Órarend beolvasása
      if (null == $data)
      {
        // Töröljük a hozzáadott órarendet
        $this->db->Execute('DELETE FROM '.$this->tableName.' WHERE '.
          $this->primaryField.'='.$values[$this->primaryField]);
        
        $this->response->sendError('Hiba az órarend ('.$orarendID.
          ') megnyitása közben! Az órarendfáj nem található (orarend.xml)!',true);
      }
      
      // Különböző adatok lekérdezése keresés céljából
      // NOTE: - az SQL nem tesz különbséget pl. 'a' és 'á' között, ezért
      //         a keresést egy tömb segítségével végezzük majd el, kikerülve az SQL-t
      $tanarok = arrayFromQuery($this->db,'felhasznalok','felhasznaloNevO','felhasznaloID');
      
      //$osztalyok = arrayFromQuery($this->db,'osztaly_cimkek','osztalyCimkeNevO','osztalyCimkeID','tanevID='.$tanevID);
      $osztalyok = arrayFromQuery($this->db,'osztalyokcimkei LEFT JOIN osztaly_cimkek ON osztaly_cimkek.osztalyCimkeID=osztalyokcimkei.osztalyCimkeID ','osztalyCimkeNevO','osztalyID','osztalyokcimkei.tanevID='.$tanevID);
      
      $tantargyak = arrayFromQuery($this->db,'tantargyak','tantargyNevO','tantargyID');      
      
      // Adatok adatbázisba írása

      $this->db->Execute('START TRANSACTION');

      foreach ($data['tanarok'] as $tanar)
      {
        if (!in_array(utf8ToLatin2($tanar['oNev']),array_keys($tanarok)))
        {    
          $this->db->Execute('INSERT INTO felhasznalok (felhasznaloNev,felhasznaloNevO,felhasznaloNevH)'.
            'VALUES ("'.$tanar['nev'].'","'.$tanar['oNev'].'","'.$tanar['nev'].'")');
              
          $tanarok = arrayFromQuery($this->db,'felhasznalok','felhasznaloNevO','felhasznaloID');
        }
          
      }
 
      $missingClasses = array();
      foreach ($data['osztalyok'] as $osztaly)
      {
        
        if (!in_array(utf8ToLatin2($osztaly['oNev']),array_keys($osztalyok)))
        {
          $this->db->Execute('INSERT INTO osztaly_cimkek (tanevID,osztalyCimkeNev,osztalyCimkeNevO,osztalyCimkeNevH)'.
            'VALUES ('.$tanevID.',"'.$osztaly['nev'].'","'.$osztaly['oNev'].'","'.$osztaly['nev'].'")');

          $missingClasses[] = $osztaly['oNev'];       
          // Nincs szükség újralekérdezésre, hiszen az osztalyokcimkei tábla nem módosul
          //$osztalyok = arrayFromQuery($this->db,'osztaly_cimkek','osztalyCimkeNevO','osztalyCimkeID','tanevID='.$tanevID);
        }
          
      }
        
      foreach ($data['tantargyak'] as $tantargy)
      {
        if (!in_array(utf8ToLatin2($tantargy['oNev']),array_keys($tantargyak)))
        {    
          $this->db->Execute('INSERT INTO tantargyak (tantargyNev,tantargyNevO,tantargyNevH)'.
            'VALUES ("'.$tantargy['nev'].'","'.$tantargy['oNev'].'","'.$tantargy['oNev'].'")');
              
          $tantargyak = arrayFromQuery($this->db,'tantargyak','tantargyNevO','tantargyID');
        }
          
      }
        
      foreach ($data['orak'] as $ora)
      {
        $hossz = $ora['hossz'];
        $hetek = array();
          
        // Elkészítjük a hetek tömbjét
        for ($i = 0; $i < strlen($ora['hetek']); $i++)
          if ('0' !== $ora['hetek'][$i]) $hetek[] = $i;
          
        foreach ($hetek as $het)
          for ($i = 0; $i < $hossz; $i++)
          {
            // Csak akkor adjuk hozzá, ha minden szükséges adat meg van adva
            if ('' != $ora['tanar'])
            {
              $rs = $this->db->Execute(
                'INSERT INTO orak (orarendID,felhasznaloID,osztalyID,tantargyID,het,nap,ora)
                 VALUES(
                 "'.$orarendID.'",'.
                 $tanarok[utf8ToLatin2($data['tanarok'][$ora['tanar']]['oNev'])].','.
                 $osztalyok[utf8ToLatin2($data['osztalyok'][$ora['osztaly']]['oNev'])].','.
                 $tantargyak[utf8ToLatin2($data['tantargyak'][$ora['tantargy']]['oNev'])].','.
                 $het.','.$ora['nap'].','.($ora['ora']+$i).'
                )');
            }
          }
      }
      
      $this->db->Execute('COMMIT');
      
      // Ha vannak hiányzó osztályok, akkor jelezzük
      if (0 < count($missingClasses)) 
      {
        $this->response->sendError('Az alábbi osztálycímkékhez nincs osztály hozzárendeve: '.utf8ToLatin2(implode(',',$missingClasses)),true);
      }
                    
    }
    
    // @override
    function createRemoveExpression($ids)
    {
      // Mivel az órarend azonosítója szöveg ezért a lekérdezéshez az értékeket
      // idézőjelek közé kell tenni
      return $this->primaryField.' IN("'.implode('","',$ids).'")';
    }
    
  }
  
?>
