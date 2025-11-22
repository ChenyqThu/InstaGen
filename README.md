<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fdMFK2uyXaBI4e1gLrUeTWemuqJ10doS

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Features

### 📸 Instant Photo Generation
- Take photos using your device camera or upload images
- AI-powered photo editing with Google Gemini
- Multiple Polaroid frame styles (Classic, Black, Colorful, Vintage)

### ✨ Pokemon Card Holographic Effects
Add stunning holographic effects to your photos with interactive 3D animations:

- **9 Distinct Effects**: Holo, Galaxy, VMAX, VSTAR, Full Art, Rainbow, Gold, and Trainer Gallery variants
- **Interactive 3D Tilt**: Cards respond to mouse movement with realistic rotation and shine
- **Visual Previews**: See each effect applied to a sample image before selecting
- **Independent Selection**: Combine any frame style with any card effect
- **Full Coverage**: Holographic effects apply to the entire Polaroid (photo + frame + caption)
- **High-Quality Export**: Download your holographic cards at high resolution

The holographic effects are powered by CSS blend modes, gradients, and 3D transforms, ported from the [vue-pokemon-cards-css](https://github.com/simeydotme/pokemon-cards-css) project.

### 🎨 Customization
- Editable captions on all photos
- Draggable photos on the board
- Multiple frame styles to choose from
- AI-powered photo transformations

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + SCSS (for Pokemon card effects)
- **AI**: Google Gemini API for image generation and editing
- **Database**: Supabase (PostgreSQL)
- **3D Effects**: CSS transforms, blend modes, and custom properties

## Roadmap

> 详细开发文档请查看 [docs/](./docs/)

### v1.1.0 - 用户认证
- [ ] Google / GitHub OAuth 登录
- [ ] 用户状态管理
- [ ] 登录 UI 组件

### v1.2.0 - 个人照片库
- [ ] 照片云端保存
- [ ] 个人卡片库界面
- [ ] 分享到公共画廊

### v1.3.0 - 账户管理
- [ ] 账户设置页面
- [ ] 自定义 Gemini API Key

### v1.4.0 - 使用限制
- [ ] Magic Edit 每日配额 (3次/天)
- [ ] 自定义 Key 无限使用
