<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Tantárgyelszámolások kezelését megvalósító osztály.
   */
  class CTantargyelsz extends CService
  {    
    // Tantárgy típusának lehetséges értékei
    protected $tipusValues = array('elm','gyak','tkt','ef','tktgy','efgy');
    // Tantárgy típusainak nevei
    protected $tipusNames = array('-'=>'-',
                                  'elm'=>'Elmélet',
                                  'gyak'=>'Gyakorlat',
                                  'tkt'=>'Tanórán kívüli tevékenység',
                                  'ef'=>'Egyéni foglalkozás',
                                  'tktgy'=>'Tanórán kívüli tevékenység (gyakorlat)',
                                  'efgy'=>'Egyéni foglalkozás (gyakorlat)');
                                  
    // Szakfeladat típusának lehetséges értékei
    protected $szakfValues = array(0,1,2,3,4,5);
    // Szakfeladat típusainak nevei
    protected $szakfNames = array('-'=>'-',
                                  0=>'Szakfeladat nélkül',
                                  1=>Felnőttképzés,
                                  2=>Szakközépiskola,
                                  3=>Szakiskola,
                                  4=>Szakképzés,
                                  5=>Kollégium);
                                  
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_TANTARGYELSZ_LIST';
      $this->getDataAction = 'GET_TANTARGYELSZ_DATA';
      $this->insertDataAction = 'INSERT_TANTARGYELSZ_DATA';
      $this->modifyDataAction = 'MODIFY_TANTARGYELSZ_DATA';
      $this->removeDataAction = 'REMOVE_TANTARGYELSZ_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'tantargyelsz';
      $this->primaryField = 'tantargyID';
      $this->orderByFields = array('tantargyNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tanevID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['felhasznaloID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tipus'] = new CField('string','oneWord',$this->response,1,5);
      $this->fields['szakfelsz'] = new CField('integer','',$this->response,0,5);
    }
    
    // @override
    function testDbValue2($field,$value)
    {
      if ('tipus' == $field)
        return in_array($value,$this->tipusValues);
        
      if ('szakfelsz' == $field)
        return in_array($value,$this->szakfValues);
        
      return parent::testDbValue2($field,$value);
    }
  
    // @override
    function getDataList()
    {
      // Alapadatok lekérdezése
      $value = $this->getDbFieldValues(array('tanevID','felhasznaloID'));
      
      $tanevID = $value['tanevID'];
      $felhasznaloID = $value['felhasznaloID'];
        
      // Tanév tantárgyelszámolásainak a lekérdezése
      $rs = $this->db->execute('SELECT tantargyID FROM tantargyelsz WHERE '.
        'tanevID='.$tanevID.' AND felhasznaloID='.$felhasznaloID);
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba az óraelszámolások listájának lekérdezése során!',true);
      // Lekérdezés eredményének átalakítása tömbbé
      $oraelszk = array();
      while ($record = $rs->FetchRow())
        $oraelszk[] = $record['tantargyID'];
            
      // Felhasználó által az adott tanévben oktatott tantárgyak lekérdezése
      // NOTE: - csak az adott vezetőhöz tartozó felhasználók neveit tartalmazza
      $rs = $this->db->execute(
        'SELECT orak.tantargyID,tantargyNev
        FROM orak 
        LEFT JOIN tantargyak ON tantargyak.tantargyID = orak.tantargyID
        WHERE orarendID
        IN (
          SELECT orarendID
          FROM orarendek
          WHERE tanevID = '.$tanevID.'
        )
        AND felhasznaloID = '.$felhasznaloID.'
        
        UNION
        
        SELECT tantargyelsz.tantargyID,tantargyNev
        FROM tantargyelsz
        LEFT JOIN tantargyak ON tantargyak.tantargyID = tantargyelsz.tantargyID
        WHERE 
        tanevID = '.$tanevID.'
        AND felhasznaloID = '.$felhasznaloID.'
        
        UNION
        
        SELECT tktef.tantargyID,tantargyNev
        FROM tktef
        LEFT JOIN tantargyak ON tantargyak.tantargyID = tktef.tantargyID
        WHERE tktef.felhasznaloID = '.$felhasznaloID.'
        AND tktef.idoszakID
        IN (
         SELECT idoszakID FROM idoszakok WHERE tanevID = '.$tanevID.
        ')
        GROUP BY tantargyID'.
        $this->getOrderByExpression());
      
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a tantárgyak listájának lekérdezése során!',true);
      
      
      // Válaszként elküldjük azt is, hogy a felhasználó óraadó-e vagy sem?
      $a = dbExec($this->db, 'SELECT oraado FROM felhasznalok WHERE felhasznaloID='.$felhasznaloID);   
      
      // Hiba esetén kilépünk
      if (!(0 < count($a)))
        $this->response->sendError('Hiba a felhasználó adatainak (óraadó-e?) a lekérdezése során!',true);
      
      
      // Átalakítjuk az eredményt tömbbé
      // NOTE: - automatikusan hozzáadjuk a 'meghatarozva' mező értékeit is
      $tantargyak = array();
      while ($record = $rs->FetchRow())
      {
        $tantargyID = $record['tantargyID'];
        
        // Tantárgyelszámolás típusának a lekérdezése
        $tipus = $this->getTantargyelszTipus($tanevID,$felhasznaloID,$tantargyID);
        // Név meghatározása
        $tipus = $this->tipusNames[$tipus];
        
        // Szakfeladat elszámolás típusának a lekérdezése
        $szakf = $this->getSzakfeladatelszTipus($tanevID,$felhasznaloID,$tantargyID);
        // Név meghatározása
        $szakf = $this->szakfNames[$szakf];
        
        $tantargyak[] = array('tantargyID' => $tantargyID,
                              'tantargyNev' => utf8ToLatin2($record['tantargyNev']),
                              'tipus' => $tipus,
                              'szakfelsz' => $szakf);
      }
      
      if (0 < count($tantargyak))
        $tantargyak[0]['oraado'] = $a[0]['oraado'];
               
      // Válasz küldése                 
      $this->response->addArray($tantargyak);
      
      return $rs;
    }
    
    // @override
    function createModifyExpression($fields,$values,$id)
    {
      // Alapesetben csak a tantárgyazonosító szerepel az UPDATE lekérdezés
      // WHERE záradékában, ami hibákat okozhat, ezért ki kell egészíteni
      // más mezőkkel az egyértelműbb azonosítás céljából
      return $this->primaryField.'='.$id.
             ' AND felhasznaloID='.$values['felhasznaloID'].
             ' AND tanevID='.$values['tanevID'];
    }
    
    // @override
    function createGetDataExpression($fields,$id)
    {
      // Mezők értékei
      $values = $this->getDbFieldValues($fields);
      
      return $this->createModifyExpression($fields,$values,$id);
    }
    
  }
  
?>
