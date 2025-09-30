# HyExam - Professional Online Examination System

一个专业的在线考试系统，专为学校和教育机构设计，支持所有主要题型，具有专业且独特的界面设计。

## ✨ 核心功能

### 🎯 考试功能
- **多种题型支持**: 单选题、多选题、判断题、填空题
- **灵活考试管理**: 班级管理和考试码两种模式
- **自动评分**: 客观题实时评分
- **专业界面**: 参考现代设计网站的专业界面

### 👥 用户角色
- **管理员**: 系统管理和用户创建
- **教师**: 创建试卷、管理班级、查看结果
- **学生**: 参加考试、查看成绩
- **社区用户**: 访问共享的公开内容

### 🚀 高级功能
- **社区分享**: 用户可分享试卷到公开社区
- **CSV导出**: 自定义数据导出功能
- **班级管理**: 组织学生和分配考试
- **考试码**: 通过唯一代码快速访问

## 🛠️ 技术栈

- **前端**: React + TypeScript + Tailwind CSS
- **后端**: FastAPI + Python
- **数据库**: PostgreSQL
- **部署**: Docker

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

```bash
# 克隆项目后，直接运行启动脚本
./start.sh
```

### 方法二：手动启动

1. **安装依赖**
   ```bash
   npm run install:all
   ```

2. **启动开发环境**
   ```bash
   npm run dev
   ```

3. **访问应用**
   - 前端界面: http://localhost:3000
   - 后端API: http://localhost:8000
   - API文档: http://localhost:8000/docs

## 📋 开发阶段

### 第一阶段：核心考试流程 ✅
- ✅ 用户认证系统
- ✅ 试卷创建和管理
- ✅ 考试码生成
- ✅ 学生参加考试
- ✅ 自动评分
- ✅ 基础CSV导出

### 第二阶段：班级管理（计划中）
- 📋 学生注册
- 📋 基于班级的考试分配
- 📋 高级用户管理

### 第三阶段：社区功能（计划中）
- 📋 公开试卷分享
- 📋 社区发现功能
- 📋 社交功能

### 第四阶段：高级功能（计划中）
- 📋 自定义CSV导出格式
- 📋 高级分析功能
- 📋 集成能力

## 📁 项目结构

```
hyexam/
├── frontend/              # React 前端应用
│   ├── src/
│   │   ├── components/    # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── contexts/      # React Context
│   │   ├── services/      # API 服务
│   │   └── types/         # TypeScript 类型定义
│   ├── package.json
│   └── vite.config.ts
├── backend/               # FastAPI 后端应用
│   ├── routers/           # API 路由
│   ├── models.py          # 数据库模型
│   ├── schemas.py         # Pydantic 模式
│   ├── auth.py            # 认证逻辑
│   └── main.py            # 应用入口
├── docker-compose.yml     # 开发环境配置
├── start.sh              # 启动脚本
└── README.md             # 项目说明
```

## 🎨 界面设计特色

参考了您提供的设计网站风格：
- **现代简洁**: 参考 der-baukasten.com 的现代设计
- **专业排版**: 借鉴 pantheonmedia.com 的排版风格
- **独特交互**: 融合 walrus.xyz 的交互元素
- **优雅配色**: 采用 clou.ch 的色彩搭配
- **精致细节**: 学习 formandfun.co 的设计细节

## 🔧 开发说明

### 默认账户
系统启动后，您可以：
1. 注册新的社区用户账户
2. 管理员创建教师和学生账户
3. 教师创建试卷并生成考试码
4. 学生使用考试码参加考试

### API 文档
启动后端服务后，访问 http://localhost:8000/docs 查看完整的API文档。

## 📝 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

本项目采用分阶段开发方式。请参考当前阶段目标进行贡献。

---

**HyExam** - 让在线考试更专业、更高效！