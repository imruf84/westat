<?php

  /**
   * Megadja két a dátum közti különbséget napokban.
   */         
  function dateDiff($iStartDate,$iEndDate) 
  {
    return sprintf('%d', (strtotime($iEndDate) - strtotime($iStartDate)) / 86400);
  }
  
?>
