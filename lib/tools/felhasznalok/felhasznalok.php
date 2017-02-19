<?php
  /**
   * Felhasználók szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CFelhasznalok.php');
  
  $felhasznalok = new CFelhasznalok($GLOBALS['RESPONSE']);
  $felhasznalok->connectDB();
  $felhasznalok->doAction($_POST['ACTION']);
  $felhasznalok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
