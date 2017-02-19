<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Csoportok kezelését megvalósító osztály.
   */
  class CCsoportok extends CService
  {
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_CSOPORT_LIST';
      $this->getDataListCBAction = 'GET_CSOPORT_LIST_CB';
      $this->getDataAction = 'GET_CSOPORT_DATA';
      $this->insertDataAction = 'INSERT_CSOPORT_DATA';
      $this->modifyDataAction = 'MODIFY_CSOPORT_DATA';
      $this->removeDataAction = 'REMOVE_CSOPORT_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'csoportok';
      $this->primaryField = 'csoportID';
      $this->orderByFields = array('csoportNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['csoportNev'] = new CField('string','anyWord',$this->response,1,50);
      $this->fields['vezetoID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
    }
    
    // @override
    function getDataListQuery($fields,$filterFields,$filterValues)
    {
      $expr = '';
      if (in_array('felhasznaloNev',$fields))
        $expr .= ' LEFT JOIN felhasznalok ON felhasznalok.felhasznaloID='.$this->tableName.'.vezetoID';
        
        
      $felhasznaloID = $_SESSION['felhasznaloID'];

      // Alapértelmezésben csak a felhasználóhoz tartozó csoportokat listázzuk ki
      $inExpr = implode(',',$this->getCsoportokList($felhasznaloID));
      
      // Ha nincsenek csoportok akkor üres eredményt adunk vissza
      $query = 'SELECT '.implode(',',$fields).' FROM '.$this->tableName.$expr.
        ' WHERE '.((''==$inExpr) ? 'FALSE' : $this->tableName.'.'.$this->primaryField.' IN ('.
        $inExpr.')').$this->getOrderByExpression();
      
      return $this->db->execute($query);
    }
    
  }   
?>
