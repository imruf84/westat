<?php
  /**
   * Hiányzások és helyettesítések állományból való betöltés szolgáltatásait 
   * végrehajtó állomány.
   */   
  
  require_once('../../response.php');
  require_once('CHihebetolt.php');
  
  $hihebetolt = new CHihebetolt($GLOBALS['RESPONSE']);
  $hihebetolt->connectDB();
  $hihebetolt->doAction($_POST['ACTION']);
  $hihebetolt->closeDB();
  
  //Válasz küldése
  $GLOBALS['RESPONSE']->send();
?>
