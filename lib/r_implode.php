<?php
  /**
   * T�mb�ket tartalmaz� t�mb �talak�t�sa karakterl�ncc�.
   */     
  function r_implode( $glue, $pieces ) 
  { 
    foreach( $pieces as $r_pieces ) 
    { 
      if( is_array( $r_pieces ) ) 
      { 
        $retVal[] = r_implode( $glue, $r_pieces ); 
      } 
      else 
      { 
        $retVal[] = $r_pieces; 
      } 
    } 
    return implode( $glue, $retVal ); 
  }

?>
