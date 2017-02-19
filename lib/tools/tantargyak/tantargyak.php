<?php
  /**
   * Tantárgyak szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CTantargyak.php');
  
  $tantargyak = new CTantargyak($GLOBALS['RESPONSE']);
  $tantargyak->connectDB();
  $tantargyak->doAction($_POST['ACTION']);
  $tantargyak->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
