<?php
  /**
   * Jelentések kezelésének szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CJelentesek.php');
  
  $jelentesek = new CJelentesek($GLOBALS['RESPONSE']);
  $jelentesek->connectDB();
  
  $action = $_POST['ACTION'];
  // Ha nincs a POST-ban parancs, akkor minden bizonnyal a GET-ben lesz
  if(isset($action))
    $jelentesek->doAction($action);
  else
    $jelentesek->doAction($_GET['ACTION']);
    
  $jelentesek->closeDB();
  
  // Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
