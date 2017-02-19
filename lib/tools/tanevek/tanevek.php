<?php
  /**
   * Tanévek szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CTanevek.php');
  
  $csoportok = new CTanevek($GLOBALS['RESPONSE']);
  $csoportok->connectDB();
  $csoportok->doAction($_POST['ACTION']);
  $csoportok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
