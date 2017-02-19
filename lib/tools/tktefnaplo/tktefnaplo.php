<?php
  /**
   * Tanórán kívüli tevékenységek és egyéni foglalkozások naplójának szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CTktefnaplo.php');
  
  $tktefnaplo = new CTktefnaplo($GLOBALS['RESPONSE']);
  $tktefnaplo->connectDB();
  $tktefnaplo->doAction($_POST['ACTION']);
  $tktefnaplo->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
