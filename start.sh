#!/bin/bash

echo "🚀 启动 HyExam 开发环境..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 启动数据库
echo "📦 启动 PostgreSQL 数据库..."
docker-compose up -d db

# 等待数据库启动
echo "⏳ 等待数据库启动..."
sleep 10

# 安装依赖
echo "📥 安装前端依赖..."
cd frontend && npm install && cd ..

echo "📥 安装后端依赖..."
cd backend && pip install -r requirements.txt && cd ..

# 启动开发服务器
echo "🎯 启动开发服务器..."
npm run dev