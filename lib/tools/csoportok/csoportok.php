<?php
  /**
   * Csoportok szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CCsoportok.php');
  
  $csoportok = new CCsoportok($GLOBALS['RESPONSE']);
  $csoportok->connectDB();
  $csoportok->doAction($_POST['ACTION']);
  $csoportok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
