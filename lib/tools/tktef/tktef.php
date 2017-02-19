<?php
  /**
   * Tanórán kívüli tevékenységek szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CTktef.php');
  
  $tktef = new CTktef($GLOBALS['RESPONSE']);
  $tktef->connectDB();
  $tktef->doAction($_POST['ACTION']);
  $tktef->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
