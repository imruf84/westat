<?php
  /**
   * Kötelező órák szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CKotelezoorak.php');
  
  $kotelezoorak = new CKotelezoorak($GLOBALS['RESPONSE']);
  $kotelezoorak->connectDB();
  $kotelezoorak->doAction($_POST['ACTION']);
  $kotelezoorak->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
