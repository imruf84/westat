<?php
  /**
   * Egyéni órakedvezmények szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CEgyeniorakedv.php');
  
  $egyeniorakedv = new CEgyeniorakedv($GLOBALS['RESPONSE']);
  $egyeniorakedv->connectDB();
  $egyeniorakedv->doAction($_POST['ACTION']);
  $egyeniorakedv->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
