<?php
  /**
   * Karakterkódolással kapcsolatos függvények.
   */   
  
  /**
   * Utf8 karakterlán átalakítása latin2-re.
   * 
   * @param utf8Text {string} az átalakítandó karakterlánc
   * @return {string} az átalakított karakterlánc         
   */     
  function utf8ToLatin2($utf8Text)
  {
    return mb_convert_encoding($utf8Text,'UTF-8','ISO-8859-2');
  }
  
  /**
   * Latin2 karakterlán átalakítása utf8-ra.
   * 
   * @param latin2Text {string} az átalakítandó karakterlánc
   * @return {string} az átalakított karakterlánc         
   */
  function latin2ToUtf8($latin2Text)
  {
    return mb_convert_encoding($latin2Text,'ISO-8859-2','UTF-8');
  }
  
  /**
   * Ékezetes betűk cseréje nem ékezetesekre.
   * 
   * @param text {string} a lecserélendő karaktereket tartalmazó szöveg
   * @return {string} a lecserélt karaktereket tartalmazó szöveg         
   */
  function changeSpecChars($text)
  {
    return strtr($text,latin2ToUtf8('öÖüÜóÓőŐúÚéÉáÁűŰíÍ'),'oOuUoOoOuUeEaAuUiI'); 
  }
       
?>
