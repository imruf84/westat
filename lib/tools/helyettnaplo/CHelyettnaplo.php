<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../kiadottparancsok/Kiadottparancsok.php');
  require_once('../helyettesitesek/CHelyettesitesek.php');
   
  /**                                                        
   * Helyettesítési napló kezelését megvalósító osztály.
   */
  class CHelyettnaplo extends CHelyettesitesek
  {
    // @override
    function addFields()
    {
      parent::addFields();
      // Parancsok
      $this->getDataListAction = 'GET_HELYETTNAPLO_LIST';

      // Értékként megengedjük a -1-et is      
      $this->fields['csoportID'] = new CField('integer','',$this->response,-1 ,PHP_INT_MAX);
      
      // Bővítjük a rendezést a felhasználó nevére is
      $this->orderByFields[] = 'helyettesitoNev';
      
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
      
      // Eltároljuk a törölve státuszt
      $torolve = $filterValues['torolve'];

      // Töröljük a törölve státuszt a szűrők listájából
      // NOTE: - később hozzáadjuk a feltételekhez ha szükséges
      unset($filterFields[array_search('torolve',$filterFields)]);
      unset($filterValues['torolve']);

      // Létrehozzuk a szűrőkből a feltételt    
      $filterExpr = $this->createFilterExpr($filterFields,$filterValues,true);
      
      // BUG: valamilyen hiba folytán a torolve mező nem kerül bele a feltételbe,
      //       ezért kézzel adjuk hozzá, ha szükséges
      if (!(0 > $torolve))
        $filterExpr .= ' AND torolve='.$torolve;
      
      
      // Felhasználó típusának a lekérdezése
      $tipus = $this->getFelhasznaloTipus($_SESSION['felhasznaloID']);
      
      // Hozzáadjuk a szűrőhöz a csoporthoz tartozó felhasználók neveit
      // NOTE: - negatív szám esetén és leader, operator és admin esetében egy speciális érték 
      //         esetében intézményi szinten kérhetjük le az adatokat
      if (!(0 > $csoportID) && ('admin' == $tipus || 'operator' == $tipus || 'leader' == $tipus))
        $filterExpr .= ' AND helyettesitoID IN(SELECT felhasznaloID FROM felhasznalok WHERE csopID='.$csoportID.')';
      
      $expr = '';
      if (in_array('osztalyNev',$fields)) {
        //$expr .= ' LEFT JOIN osztaly_cimkek ON osztaly_cimkek.osztalyCimkeID='.$this->tableName.'.osztalyID';
        $k = array_search('osztalyNev', $fields);
        $fields[$k] = ' GET_OSZTALY_NEV_BY_IDOSZAK('.$this->tableName.'.osztalyID,'.$this->tableName.'.idoszakID) AS osztalyNev ';
      }
      if (in_array('tantargyNev',$fields))
        $expr .= ' LEFT JOIN tantargyak ON tantargyak.tantargyID='.$this->tableName.'.tantargyID';
      if (in_array('helyettesitettNev',$fields))
      {
        $fields[array_search('helyettesitettNev',$fields)] = 'helyettesitett.felhasznaloNev AS helyettesitettNev';
        $expr .= ' LEFT JOIN felhasznalok helyettesitett ON helyettesitett.felhasznaloID='.$this->tableName.'.helyettesitettID';
      }
      if (in_array('helyettesitoNev',$fields))
      {
        $fields[array_search('helyettesitoNev',$fields)] = 'helyettesito.felhasznaloNev AS helyettesitoNev';
        $expr .= ' LEFT JOIN felhasznalok helyettesito ON helyettesito.felhasznaloID='.$this->tableName.'.helyettesitoID';
      }
      if (in_array('helyettesitestipusaNev',$fields))
        $expr .= ' LEFT JOIN helyettesitestipusai ON helyettesitestipusai.helyettesitestipusaID='.
          $this->tableName.'.helyettesitestipusaID';
     
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
