<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Tanévek kezelését megvalósító osztály.
   */
  class CTanevek extends CService
  {
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_TANEV_LIST';
      $this->getDataListCBAction = 'GET_TANEV_LIST_CB';
      $this->getDataAction = 'GET_TANEV_DATA';
      $this->insertDataAction = 'INSERT_TANEV_DATA';
      $this->modifyDataAction = 'MODIFY_TANEV_DATA';
      $this->removeDataAction = 'REMOVE_TANEV_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'tanevek';
      $this->primaryField = 'tanevID';
      $this->orderByFields = array('elsoNap');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tanevNev'] = new CField('string','tanevNev',$this->response,9,10);
      $this->fields['elsoNap'] = new CField('string','date',$this->response,10,10);
      $this->fields['utolsoNap'] = new CField('string','date',$this->response,10,10);
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
                
      // Ha minden rendben van akkor lefuttatjuk az eredeti lekérdezést
      return parent::modifyDataQuery($fields,$values,$id,$pairs);
    }
        
  }   
?>
