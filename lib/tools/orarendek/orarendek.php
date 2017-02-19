<?php
  /**
   * Órarendek szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('COrarendek.php');
  
  $csoportok = new COrarendek($GLOBALS['RESPONSE']);
  $csoportok->connectDB();
  $csoportok->doAction($_POST['ACTION']);
  $csoportok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
