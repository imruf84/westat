<?php
  /**
   * Tantárgyak címkéinek a szolgáltatásait végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CTantargyakCimkei.php');
  
  $tantargyakcimkei = new CTantargyakCimkei($GLOBALS['RESPONSE']);
  $tantargyakcimkei->connectDB();
  $tantargyakcimkei->doAction($_POST['ACTION']);
  $tantargyakcimkei->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
