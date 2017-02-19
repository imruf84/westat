<?php

  require_once('adodb5/adodb.inc.php');

 /**
   * SQL lekérdezés futtatása, majd az eredmény tömbbé alakítása.
   * NOTE: - a karakterkódolás is automatikusan elvégződik (utf8->latin2)   
   * 
   * @param db {AdoDBObject} adatbázis referencia objektuma
   * @param sql {sql} SQL lekérdezés       
   * @return {array} a lekérdezés eredménye tömbként     
   * NOTE: - ha a tömb csak egy elemből áll, akkor kényelmi okokból csak ezt az egy
   *         elemet adjuk vissza      
   */     
  function dbExec($db,$sql)
  {
    $rs = $db->execute($sql);
    if (true != $rs)
      die('Hiba a jelentés elkészítése során! Lekérdezés:'.$sql);
      
    // Ha egyetlen rekordot sem tartalmaz, akkor üres tömbbel kilépünk
    if (!(0 < $rs->RecordCount())) return array();
      
    // Lekérdezés eredményének átalakítása tömbbé
    $a = array();
    while ($record = $rs->FetchRow())
    {
      $b = array();
      foreach ($record as $key=>$r)
        $b[$key] = (is_string($r) ? utf8ToLatin2($r) : $r);
        
      $a[] = $b;
    }
    
    return $a;
  }

?>
