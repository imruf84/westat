<?php  
  require_once('adodb5/adodb.inc.php'); 
  require_once('config.php');
  require_once('CTestString.php');
  require_once('CharCoding.php');
  require_once('response.php');
  require_once('CField.php');
  require_once('dbExec.php');
  
  abstract class CService
  {
    protected $db;
    protected $response;
    protected $fields;
    protected $primaryfield;
    protected $tableName;
    protected $orderByFields;
    
    protected $getDataListAction;
    protected $getDataListCBAction;
    protected $getDataAction;
    protected $insertDataAction;
    protected $modifyDataAction;
    protected $removeDataAction;
    
    /**
     * Konstruktor.
     *      
     * @param response {CResponse} a válasz küldéséért felelős osztály referenciája
     */
    function __construct($response)
    {
      $this->fields = array();
      $this->primaryField = '';
      $this->tableName = '';
      $this->orderByFields = array();
      $this->response = $response;
      
      $this->getDataListAction = '';
      $this->getDataAction = '';
      $this->insertDataAction = '';
      $this->modifyDataAction = '';
      $this->removeDataAction = '';
      
      $this->addFields();
    }
    
    /**
     * Tantárgyelszámolás típusának a lekérdezése.
     * 
     * @param tanevID {number} a tanév azonosítója
     * @param felhasznaloID {number} a felhasználó azonosítója
     * @param tantargyID {number} a tantárgy azonosítója          
     * @return {string} a használható típusa          
     */         
    function getTantargyelszTipus($tanevID,$felhasznaloID,$tantargyID)
    {
      // Hiányzó adatok esetén '-'-at adunk vissza
      // NOTE: - ilyen akkor fordulhat elő, ha helyettesítéskor nincs megadva a helyettesitettID
      if ('' == $felhasznaloID)
        return '-';
    
      $rs = $this->db->execute('SELECT tipus FROM tantargyelsz WHERE tanevID='.$tanevID.
          ' AND felhasznaloID='.$felhasznaloID.' AND tantargyID='.$tantargyID);
          
      if (true != $rs)
        $this->response->sendError('Hiba a tantárgyelszámolás típusának lekérdezése során!',true);
          
      $tipusok = array();
      while ($record = $rs->FetchRow())
        $tipusok[] = $record['tipus'];        
      
      
      $tipus = (0 < count($tipusok)) ? $tipusok[0] : '-';
      
      return $tipus;
    }
    
    /**
     * Szakfeladat elszámolás típusának a lekérdezése.
     * 
     * @param tanevID {number} a tanév azonosítója
     * @param felhasznaloID {number} a felhasználó azonosítója
     * @param tantargyID {number} a tantárgy azonosítója          
     * @return {string} a használható típusa          
     */         
    function getSzakfeladatelszTipus($tanevID,$felhasznaloID,$tantargyID)
    {
      // Hiányzó adatok esetén '-'-at adunk vissza
      // NOTE: - ilyen akkor fordulhat elő, ha helyettesítéskor nincs megadva a helyettesitettID
      if ('' == $felhasznaloID)
        return '-';
    
      $rs = $this->db->execute('SELECT szakfelsz FROM tantargyelsz WHERE tanevID='.$tanevID.
          ' AND felhasznaloID='.$felhasznaloID.' AND tantargyID='.$tantargyID);
          
      if (true != $rs)
        $this->response->sendError('Hiba a tantárgyelszámolás típusának lekérdezése során!',true);
          
      $tipusok = array();
      while ($record = $rs->FetchRow())
        $tipusok[] = $record['szakfelsz'];        
      
      
      $tipus = (0 < count($tipusok)) ? $tipusok[0] : '-';
      
      return $tipus;
    }
    
    /**
     * Felhasználó típusának a lekérdezése.
     * 
     * @param felhasznaloID {number} a felhasználó azonosítója
     * @return {string} a használható típusa          
     */         
    function getFelhasznaloTipus($felhasznaloID)
    {
      $rs = $this->db->execute('SELECT tipus FROM felhasznalok WHERE felhasznaloID='.$felhasznaloID);        
      
      if (true != $rs)
        $this->response->sendError('Hiba a felhasználó típusának lekérdezése során!',true);
      
      $record = $rs->FetchRow();
      
      return $record['tipus'];
    }
    
    /**
     * Egy felhasználóhoz tartozó felhasználók listájának a lekérdezése.
     * NOTE: - ha a felhasználó egy csoport vezetője, akkor a csoporthoz tartozó
     *         felhasználókat adja vissza, beleértve magát a felhasználót is
     *         
     * @param felhasznaloID {number} a felhasználó azonosítója
     * @return {Array():number} a felhasználó csoportjához tartozó felhasználók
     */         
    function getFelhasznalokList($felhasznaloID)
    {
      $tipus = $this->getFelhasznaloTipus($felhasznaloID);
      
      // Alapból mindenki csak a saját csoportjának az embereit láthatja
      $where = ' WHERE csopID IN (SELECT csoportID FROM csoportok WHERE vezetoID='.$felhasznaloID.') ';
      
      // Leader esetében az adminokat kivéve bárkit láthat
      if ('leader' == $tipus)
        $where = ' WHERE tipus NOT IN ("admin") ';
        
      // Az admin mindenkit láthat
      if ('admin' == $tipus)
        $where = '';
       
      // Lekérdezés elindítása
      $rs = $this->db->execute('SELECT felhasznaloID FROM felhasznalok'.$where);
        
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a felhasználók listájának a lekérdezése közben!',true);
      
      // Lekérdezés tömbbé alakítása
      $felhasznalok = array();
      while ($record = $rs->FetchRow())
        $felhasznalok[] = $record['felhasznaloID'];
        
      // A felhasználó maga mindenképpen belekerül a tömbbe
      if (!in_array($felhasznaloID,$felhasznalok))
        $felhasznalok[] = $felhasznaloID;
      
      return $felhasznalok;
    }
    
    /**
     * Egy felhasználóhoz tartozó csoportok listájának a lekérdezése.
     * NOTE: - azon csoportokat kérdezi le, amelyeknek a felhasználó a vezetője
     *         
     * @param felhasznaloID {number} a felhasználó azonosítója
     * @return {Array():number} a felhasználó csoportjai
     */         
    function getCsoportokList($felhasznaloID)
    {
      $tipus = $this->getFelhasznaloTipus($felhasznaloID);
            
      // Alapból csak a saját csoportjait kérdezheti le
      $where = ' WHERE vezetoID='.$felhasznaloID;
      
      // A leader az admin csoportjait kivéve mindent lekérdezhet
      if ('leader' == $tipus)
        $where = ' WHERE vezetoID IN (SELECT felhasznaloID FROM felhasznalok WHERE tipus NOT IN ("admin"))';
        
      // Az admin mindent láthet
      if ('admin' == $tipus)
        $where = '';
      
      // Lekérdezés elindítása
      $rs = $this->db->execute('SELECT csoportID FROM csoportok'.$where);
        
      // Hiba esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a csoportok listájának a lekérdezése közben!',true);
      
      // Lekérdezés tömbbé alakítása
      $csoportok = array();
      while ($record = $rs->FetchRow())
        $csoportok[] = $record['csoportID'];
        
      return $csoportok;
    }
    
    /**
     * Adott felhasználó által engedélyezett parancsok listájának a lekérdezése.
     * 
     * @param felhasznaloID {number} a felhasználó azonosítója
     * @return {Array():string} a használható parancsok listája               
     */         
    function getAllowedActions($felhasznaloID)
    {
      // Parancsok listája
      $actions = array();
      
      // Alapparancsok
      $actions[] = 'LOGIN_FELHASZNALO';
      $actions[] = 'LOGOUT_FELHASZNALO';
      $actions[] = 'GET_LOGIN_FELHASZNALO_LIST';
      $actions[] = 'LOGIN_GET_HISTORY';
      
      // Hibás azonosító esetén kilépünk
      if (!is_numeric($felhasznaloID)) return $actions;
      
      // Felhasználó típusának a lekérdezése
      $tipus = $this->getFelhasznaloTipus($felhasznaloID);
      
      // Parancsok listájának a létrehozása
      switch ($tipus)
      {
        case 'admin':
          $actions[] = 'GET_CSOPORT_LIST';
          $actions[] = 'REMOVE_CSOPORT_LIST';
          $actions[] = 'GET_CSOPORT_DATA';
          $actions[] = 'INSERT_CSOPORT_DATA';
          $actions[] = 'MODIFY_CSOPORT_DATA';
          
          $actions[] = 'GET_FELHASZNALO_LIST';
          $actions[] = 'REMOVE_FELHASZNALO_LIST';
          $actions[] = 'GET_FELHASZNALO_DATA';
          $actions[] = 'INSERT_FELHASZNALO_DATA';
          $actions[] = 'MODIFY_FELHASZNALO_DATA';
          
          $actions[] = 'GET_HELYETTESITESTIPUSA_LIST';
          $actions[] = 'REMOVE_HELYETTESITESTIPUSA_LIST';
          $actions[] = 'GET_HELYETTESITESTIPUSA_DATA';
          $actions[] = 'INSERT_HELYETTESITESTIPUSA_DATA';
          $actions[] = 'MODIFY_HELYETTESITESTIPUSA_DATA';
          
          $actions[] = 'GET_HIANYZASOKA_LIST';
          $actions[] = 'REMOVE_HIANYZASOKA_LIST';
          $actions[] = 'GET_HIANYZASOKA_DATA';
          $actions[] = 'INSERT_HIANYZASOKA_DATA';
          $actions[] = 'MODIFY_HIANYZASOKA_DATA';
          
          $actions[] = 'GET_HIHEBETOLT_LIST';
          $actions[] = 'REMOVE_HIHEBETOLT_LIST';
          $actions[] = 'GET_HIHEBETOLT_DATA';
          $actions[] = 'INSERT_HIHEBETOLT_DATA';
          $actions[] = 'MODIFY_HIHEBETOLT_DATA';
          
          $actions[] = 'GET_IDOSZAK_LIST';
          $actions[] = 'REMOVE_IDOSZAK_LIST';
          $actions[] = 'GET_IDOSZAK_DATA';
          $actions[] = 'INSERT_IDOSZAK_DATA';   
          $actions[] = 'MODIFY_IDOSZAK_DATA';
          
          $actions[] = 'GET_ORAREND_LIST';
          $actions[] = 'REMOVE_ORAREND_LIST';
          $actions[] = 'GET_ORAREND_DATA';
          $actions[] = 'INSERT_ORAREND_DATA';
          $actions[] = 'MODIFY_ORAREND_DATA';
          
          $actions[] = 'GET_OSZTALY_CIMKEK_LIST';
          $actions[] = 'GET_OSZTALYOK_CIMKEI_LIST';
          $actions[] = 'GET_TANTARGYAK_CIMKEI_LIST';
          $actions[] = 'GET_OSZTALY_CSOPORTOK_LIST';
          $actions[] = 'GET_OSZTALYOK_LIST';
          $actions[] = 'GET_SZAKMACSOPORTOK_LIST';
          $actions[] = 'REMOVE_OSZTALY_CIMKEK_LIST';
          $actions[] = 'REMOVE_OSZTALYOK_CIMKEI_LIST';
          $actions[] = 'REMOVE_TANTARGYAK_CIMKEI_LIST';
          $actions[] = 'REMOVE_OSZTALY_CSOPORTOK_LIST';
          $actions[] = 'REMOVE_OSZTALYOK_LIST';
          $actions[] = 'REMOVE_SZAKMACSOPORTOK_LIST';
          $actions[] = 'GET_OSZTALY_CIMKEK_DATA';
          $actions[] = 'GET_OSZTALYOK_CIMKEI_DATA';
          $actions[] = 'GET_TANTARGYAK_CIMKEI_DATA';
          $actions[] = 'GET_OSZTALY_CSOPORTOK_DATA';
          $actions[] = 'GET_OSZTALYOK_DATA';
          $actions[] = 'GET_SZAKMACSOPORTOK_DATA';
          $actions[] = 'INSERT_OSZTALY_CIMKEK_DATA';
          $actions[] = 'INSERT_OSZTALYOK_CIMKEI_DATA';
          $actions[] = 'INSERT_TANTARGYAK_CIMKEI_DATA';
          $actions[] = 'INSERT_OSZTALY_CSOPORTOK_DATA';
          $actions[] = 'INSERT_OSZTALYOK_DATA';
          $actions[] = 'INSERT_SZAKMACSOPORTOK_DATA';
          $actions[] = 'MODIFY_OSZTALY_CIMKEK_DATA';
          $actions[] = 'MODIFY_OSZTALYOK_CIMKEI_DATA';
          $actions[] = 'MODIFY_TANTARGYAK_CIMKEI_DATA';
          $actions[] = 'MODIFY_OSZTALY_CSOPORTOK_DATA';
          $actions[] = 'MODIFY_OSZTALYOK_DATA';
          $actions[] = 'MODIFY_SZAKMACSOPORTOK_DATA';
          
          $actions[] = 'GET_TANEV_LIST';
          $actions[] = 'REMOVE_TANEV_LIST';
          $actions[] = 'GET_TANEV_DATA';
          $actions[] = 'INSERT_TANEV_DATA';
          $actions[] = 'MODIFY_TANEV_DATA';
          
          $actions[] = 'GET_TANTARGY_LIST';
          $actions[] = 'GET_TANTARGY_CIMKEK_LIST';
          $actions[] = 'REMOVE_TANTARGY_LIST';
          $actions[] = 'REMOVE_TANTARGY_CIMKEK_LIST';
          $actions[] = 'GET_TANTARGY_DATA';
          $actions[] = 'GET_TANTARGY_CIMKEK_DATA';
          $actions[] = 'INSERT_TANTARGY_DATA';
          $actions[] = 'INSERT_TANTARGY_CIMKEK_DATA';
          $actions[] = 'MODIFY_TANTARGY_DATA';    
          $actions[] = 'MODIFY_TANTARGY_CIMKEK_DATA';
          
          $actions[] = 'GET_RNAP_LIST';
          $actions[] = 'REMOVE_RNAP_LIST';
          $actions[] = 'GET_RNAP_DATA';
          $actions[] = 'INSERT_RNAP_DATA';
          $actions[] = 'MODIFY_RNAP_DATA';    
          
          $actions[] = 'GET_LEZARAS_DATA';
          $actions[] = 'MODIFY_LEZARAS_DATA';
          
          $actions[] = 'CLEAR_TEMP_DIR';
        case 'leader':  
        case 'operator':
          $actions[] = 'REMOVE_KOTELEZOORA_LIST';
          $actions[] = 'INSERT_KOTELEZOORA_DATA';
          $actions[] = 'MODIFY_KOTELEZOORA_DATA';
          
          $actions[] = 'GET_HELYETTNAPLO_LIST';
          
          $actions[] = 'GET_TKTEFNAPLO_LIST';
          
          $actions[] = 'REMOVE_EGYENIORAKEDV_LIST';
          $actions[] = 'INSERT_EGYENIORAKEDV_DATA';
          $actions[] = 'MODIFY_EGYENIORAKEDV_DATA';
          
          $actions[] = 'REMOVE_TANTARGYELSZ_LIST';
          $actions[] = 'INSERT_TANTARGYELSZ_DATA';
          $actions[] = 'MODIFY_TANTARGYELSZ_DATA';
          
          $actions[] = 'GET_EGYENIORAKEDV_LIST';
          $actions[] = 'GET_EGYENIORAKEDV_DATA';
          
          $actions[] = 'GET_TANTARGYELSZ_LIST';
          $actions[] = 'GET_TANTARGYELSZ_DATA';
          
          $actions[] = 'UNLOCK_LEZARAS_LIST';
          $actions[] = 'UNASSIGN_OSZTALYOK_CIMKEI_LIST';
          $actions[] = 'UNASSIGN_TANTARGYAK_CIMKEI_LIST';
          
        case 'user':
          $actions[] = 'REMOVE_JELENTES_LIST';
          $actions[] = 'GET_JELENTES_DATA';
          $actions[] = 'INSERT_JELENTES_DATA';
          $actions[] = 'MODIFY_JELENTES_DATA';
          
          $actions[] = 'GET_JELENTES_LIST';
          $actions[] = 'PREPARE_DOWNLOAD_JELENTES_LIST';
          $actions[] = 'DOWNLOAD_JELENTES_LIST';
          $actions[] = 'DOWNLOAD_JELENTES_EMPTY';
          
          $actions[] = 'GET_KOTELEZOORA_LIST';
          $actions[] = 'GET_KOTELEZOORA_DATA';
          $actions[] = 'GET_FELHASZNALO_HETI_ORAI';
          $actions[] = 'GET_ORAREND_LIST_DB';
          $actions[] = 'GET_ORAREND_HETEK';
          
          $actions[] = 'GET_CSOPORT_LIST_CB';
          $actions[] = 'GET_TANEV_LIST_CB';
          $actions[] = 'GET_IDOSZAK_LIST_CB';
          $actions[] = 'GET_FELHASZNALO_LIST_CB';
          $actions[] = 'GET_FELHASZNALO_LIST_ALL_CB';
          $actions[] = 'GET_OSZTALY_CIMKEK_LIST_CB';
          $actions[] = 'GET_OSZTALYOK_CIMKEI_LIST_CB';
          $actions[] = 'GET_TANTARGYAK_CIMKEI_LIST_CB';
          $actions[] = 'GET_OSZTALY_CSOPORTOK_LIST_CB';
          $actions[] = 'GET_OSZTALYOK_LIST_CB';
          $actions[] = 'GET_SZAKMACSOPORTOK_LIST_CB';
          $actions[] = 'GET_TANTARGY_LIST_CB';
          $actions[] = 'GET_TANTARGY_CIMKEK_LIST_CB';
          $actions[] = 'GET_HIANYZASOKA_LIST_CB';
          $actions[] = 'GET_HIANYZAS_LIST';
          $actions[] = 'GET_HIANYZAS_DATA';
          $actions[] = 'INSERT_HIANYZAS_DATA';
          $actions[] = 'MODIFY_HIANYZAS_DATA';
          $actions[] = 'REMOVE_HIANYZAS_LIST';
          $actions[] = 'GET_HELYETTESITES_LIST';
          $actions[] = 'GET_HELYETTESITES_DATA';
          $actions[] = 'INSERT_HELYETTESITES_DATA';
          $actions[] = 'MODIFY_HELYETTESITES_DATA';
          $actions[] = 'REMOVE_HELYETTESITES_LIST';
          $actions[] = 'GET_HELYETTESITESTIPUSA_LIST_CB';
          
          $actions[] = 'GET_TKTEF_LIST';
          $actions[] = 'GET_TKTEF_DATA';
          $actions[] = 'INSERT_TKTEF_DATA';
          $actions[] = 'LOAD_TKTEF_LESSONS';
          $actions[] = 'MODIFY_TKTEF_DATA';
          $actions[] = 'REMOVE_TKTEF_LIST';
          
          $actions[] = 'GET_JELSZO_LIST';
          $actions[] = 'GET_JELSZO_DATA';
          $actions[] = 'INSERT_JELSZO_DATA';
          $actions[] = 'MODIFY_JELSZO_DATA';
          $actions[] = 'REMOVE_JELSZO_LIST';
          
          $actions[] = 'GET_LEZARAS_LIST';
          $actions[] = 'LOCK_LEZARAS_LIST';
          $actions[] = 'ASSIGN_OSZTALYOK_CIMKEI_LIST';
          $actions[] = 'ASSIGN_TANTARGYAK_CIMKEI_LIST';
        case 'guest':
      }
      
      return $actions;
    }
    
    /**
     * Felhasználó jogosultságának ellenőrzése a parancs végrehajtására.
     * 
     * @param action {string} a végrehajtandó parancs
     */         
    function checkUserAction($action)
    {
      $actions = $this->getAllowedActions($_SESSION['felhasznaloID']);
      if (!in_array($action,$actions))
        $this->response->sendError('Nincs jogosultsága az alábbi parancs ('.
          $action.') végrehajtásához!',true);
    }
    
    /**
     * Parancs ellenörzése.
     * 
     * @param action {string} a végrehajtandó parancs
     */
    function testAction($action)
    {
      if (true != is_string($action))
        $this->response->sendError('Nincs parancs megadva!',true);
        
      $this->checkUserAction($action);
    }
    
    /**
     * Parancs végrehajtása.
     *      
     * @param action {string} a végrehajtandó parancs
     */
    function doAction($action)
    {
      // Parancs ellenörzése
      $this->testAction($action);
      
      // Parancs futtatása
      $this->doActionFunc($action);
    }
    
    /**
     * A parancs tényleges futtatása.
     * NOTE: - származtatott osztályokban ezt kell felülírni
     * 
     * @param action {string} a végrehajtandó parancs               
     */
    function doActionFunc($action)
    {
      switch ($action)
      {
        // Adatok listájának lekérdezése
        case $this->getDataListAction:
        case $this->getDataListCBAction:
          $this->getDataList();
        break;
        // Adat lekérdezése
        case $this->getDataAction:
          $this->getData();
        break;
        // Új adat beszúrása
        case $this->insertDataAction:
          $this->insertData();
        break;
        // Meglévő adatok módosítása
        case $this->modifyDataAction:
          $this->modifyData();
        break;
        // Adatok törlése
        case $this->removeDataAction:
          $this->removeDataList();
        break;
        // Alapértelmezésben hibát küldünk vissza
        default:
          $this->response->sendError('Ismeretlen parancs: '.$action,true);
      }
    }         
    
    /**
     * Mezők létrehozása.    
     * NOTE: - a származtatott osztályokban itt jönnek létre a specifikus elemek      
     */         
    abstract function addFields();
    
    /**
     * Szűrőfeltétel létrehozása.
     * 
     * @param filterFields {Array():string} a szűrésben részt vevő mezők nevei
     * @param filterValues {Array():any type} a szűrésben részt vevő mezők értékei
     * @param addWhere {boolean} ha igaz akkor hozzáadódik a 'WHERE' kifejezés is ([true])               
     * @return {string} a szűrőfeltétel karakterláncként                    
     */         
    function createFilterExpr($filterFields,$filterValues,$addWhere=true)
    {
      $filterExpr = '';
      
      // Ha vannak szűrők...
      if ((0 < count($filterFields)) && 
          (0 < count($filterValues)) && 
          (count($filterFields) == count($filterValues)))
      {
        // ...akkor előállítjuk a szűrő feltételt
        for ($i = 0; $i < count($filterFields); $i++)
        {
          $key = $filterFields[$i];
          $filterExpr .= $key.'='.$filterValues[$key].
           (($i < count($filterFields)-1)?' AND ':'');
        }
        
        if (true == $addWhere)
          $filterExpr = ' WHERE '.$filterExpr;
      }
      
      return $filterExpr;
    }
    
    /**
     * Adatlista lekéréséhez használt lekérdezés.
     * NOTE: - segítségével a származtatott osztályokban egyedi lekérdezéseket 
     *         használhatunk
     *       - önálló használatra nem ajánlott          
     *         
     * @param fields {Array():string} mezőnevek
     * @param $filterFields {Array():string?null} a szűrők mezőnevei     
     * @param $filterValues {Array():string?null} a szűrők mezőneveinek értékei     
     * @return {SQLResult} a lekérdezés eredménye     
     */         
    function getDataListQuery($fields,$filterFields,$filterValues)
    {
      $filterExpr = $this->createFilterExpr($filterFields,$filterValues,true);
    
      // Alapértelmezésben a kért mezőnevekkel dolgozunk.
      return $this->db->execute('SELECT '.implode(',',$fields).' FROM '.
        $this->tableName.$filterExpr.$this->getOrderByExpression());
    }
    
    /**
     * Rendezési kifejezés előállítása.
     * 
     * @return {string} a rendezési kifejezés          
     */
    function getOrderByExpression()
    {
      if (is_array($this->orderByFields) && 0 < count($this->orderByFields))
        return ' ORDER BY '.implode(',',$this->orderByFields).' ';
        
      return ' ';
    }         
    
    /**
     * Adatlista lekérdezése.
     * NOTE: - csak a kívánt mezőnevek vesznek részt a lekérdezésben
     *       - tabletool esetén a mezőneveket az oszlopnevek adják          
     */         
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      $a = $this->getFilters($_POST['FILTERS']);
      $filterFields = $a['fields'];
      $filterValues = $a['values'];
        
      // Lekérdezés elindítása
      $rs = $this->getDataListQuery($fields,$filterFields,$filterValues);        
      
      if (true != $rs)
        $this->response->sendError('Hiba az adatlista lekérdezése során!',true);
        
      $this->response->addResult($rs);
      
      return $rs;
    }
    
    /**
     * Lekérdezések WHERE feltételének az előállítása.
     * 
     * @param fields {Array():string} mezőnevek
     * @param id {any type} elsődleges kulcs értéke               
     * @return {string} a lekérdezés WHERE feltétele
     */         
    function createGetDataExpression($fields,$id)
    {
      return $this->primaryField.'='.$id;
    }
    
    /**
     * Adatok lekérdezése azonosító alapján.
     */         
    function getData()
    {
      // Mezők listája
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Azonosító lekérdezése
      $id = $this->getPrimaryFieldValue();
        
      // Lekérdezés elindítása
      $rs = $this->db->execute('SELECT '.implode(',',$fields).' FROM '.
        //$this->tableName.' WHERE '.$this->primaryField.'='.$id);        
        $this->tableName.' WHERE '.$this->createGetDataExpression($fields,$id));
        
      if (true != $rs)
        $this->response->sendError('Hiba az adatok lekérdezése közben!',true);
        
      $this->response->addResult($rs);
      
      return $rs;
    }
    
    /**
     * Új adat létrehozásához használt lekérdezés.
     * NOTE: - segítségével a származtatott osztályokban egyedi lekérdezéseket 
     *         használhatunk
     *       - önálló használatra nem ajánlott          
     *         
     * @param fields {Array():string} mezőnevek
     * @param values {Array():any type} mezőértékek     
     * @return {SQLResult} a lekérdezés eredménye     
     */         
    function insertDataQuery($fields,$values)
    {
      // Alapértelmezésben a kért mezőnevekkel és az értékeikkel dolgozunk.
      return $this->db->Execute('INSERT INTO '.$this->tableName.' ('.
        implode(',',$fields).') VALUES ('.implode(',',$values).')');
    }
    
    /**
     * Új adat beszúrása.
     */         
    function insertData()
    {
      // Mezők listája
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Mezők értékei
      $values = $this->getDbFieldValues($fields);
        
      // Lekérdezés elindítása
      $rs = $this->insertDataQuery($fields,$values);
      
      if (true != $rs)
        $this->response->sendError('Hiba az adatok beszúrása közben! ['.$this->db->ErrorMsg().']',true);
        
      // Visszaküldjük az újonnan beszúrt adat elsődleges kulcsának értékét
      $this->response->addElement($this->primaryField,$this->db->Insert_ID());
      
      return $rs;
    }
    
    /**
     * Lekérdezések WHERE feltételének az előállítása.
     * 
     * @param fields {Array():string} mezőnevek
     * @param values {Array():any type} mezőértékek
     * @param id {any type} elsődleges kulcs értéke               
     * @return {string} a lekérdezés WHERE feltétele
     */         
    function createModifyExpression($fields,$values,$id)
    {
      return $this->primaryField.'='.$id;
    }
    
    /**
     * Módosításához használt lekérdezés.
     * NOTE: - segítségével a származtatott osztályokban egyedi lekérdezéseket 
     *         használhatunk
     *       - önálló használatra nem ajánlott          
     *         
     * @param fields {Array():string} mezőnevek
     * @param values {Array():any type} mezőértékek
     * @param id {any type} elsődleges kulcs értéke          
     * @param pairs {Array():string} kulcs-érték párok karakterláncként     
     * @return {SQLResult} a lekérdezés eredménye     
     */         
    function modifyDataQuery($fields,$values,$id,$pairs)
    {
      // Alapértelmezésben a kért mezőnevekkel és az értékeikkel dolgozunk.
      return $this->db->Execute('UPDATE '.$this->tableName.' SET '.$pairs.
        ' WHERE '.$this->createModifyExpression($fields,$values,$id));
    }
    
    /**
     * Kulcs-érték párok létrehozása.
     */         
    function createModifyPairs($values)
    {
      $pairs = '';
      $i = 0;
      foreach ($values as $key => $value)
      {
        $pairs .= $key.'='.$value.(($i < count($values)-1)?',':'');
        $i++;
      }
      
      return $pairs;
    }
    
    /**
     * Adat módosítása.
     */         
    function modifyData()
    {
      // Mezők listája
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Mezők értékei
      $values = $this->getDbFieldValues($fields);
        
      // Kulcs-érték párok összerendelése
      $pairs = $this->createModifyPairs($values);
        
      // Azonosító lekérdezése
      $id = $this->getPrimaryFieldValue();
      
      // Lekérdezés elindítása
      $rs = $this->modifyDataQuery($fields,$values,$id,$pairs);
      
      if (true != $rs)
        $this->response->sendError('Hiba az adatok mentése közben! ['.$this->db->ErrorMsg().']',true);
        
      return $rs;
    }
    
    /**
     * A függvény az elsődleges kulcsok értékeinek tömbjéből állítja elő a
     * lekérdezésben szereplő törléshez szükséges feltétel.
     * NOTE: - a származtatott osztályokban felül lehet írni abban az
     *         esetben ha nem szám az elsődleges kulcs, hanem például szöveg,
     *         és így aposztrófok közé kell zárni
     *         
     * @param ids {Array():string|number} az azonosítók értékei
     * @return {string} a törléshez szükséges feltétel               
     */
    function createRemoveExpression($ids)
    {
      $a = $this->getFilters($_POST['FILTERS']);
      $filterExpr = $this->createFilterExpr($a['fields'],$a['values'],false);
      if ('' != $filterExpr)
        $filterExpr = ' AND '.$filterExpr;
      
      return $this->primaryField.' IN ('.implode(',',$ids).')'.$filterExpr;
    }
    
    /**
     * A függvény elvégzi a tényleges törlést.
     * 
     * @param ids {Array():string|number} az azonosítók értékei          
     */         
    function forceRemoveDataList($ids)
    {
      // Feltétel létrehozása
      $expr = $this->createRemoveExpression($ids);
      
      // Lekérdezés elindítása
      return $this->db->Execute('DELETE FROM '.$this->tableName.' WHERE '.$expr);
    }
    
    /**
     * Adatsor törlése.
     */         
    function removeDataList()
    {
      // Az elsődleges kulcsok értékei
      $ids = $_POST[$this->primaryField];
      
      // Ha nem adtunk meg elsődleges kulcsokat akkor kilépünk
      if (!isset($ids))
        $this->response->sendError('Nem adott meg azonosítókat!',true);
        
      // Elsődleges kulcsok tömbjének elkészítése
      $ids = explode(',',$ids);
      
      // Elsődleges kulcsok formátumának ellenőrzése
      for ($i = 0; $i < count($ids); $i++)
        $this->testDbValue($this->primaryField,$ids[$i]);
      
      // Lekérdezés elindítása
      $rs = $this->forceRemoveDataList($ids);
      
      if (true != $rs)
        $this->response->sendError('Hiba az adat(ok) törlése során! ['.$this->db->ErrorMsg().']',true);
                
      return $rs;  
    }
    
    /**
     * Csatlakozás az adatbázishoz.
     */     
    function connectDB()
    { 
      // Létrehozzuk a kapcsolatot
      $this->db = ADONewConnection($GLOBALS['driver']);
      $this->db->SetFetchMode(ADODB_FETCH_ASSOC); 
      // Alapértelmezésben nincs szükségünk debug-ra
      //$this->db->debug = true;
      
      // Csatlakozás az adatbázishoz
      $this->db->connect($GLOBALS['hostname'], $GLOBALS['username'], 
                         $GLOBALS['password'], $GLOBALS['database']);
      
      // Ha nem sikerült csatlakozni, akkor megpróbáljuk más adatokkal
      if(true != $this->db->_connectionID)
      {
        $this->db->connect($GLOBALS['hostname'],  $GLOBALS['username2'], 
                           $GLOBALS['password2'], $GLOBALS['database']);
          
        // Ha így sem sikerült csaatlakozni, akkor hibával leállunk                
        if(true != $this->db->_connectionID)
          $this->response->sendError('Sikertelen kapcsolódás az adatbázishoz.',true);
          
          
        // Definiálunk néhány fügvényt
        
        // Osztályokkal kapcsolatos függvények (ezeket phpmyadminban is beszúrhatjuk, ami erősen javasolt!!!!!!!!!!!!!!!!!!!!!!!!!)
        $this->db->execute(
          'DELIMITER $$
          
          DROP FUNCTION IF EXISTS GET_OSZTALY_NEV$$
          CREATE FUNCTION GET_OSZTALY_NEV(inOsztalyID INT, inTanevID INT) RETURNS VARCHAR(20)
          DETERMINISTIC
          BEGIN
           DECLARE nev VARCHAR(20) DEFAULT "";
           
           SELECT CASE kezdoevfolyam WHEN 0 THEN betujel ELSE CONCAT(YEAR(t2.elsoNap)-YEAR(t1.elsoNap)+kezdoevfolyam,".",betujel) END INTO nev 
           FROM osztalyok 
           LEFT JOIN tanevek t1 ON t1.tanevID=osztalyok.tanevID 
           LEFT JOIN tanevek t2 ON t2.tanevID=inTanevID
           WHERE osztalyID=inOsztalyID;
           
           RETURN nev;
          END$$
          
          DROP FUNCTION IF EXISTS GET_OSZTALY_NEV_BY_IDOSZAK$$
          CREATE FUNCTION GET_OSZTALY_NEV_BY_IDOSZAK(inOsztalyID INT, inIdoszakID INT) RETURNS VARCHAR(20)
          DETERMINISTIC
          BEGIN
           DECLARE nev VARCHAR(20) DEFAULT "";
           DECLARE tanev INT DEFAULT 0;
           
           SELECT tanevID INTO tanev FROM idoszakok WHERE idoszakok.idoszakID=inIdoszakID;
           
           SELECT GET_OSZTALY_NEV(inOsztalyID,tanev) INTO nev;
           
           RETURN nev;
          END$$
          
          DROP FUNCTION IF EXISTS IS_OSZTALY_AKTIV$$
          CREATE FUNCTION IS_OSZTALY_AKTIV(inOsztalyID INT, inTanevID INT) RETURNS BOOLEAN
          DETERMINISTIC
          BEGIN
           DECLARE aktiv BOOLEAN DEFAULT FALSE;
           
           SELECT (YEAR(t2.elsoNap)-YEAR(t1.elsoNap)) BETWEEN 0 AND (idotartam-1) INTO aktiv 
           FROM osztalyok 
           LEFT JOIN tanevek t1 ON t1.tanevID=osztalyok.tanevID 
           LEFT JOIN tanevek t2 ON t2.tanevID=inTanevID
           WHERE osztalyID=inOsztalyID;
           
           RETURN aktiv;
          END$$
          
          DROP FUNCTION IF EXISTS IS_OSZTALY_INDULO$$
          CREATE FUNCTION IS_OSZTALY_INDULO(inOsztalyID INT, inTanevID INT) RETURNS BOOLEAN
          DETERMINISTIC
          BEGIN
           DECLARE indulo BOOLEAN DEFAULT FALSE;
           
           SELECT (YEAR(t2.elsoNap)=YEAR(t1.elsoNap)) INTO indulo 
           FROM osztalyok 
           LEFT JOIN tanevek t1 ON t1.tanevID=osztalyok.tanevID 
           LEFT JOIN tanevek t2 ON t2.tanevID=inTanevID
           WHERE osztalyID=inOsztalyID;
           
           RETURN indulo;
          END$$
          
         DELIMITER ;');
          
      }     
    }
    
    /**
     * Adatbázis mezőneveinek a tesztelése.
     * 
     * @param fieldsstr {string} a mezők neveit tartalmazó karakterlánc     
     * NOTE: - a karakterláncban a mezőnevek vesszőkkel elválasztva szerepelnek
     *       - amilyen formában megkapja a szerver egyből lehet küldeni ide
     *       - mezőnév csak maximum 10 karakter hosszúságú az angol abc betűit,
     *         illetve alulvonást tartalmazhat          
     * @return {array():string} az ellenörzött mezőnevek tömbje                         
     */         
    function getDbFields($fieldsstr)
    {
      // Átalakítjuk a mezőneveket tömbbé    
      $fields = (is_string($fieldsstr)) ?  
        explode(',',$fieldsstr) :
        array();
        
      // Ha nem találhatóak mezőnevek akkor hibával kilépünk
      if (0 == count($fields))
        $this->response->sendError('Nem található mezőnév lista!',true);
        
      // Ha nem megfelelő valamelyik mezőnév formátuma, akkor hibát küldünk vissza
      // NOTE: - a mezőnév csak az angol abc kis és negybetűit tartalmazhatja
      $pName = 'fieldName';
      for ($i = 0; $i < count($fields); $i++)
        if (0 != CTestString::test($fields[$i],$pName,1,30))
        {
          $pp = CTestString::getPattern($pName);
          $this->response->sendError('Mezőnév ('.$fields[$i].') nem megfelelő! '.$pp['help'],true);
        }
          
      return $fields;
    }
    
    /**
     * Mezők értékeinek lekérdezése.
     * NOTE: - ha nem található a _POST tömbben, akkor megkeresi a _GET tömbben     
     * 
     * @param fields {Array():string} a mezők neveinek tömbje
     * @return {Array():any type} a mezők értékeinek tömbje               
     */         
    function getDbFieldValues($fields)
    {
      // Ha nem adtunk meg tömböt akkor kilépünk
      if (!is_array($fields))
        $this->response->sendError('Nincs megadva mezőnév lista!',true);
        
      $values = array();
        
      // Mezők értékeinek vizsgálata
      for ($i = 0; $i < count($fields); $i++)
      {
        // Érték lekérdezése
        $field = $fields[$i];
        
        $value = $_POST[$field];
        if (!isset($value))
          $value = $_GET[$field];
        
        // Ha nem található a mező értéke akkor kilépünk
        if (!isset($value))
          $this->response->sendError('A mező ('.$field.') értéke nem található!',true);
        
        // Érték formátumának vizsgálata
         $pattern = $this->testDbValue($field,$value);
        
        // Karakterlánc esetén idézőjelek közé teszük az értéket
        // NOTE: - egyúttal utf8-ba konvertáljuk az értéket
        if ('string' == $pattern->getType())
          $value = '"'.latin2ToUtf8($value).'"';
        
        // Érték tárolása
        $values[$field] = $value;
      }
                                                          
      return $values;
    }
    
    /**
     * Szűrők listájának és értékeinek a lekérdezése.
     * 
     * @param filters {Array():any type} a szűrők tömbje
     * @return {Array()} a szűrők mezőnevei és az értékek
     * NOTE: - fields: a mezőnevek tömbje
     *       - values: az értékek
     *       - hiányzó szűrők esetében üresek lesznek a tömbök                              
     */         
    function getFilters($filters)
    {
      $filterFields = array();
      $filterValues = array();
      if ($filters)
      {
        $filterFields = $this->getDbFields($filters);
        $filterValues = $this->getDbFieldValues($filterFields);
      }
      
      return array('fields' => $filterFields,'values' => $filterValues);
    }
    
    /**
     * Egyéni tesztelés függvénye.
     * NOTE: - segítségével ellenőrizhetjük a küldött paraméterek értékeit
     *       - hasznos ha nem csak a típus számít, hanem az érték is
     *       
     * @param field {string} a mező neve
     * @param value {any type} a mező értéke
     * @return {boolean} igaz ha az érték megfelelő                    
     */         
    function testDbValue2($field,$value)
    {
      return true;
    }
    
    /**
     * Mező értékének tesztelése.
     * 
     * @param field {string} a mező neve
     * @param value {any type} a mező értéke
     * @return {CField} a mező formátuma                    
     */         
    function testDbValue($field,$value)
    {
      // Érték formátumának lekérdezése
      $pattern = $this->fields[$field];
      if (!isset($pattern))
        $this->response->sendError('A mező ('.$field.') nem található az adatbázisban!',true);
      
      // Ha valamelyik mező ezt az értéket tartalmazza, az azt jelenti, hogy üres, 
      // ami következtében valószínület nincs meg minden szükséges adat a lekérdezés folytatásához.
      if ('__null__' === $value) {
        // TODO: - elvileg a hibaüzenet helyett csendesen térünk vissza, ami sokkal esztétikusabb,
        //         viszont át kell gondolni, hogy ez nem okoz-e rejtett hibákat?
        
        //$this->response->sendError('A mező ('.$field.') nem tartalmaz adatot, aminek következtében nem folytatható a művelet!',true);
        $this->response->sendEmptyAndExit();
      } 
          
      // Érték formátumának a vizsgálata (ha __null__ akkor nem vizsgálunk semmit, mert ez speciálisan
      // az üres combo boxok értéke, aminek az a hatása, hogy sohasem ad eredményt vissza)
      if ((0 != $pattern->test($value)) || true != $this->testDbValue2($field,$value))
      //if (((0 != $pattern->test($value)) || true != $this->testDbValue2($field,$value)) && ('__null__' !== $value))
      {
        $pp = $pattern->getPattern();
        $this->response->sendError('Az mező ('.$field.') értékének ('.$value.') '.
          'a formátuma, vagy '.('string'==$pattern->getType()?'a hossza':'az értéke').
          ' (min:'.$pattern->getMin().'max:'.$pattern->getMax().
          '), vagy értéke nem megfelelő! '.$pp['help'],true);
      }
        
      return $pattern;
    }
    
    /**
     * Elsődleges kulcs értékének lekérdezése.
     * NOTE: - azonosító mezőnevének formátumának az ellenörzése azért nem
     *         szükséges, mert az már szerver oldalon meg van adva          
     */         
    function getPrimaryFieldValue()
    {
      $value = $this->getDbFieldValues(array($this->primaryField));
      
      return  $value[$this->primaryField];
    }
    
    /**
     * Karakterláncként megadott dátum szétbontása évre, hónapra, napra.
     * NOTE: - a paraméterként megadott dátum az átalakítások miatt idézőjelekben
     *         szerepel, amit le kell vágni (pl. "2010-01-01" -> [2010,01,01])    
     *         
     * @param dateStr {string} a dátum karakterláncként
     * @return {Array(3):number} a dátum évre, hónapra és napra bontva                     
     */         
    function splitStringToDate($dateStr)
    {
      $date = array();
      $k = 0;
      $d = explode('-',substr($dateStr,1,-1));
      for ($i = 0; $i < count($d); $i++)
      {
        $dd = explode('.',$d[$i]);
        for ($j = 0; $j < count($dd); $j++)
          $date[$k++] = (int)$dd[$j];
      }
      
      return $date;
    }
    
    /**
     * Kapcsolat bontása.
     */     
    function closeDB()
    {
      $this->db->close();  
    }
  }    
?>
