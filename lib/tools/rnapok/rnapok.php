<?php
  /**
   * Rendhagyó napok szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CRnapok.php');
  
  $rnapok = new CRnapok($GLOBALS['RESPONSE']);
  $rnapok->connectDB();
  $rnapok->doAction($_POST['ACTION']);
  $rnapok->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
