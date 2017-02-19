<?php
  /**
   * Osztályok címkéinek a szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('COsztalyokCimkei.php');
  
  $osztalyokcimkei = new COsztalyokCimkei($GLOBALS['RESPONSE']);
  $osztalyokcimkei->connectDB();
  $osztalyokcimkei->doAction($_POST['ACTION']);
  $osztalyokcimkei->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
