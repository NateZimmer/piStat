rem Generate build RTD md docs
call mkdocs build
rmdir ..\docs\ /q /s
xcopy /s site\* ..\docs\