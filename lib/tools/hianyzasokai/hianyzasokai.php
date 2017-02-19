<?php
  /**
   * Hiányzás okainak a szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CHianyzasokai.php');
  
  $hianyzasokai = new CHianyzasokai($GLOBALS['RESPONSE']);
  $hianyzasokai->connectDB();
  $hianyzasokai->doAction($_POST['ACTION']);
  $hianyzasokai->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
