<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Osztályok kezelését megvalósító osztály.
   */
  class CLogin extends CService
  {
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_LOGIN_FELHASZNALO_LIST';
      $this->getDataAction = 'LOGIN_FELHASZNALO';
      $this->insertDataAction = '';
      $this->modifyDataAction = 'LOGIN_GET_HISTORY';
      $this->removeDataAction = 'LOGOUT_FELHASZNALO';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = '';
      $this->primaryField = 'felhasznaloID';
      $this->orderByFields = array('felhasznaloNev');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['jelszo'] = new CField('string','anyWord',$this->response,0,20);
    }
    
    // @override
    // NOTE: - felhasználók listájának lekérdezése
    function getDataList()
    {
      $rs = $this->db->execute('SELECT felhasznaloID,felhasznaloNev FROM felhasznalok'.$this->getOrderByExpression());        
      
      if (true != $rs)
        $this->response->sendError('Hiba az felhasználók listájának lekérdezése közben!',true);
        
      $this->response->addResult($rs);
      
      return $rs;
    }
    
    // @override  
    // NOTE: - felhasználó beléptetése      
    function getData()
    {
      $value = $this->getDbFieldValues(array('felhasznaloID','jelszo'));
      // Felhasználó azonosító lekérdezése
      $felhasznaloID = $value['felhasznaloID'];
      // Jelszó lekérdezése
      $jelszo = $value['jelszo'];
        
      // Felhasználó adatainak a lekérdezése
      $rs = $this->db->execute('SELECT felhasznaloID,felhasznaloNev,tipus,jelszo FROM '.
        'felhasznalok WHERE felhasznaloID='.$felhasznaloID.' AND '.
        '(jelszo IS NULL OR jelszo=MD5('.utf8ToLatin2($jelszo).'))');        
      
      // Hibás lekérdezés esetén kilépünk
      if (true != $rs)
        $this->response->sendError('Hiba a felhasználó adatainak lekérdezése közben!',true);
        
      // Ha nem találtunk ilyen felhasználót (pl hibás a jelszó), akkor hibával kilépünk
      if (!(0 < $rs->RecordCount()))
        $this->response->sendError('Hibás a felhasználói név vagy jelszó!',true);
      
      $this->response->addResult($rs);
      
      // Parancsok listájának a létrehozása
      $actions = $this->getAllowedActions($felhasznaloID);
      $this->response->addArray(array('ACTIONS' => $actions));
      
      // Felhasználó adatainak ideinglenes tárolása (session)
      $_SESSION['felhasznaloID'] = $felhasznaloID;
      
      return $rs;
    }
    
    // @override
    // NOTE: - előzmények szövegének letöltése
    //       - nem igényel bemenő paramétereket
    //       - válaszként minden esetben szöveget ad vissza (hiba esetén is)
    function modifyData()
    {
      $history = file_get_contents('../../../history.txt');
      
      if (false == $history)
        $this->response->sendError('Az előzményeket tartalmazó állomány nem elérhető!',true);
        
      $this->response->addElement('HISTORY',$history);
    }
    
    // @override
    // NOTE: - felhasználó kiléptetése
    function removeDataList()
    { 
      // Felhasználó ideinglenes adatainak törlése (session)
      if (isset($_SESSION['felhasznaloID']))
        unset($_SESSION['felhasznaloID']); 
    }
    
  }   
?>
