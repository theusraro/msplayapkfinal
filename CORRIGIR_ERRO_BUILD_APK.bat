@echo off
chcp 65001 >nul
echo =============================================
echo  MSPlay - Corrigir erro capacitor.settings.gradle
echo =============================================
echo.
echo Este script vai apagar a pasta android quebrada e recriar corretamente.
echo A interface do app NAO sera modificada.
echo.
pause

cd /d "%~dp0"

if exist android (
  echo Removendo pasta android antiga/quebrada...
  rmdir /s /q android
)

if exist package-lock.json (
  echo Limpando lock antigo...
  del /f /q package-lock.json
)

if exist node_modules (
  echo Limpando node_modules antigo...
  rmdir /s /q node_modules
)

echo Instalando dependencias...
call npm install
if errorlevel 1 goto erro

echo Gerando build web...
call npm run build
if errorlevel 1 goto erro

echo Recriando projeto Android do Capacitor...
call npx cap add android
if errorlevel 1 goto erro

echo Sincronizando Android...
call npx cap sync android
if errorlevel 1 goto erro

echo.
echo =============================================
echo  Corrigido com sucesso!
echo =============================================
echo Agora rode:
echo npx cap open android
echo.
echo Ou para APK debug:
echo cd android
echo gradlew.bat assembleDebug
echo.
pause
exit /b 0

:erro
echo.
echo =============================================
echo  Deu erro em alguma etapa.
echo =============================================
echo Copie a mensagem acima e me envie.
pause
exit /b 1
