# AI PDP Generator 🚀

AI PDP Generator is a sophisticated web application designed to help students and professionals craft highly personalized **Personal Development Plans (PDP)** using Artificial Intelligence. By answering a series of curated questions, users get a structured, professional development report streamed in real-time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-8-purple)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%20Flash-orange)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1e57a70c-f13a-44ba-956f-3e48eeadedd8/deploy-status)](https://app.netlify.com/projects/pdp-gen/deploys)

## ✨ Features

- **🤖 AI-Powered Planning**: Uses Google's Gemini AI to analyze your profile and goals.
- **⚡ Real-time Streaming**: Watch your plan being generated word-by-word.
- **📑 Professional Formatting**: Outputs clean Markdown with tables, headers, and clear sections.
- **💾 Multiple Export Options**: 
  - Save as **PDF** with optimized print layout.
  - Download as **Word (.doc)** with native page breaks.
  - Export as **Markdown (.md)** for GitHub or personal notes.
- **🎨 Premium UI/UX**: Clean, modern interface with smooth animations, glassmorphism headers, and dark-themed footer.
- **📱 Fully Responsive**: Seamless experience across desktops, tablets, and mobile devices.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Routing**: React Router DOM
- **AI Integration**: Google Generative AI (@google/generative-ai)
- **Styling**: Vanilla CSS (Custom UI kit)
- **Markdown Rendering**: React Markdown, Rehype-Raw
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Google Gemini API Key ([Get it here](https://aistudio.google.com/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/senuda-d/pdp-gen.git
   cd pdp-gen
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(See `.env.example` for reference)*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📂 Project Structure

```text
src/
├── components/     # Reusable UI components (Header, Footer)
├── data/           # Questions JSON and AI Prompts
├── pages/          # Main application views (Form, Result)
├── services/       # AI Service logic
├── App.css         # Main styling system
└── main.jsx        # App entry point
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
Built with ❤️ by [Senuda](https://github.com/senuda-d)
