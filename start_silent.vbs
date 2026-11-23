Set WshShell = CreateObject("WScript.Shell")
strPath = WshShell.CurrentDirectory

' Start Full-Stack server invisibly (0 = hide window)
WshShell.Run "backend\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend", 0, False

WScript.Sleep 2000

' Open browser to the website
WshShell.Run "http://localhost:8000/", 1, False
