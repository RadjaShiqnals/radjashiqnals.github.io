<div align="center">
  <img src="https://reactjs.org/favicon.ico" alt="React Logo" width="100" />
  <h1>Portfolio Website</h1>
</div>

A modern, responsive portfolio website with animated page transitions and a collapsible sidebar navigation.

## Author
Created by [RadjaShiqnals](https://github.com/RadjaShiqnals)

## Tech Stack
<p align="left">
  <a href="https://reactjs.org/" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" alt="react" width="40" height="40"/>
  </a>
  <a href="https://vitejs.dev/" target="_blank" rel="noreferrer">
    <img src="https://vitejs.dev/logo.svg" alt="vite" width="40" height="40"/>
  </a>
  <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" alt="tailwind" width="40" height="40"/>
  </a>
  <a href="https://reactrouter.com/" target="_blank" rel="noreferrer">
    <img src="https://reactrouter.com/_brand/React%20Router%20Brand%20Assets/React%20Router%20Logo/Dark.svg" alt="react-router" width="40" height="40"/>
  </a>
</p>

### Main Technologies
- **React** <img src="https://reactjs.org/favicon.ico" width="16" /> - A JavaScript library for building user interfaces
- **Vite** <img src="https://vitejs.dev/logo.svg" width="16" /> - Next Generation Frontend Tooling
- **React Router** <img src="https://reactrouter.com/_brand/React%20Router%20Brand%20Assets/React%20Router%20Logo/Dark.svg" width="16" /> - Declarative routing for React
- **Tailwind CSS** <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" width="16" /> - A utility-first CSS framework
- **PostCSS** <img src="https://postcss.org/assets/postcss-CsElRNOW.svg" width="16" /> - A tool for transforming CSS with JavaScript

## Features
- Hash-based routing for smooth page transitions
- Animated collapsible sidebar
- Responsive design
- Dark mode UI
- 404 page handling
- CSS animations and transitions

## Live Demo
Visit the live site: [Portfolio Website](https://radjashiqnals.github.io/radjashiqnals.github.io/)

## Project Structure
```
src/
├── layouts/
│   └── MainLayout.jsx        # Main layout with sidebar
├── pages/
│   ├── MainPage.jsx         # Contains all main sections
│   └── MainPage.module.css  # Page-specific styles
├── App.jsx                  # Root component with routing
├── main.jsx                # Entry point
└── index.css              # Global styles and Tailwind imports

Configuration files:
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── postcss.config.js      # PostCSS configuration
```

## Setup and Installation
1. Clone the repository
```bash
git clone https://github.com/RadjaShiqnals/radjashiqnals.github.io.git
```

2. Install dependencies
```bash
npm install
```

3. Run development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## Deployment
This project is deployed on GitHub Pages. To deploy:

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

## Project Architecture
- Single page application with hash-based routing
- Centralized layout management
- Component-based structure
- Tailwind CSS for styling
- Responsive design patterns

## License
MIT License
