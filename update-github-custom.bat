@echo off
echo ========================================
echo    Custom GitHub Update Script
echo ========================================
echo.

set /p commit_msg="Enter commit message (or press Enter for auto): "

if "%commit_msg%"=="" (
    set commit_msg="Auto update: %date% %time%"
) else (
    set commit_msg="%commit_msg%"
)

echo.
echo Adding all changes to git...
git add .

echo.
echo Committing changes with message: %commit_msg%
git commit -m %commit_msg%

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo    Update Complete!
echo ========================================
echo.
pause
