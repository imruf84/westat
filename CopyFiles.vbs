'// Jelen script lefuttatja a saját könyvtárában lévõ copy.bat állományt, ami elvégzi a szükséges fájlok másolását
'// TIPP: ha törlök minden scriptet a PSPad-ból (ezt kivéve), akkor véletlenül sem indíthatok el rossz scriptet

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
