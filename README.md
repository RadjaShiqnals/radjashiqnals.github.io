# Portfolio Website

A modern, responsive portfolio website built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Responsive Design**: Fully responsive layout that works on all devices
- **Modern UI**: Clean and professional design with dark mode support
- **Interactive Project Gallery**: Expandable project cards with image galleries
- **Social Media Integration**: Font Awesome icons for social media links
- **Performance Optimized**: Built with Next.js for optimal performance
- **Type Safe**: Full TypeScript support for better development experience

## Pages

### Homepage
- Hero section with profile image and introduction
- Services/skills overview with icons
- Call-to-action sections
- Smooth scrolling and animations

### Projects Page
- Grid layout of project cards
- Click-to-expand modal with:
  - Image gallery with navigation
  - Detailed project descriptions
  - Technology stack badges
  - Links to live demo and source code

### About Page
- Personal introduction with profile photo
- Skills and technologies organized by category
- Experience timeline
- Social media links (LinkedIn, GitHub, Twitter, Email)
- Download resume button

## Tech Stack

- **Framework**: Next.js 15.5.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Font Awesome
- **Linting**: Biome
- **Image Placeholders**: Placehold.co

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Customization

### Personal Information
Update the following files with your personal information:
- Replace placeholder text in `src/app/page.tsx`
- Update profile information in `src/app/about/page.tsx`
- Add your projects to the projects array in `src/app/projects/page.tsx`

### Styling
- Modify colors and themes in `src/app/globals.css`
- Update component styles using Tailwind CSS classes
- Customize the navigation in `src/components/Navigation.tsx`

### Images
- Replace placeholder images with your actual photos
- Add your project screenshots to the projects data
- Update social media links with your actual profiles

## Project Structure

```
src/
├── app/
│   ├── about/
│   │   └── page.tsx          # About page
│   ├── projects/
│   │   └── page.tsx          # Projects page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── components/
│   └── Navigation.tsx        # Navigation component
└── lib/
    └── fontawesome.ts        # Font Awesome configuration
```

## Deployment

This project is ready to be deployed on platforms like:
- Vercel (recommended for Next.js)
- Netlify
- GitHub Pages
- Any hosting service that supports Node.js

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Feel free to submit issues and enhancement requests!