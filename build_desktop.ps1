# Run Flutter build with Visual Studio environment
$vsPath = "C:\Program Files\Microsoft Visual Studio\2022\Community"
$vcvarsBat = "$vsPath\VC\Auxiliary\Build\vcvars64.bat"

# Start a new process with VS environment
$process = Start-Process -FilePath "cmd.exe" -ArgumentList "/k `"$vcvarsBat` && cd /d D:\repos\ionic\syncstuff\apps\desktop && flutter build windows`"" -PassThru -WindowStyle Normal

# Wait for completion
$process.WaitForExit()
