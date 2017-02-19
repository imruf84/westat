<?php
  /**
   * Helyettesítések szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CHelyettesitesek.php');
  
  $helyettesitesek = new CHelyettesitesek($GLOBALS['RESPONSE']);
  $helyettesitesek->connectDB();
  $helyettesitesek->doAction($_POST['ACTION']);
  $helyettesitesek->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
