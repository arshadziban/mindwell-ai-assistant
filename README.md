# Mind Well - Mental Health Assessment Platform

An AI-powered mental health assessment platform that provides personalized wellness guidance based on lifestyle indicators. Built with React frontend, Node.js backend, and Google's Gemini AI.

## Overview

Mind Well helps users understand their mental health status by analyzing five key wellness indicators:
- **Sleep Quality**: Hours and quality of sleep
- **Screen Time**: Daily digital device usage
- **Physical Activity**: Minutes of movement/exercise
- **Stress Levels**: Self-reported stress
- **Mood**: Self-reported emotional state

The system generates evidence-based recommendations and actionable insights tailored to each user's wellness profile.

## Project Structure

```
metal_health_AI/app/
├── frontend/                    # React application
│   ├── public/                  # Static assets & favicons
│   ├── src/
│   │   ├── App.js              # Main app component
│   │   ├── AssessmentPage.js   # Assessment & results UI
│   │   ├── index.js            # Entry point
│   │   └── index.css           # Global styles
│   ├── package.json            # Dependencies
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── README.md               # Frontend documentation
│
├── backend/                     # Node.js API server
│   ├── server.js               # Express app & endpoints
│   ├── package.json            # Dependencies
│   ├── .env                    # Environment variables
│   └── README.md               # Backend documentation
│
└── .vscode/                     # VS Code settings & tasks
    └── tasks.json              # Development tasks
```

## Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **Tailwind CSS** - Responsive styling
- **React Markdown** - Display AI insights
- **html2pdf.js** - PDF report generation
- **Canvas API** - Animation rendering

### Backend
- **Node.js** - Runtime environment
- **Express.js** - HTTP server framework
- **Google Gemini 2.5 Flash** - AI model (via OpenRouter)
- **Pinecone** - Vector database for health knowledge
- **CORS** - Cross-origin request handling

## Features

### Core Assessment
- **5-Field Form**: Sleep, screen time, activity, stress, mood
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Real-time Validation**: Input checks and feedback
- **Loading Animation**: Interactive 3D particle animation

### Results & Insights
- **Risk Assessment**: Categorized wellness risk levels
- **Clinical Snapshot**: AI-generated clinical summary
- **Evidence-Based Insights**: Personalized health observations
- **Actionable Recommendations**: Specific wellness guidance
- **PDF Export**: Download reports as PDF documents

### System Features
- **Rate Limiting**: Protect API from abuse
- **Error Handling**: Graceful error messages
- **Health Monitoring**: API status and dependency checks
- **Usage Statistics**: Track assessment metrics

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- OpenRouter API key (for Gemini AI)
- Pinecone API key (for knowledge base)

### Quick Start

1. **Clone and navigate**
   ```bash
   cd app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env  # Add your API keys
   npm install
   npm start
   ```
   Server runs on `http://localhost:5000`

3. **Frontend Setup** (new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```
   App opens at `http://localhost:3000`

4. **Test the App**
   - Navigate to `http://localhost:3000`
   - Fill the assessment form (all fields 1-10)
   - Click "Get Wellness Insights"
   - View results and download PDF

## API Reference

See [backend/README.md](backend/README.md) for complete API documentation.

### Key Endpoints

```
POST   /api/assess          # Submit wellness assessment
GET    /api/health          # System health check
GET    /api/stats           # Usage statistics
POST   /api/feedback        # Record user feedback
```

## Configuration

### Frontend Environment

```env
REACT_APP_API_URL=http://localhost:5000
```

### Backend Environment

```env
OPENROUTER_API_KEY=sk-or-your-key-here
PINECONE_API_KEY=your-pinecone-key
PORT=5000
HOST=0.0.0.0
CHAT_MODEL=google/gemini-2.5-flash-lite
RATE_LIMIT_RPM=30
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Development

### Available Scripts

**Frontend:**
```bash
npm start              # Development server
npm run build         # Production build
npm test              # Run tests
npm run eject         # Eject from Create React App
```

**Backend:**
```bash
npm start             # Development server
npm run dev           # Dev server with restart on changes
npm test              # Run tests
```

### Project Commands

From root directory:

```bash
# Start both servers in parallel (requires concurrently)
npm run dev

# Build frontend
cd frontend && npm run build

# Deploy build to backend
cp -r frontend/build/* backend/public/
```

## Styling

### Design System

**Colors:**
- Primary Teal: `#0E748A`
- Dark Text: `#0f172a`
- Muted Text: `#64748b`
- Light Background: `#f3f7fc`
- Wave Gradient: Teal to cyan animations

**Typography:**
- Font: Inter (from Google Fonts)
- Weights: 400, 500, 600, 700, 800
- Sizes: Responsive with Tailwind breakpoints

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1023px
- Desktop: ≥ 1024px

## Performance

### Metrics

- **Frontend Build**: ~150KB gzipped
- **API Response**: 1.2 - 2.5 seconds (includes AI processing)
- **Page Load**: < 2 seconds on 4G
- **Lighthouse Score**: 90+ (Performance, Accessibility, Best Practices)

### Optimization

- Tree-shaking CSS with Tailwind
- Lazy code splitting with React
- Canvas-based animations (GPU accelerated)
- API rate limiting and caching
- Compression on responses > 1KB

## Security

1. **API Key Management**
   - Never commit `.env` files
   - Use environment-specific keys
   - Rotate keys regularly

2. **CORS Protection**
   - Whitelist frontend origins only
   - Disable in sensitive environments

3. **Input Validation**
   - Validate all assessment data
   - Limit file uploads
   - Implement rate limiting

4. **HTTPS**
   - Use HTTPS in production
   - Enforce in server headers
   - Use secure cookies only

## Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend
npm run build
# Deploy build/ folder to hosting service
```

### Backend (Heroku/Railway)

```bash
# Set environment variables
# Deploy with platform CLI
heroku create mindwell-api
git push heroku main
```

## Troubleshooting

### Port Conflicts
- Frontend port 3000: Will auto-use 3001 if taken
- Backend port 5000: Change in `.env` if needed

### API Key Issues
- OpenRouter: Get key from [openrouter.ai](https://openrouter.ai)
- Pinecone: Get key from [pinecone.io](https://pinecone.io)

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`

See individual [frontend/README.md](frontend/README.md) and [backend/README.md](backend/README.md) for detailed troubleshooting.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 13+, Chrome Mobile)

## Contributing

1. Follow existing code style
2. Keep components focused and reusable
3. Document complex logic
4. Test across devices before committing
5. Update README if adding features

## License

© 2026 Mind Well. All rights reserved.

## Support

For issues, feature requests, or questions:
- Check existing documentation
- Review error messages in browser console
- Check backend logs for API issues
- Verify API keys and environment variables

---

**Version**: 1.0.0  
**Last Updated**: April 12, 2026  
**Status**: Active Development
