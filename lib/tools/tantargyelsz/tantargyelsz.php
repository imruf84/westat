<?php
  /**
   * Tantárgyelszámolások szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CTantargyelsz.php');
  
  $tantargyelsz = new CTantargyelsz($GLOBALS['RESPONSE']);
  $tantargyelsz->connectDB();
  $tantargyelsz->doAction($_POST['ACTION']);
  $tantargyelsz->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
