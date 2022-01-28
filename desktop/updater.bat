@echo off

rem Prefixos REM são comentarios
rem Escreve uma mensagem avisando para nao fechar a janela
rem Definimos uma variável de quebra de linha, usamos ela com %nl% antes da quebra de texto
set nl=^& echo.
rem Definimos uma variável com o diretório padrão também
set dir=C:\Program Files\Mundo Eletronico

rem Escreve a mensagem na tela
echo ---------------------------------------------- %nl%%nl%             MUNDO ELETRONICO %nl%%nl%%nl%           NAO FECHE ESSA JANELA %nl%          ATUALIZACAO EM ANDAMENTO %nl%             POR FAVOR AGUARDE %nl%%nl%%nl%    EM CASO DE DUVIDAS FALE COM O SUPORTE %nl%              47 99964-9667 %nl%%nl%----------------------------------------------

rem Faz 10 pings para o localhost, serve como delay de 10 segundos
rem Evita que o programa ainda esteja aberto em pcs lerdos na hora da atualização
ping 127.0.0.1 -n 10 > nul

rem Verifica todos os arquivos na pasta raiz do app, exclui todos os arquivos exceto o settings.json, updater.bat, unins000.exe e unins000.dat e a pasta updates
rem Colocamos o %%f entre aspas "" para transformalo em string e o cmd comparar os nomes
for /f %%f in ('dir /b "%dir%"') do if not "%%f"=="settings.json" if not "%%f"=="updater.bat" if not "%%f"=="updates" if not "%%f"=="unins000.exe" if not "%%f"=="unins000.dat" del /q "%dir%\%%f"
if exist "%dir%\locales" RD /S /Q "%dir%\locales" & if exist "%dir%\resources" RD /S /Q "%dir%\resources" & if exist "%dir%\swiftshader" RD /S /Q "%dir%\swiftshader" & setlocal
rem Muda o diretorio do cmd para onde o bat está
cd /d %~dp0
Call :UnZipFile "%dir%" "%dir%\updates\wupdate.zip"
exit /b

:UnZipFile <ExtractTo> <newzipfile>
set vbs="%temp%\_.vbs"
if exist %vbs% del /f /q %vbs%
>%vbs%  echo Set fso = CreateObject("Scripting.FileSystemObject")
>>%vbs% echo If NOT fso.FolderExists(%1) Then
>>%vbs% echo fso.CreateFolder(%1)
>>%vbs% echo End If
>>%vbs% echo set objShell = CreateObject("Shell.Application")
>>%vbs% echo set FilesInZip=objShell.NameSpace(%2).items
>>%vbs% echo objShell.NameSpace(%1).CopyHere(FilesInZip)
>>%vbs% echo Set fso = Nothing
>>%vbs% echo Set objShell = Nothing
cscript //nologo %vbs%
rem Coloca as aspas duplas antes do Printers.exe para não abrir um console do cmd com o app
if exist %vbs% del /f /q %vbs% & cd %dir% & start "" Printers.exe
