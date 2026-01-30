# 🎬 AI Video Subtitle Processor - 完整部署指南

## 📋 系统概况

本项目是一个**全功能的 AI 驱动的视频字幕处理系统**，支持：
- ✅ 视频上传和处理
- ✅ 音频提取（基于 FFmpeg）
- ✅ 自动字幕生成（OpenAI Whisper）
- ✅ 视频画面 OCR 字幕识别（Tesseract.js）
- ✅ 智能中文翻译（GPT-3.5 Turbo）
- ✅ 领域检测和专业词汇翻译（Minecraft 游戏术语等）
- ✅ 自动质量验证和语义检查
- ✅ 多格式导出（SRT/WebVTT）

## 🚀 快速开始

### 前置要求

1. **Node.js 16+** 和 **npm 7+**
   ```bash
   node --version  # v16 或更高
   npm --version   # 7 或更高
   ```

2. **FFmpeg**（用于视频处理）
   - Windows: `winget install ffmpeg`
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt-get install ffmpeg`

3. **OpenAI API Key**
   - 访问 https://platform.openai.com/api-keys
   - 创建新的 API Key

### 环境配置

1. 进入后端目录并配置 `.env`：
   ```bash
   cd backend
   ```

2. 编辑 `backend/.env` 文件：
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   PORT=5000
   NODE_ENV=development
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://0.0.0.0
   ```

### 安装依赖

```bash
# 后端依赖
cd backend
npm install

# 前端依赖
cd ../frontend
npm install
```

### 启动系统

#### 方法 1：使用启动脚本（推荐）

```bash
# Windows
./start-all.bat

# Linux/Mac
./start-all.sh
```

#### 方法 2：手动启动

**终端 1 - 启动后端**：
```bash
cd backend
npm run dev
```

**终端 2 - 启动前端**：
```bash
cd frontend
npm run dev
```

### 访问应用

打开浏览器访问：**http://localhost:5173**

## 📡 本地网络访问

在中国局域网中，其他计算机可以通过以下地址访问：
- 获取你的计算机 IP：`ipconfig` (Windows) 或 `ifconfig` (Mac/Linux)
- 访问地址：`http://<你的IP>:5173`

例如：`http://192.168.1.100:5173`

## 📱 使用流程

### 1️⃣ 上传视频
- 点击"📹 Upload Video"
- 选择支持的视频格式（MP4、MKV、AVI 等）
- 获得 Job ID

### 2️⃣ 生成字幕
两种方式任选：
- **🎵 从音频生成**（推荐）：自动提取音频并使用 Whisper 识别
- **📸 从OCR生成**：扫描视频画面中的字幕

### 3️⃣ 翻译为中文
- 系统自动检测视频内容领域
- 应用领域特定词汇（如 Minecraft 术语）
- 生成准确的中文字幕

### 4️⃣ 质量验证
系统检查以下方面：
- ✅ 完整性（是否覆盖整个视频）
- ✅ 时序准确性（字幕时间点是否正确）
- ✅ 文本质量（字幕格式是否正确）
- ✅ 领域相关性（是否使用了正确的专业术语）
- ✅ 一致性（时间间隔是否均匀）
- ✅ 语义连贯性（字幕之间逻辑是否通顺）

### 5️⃣ 导出字幕
- 选择格式：SRT（通用）或 WebVTT（网页）
- 下载字幕文件
- 在视频播放器中使用

## 🎮 支持的领域

系统内置以下领域的专业词汇库（可扩展）：

### Minecraft 游戏术语
- `creeper` → 爬行者
- `enderman` → 末影人
- `redstone` → 红石
- `biome` → 生物群落
- 等等...

### 其他领域
- 医疗健康术语
- 金融投资术语
- 法律条款
- IT 技术术语

## 🔌 API 端点

### 视频处理
```
POST   /api/video/upload              - 上传视频
POST   /api/video/extract-audio/:jobId - 提取音频
GET    /api/video/status/:jobId        - 获取处理状态
GET    /health                         - 健康检查
```

### 字幕处理
```
POST   /api/subtitle/generate-from-audio  - 从音频生成字幕
POST   /api/subtitle/generate-from-ocr    - 从OCR生成字幕
POST   /api/subtitle/translate             - 翻译字幕
POST   /api/subtitle/verify                - 验证质量
GET    /api/subtitle/export/:jobId         - 导出字幕
```

## 🛠️ 项目结构

