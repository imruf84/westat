<?php
  /**
   * Helyettesítés típusainak a szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CHelyettesitestipusai.php');
  
  $helyettesitestipusai = new CHelyettesitestipusai($GLOBALS['RESPONSE']);
  $helyettesitestipusai->connectDB();
  $helyettesitestipusai->doAction($_POST['ACTION']);
  $helyettesitestipusai->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
