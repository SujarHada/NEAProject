@echo off

for /f %%a in ('powershell -NoLogo -NoProfile -Command "(Get-Date).ToString(\"yyyy-MM-dd\")"') do set dt=%%a

git add .
git commit -m "save data %dt%"
git push
