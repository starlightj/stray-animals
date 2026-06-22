# 🐾 校园流浪动物管理系统

基于图像识别的校园流浪动物管理系统，支持 AI 识别猫狗、档案管理、地图追踪、领养申请和评论互动。

## 🚀 快速启动

### 方法一：双击运行（推荐给伙伴）

```
1. 下载解压项目
2. 双击「启动服务器.bat」
3. 浏览器打开 http://localhost:3000
```

### 方法二：命令行

```bash
cd backend
npm install
node server-debug.js
```

然后浏览器打开 http://localhost:3000

## 📋 功能模块一览

| 模块 | 说明 |
|------|------|
| 📊 数据看板 | 统计总动物数、物种数、识别次数 |
| 📷 AI识别上报 | 上传图片自动识别猫/狗（TensorFlow.js） |
| 📋 动物档案 | 卡片展示 + 搜索/筛选/详情 |
| 🗺️ 地图追踪 | 位置分布展示，按物种筛选 |
| 🏠 动物领养 | 提交领养申请（姓名/联系方式/理由） |
| 💬 评论系统 | 发表和查看评论 |
| ⚙️ 管理后台 | 增删改查 + 图片上传 |

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + JavaScript + TensorFlow.js + MobileNet
- **后端**: Node.js + Express + Multer
- **数据库**: SQLite (better-sqlite3，零配置)
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
