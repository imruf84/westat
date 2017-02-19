<?php
  /**
   * Osztálycsoportok szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('COsztalyCsoportok.php');
  
  $osztalycsoportok = new COsztalyCsoportok($GLOBALS['RESPONSE']);
  $osztalycsoportok->connectDB();
  $osztalycsoportok->doAction($_POST['ACTION']);
  $osztalycsoportok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
