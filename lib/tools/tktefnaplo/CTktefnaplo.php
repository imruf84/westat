<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../kiadottparancsok/Kiadottparancsok.php');
  require_once('../tktef/CTktef.php');
   
  /**                                                        
   * Tanórán kívüli tevékenységek és egyéni foglalkozások naplóját kezelő osztály.
   */
  class CTktefnaplo extends CTktef
  {
    // @override
    function addFields()
    {
      parent::addFields();
      // Parancsok
      $this->getDataListAction = 'GET_TKTEFNAPLO_LIST';

      // Értékként megengedjük a -1-et is      
      $this->fields['csoportID'] = new CField('integer','',$this->response,-1,PHP_INT_MAX);
      
      // Bővítjük a rendezést a felhasználó nevére is
      $this->orderByFields[] = 'felhasznaloNev';
      
      // Jelezzük, hogy nincs szükség a parancs tárolására
      // NOTE: - ez azért kell, mert nem rendelkezünk felhasználói azonosítóval,
      //         ezért az ősosztály függvénye hibával leállna
      $this->dontLogAction = true;
    }
    
    // @override
    function getDataListQuery($fields,$filterFields,$filterValues)
    { 
      // Eltároljuk a csoportazonosítót
      $csoportID = $filterValues['csoportID'];
      
      // Töröljük a csoportazonosítót a szűrők listájából
      unset($filterFields[array_search('csoportID',$filterFields)]);
      unset($filterValues['csoportID']);

      // Létrehozzuk a szűrőkből a feltételt    
      $filterExpr = $this->createFilterExpr($filterFields,$filterValues,true);
      
      
      // Felhasználó típusának a lekérdezése
      $tipus = $this->getFelhasznaloTipus($_SESSION['felhasznaloID']);
      
      // Hozzáadjuk a szűrőhöz a csoporthoz tartozó felhasználók neveit
      // NOTE: - negatív szám esetén és leader, operator és admin esetében egy speciális érték 
      //         esetében intézményi szinten kérhetjük le az adatokat
      if (!(0 > $csoportID) && ('admin' == $tipus || 'operator' == $tipus || 'leader' == $tipus))
        $filterExpr .= ' AND tktef.felhasznaloID IN(SELECT felhasznaloID FROM felhasznalok WHERE csopID='.$csoportID.')';
      
      $expr = '';
      if (in_array('tantargyNev',$fields))
        $expr .= ' LEFT JOIN tantargyak ON tantargyak.tantargyID='.$this->tableName.'.tantargyID';
      if (in_array('felhasznaloNev',$fields))
        $expr .= ' LEFT JOIN felhasznalok ON felhasznalok.felhasznaloID='.$this->tableName.'.felhasznaloID';
     
      // Ha szükségünk van extra adatokra akkor... 
      if ('' != $expr)
      {        
        // ...új lekérdezést készítünk
        $rs = $this->db->execute('SELECT '.implode(',',$fields).' FROM '.
          $this->tableName.$expr.$filterExpr.$this->getOrderByExpression());
          
        return $rs;
      }
      else
        // Egyébként az eredeti lekérdezést futtatjuk
        return parent::getDataListQuery($fields,$filterFields,$filterValues);
    }
    
    // @override
    function removeDataList()
    {
      // Töröljük a csoportID-t a szűrők közül
      $filters = explode(',',$_POST['FILTERS']);
      unset($filters[array_search('csoportID',$filters)]);
      $_POST['FILTERS'] = implode(',',$filters);
      unset($_POST['csoportID']);
      
      return parent::removeDataList();  
    }
        
  }   
?>
