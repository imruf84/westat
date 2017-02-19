<?php
  /**
   * Helyettesítési napló szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CHelyettnaplo.php');
  
  $helyettnaplo = new CHelyettnaplo($GLOBALS['RESPONSE']);
  $helyettnaplo->connectDB();
  $helyettnaplo->doAction($_POST['ACTION']);
  $helyettnaplo->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
