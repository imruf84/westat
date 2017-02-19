<?php
  /**                                                        
   * Ideinglenes munkaterület kialakítását, illetve az azon a helyen
   * lévő nem létező fájlnevek generálását végző osztály.   
   */
  class CWorkingDir
  {
    protected $workingDir;
    protected $tempDir;
    
    /**
     * Konstruktor.
     * 
     * @param workingDirPrefix {string} a munkaterület prefixuma
     * @param create {boolean} ha igaz, akkor létre is hozza               
     */
    function __construct($workingDirPrefix,$create=true)
    {
      $this->tempDir = $this->getTempDir();
      if (true == $create)
        $this->workingDir = $this->createWorkingDir($workingDirPrefix);
    }    
    
    /**
     * Destruktor.
     */         
    function __destruct()
    {
      $this->removeWorkingDir();
    }
    
    /**
     * Rendszer temp könyvtárának lekérdezése.
     * 
     * @return {string} a temp könyvtár elérési útja          
     */         
    function getTempDir()
    {
      // Linux esetében a tmp könyvtárat használjuk
      $tmp = '/tmp/';
      if (!is_dir($tmp))
        $tmp = sys_get_temp_dir();
        
      return $tmp;
    }
    
    /**
     * Rendszer ideinglenes könyvtárának lekérdezése.
     * 
     * @return {string} az ideinglenes könyvtár elérési útja          
     */         
    function getFullWorkingDir()
    {
      return $this->workingDir;
    }
    
    /**
     * Ideinglenes munkaterület létrehozása.     
     * 
     * @param prefix {string?undefined?''} a munkaterület prefixuma ([westat])     
     * @return {string} a munkaterület elérési útja
     * NOTE: - az elérési utat perjel zárja     
     *       - az osztály workingDir mezője is megkapja az elérési utat értékként               
     */
    function createWorkingDir($prefix)
    {
      // Könyvtár nevének a meghatározása
      $i = 0;
      $dir = (is_string($prefix)) ? $prefix : 'westat';
      if ('' == $dir)
        $dir = 'westat';
      $workingDir = $this->tempDir.$dir.$i;
      while(is_dir($workingDir))
        $workingDir = $this->tempDir.$dir.(++$i);
      
      // Könyvtár létrehozása
      mkdir($workingDir)  or
        die ('Hiba az ideinglenes munkaterület létrehozása közben:'.$workingDir); 
      
      // Záró perjel hozzáadása
      $workingDir = $workingDir.'/';
      
      $this->workingDir = $workingDir;
      
      return $workingDir;
    }
    
    /**
     * Temp könyvtár westat-tal kezdődő mappáinak a törlése.
     * 
     * @return {array} a törölt, illetve a nem törölt könyvtárak nevei
     * NOTE: - a nevek nem tartalmazzák az elérési utat
     *       - tömb kulcsai:
     *            'removed':a sikeresen törölt könyvtárak nevei
     *            'notremoved':a nem törölt könyvtárak nevei                              
     */         
    function clearTempDir()
    {
      $tempDir = $this->getTempDir();
      $objects = scandir($tempDir);
      
      $a = array('removed'=>array(),'notremoved'=>array());
      foreach ($objects as $object)
      {
        if (strstr($object,'westat'))
        {
          $key = (true == $this->removeDir($tempDir.$object)) ? 'removed' : 'notremoved';
          $a[$key][] = $object;
        }
      }
      
      return $a; 
    }
    
    /**
     * Érvényes, az ideinglenes munkaterületen nem létező fájlnév generálása.
     * NOTE: - a kiterjesztés is a fájlnévhez adódik
     * 
     * @param prefix {string} a fájlnév prefixuma
     * @param ext {string?undefined} fájl kiterjesztése
     * @param indexFirst {boolean?undefined} ha igaz akkor a 0 index is része 
     *   lesz az állomány nevének                    
     * 
     * @return {string} az állomány neve
     * NOTE: - az érték nem tartalmazza az elérési utat                    
     */
    function generateValidWorkingFileName($prefix,$ext,$indexFirst=true)
    {
      $lPrefix = (is_string($prefix)) ? $prefix : '';
      $lExt = (is_string($ext)) ? $ext : '';
      if ('' != $lExt)
        $lExt = '.'.$lExt;
       
      $i = 0;
      $fileName = $this->workingDir.$lPrefix.(($indexFirst)?$i:'').$lExt;
      while(is_file($fileName))
        $fileName = $this->workingDir.$lPrefix.(++$i).$lExt;
        
      return $lPrefix.(((0==$i)&&(!$indexFirst))?'':$i).$lExt;
    }
    
    /**
     * Könyvtár és a teljes tartalmának a törlése.
     * 
     * @param dir {string} a törlendő könyvtár
     * @return {boolean} igaz ha sikerült törölni, egyébként hamis               
     */         
    function removeDir($dir)
    {
      if (!is_dir($dir)) return false;
      
      $objects = scandir($dir); 
      foreach ($objects as $object) { 
        if ($object != '.' && $object != '..') { 
          if (filetype($dir.'/'.$object) == 'dir') rrmdir($dir.'/'.$object); else unlink($dir.'/'.$object); 
        } 
      } 
      reset($objects); 
      return rmdir($dir);
    }
    
    /**
     * Ideinglenes munkaterület törlése.
     * NOTE: - az összes fájl és alkönyvtár is törlődik     
     */         
    function removeWorkingDir()
    {
      $this->removeDir($this->workingDir);
    }
    
  }
  
?>
