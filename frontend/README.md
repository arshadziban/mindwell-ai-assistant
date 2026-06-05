# Mind Well - Frontend

A modern React-based mental health assessment application that provides AI-powered wellness insights using evidence-based patterns.

## Features

- **AI-Powered Assessment**: Analyzes lifestyle indicators (sleep, screen time, activity, stress, mood) to provide personalized wellness recommendations
- **Responsive Design**: Fully responsive interface optimized for mobile, tablet, and desktop devices
- **Evidence-Based Insights**: Delivers risk assessments and actionable recommendations backed by health research
- **PDF Export**: Generate and download wellness reports as PDFs
- **Secure & Private**: Client-side form validation and secure API communication

## Tech Stack

- **Framework**: React 18.2.0
- **Styling**: Tailwind CSS with responsive breakpoints
- **Typography**: Inter font from Google Fonts
- **Build Tool**: Create React App with Webpack
- **Markdown Rendering**: react-markdown with remark-gfm
- **PDF Generation**: html2pdf.js

## Project Structure

```
frontend/
├── public/
│   ├── index.html          # HTML entry point
│   ├── manifest.json       # PWA manifest
│   ├── logo_horizontal.png # Mind Well brand logo
│   ├── fav_icon.svg        # Favicon
│   └── robots.txt          # SEO robots file
├── src/
│   ├── App.js              # Main application component
│   ├── AssessmentPage.js   # Core assessment & results component
│   ├── index.js            # React entry point
│   └── index.css           # Global styles & Tailwind directives
├── package.json            # Dependencies & scripts
├── tailwind.config.js      # Tailwind configuration
└── postcss.config.js       # PostCSS configuration
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn package manager

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

The app auto-recompiles on file changes. Check the browser console for any warnings.

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `build/` folder.

## Component Overview

### App.js
Main application wrapper handling:
- API communication with backend (`/api/assess`)
- State management (loading, results, errors)
- Props delegation to AssessmentPage

### AssessmentPage.js
Comprehensive component featuring:
- **LoadingView**: Canvas-based 3D particle animation during assessment
- **AssessmentForm**: 5-field wellness questionnaire (sleep, screen time, activity, stress, mood)
- **ResultsView**: Risk badge, personalized insights, evidence-based recommendations
- **PDF Export**: Download wellness report with custom styling

## Styling System

### Tailwind CSS
- Mobile-first responsive design
- Breakpoints: sm (640px), md (768px)
- Maintained through className props

### Color Palette

| Color | Value | Usage |
|-------|-------|-------|
| Primary Teal | #0E748A | Headers, badges, accents |
| Dark Slate | #0f172a | Text |
| Muted Slate | #64748b | Secondary text |
| Light Background | #f3f7fc | Page background |
| Wave | Various gradients | Animations |

### Global CSS
Defined in `index.css`:
- Custom scrollbar styling
- Inter font loading from Google Fonts
- CSS variables for theming
- Tailwind directives

## Responsive Breakpoints

- **Mobile**: < 640px (full width, compact spacing)
- **Tablet**: 640px - 1023px (medium sizing)
- **Desktop**: ≥ 1024px (full layout)

Logo sizing example:
- Mobile: 16px
- Tablet: 16px
- Desktop: 16px

## API Integration

### Endpoint: POST /api/assess

**Request Body:**
```json
{
  "assessment": {
    "sleep": 6,
    "screen_time": 8,
    "activity": 3,
    "stress": 7,
    "mood": 5
  }
}
```

**Response:**
```json
{
  "risk_level": "moderate",
  "summary": "...",
  "insights": ["..."],
  "recommendations": ["..."]
}
```

## Build Artifacts

The `build/` folder contains production-ready files:
- `index.html`: Minified HTML with correct theme color and favicon references
- `manifest.json`: PWA configuration with Mind Well branding
- `static/`: Optimized JS and CSS bundles

## Performance Considerations

- Lazy loading for markdown content
- Optimized canvas rendering for animations
- Responsive logo sizing reduces memory on mobile
- Efficient CSS with Tailwind's tree-shaking

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Guidelines

1. **Styling**: Use Tailwind CSS classes first, inline styles only for dynamic values
2. **Components**: Keep components focused and reusable
3. **Imports**: All external assets should be in the `public/` folder
4. **Testing**: Manual testing on multiple viewports (mobile, tablet, desktop)

## Troubleshooting

### Logo not showing
- Ensure `logo_horizontal.png` exists in `public/` folder
- Check browser DevTools Network tab for 404 errors
- Clear browser cache and restart dev server

### Port 3000 in use
- The app will automatically use next available port (e.g., 3001)
- Or kill process: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)

### Build failing
- Clear `node_modules/` and reinstall: `rm -rf node_modules && npm install`
- Update npm: `npm install -g npm@latest`

## License

© 2026 Mind Well. All rights reserved.
