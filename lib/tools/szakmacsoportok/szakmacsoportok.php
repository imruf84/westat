<?php
  /**
   * Szakmacsoportok szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CSzakmaCsoportok.php');
  
  $szakmacsoportok = new CSzakmaCsoportok($GLOBALS['RESPONSE']);
  $szakmacsoportok->connectDB();
  $szakmacsoportok->doAction($_POST['ACTION']);
  $szakmacsoportok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
