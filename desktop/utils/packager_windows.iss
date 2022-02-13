#define MyAppName "Mundo Eletrônico"
#define MyAppPublisher "Mundo Eletrônico"
#define MyAppURL "https://mundoeletronico.net/"
#define MyAppExeName "mundoeletronico.exe"

[Setup]
AppId={{5B856DA2-3BF1-42C2-9E61-DEC57827B418}
AppName={#MyAppName}
AppVerName={#MyAppName}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName=C:\Program Files\{#MyAppName}
DisableDirPage=yes
DisableWelcomePage=yes
DisableProgramGroupPage=yes
LicenseFile=D:\Projetos\mundoeletronico\desktop\utils\license.txt
OutputDir=D:\Projetos\mundoeletronico\desktop\releases
OutputBaseFilename=setup_windows
SetupIconFile=D:\Projetos\mundoeletronico\desktop\utils\icon.ico
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin

[Dirs]
Name: "{app}"; Permissions: everyone-full

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Files]
Source: "D:\Projetos\mundoeletronico\desktop\dist\win-ia32-unpacked\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "D:\Projetos\mundoeletronico\desktop\dist\win-ia32-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Permissions: everyone-full

[Icons] 
Name: "{commonstartup}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: runascurrentuser nowait postinstall skipifsilent
