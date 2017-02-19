<?php
  /**
   * Órák szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('COrak.php');
  
  $orak = new COrak($GLOBALS['RESPONSE']);
  $orak->connectDB();
  $orak->doAction($_POST['ACTION']);
  $orak->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
