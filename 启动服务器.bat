@echo off
chcp 65001 >nul
title 校园流浪动物管理系统 - 服务器
cls

echo ============================================
echo    🐾 校园流浪动物管理系统 - 服务器启动
echo ============================================
echo.

:: 进入 backend 目录
cd /d "%~dp0backend"

echo [1/3] 检查依赖...
if not exist "node_modules" (
    echo ⏳ 正在安装依赖，请稍候...
    call npm install
) else (
    echo ✅ 依赖已安装
)
echo.

echo [2/3] 启动服务器...
echo 📡 后端地址: http://localhost:3000
echo 🌐 前端地址: http://localhost:3000
echo.

echo ⚠️  启动后请勿关闭此窗口！
echo.
echo ============================================

node server-debug.js

pause
