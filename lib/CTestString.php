<?php

  /**
   * Karakterlánc formátum definiciók.
   * NOTE: - a System.js állomány ugyanezeket a definíciókat tartalmazza a
   *         kliensoldali vizsgálathoz   
   *       - tesztelésre: 
   *         http://www.switchplane.com/utilities/preg_match-regular-expression-tester.php?pattern=//u&subject=abc
   *         http://www.spaweditor.com/scripts/regex/index.php
   *         http://www.functions-online.com/preg_replace.html   
   * Az asszociatív tömb elemei kételemű asszociatív tömbök:
   *   'pattern' {string} minta
   *   'help' {string} a minta szöveges megfogalmazása
   *    NOTE: - hiba esetén segítheti a felhasználót      
   */
  $GLOBALS['TEST_STRING_PATTERNS'] = array(
    // Bármilyen karakterlánc
    'anyWord' => array(
      'pattern' => '/.*/u',
      'help' => 'Bármilyen karakter megengedett!'
    ),
    // Pozitív egész szám
    'posInt' => array(
      'pattern' => '/^\d*\.{0,1}\d+$/u',
      'help' => 'Csak pozitív egész szám a megengedett!'
    ),
    // Egész szám
    'posNegInt' => array(
      'pattern' => '/^-{0,1}\d*\.{0,1}\d+$/u',
      'help' => 'Csak egész szám a megengedett!'
    ),
    // Pozitív tizedes tört
    'fraction' => array(
      'pattern' => '/^\d*\.?\d*$/u',
      'help' => 'Csak pozit\u00edv tizedes t\u00f6rt a megengedett!'
    ),
    // Tetszőleges betűt tartalmazó, tetszőleges hosszúságú, szóközökkel tagolt szavak 
    'nWordSepBySpace' => array(
      'pattern' => '/^[a-zA-ZöÖüÜóÓőŐúÚéÉáÁűŰíÍ]{1,}([\s][a-zA-ZöÖüÜóÓőŐúÚéÉáÁűŰíÍ]{1,})*$/u',
      'help' => 'Csak egyszeres szóközökkel tagolt szavak adhatóak meg!'
    ),
    // Tetszőleges betűt és pontot tartalmazó, tetszőleges hosszúságú, szóközökkel tagolt szavak
    'nWordSepBySpaceDot' => array(
      'pattern' => '/^[a-zA-ZöÖüÜóÓőŐúÚéÉáÁűŰíÍ]{1,}[\.]?([\s][a-zA-ZöÖüÜóÓőŐúÚéÉáÁűŰíÍ]{1,}[\.]?)*$/u',
      'help' => 'Csak egyszeres szóközökkel tagolt szavak és pont adhatóak meg!'
    ),
    // Betűket, számokat, vesszőt, kötőjelet, pontot és kötőjelet tartalmazó, tetszőleges hosszúságú, szóközökkel tagolt szavak
    'nWordSepBySpaceSpec' => array(
      'pattern' => '/^[0-9a-zA-ZöÖüÜóÓőŐúÚéÉáÁűŰíÍ\.\/-]{1,}[\,]?([\s][0-9a-zA-ZöÖüÜóÓőŐúÚéÉáÁűŰíÍ\.\/-]{1,}[\,]?)*$/u',
      'help' => 'Csak egyszeres szóközökkel, vagy vesszővel tagolt szavak adhatóak meg!'
    ),
    // Angol abc betűit és alulvonást tartalmazó tetszőleges hosszúságú szó 
    'oneWord' => array(
      'pattern' => '/^[a-zA-Z_]{1,}$/u',
      'help' => 'Csak az angol abc betűit és alulvonást (_) tartalmazó szó adható meg!'
    ),
    // Mezőnév 
    'fieldName' => array(
      'pattern' => '/^([a-zA-Z_]{1,})([0-9]{0,})$/u',
      'help' => 'Csak az angol abc betűit és alulvonást (_) tartalmazó esetleg azt számmal lezáró szó adható meg!'
    ),
    // Tetszőleges betűket tartalmazó tetszőleges hosszúságú szó 
    'oneWord2' => array(
      'pattern' => '/^[a-zA-ZöÖüÜóÓőŐúÚéÉáÁűŰíÍ]{1,}$/u',
      'help' => 'Csak tetszőleges betűket tartalmazó szó adható meg!'
    ),
    // Az angol ABC egy betűje
    'oneChar' => array(
      'pattern' => '/^[a-zA-Z]{1,1}$/u',
      'help' => 'Csak egy betű adható meg!'
    ),
    // Az angol ABC egy betűje vagy száma
    'oneCharOrNumber' => array(
      'pattern' => '/^[a-zA-Z0-9]{1,1}$/u',
      'help' => 'Csak egy betű adható meg!'
    ),
    // Osztály neve 
    'osztalyNev' => array(
      'pattern' => '/^[1-9][0-9]?[\.\,][1-9A-Za-z]$/u',
      'help' => 'Csak ponttal elválasztott két szó adható meg ([egy vagy kétjegyű szám].[betű A-tól Z-ig] pl. 12.F vagy 9.4 stb.)!'
    ),
    // Órarend azonosítója 
    'orarendID' => array(
      'pattern' => '/^orarend\d{6}$/u',
      'help' => 'Csak "orarend" felirat, utána hat számmal a megfelelő (pl. orarend123456)!'
    ),
    // Órarend változatainak a betűjele 
    'orarendBetujel' => array(
      'pattern' => '/^[A-B]{1}$/u',
      'help' => 'Csak "A" és "B" adható meg!'
    ),
    // Tanév elnevezése
    'tanevNev' => array(
      'pattern' => '/^[1-9][0-9]{3}\/[1-9][0-9]{3}$/u',
      'help' => 'Csak két négy számjegyből álló perrel elválasztott azonosító adható meg (pl. 2010/2011)!'
    ),
    // Dátum
    'date' => array(
      'pattern' => '/^([1-9][0-9]{3})(\.|\-)(([0][1-9])|([1][0-2]))(\.|\-)(([0][1-9])|([12][0-9])|([3][01]))$/u',
      'help' => 'Csak az alábbi formátumban megadott dátum érvényes:éééé-hh-nn!'
    ),
    // Időszak neve
    'idoszakNev' => array(
      'pattern' => '/^(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)\-(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)$/u',
      'help' => 'Csak az alábbi formátumban megadott név érvényes:hónapnév-hónapnév (pl. jav-feb)!'
    ),
    // Exel fájl
    'excelFile' => array(
      'pattern' => '/.*/u',
      'help' => 'Bármilyen karakter megengedett!'
    )
  );  
  
  /**
   * Segédosztály a karakterláncok teszteléséhez.
   * TODO: - a mintákat az osztályban tárolni   
   */     
  class CTestString
  { 
    /**
     * Karakterlánc hosszának és formátumának a tesztelése.
     * 
     * @param str {string} a vizsgálndó karakterlánc
     * @param patternName {string} a minta neve     
     * @param minLen {number?undefined} a karakterlánc minimális hossza (-1 esetén figyelmen kívül marad)
     * @param maxLen {nimber?undefined} a karakterlánc maximális hossza (-1 esetén figyelmen kívül marad)
     * @return {number} 0 vagy hiba esetén a hiba kódja
     * NOTE: - 0: nincs hiba
     *       - 1: a változó típusa nem megfelelő     
     *       - 2: a minta nem található     
     *       - 3: a karakterlánc túl rövid
     *       - 4: a karakterlánc túl hosszú
     *       - 5: a karakterlánc formátuma nem megfelelő     
     */
    function test($str,$patternName,$minLen,$maxLen)
    {
      if (!is_string($str)) return 1;
      
      $pattern = CTestString::getPattern($patternName);
      if (null == $pattern) return 2;
      
      $len = mb_strlen($str,'UTF-8');
      if (isset($minLen) && -1 != $minLen && $minLen > $len)
        return 3;
      if (isset($maxLen) && -1 != $maxLen && $maxLen < $len)
        return 4;
      if (is_string($patternName) && 0 == preg_match($pattern['pattern'],$str))
        return 5;
      
      return 0;
    }
    
    /**
     * Minta lekérdezése.
     * 
     * @param patternName {string} a minta neve
     * @return {arrya(2):string} a névhez tartozó minta vagy hiba esetén null               
     */      
    function getPattern($patternName)
    { 
      $pattern = $GLOBALS['TEST_STRING_PATTERNS'][$patternName];
      if (!isset($pattern)) return null;
      
      return $pattern;
    }   
    
  }  
   
?>
