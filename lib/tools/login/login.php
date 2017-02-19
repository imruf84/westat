<?php
  /**
   * Felhasználók beléptetését végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CLogin.php');
  
  $login = new CLogin($GLOBALS['RESPONSE']);
  $login->connectDB();
  $login->doAction($_POST['ACTION']);
  $login->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
