#!/bin/bash

# 启动脚本 - 校园流浪动物管理系统前端

echo "=== 校园流浪动物管理系统前端启动脚本 ==="
echo ""

# 切换到项目根目录
cd ..

# 检查是否存在package.json文件
if [ ! -f "package.json" ]; then
  echo "错误：未找到package.json文件，请确保在项目根目录运行此脚本"
  exit 1
fi

echo "1. 检查并安装依赖..."

# 尝试使用npm安装依赖
if command -v npm &> /dev/null; then
  echo "使用npm安装依赖..."
  npm install
  
  if [ $? -eq 0 ]; then
    echo "依赖安装成功！"
  else
    echo "npm安装失败，尝试使用yarn..."
    
    # 尝试使用yarn安装依赖
    if command -v yarn &> /dev/null; then
      echo "使用yarn安装依赖..."
      yarn install
      
      if [ $? -eq 0 ]; then
        echo "依赖安装成功！"
      else
        echo "错误：依赖安装失败，请检查网络连接或手动安装依赖"
        exit 1
      fi
    else
      echo "错误：未找到npm或yarn，请先安装Node.js"
      exit 1
    fi
  fi
else
  echo "错误：未找到npm，请先安装Node.js"
  exit 1
fi

echo ""
echo "2. 启动开发服务器..."

# 启动开发服务器
if command -v npm &> /dev/null; then
  echo "使用npm启动开发服务器..."
  npm run dev
elif command -v yarn &> /dev/null; then
  echo "使用yarn启动开发服务器..."
  yarn dev
else
  echo "错误：未找到npm或yarn，请先安装Node.js"
  exit 1
fi
