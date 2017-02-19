<?php
  //session_cache_limiter('public');
  //session_start();
  //ob_start();
?>                                

<html>
  <head>            
    <meta http-equiv="Content-Type" content="text/html; charset=iso-8859-2">
    <!-- IE 8 egy ratyi, ezért emulálom a 7-et -->
    <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
    <title>westat</title>
    
    <!-- Alap könyvtárak betöltése -->
    <script language='JavaScript' type='text/javascript' src='lib/ModuleManager.js'></script>
            
  </head>

  <body>
    <!-- Kezdésképpen a bejelentkező képernyőt jelenítjük meg. --> 
    <script>
      var body = document.body;
      body.style.fontFamily = 'Arial';
      body.style.margin  = '0px';
      body.style.padding = '0px';
      body.style.width = body.style.height = '100%';
      body.style.overflow = 'hidden';
      var html = document.getElementsByTagName('html')[0];
      html.style.overflow = 'hidden';
      html.style.width = html.style.height = '100%';
      
      // Betöltés felirat létrehozása
      // Modul betöltési információinak megjelenítéséért felelős tároló létrehozása
      loadingDiv = document.createElement('div');
      loadingDiv.style.position = 'absolute';
      loadingDiv.style.top = this.loadingDiv.style.left = '0px';
      //loadingDiv.style.backgroundColor = 'red';
      loadingDiv.style.zIndex = 5000;
      document.body.appendChild(loadingDiv);
      var loadingTextDiv = document.createElement('div');
      loadingTextDiv.appendChild(document.createTextNode('Bet\u00f6lt\u00e9s...'));
      loadingDiv.appendChild(loadingTextDiv);
      
      ModuleManager.load(
      [
        'lib/tools/login/Login.js','lib/HelpfulTools.js'
      ],
      function()
      { 
        // Betöltés felirat törlése
        document.body.removeChild(loadingDiv);
        
        new Login();
      });
      
    </script>
    
  </body>
  
</html>

<?php
  //ob_end_flush();
?>