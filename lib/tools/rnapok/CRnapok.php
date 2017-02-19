<?php
  require_once('../../CService.php');
  require_once('../../CField.php');
   
  /**                                                        
   * Rendhagyó napok kezelését megvalósító osztály.
   */
  class CRnapok extends CService
  {
    // Rendhagyó nap típusainak a nevei
    protected $tipusNames = array('ikn'=>'Időszakon kívüli nap',
                                  'mszn'=>'Munkaszüneti nap',
                                  'tnm'=>'Tanítás nélküli munkanap',
                                  'hn'=>'Helyettesített nap',
                                  'kon'=>'Kötelező óraszám szerinti nap',
                                  'kono'=>'Kötelező óraszám szerinti nap (adott osztállyal)',
                                  'aono'=>'Adott óraszám szerinti nap (adott osztállyal)',
                                  'nor'=>'Normál, órarend szerinti nap',
                                  'onaoao'=>'Órarend szerinti nap adott órától adott óráig');
                                  
    // @override
    function addFields()
    {
      // Parancsok
      $this->getDataListAction = 'GET_RNAP_LIST';
      $this->getDataAction = 'GET_RNAP_DATA';
      $this->insertDataAction = 'INSERT_RNAP_DATA';
      $this->modifyDataAction = 'MODIFY_RNAP_DATA';
      $this->removeDataAction = 'REMOVE_RNAP_LIST';
    
      // Adatbázissal kapcsolatos változók
      $this->tableName = 'rnapok';
      $this->primaryField = 'rnapID';
      $this->orderByFields = array('datum');
      
      // Mezők
      $this->fields[$this->primaryField] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['idoszakID'] = new CField('integer','',$this->response,0,PHP_INT_MAX);
      $this->fields['tipus'] = new CField('string','oneWord',$this->response,1,10);
      $this->fields['datum'] = new CField('string','date',$this->response,10,10);
      $this->fields['megjegyzes'] = new CField('string','nWordSepBySpaceSpec',$this->response,0,30);
      $this->fields['hnDatum'] = new CField('string','date',$this->response,10,10);
      $this->fields['hnHet'] = new CField('string','orarendBetujel',$this->response,1,1);
      $this->fields['konoOsztalyNev'] = new CField('string','nWordSepBySpaceSpec',$this->response,1,20);
      $this->fields['aonoOsztalyNev'] = new CField('string','nWordSepBySpaceSpec',$this->response,1,20);
      $this->fields['aonoOraszam'] = new CField('integer','',$this->response,0,24);
      $this->fields['onaoaoOratol'] = new CField('integer','',$this->response,0,24);
      $this->fields['onaoaoOraig'] = new CField('integer','',$this->response,0,24);
    }
    
    // @override
    function testDbValue2($field,$value)
    {
      if ('tipus' == $field)
        return in_array($value,array_keys($this->tipusNames));
        
      return parent::testDbValue2($field,$value);
    }
    
    // @override
    function getDataList()
    { 
      // Mezők listájának lekérdezése, tesztelése 
      $fields = $this->getDbFields($_POST['FIELDS']);
      
      // Hiányzások kilistázása az adatbázisról
      $a = $this->getFilters($_POST['FILTERS']);
      $filterFields = $a['fields'];
      $filterValues = $a['values'];
      
      $rs = $this->getDataListQuery($fields,$filterFields,$filterValues);
      
      if (true != $rs)
        $this->response->sendError('Hiba a rendhagyó napok listájának a lekérdezése során!',true);
      
      // Átalakítjuk az eredményt tömbbé
      $rnapok = array();
      while ($record = $rs->FetchRow())
      {
        $rnap = array();
        foreach ($record as $field => $value)
          $rnap[$field] = utf8ToLatin2($value);
          
        // Egyéni elnevezések megadása
        $rnap['tipus'] = $this->tipusNames[$rnap['tipus']];
        
        $rnapok[] = $rnap;
      }
        
      // Rendhagyó napok listájának a hozzáadása a válaszhoz
      $this->response->addArray($rnapok);
    }
    
    // @override
    function modifyDataQuery($fields,$values,$id,$pairs)
    {
      // Másolatok készítése a paraméterekről
      $lPairs = $pairs;
      
      // Nem használt mézők értékeinek kinullázása
      if (!in_array('hnDatum',$fields))
        $lPairs .= ',hnDatum=NULL';
      if (!in_array('hnHet',$fields))
        $lPairs .= ',hnHet=NULL';
      if (!in_array('konoOsztalyNev',$fields))
        $lPairs .= ',konoOsztalyNev=NULL';
      if (!in_array('aonoOsztalyNev',$fields))
        $lPairs .= ',aonoOsztalyNev=NULL';
      if (!in_array('aonoOraszam',$fields))
        $lPairs .= ',aonoOraszam=NULL';
      if (!in_array('onaoaoOratol',$fields))
        $lPairs .= ',onaoaoOratol=NULL';
      if (!in_array('onaoaoOraig',$fields))
        $lPairs .= ',onaoaoOraig=NULL';
    
      // Alapértelmezésben a kért mezőnevekkel és az értékeikkel dolgozunk.
      return $this->db->Execute('UPDATE '.$this->tableName.' SET '.$lPairs.
        ' WHERE '.$this->createModifyExpression($fields,$values,$id));
    }
    
    // @override
    function insertData()
    {
      // BUG: - ha nem változtatjuk meg a hnHet értékét, akkor undefined lesz
      if ('undefined' == $_POST['hnHet'])
        $_POST['hnHet'] = 'A';
      
      return parent::insertData();
    }
    
    // @override
    function modifyData()
    {      
      // BUG: - ha nem változtatjuk meg a hnHet értékét, akkor undefined lesz
      if ('' == $_POST['hnHet'])
        $_POST['hnHet'] = 'A';
      
      return parent::modifyData();
    }
    
  }   
?>
