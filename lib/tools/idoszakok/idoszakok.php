<?php
  /**
   * Időszakok szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CIdoszakok.php');
  
  $idoszakok = new CIdoszakok($GLOBALS['RESPONSE']);
  $idoszakok->connectDB();
  $idoszakok->doAction($_POST['ACTION']);
  $idoszakok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
