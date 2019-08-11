rem Generate build RTD md docs
mkdocs build
rmdir ..\docs\ /q /s
xcopy /s site\* ..\docs\