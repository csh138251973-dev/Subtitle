# AI Video Subtitle Processor

🎬 一个智能视频字幕处理系统，基于 Node.js + React + OpenAI，支持自动字幕生成、翻译和质量验证。

## ✨ 主要功能

### 🎥 视频处理
- 支持多种视频格式（MP4、MKV、AVI、MOV、FLV、WebM、WMV）
- 自动提取视频音频文件
- 获取视频元数据（时长、分辨率、帧率等）

### 🗣️ 字幕生成
- **语音识别**：使用 OpenAI Whisper 自动识别音频并生成字幕
- **OCR 扫描**：从视频画面识别字幕文本
- 支持多语言识别（英文、中文、日文、西班牙文、法文、德文等）

### 🌐 智能翻译
- 自动翻译为中文字幕
- **领域检测**：自动识别视频内容领域（游戏、医疗、法律、金融、技术等）
- **专业术语库**：针对不同领域使用准确的专业词汇翻译
- 支持 Minecraft 等特定游戏领域的网络用语翻译

### ✅ 质量验证
- **多维度评估**：完整性、时序准确性、文本质量、领域相关性、一致性、语义连贯性
- **自动检测问题**：空字幕、时序错误、覆盖率不足
- **优化建议**：自动提供改进建议

### 💾 字幕导出
- 支持 SRT 和 WebVTT 格式
- 可与任何视频播放器兼容

## 🚀 快速开始

### 前置要求
- Node.js 16+ 和 npm
- FFmpeg（用于视频处理）
- OpenAI API Key

### 安装

```bash
# 克隆或进入项目目录
cd video-subtitle-ai

# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 配置

1. 在 `backend/.env` 配置 OpenAI API Key：
```env
OPENAI_API_KEY=sk-your-api-key
PORT=5000
CORS_ORIGINS=http://localhost:5173
```

2. 在 `frontend/src/services/api.ts` 配置后端地址（如需要）

### 启动

#### 方式 1：分别启动前后端

**后端**：
```bash
cd backend
npm run dev
```

**前端**：
```bash
cd frontend
npm run dev
```

#### 方式 2：使用启动脚本

```bash
# Windows
./start-all.bat

# Linux/Mac
./start-all.sh
```

### 访问

打开浏览器访问：**http://localhost:5173**

> **本地网络访问**：在中国局域网中，其他设备可以访问 `http://<你的电脑IP>:5173`

## 📁 项目结构

```
video-subtitle-ai/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Express 服务器入口
│   │   ├── routes/             # API 路由
│   │   │   ├── video.ts        # 视频处理路由
│   │   │   ├── subtitle.ts     # 字幕处理路由
│   │   │   └── health.ts       # 健康检查
│   │   └── services/           # 业务逻辑
│   │       ├── videoProcessor.ts
│   │       ├── speechRecognizer.ts
│   │       ├── translator.ts
│   │       ├── ocrService.ts
│   │       ├── subtitleGenerator.ts
│   │       ├── domainKnowledge.ts
│   │       └── qualityVerifier.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # 主应用组件
│   │   ├── components/         # React 组件
│   │   │   ├── VideoUploader.tsx
│   │   │   ├── SubtitleGenerator.tsx
│   │   │   ├── SubtitleTranslator.tsx
│   │   │   ├── QualityVerifier.tsx
│   │   │   └── SubtitleExporter.tsx
│   │   ├── index.css           # 全局样式
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

## 🔄 工作流程

1. **上传视频** → 选择并上传视频文件
2. **生成字幕** → 选择方式（语音识别或 OCR）生成原语言字幕
3. **翻译字幕** → 自动检测领域并翻译为中文
4. **质量验证** → AI 检查翻译准确性和语义连贯性
5. **导出字幕** → 下载 SRT 或 WebVTT 格式的字幕文件

## 🎮 支持的领域

系统包含以下领域的专业词汇库：

- 🎮 **Minecraft** - 游戏术语、物品名称、命令等
- 🏥 **医疗** - 医学术语、症状、治疗方法
- 💼 **金融** - 投资、股票、交易术语
- ⚖️ **法律** - 法律术语、法庭用语
- 💻 **技术** - 编程术语、技术概念

可以轻松扩展以支持更多领域！

## 🔐 隐私与安全

- 所有视频处理在本地或 OpenAI 服务器上完成
- 上传的视频和字幕不会存储在公共服务器
- 需要有效的 OpenAI API Key（自行管理）

## 🛠️ 技术栈

- **后端**：Node.js + Express + TypeScript
- **前端**：React 18 + TypeScript + Vite
- **AI 集成**：OpenAI Whisper（语音识别）、GPT-3.5 Turbo（翻译）
- **视频处理**：FFmpeg + Tesseract.js（OCR）
- **样式**：CSS3 + 响应式设计

## 📝 API 端点

### 视频处理
- `POST /api/video/upload` - 上传视频
- `POST /api/video/extract-audio/:jobId` - 提取音频
- `GET /api/video/status/:jobId` - 获取处理状态

### 字幕处理
- `POST /api/subtitle/generate-from-audio` - 从音频生成字幕
- `POST /api/subtitle/generate-from-ocr` - 从 OCR 生成字幕
- `POST /api/subtitle/translate` - 翻译字幕
- `POST /api/subtitle/verify` - 验证字幕质量
- `GET /api/subtitle/export/:jobId` - 导出字幕

## 🐛 常见问题

### Q: FFmpeg 未安装怎么办？
A: 访问 https://ffmpeg.org/download.html 下载并安装

### Q: OpenAI API Key 从哪里获取？
A: 访问 https://platform.openai.com/api-keys 获取

### Q: 能否在 Windows 之外的系统上运行？
A: 是的，项目是跨平台的，支持 Windows、macOS、Linux

### Q: 支持离线使用吗？
A: 不，该系统需要 OpenAI API 密钥进行翻译和语音识别

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提出 Issue 和 Pull Request！

## 📧 联系方式

有问题或建议？欢迎提交 Issue 或发送邮件。

---

**Happy Subtitling!** 🎬✨
