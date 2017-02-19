<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Időszakok kezelését megvalósító osztály.
   */
  class CIdoszakok extends CService
  {
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_IDOSZAK_LIST';
      $this->getDataListCBAction = 'GET_IDOSZAK_LIST_CB';
      $this->getDataAction = 'GET_IDOSZAK_DATA';
      $this->insertDataAction = 'INSERT_IDOSZAK_DATA';
      $this->modifyDataAction = 'MODIFY_IDOSZAK_DATA';
      $this->removeDataAction = 'REMOVE_IDOSZAK_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'idoszakok';
      $this->primaryField = 'idoszakID';
      $this->orderByFields = array('elsoNap','utolsoNap DESC');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['idoszakNev'] = new CField('string','idoszakNev',$this->response,7,10);
      $this->fields['elsoNap'] = new CField('string','date',$this->response,10,10);
      $this->fields['utolsoNap'] = new CField('string','date',$this->response,10,10);
      $this->fields['tanevID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      
      $this->fields['kezdoHetSorszam'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['kezdoHetElsoNap'] = new CField('string','date',$this->response,10,10);
      $this->fields['kezdoHetBetujel'] = new CField('string','orarendBetujel',$this->response,1,1);
    }
    
    // @override
    function modifyDataQuery($fields,$values,$id,$pairs)
    {
      $d = array($this->splitStringToDate($values['elsoNap']),
                 $this->splitStringToDate($values['utolsoNap']));
                 
      // Dátumok érvényességének a vizsgálata
      if (!checkdate($d[0][1],$d[0][2],$d[0][0]))
        $this->response->sendError('Az első nap időpontja ('.
          utf8ToLatin2($values['elsoNap']).') nem érvénes nap!',true);
      
      if (!checkdate($d[1][1],$d[1][2],$d[1][0]))
        $this->response->sendError('Az utolsó nap időpontja ('.
          utf8ToLatin2($values['utolsoNap']).') nem érvénes nap!',true);
     
      // Csak akkor helyes az űrlap, ha az első nap nem előzi meg az utolsó napot            
      $b = false;
      
      if ($d[0][0] < $d[1][0]) $b = true;
      if ($d[0][1] < $d[1][1]) $b = true;
      if ($d[0][2] < $d[1][2]) $b = true;
          
      if (!$b)
        $this->response->sendError('A tanév utolsó tanítási napja '.
          'nem előzheti meg az elsőt!',true);
          
      // Az időszak időintervalluma nem lehet bővebb, mint a hozzá tartozó tanév időintervalluma
                
      // Ha minden rendben van akkor lefuttatjuk az eredeti lekérdezést
      return parent::modifyDataQuery($fields,$values,$id,$pairs);
    }
        
  }   
?>
