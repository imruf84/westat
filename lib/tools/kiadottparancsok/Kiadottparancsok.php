<?php
  require_once('../../CService.php');
  require_once('../../dbExec.php');
  
  /**
   * Tárolt parancsok listájának a lekérdezése.
   * 
   * @return {array of string} a tárolt parancsok listája      
   */     
  function getLoggedActions()
  {
    return array('GET_HIANYZAS_LIST','GET_HELYETTESITES_LIST','GET_TKTEF_LIST');
  } 
  
  /**
   * Tárolt parancsok menüpont neveinek a listájának a lekérdezése.
   * 
   * @return {array of string} a tárolt parancsok menüpont neveinek a listája      
   */     
  function getLoggedActionNames()
  {
    return array('Hiányzások','Helyettesítések','Tanórán kívüli tevékenységek');
  }
  
  /**
   * Blokkolt parancsok neveinek a listájának a lekérdezése.
   * 
   * @return {array of string} a tárolt parancsok menüpont neveinek a listája      
   */     
  function getBlockedActions()
  {
    return array(
      'INSERT_HIANYZAS_DATA','MODIFY_HIANYZAS_DATA','REMOVE_HIANYZAS_LIST',
      'INSERT_HELYETTESITES_DATA','MODIFY_HELYETTESITES_DATA','REMOVE_HELYETTESITES_LIST',
      'INSERT_TKTEF_DATA','MODIFY_TKTEF_DATA','REMOVE_TKTEF_LIST','LOAD_TKTEF_LESSONS'
    );
  }
  
  /**
   * Kiadott parancsok naplózására szolgáló eljárás.
   * NOTE: - csak néhány parancs naplózására van szükség, a lezárás eszköz használatához   
   */ 
  function logAction($db,$felhasznaloID,$idoszakID,$action)
  {
    $loggedFelhasznaloID = $_SESSION['felhasznaloID'];
    
    $loggedActions = getLoggedActions();
    
    // Ha minden rendben van, akkor elkészítjük a bejegyzést
    if (($loggedFelhasznaloID === $felhasznaloID) && (in_array($action,$loggedActions)))
      $db->Execute('INSERT INTO kiadottparancsok (felhasznaloID,idoszakID,parancs) 
        VALUES ('.$felhasznaloID.','.$idoszakID.',"'.$action.'"'.')');
  }
  
  /**
   * A függvény ellenőrzi, hogy az adott parancs végrehajtható-e?
   * NOTE: - a parancs akkor nem hajtható végre, ha action loggedAction és az adott 
   *         felhasználó, az adott időszakkal szerepel a lezarasok táblában
   *       - ha a parancs nem hajtható végre, akkor hibával leállunk         
   */
  function checkAction($db,$action,$idoszakID,$felhasznaloID,$felhasznaloTipus,$response)
  {
    $blockedActions = getBlockedActions();
    
    // Ha a parancs loggedAction és a felhasználó user vagy guest...
    if (!in_array($felhasznaloTipus,array('admin','leader','operator')) && (in_array($action,$blockedActions)))
    {
      // ...és szerepel a felhaszanáló az időszakkal a lezarasok táblában...
      $a = dbExec($db,'SELECT * FROM lezarasok WHERE felhasznaloID='.$felhasznaloID.' AND idoszakID='.$idoszakID);
      
      if (0 < count($a))
      {
        // ...akkor nem hajthatja végre a kért műveletet
        $response->sendError('A kért művelet nem hajtható végre lezárt időszakon!',true);
      }
    }
    
  }     

?>
