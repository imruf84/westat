<?php
  require_once('CTestString.php');
  require_once('CharCoding.php');
  require_once('response.php');
  
  /**
   * Mezőt megvalósító osztály.
   * Egy mező tartalmazza az étékének a teszteléséhez szükséges formátumot, 
   * illetve étékének a minimális, és maximális hosszát.      
   */     
  class CField
  {
    protected $pattern;
    protected $min;
    protected $max;
    protected $type;
    
    /**
     * Konstruktor.
     * 
     * @param pattern {string} a mező formátumának neve
     * NOTE: - lásd: CTestingString
     * @param min {number} a mező étékének minimális hossza, szám esetében pedig
     *   a minimális értéke
     * @param max {number} a mező étékének maximális hossza, szám esetében pedig
     *   a maximális értéke
     * @param type {string} a mező értékének típusa ('string','boolean','integer','float')
     * @param $response {CResponse} a válasz küldéséért felelős objektum
     * NOTE: - általában hibák küldése esetén van szerepe                       
     */         
    function __construct($type,$pattern,$response,$min,$max)
    { 
      switch ($type)
      {
        case 'string':
        case 'boolean':
        case 'integer':
        case 'float':
          $this->type = $type;
        break;
        default:
          $response->sendError('A megadott típus nem megfelelő:'.$type,true);
      }
      
      // Logikai típusnál nincs értelme a mintának,hossznak/értéknek
      if ('boolean' != $type)
      {
        // A mintának csak szöveg esetében van értelme
        if ('string' == $type)
        {
          $this->pattern = $GLOBALS['TEST_STRING_PATTERNS'][$pattern];
         
          // Ha nem létezik a megadott mintanév akkor hibával kilépünk 
          if (!isset($this->pattern))
            $response->sendError('A megadott mezőminta nem létezik: '.$pattern,true);
        }
      
        if (!is_numeric($min))
          $response->sendError('A minimális hossz/érték csak szám lehet: '.$min,true);
        $this->min = $min;
      
        if (!is_numeric($max))
          $response->sendError('A minimális hossz/érték csak szám lehet: '.$max,true);
        $this->max = $max;
      }
    }
    
    /**
     * Érték tesztelése.
     * 
     * @param value {any type} a tesztelendő érték
     * @return {number} 0, vagy hiba esetén a hiba kódja
     * NOTE: - 0 : nincs hiba
     *       - 1 : típus hiba     
     *       - 2 : alsó érték probléma
     *       - 3 : felső érték probléma
     *       - 4 : formátum hiba                                   
     */   
    function test($value)
    {
      // Típus ellenörzése
      $validType = true;
      switch ($this->type)
      {
        case 'string':
          $validType = is_string($value);
        break;
        case 'boolean':
          $validType = is_bool($value);
        break;
        case 'integer':
          if (is_string($value))
            $validType = (0 == CTestString::test($value,'posNegInt',1,-1));
          else
            $validType = is_integer((int)$value);
        break;
        case 'float':
          $validType = is_float($value);
        break;
      }
      
      // Ha a típus nem megfelelő akkor kilépünk      
      if (!$validType) return 1;
      
      // Logikai típusnál nincs értelme a következő vizsgálatoknak
      if ('boolean' != $this->type)
      {
      
        // Hossz/érték ellenörzése
        $len = ('string' == $this->type) ? mb_strlen($value,'UTF-8') : $value;
                
        if ($len < $this->min) return 2;
        if ($len > $this->max) return 3;
        
        // Minta ellenőrzése
        // NOTE: - a mintaellenörzés csak abban az esetben fut le, ha nem adtunk
        //         meg 0 hosszt minimális hosszként
        if ('string' == $this->type && (0 != $this->min || 0 != $len))
          if (0 == preg_match($this->pattern['pattern'],$value))
            return 4;
        
      }
      
      return 0;
      
    }      
    
    /**
     * Mező típusának a lekérdezése.
     * 
     * @return {string} a mező típusa          
     */         
    function getType()
    {
      return $this->type;
    }
    
    /**
     * Mező formátumának a lekérdezése.
     * 
     * @return {string} a mező formátuma
     */         
    function getPattern()
    {
      return $this->pattern;
    }
    
    /**
     * Mező értékének minimális hossza/értéke.
     * 
     * @return {number} a mező minimális hossza/értéke
     */         
    function getMin()
    {
      return $this->min;
    }
    
    /**
     * Mező értékének maximális hossza/értéke.
     * 
     * @return {number} a mező maximális hossza/értéke
     */         
    function getMax()
    {
      return $this->max;
    }
    
  }
?>
