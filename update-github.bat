@echo off
echo ========================================
echo    Auto GitHub Update Script
echo ========================================
echo.

echo Adding all changes to git...
git add .

echo.
echo Committing changes...
git commit -m "Auto update: %date% %time%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo    Update Complete!
echo ========================================
echo.
pause
