<?php
  session_cache_limiter('public');
  ob_start();
  session_start();
  
  // Előfordulhat, hogy egy-egy művelet sok időt vesz igénybe, így korlátlan
  // időt adunk a futásra
  //ini_set('max_execution_time',0);
  ini_set('max_execution_time',1200); 
   
  // Hibakezelés beállítása
  error_reporting(E_ERROR | E_PARSE /*| E_WARNING*/);
  //ini_set('display_errors','0');
  ini_set('memory_limit','1024M');
   
  /**
   * Adatbázishoz való csatlakozáshoz szükséges adatok.
   */
   
  // A saját gépemen
  $GLOBALS['username'] = 'root';
  $GLOBALS['password'] = '';
  // A suli szerverén
  $GLOBALS['username2'] = 'root';
  $GLOBALS['password2'] = 'lehel';
  
  $GLOBALS['hostname'] = 'localhost';
  $GLOBALS['database'] = 'westat';
  $GLOBALS['driver']   = 'mysql';
 
  $GLOBALS['dsn'] = $GLOBALS['driver'].'://'.$GLOBALS['username'].':'.
    $GLOBALS['password'].'@'.$GLOBALS['hostname'].'/'.$GLOBALS['database'];
?>
