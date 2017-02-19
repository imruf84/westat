<?php
  /**
   * Hiányzások szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CHianyzasok.php');
  
  $hianyzasok = new CHianyzasok($GLOBALS['RESPONSE']);
  $hianyzasok->connectDB();
  $hianyzasok->doAction($_POST['ACTION']);
  $hianyzasok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
