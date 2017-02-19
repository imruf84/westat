<?php
  /**
   * Lezárások szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CLezarasok.php');
  
  $lezarasok = new CLezarasok($GLOBALS['RESPONSE']);
  $lezarasok->connectDB();
  $lezarasok->doAction($_POST['ACTION']);
  $lezarasok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
