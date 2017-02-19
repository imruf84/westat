<?php
  /**
   * Tantárgycímkék szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CTantargyCimkek.php');
  
  $tantargycimkek = new CTantargyCimkek($GLOBALS['RESPONSE']);
  $tantargycimkek->connectDB();
  $tantargycimkek->doAction($_POST['ACTION']);
  $tantargycimkek->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