```
video-subtitle-ai/
├── backend/
│   ├── src/
│   │   ├── server.ts                    # Express 服务器
│   │   ├── routes/
│   │   │   ├── health.ts
│   │   │   ├── video.ts
│   │   │   └── subtitle.ts
│   │   └── services/
│   │       ├── videoProcessor.ts        # 视频处理
│   │       ├── speechRecognizer.ts      # 语音识别
│   │       ├── translator.ts            # 翻译
│   │       ├── ocrService.ts            # OCR
│   │       ├── subtitleGenerator.ts     # 字幕生成
│   │       ├── domainKnowledge.ts       # 领域知识库
│   │       └── qualityVerifier.ts       # 质量验证
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                      # 主应用
│   │   ├── components/
│   │   │   ├── VideoUploader.tsx
│   │   │   ├── SubtitleGenerator.tsx
│   │   │   ├── SubtitleTranslator.tsx
│   │   │   ├── QualityVerifier.tsx
│   │   │   └── SubtitleExporter.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── README.md
├── DEPLOYMENT_GUIDE.md (本文件)
└── start-all.bat/sh
```

## 📦 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| **前端** | React 18 + TypeScript | UI 界面 |
| **构建** | Vite | 快速开发和构建 |
| **后端** | Node.js + Express + TypeScript | API 服务 |
| **视频** | FFmpeg | 视频处理和音频提取 |
| **语音** | OpenAI Whisper | 语音转文字 |
| **翻译** | OpenAI GPT-3.5 | 自然语言翻译 |
| **OCR** | Tesseract.js | 图像字幕识别 |
| **数据库** | 内存存储 | 处理任务跟踪 |

## ⚙️ 高级配置

### 修改 CORS 设置
编辑 `backend/.env`：
```env
CORS_ORIGINS=http://localhost:5173,http://192.168.1.100:5173,http://example.com
```

### 修改端口
编辑相关配置文件：
- 后端端口：`backend/.env` 中的 `PORT`
- 前端端口：`frontend/vite.config.ts` 中的 `port`

### 修改文件大小限制
编辑 `backend/src/server.ts`：
```typescript
const maxSize = 5000 * 1024 * 1024; // 改为你需要的大小（字节）
```

## 🔧 故障排除

### 问题：FFmpeg 未找到
**解决**：
```bash
# Windows
winget install ffmpeg

# 验证
ffmpeg -version
```

### 问题：OpenAI API 错误
**检查**：
1. API Key 是否正确配置在 `.env`
2. 账户是否有充足的额度
3. API 请求是否超过速率限制

### 问题：端口被占用
**解决**：
```bash
# 找到占用 5000 的进程
netstat -ano | findstr "5000"
# 杀死该进程
taskkill /pid <PID> /f
```

### 问题：前端无法连接后端
**检查**：
1. 后端是否正在运行
2. CORS 设置是否正确
3. 使用浏览器开发者工具（F12）查看网络错误

## 📊 性能优化

1. **视频优化**：
   - 使用较小的视频文件进行测试
   - 高分辨率视频会增加 OCR 处理时间

2. **翻译优化**：
   - 批量翻译以减少 API 调用次数
   - 使用缓存存储已翻译的术语

3. **服务器优化**：
   - 使用生产级别的 Node.js 运行时
   - 配置 PM2 进程管理器
   - 使用 Nginx 作为反向代理

## 🚀 生产部署

### 使用 PM2
```bash
# 安装 PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start npm --name "subtitle-backend" -- run start

# 启动前端（构建）
cd ../frontend
npm run build
pm2 serve dist --name "subtitle-frontend" 5173
```

### 使用 Docker（可选）
项目结构已支持 Docker 部署（需要添加 Dockerfile）

## 📝 日志和监控

所有请求和错误都会记录到控制台和日志文件。使用 PM2 监控：
```bash
pm2 monit
pm2 logs subtitle-backend
```

## 📞 技术支持

遇到问题？
1. 查看 GitHub Issues
2. 检查 API 文档
3. 查看浏览器控制台错误信息

## 📄 许可证

MIT License - 自由使用和修改

## 🎉 开始使用

1. 配置 `.env` 文件
2. 运行 `start-all.bat` 或手动启动服务
3. 打开浏览器访问 http://localhost:5173
4. 选择视频文件开始处理
5. 享受智能字幕服务！

---

**祝你使用愉快！** 🎬✨
