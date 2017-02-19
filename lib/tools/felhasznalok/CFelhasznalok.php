<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
  require_once('../../dbExec.php');
   
  /**                                                        
   * Felhasználók kezelését megvalósító osztály.
   */
  class CFelhasznalok extends CService
  {
    // Óraadó nevei
    protected $oraadoNames = array(0=>'Nem',
                                   1=>'Igen');
    // Szakoktató nevei
    protected $szakoktatoNames = array(0=>'Nem',
                                       1=>'Igen');
    // Felhasználó típusának lehetséges értékei
    protected $tipusValues = array('admin','leader','operator','user','guest');
    // Felhasználó típusainak nevei
    protected $tipusNames = array('admin'=>'admin',
                                  'leader'=>'leader',
                                  'operator'=>'operator',
                                  'user'=>'user',
                                  'guest'=>'guest');
    // Ez jelzi, hogy a teljes felhasználói listára szükségünk van-e?
    protected $showAllUser = false;
                                                                
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_FELHASZNALO_LIST';
      $this->getDataListCBAction = 'GET_FELHASZNALO_LIST_CB';
      $this->getDataListAllCBAction = 'GET_FELHASZNALO_LIST_ALL_CB';
      $this->getDataAction = 'GET_FELHASZNALO_DATA';
      $this->insertDataAction = 'INSERT_FELHASZNALO_DATA';
      $this->modifyDataAction = 'MODIFY_FELHASZNALO_DATA';
      $this->removeDataAction = 'REMOVE_FELHASZNALO_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'felhasznalok';
      $this->primaryField = 'felhasznaloID';
      $this->orderByFields = array('felhasznaloNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['csopID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['felhasznaloNev'] = new CField('string','anyWord',$this->response,1,50);
      $this->fields['felhasznaloNevO'] = new CField('string','anyWord',$this->response,1,50);
      $this->fields['felhasznaloNevH'] = new CField('string','anyWord',$this->response,1,50);
      $this->fields['tipus'] = new CField('string','oneWord',$this->response,1,10);
      $this->fields['oraado'] = new CField('integer','',$this->response,0,1);
      $this->fields['szakoktato'] = new CField('integer','',$this->response,0,1);
    }
    
    // @override
    function doActionFunc($action)
    {
      switch ($action)
      {
        // Teljes felhasználó lista lekérdezése
        case $this->getDataListAllCBAction:
          // Ez a változó jelzi, hogy a teljes lista kell
          $this->showAllUser = true;
          $this->getDataList();
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
        
      if ('oraado' == $field)
        return in_array($value,array_keys($this->oraadoNames));
        
      if ('szakoktato' == $field)
        return in_array($value,array_keys($this->szakoktatoNames));
        
      return parent::testDbValue2($field,$value);
    }
    
    // @override
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
     // Felhasználók kilistázása az adatbázisról
      $rs = $this->getDataListQuery($fields);
      
      if (true != $rs)
        $this->response->sendError('Hiba a felhasználók lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $felhasznalok = array();
      while ($record = $rs->FetchRow())
      {
        $felhasznalo = array();
        foreach ($record as $field => $value)
          $felhasznalo[$field] = utf8ToLatin2($value);
          
        // Egyéni elnevezések megadása
        $felhasznalo['oraado'] = $this->oraadoNames[$felhasznalo['oraado']];
        $felhasznalo['szakoktato'] = $this->oraadoNames[$felhasznalo['szakoktato']];
        
        $felhasznalok[] = $felhasznalo;
      }
        
      // Felhasználó hozzáadása a válaszhoz
      $this->response->addArray($felhasznalok);
    }
    
    // @override
    function getDataListQuery($fields,$filterFields,$filterValues)
    {
      $expr = '';
      if (in_array('csoportNev',$fields))
        $expr .= ' LEFT JOIN csoportok ON csoportok.csoportID='.$this->tableName.'.csopID';

      $felhasznaloID = $_SESSION['felhasznaloID'];
      $felhasznaloTipus = $this->getFelhasznaloTipus($felhasznaloID);

      // Alapértelmezésben csak a felhasználóhoz tartozó felhasználókat listázzuk ki...
      $inExpr = implode(',',$this->getFelhasznalokList($felhasznaloID));
      // ...ha pedig nem erre van szükség, akkor az összes felhasználót 
      // NOTE: - admin esetében az adminok is láthatóak
      if (true === $this->showAllUser)
        $inExpr = 'SELECT felhasznalok.felhasznaloID FROM felhasznalok '.
          (('admin'===$felhasznaloTipus)?'':'WHERE felhasznalok.tipus NOT IN ("admin")');

      $query = 'SELECT '.implode(',',$fields).' FROM '.$this->tableName.$expr.
        ' WHERE '.$this->tableName.'.'.$this->primaryField.' IN ('.
        $inExpr.')'.$this->getOrderByExpression();
      
      return $this->db->execute($query);
    }
    
    // @override
    function modifyData()
    {
      $rs = parent::modifyData();
      
      $felhasznaloID = $this->getPrimaryFieldValue();
      
      $a = dbExec($this->db, 'SELECT oraado FROM felhasznalok WHERE felhasznaloID='.$felhasznaloID);   
      
      // Hiba esetén kilépünk
      if (!(0 < count($a)))
        $this->response->sendError('Hiba a felhasználó adatainak (óraadó-e?) a lekérdezése során!',true);
        
      $oraado = $a[0]['oraado'];
      
      // Felhasználó adatainak a módosításakor automatikusan nullára állítjuk a szakfeladat
      // elszámolást, amennyiben nem óraadó
      if (0 == $oraado)
        $this->db->execute('UPDATE tantargyelsz SET szakfelsz=0 WHERE felhasznaloID='.$felhasznaloID);
      
      return $rs;
    }
        
  }   
?>
