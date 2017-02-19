<?php
  /**
   * Osztályok szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('COsztalyok.php');
  
  $osztalyok = new COsztalyok($GLOBALS['RESPONSE']);
  $osztalyok->connectDB();
  $osztalyok->doAction($_POST['ACTION']);
  $osztalyok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
