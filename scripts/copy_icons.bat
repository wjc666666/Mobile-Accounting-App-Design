@echo off
echo Copying girl.png as app icons...

REM Copy the same image to all mipmap folders
copy image\girl.png android\app\src\main\res\mipmap-mdpi\ic_launcher.png
copy image\girl.png android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png

copy image\girl.png android\app\src\main\res\mipmap-hdpi\ic_launcher.png
copy image\girl.png android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png

copy image\girl.png android\app\src\main\res\mipmap-xhdpi\ic_launcher.png
copy image\girl.png android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png

copy image\girl.png android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png
copy image\girl.png android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png

copy image\girl.png android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png
copy image\girl.png android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png

echo App icons have been copied!
echo Note: The icons have not been resized. For best results, use proper icon generation tools.
echo Please rebuild your app to see the changes. 