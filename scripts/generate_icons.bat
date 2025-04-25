@echo off
echo Generating app icons from girl.png...

REM Check if ImageMagick is installed
where magick >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo ImageMagick is not installed. Please install it from https://imagemagick.org/script/download.php
  exit /b 1
)

REM Create directory for generated icons
mkdir -p temp_icons

REM Generate icons for different resolutions
magick image\girl.png -resize 48x48 temp_icons\ic_launcher.png
magick image\girl.png -resize 48x48 temp_icons\ic_launcher_round.png
copy temp_icons\ic_launcher.png android\app\src\main\res\mipmap-mdpi\ic_launcher.png
copy temp_icons\ic_launcher_round.png android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png

magick image\girl.png -resize 72x72 temp_icons\ic_launcher.png
magick image\girl.png -resize 72x72 temp_icons\ic_launcher_round.png
copy temp_icons\ic_launcher.png android\app\src\main\res\mipmap-hdpi\ic_launcher.png
copy temp_icons\ic_launcher_round.png android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png

magick image\girl.png -resize 96x96 temp_icons\ic_launcher.png
magick image\girl.png -resize 96x96 temp_icons\ic_launcher_round.png
copy temp_icons\ic_launcher.png android\app\src\main\res\mipmap-xhdpi\ic_launcher.png
copy temp_icons\ic_launcher_round.png android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png

magick image\girl.png -resize 144x144 temp_icons\ic_launcher.png
magick image\girl.png -resize 144x144 temp_icons\ic_launcher_round.png
copy temp_icons\ic_launcher.png android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png
copy temp_icons\ic_launcher_round.png android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png

magick image\girl.png -resize 192x192 temp_icons\ic_launcher.png
magick image\girl.png -resize 192x192 temp_icons\ic_launcher_round.png
copy temp_icons\ic_launcher.png android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png
copy temp_icons\ic_launcher_round.png android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png

REM Clean up
rmdir /s /q temp_icons

echo App icons have been generated and copied to the appropriate directories!
echo Please rebuild your app to see the changes. 