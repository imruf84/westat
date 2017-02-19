<?php
   
  /**
   * Szerver válaszát kezelő osztály.
   */
  class CResponse
  {
    // A hibaüzenetet tartalmazó tömb
    protected $response;
    
    /**
     * Konstruktor.
     */         
    function __construct()
    {
      $this->response = array();
    }
    
    /**
     * Lekérdezés eredményének hozzáadása a válaszhoz.
     * 
     * @param result {AdoDBResult} a hozzáadandó lekérdezéseredmény
     * @return {Array():any type?null} az eredmény tömbbé alakítva, vagy hiba esetén null               
     */     
    function addResult($result)
    {
      // Ha hibás a lekérdezés, vagy nem tartalmaz rekordokat akkor nem teszünk semmit
      if (true != $result || !(0 < $result->RecordCount()))
        return null;
      
      $rows = array();
      // Átalakítjuk utf8-ról latin2-re az adatokat...
      while ($record = $result->FetchRow())
      {
        foreach ($record as $key => $val)
          $row[$key] = utf8ToLatin2($val);
        
        $rows[] = $row;
      }
      
      // ...majd hozzáfűzzük a többi válaszhoz
      $this->response = array_merge_recursive($this->response, $rows);
      
      return $rows;
    }
    
    /**
     * Érték hozzáadása a válaszhoz.
     * 
     * @param key {string} az azonosító kulcs
     * @param value {any type} a hozzáadandó érték               
     */     
    function addElement($key,$value)
    {
      $a[$key] = $value;
      $this->response = array_merge_recursive($this->response, $a);
    }
    
    /**
     * Tömb hozzáadása a válaszhoz.
     * 
     * @param value {Array} a hozzáadandó tömb               
     */     
    function addArray($array)
    {
      $this->response = array_merge_recursive($this->response, $array);
    }
    
    /**
     * Válasz küldése.
     */     
    function send()
    {
      $resp['RESPONSE'] = $this->response;
      $resp['RESPONSE_TYPE'] = 'NO_ERROR';
      print(json_encode($resp));
      
      $this->flush();
    }
    
    /**
     * Üres válasz küldése azonnali visszatéréssel.
     * NOTE: - olyankor jó, amikor pl az egyik ComboBox __null__-t tartalmaz, 
     *         aminek hatására azonnal visszatérünk egy üres válasszal     
     */   
     function sendEmptyAndExit()
     {
        $this->send();
        exit;
     }      
    
    /**
     * Utasítás fájl letöltésére.
     */         
    function download()
    {
    }
    
    /**
     * Bufferek ürítése.
     */         
    function flush()
    {
      flush();
      ob_flush();
    }
    
    /**
     * Hibaüzenet küldése.
     *      
     * @param errorMsg {string} a hiba üzenete
     * @param sendInitalDataBack {boolean} ha igaz akkor visszaküldi a beérkező adatokat is
     * NOTE: - a bemeneti adatok visszaküldése a hiba azonosítását segítheti     
     * @param runOnSuccess {boolean?undefined} ha igaz akkor lefut a sikeres lefutás eseménye is ([false])
     * NOTE: - olyankor hasznos, amikor csak informálni szeretnénk a felhasználót
     */     
    function sendError($errorMsg,$sendInitalDataBack,$runOnSuccess=false)
    {
      $resp['ERROR_MSG'] = $errorMsg;
      $resp['RESPONSE'] = array();
      $resp['RESPONSE_TYPE'] = 'ERROR';
      
      // Ha kell akkor lefuttatjuk majd a sikeres végrehajtás esményét is
      $resp['RUN_ON_SUCCESS'] = (isset($runOnSuccess) && true == $runOnSuccess) ? 'YES' : 'NO';
      
      // Ha szükséges akkor visszaküldjük a kapott adatokat is
      if (true == $sendInitalDataBack)
        $resp['RESPONSE'] = array_merge_recursive($resp['RESPONSE'], $_POST);
        
      print(json_encode($resp));
      
      $this->flush();
      
      exit;
    }
  }   
?>
