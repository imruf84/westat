<?php

  require_once('dbExec.php');
  
  /**
   * A függvény egy lekérdezést alakít asszociatív tömbbé.
   * 
   * @param db {database} az adatbázis referenciája   
   * @param table {string} a lekérdezés táblájának a neve
   * @param key {string} a kulcsok mezőneve
   * @param value {string} az értékek mezőneve
   * @return {array[key as string] value as number} az adatok tömbje                  
   */     
  function arrayFromQuery($db,$table,$key,$value,$where='')
  {
    $a = dbExec($db,'SELECT '.$key.','.$value.' FROM '.$table.(''==$where ? '' : ' WHERE '.$where));
    
    $b = array();
    foreach ($a as $aVal)
      $b[$aVal[$key]] = $aVal[$value];
      
    return $b;
  }

?>
