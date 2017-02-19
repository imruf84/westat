<?php
  /**
   * Jelszavak szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CJelszavak.php');
  
  $jelszavak = new CJelszavak($GLOBALS['RESPONSE']);
  $jelszavak->connectDB();
  $jelszavak->doAction($_POST['ACTION']);
  $jelszavak->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
