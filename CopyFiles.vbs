'// Jelen script lefuttatja a saj�t k�nyvt�r�ban l�v� copy.bat �llom�nyt, ami elv�gzi a sz�ks�ges f�jlok m�sol�s�t
'// TIPP: ha t�rl�k minden scriptet a PSPad-b�l (ezt kiv�ve), akkor v�letlen�l sem ind�thatok el rossz scriptet

Const module_name  = "Copy Files"
Const module_ver   = "1.00"   

Sub CopyFiles
  Set objShell = WScript.CreateObject("WScript.Shell")
  objShell.Run("%comspec% /K D:\107\westat\web\westat\copy.bat"), 1, True

  logAddLine("------ File Copy Complete ------")		
End Sub


Sub Init
		menuName = "&" & module_name
    addMenuItem "Copy Files", "", "CopyFiles"
End Sub
