<?php
  /**
   * Osztály címkék szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('COsztalyCimkek.php');
  
  $osztalycimkek = new COsztalyCimkek($GLOBALS['RESPONSE']);
  $osztalycimkek->connectDB();
  $osztalycimkek->doAction($_POST['ACTION']);
  $osztalycimkek->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
