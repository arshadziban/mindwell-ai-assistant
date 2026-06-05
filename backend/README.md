# Mind Well - Backend

A Node.js/Express mental health assessment API that leverages Google's Gemini AI and Pinecone vector database to provide personalized, evidence-based wellness recommendations.

## Features

- **AI-Powered Assessment**: Uses Gemini 2.5 Flash model with knowledge retrieval from Pinecone
- **Evidence-Based Guidelines**: Knowledge base of mental health research and best practices
- **Rate Limiting**: Built-in rate limiting to prevent abuse (30 requests per minute)
- **Health Monitoring**: Endpoints for dependency checks and usage statistics
- **CORS Support**: Configurable cross-origin resource sharing for frontend integration
- **Error Handling**: Comprehensive error handling and logging

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **AI Model**: Google Gemini 2.5 Flash via OpenRouter API
- **Vector DB**: Pinecone (for storing health guidelines and evidence-based rules)
- **Database**: JSON-based in-memory statistics
- **Configuration**: dotenv for environment management

## Project Structure

```
backend/
├── server.js           # Main application server
├── package.json        # Dependencies & metadata
├── .env                # Environment variables (API keys)
└── node_modules/       # Dependencies
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- API Keys:
  - OpenRouter API Key (for Gemini access)
  - Pinecone API Key (for knowledge base)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create or update `.env` file:

```env
OPENROUTER_API_KEY=your_api_key_here
PINECONE_API_KEY=your_pinecone_key_here
PORT=5000
HOST=0.0.0.0
ENVIRONMENT=development
CHAT_MODEL=google/gemini-2.5-flash-lite
RATE_LIMIT_RPM=30
RATE_LIMIT_WINDOW=60
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Development

```bash
npm start
```

Server runs on `http://0.0.0.0:5000` (all interfaces)

## API Endpoints

### POST /api/assess
**Primary endpoint for mental health assessment**

**Request:**
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

**Response (200):**
```json
{
  "risk_level": "moderate",
  "summary": "Your wellness assessment indicates moderate lifestyle stress...",
  "insights": [
    "Sleep patterns suggest fatigue accumulation",
    "Screen time exceeds recommended levels..."
  ],
  "recommendations": [
    "Establish consistent sleep schedule",
    "Implement digital detox periods..."
  ]
}
```

**Error Response (400/500):**
```json
{
  "error": "Invalid assessment data",
  "details": "sleep must be 1-24"
}
```

### GET /api/health
**Dependency and system health check**

**Response (200):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_seconds": 3627.5,
  "dependencies": {
    "openrouter_api": "connected",
    "pinecone_db": "connected"
  },
  "timestamp": "2026-04-12T15:30:00Z"
}
```

### GET /api/stats
**Usage statistics and rate limit info**

**Response (200):**
```json
{
  "total_assessments": 42,
  "average_response_time_ms": 1230,
  "rate_limit": {
    "requests_this_minute": 5,
    "limit": 30,
    "remaining": 25
  },
  "errors_last_hour": 2
}
```

### POST /api/feedback
**Record user feedback on assessments**

**Request:**
```json
{
  "assessment_id": "uuid-here",
  "rating": 4,
  "feedback": "Very helpful recommendations"
}
```

**Response (201):**
```json
{
  "id": "feedback-uuid",
  "created_at": "2026-04-12T15:30:00Z",
  "status": "recorded"
}
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| OPENROUTER_API_KEY | - | **Required** OpenRouter API key for Gemini access |
| PINECONE_API_KEY | - | **Required** Pinecone API key for knowledge base |
| API_KEY | - | Optional API key for request authentication |
| PORT | 5000 | Server port |
| HOST | 0.0.0.0 | Server host (all interfaces) |
| ENVIRONMENT | development | Environment (development/production) |
| CHAT_MODEL | google/gemini-2.5-flash-lite | AI model to use |
| RATE_LIMIT_RPM | 30 | Max requests per minute per IP |
| RATE_LIMIT_WINDOW | 60 | Rate limit window in seconds |
| CORS_ORIGINS | * | Comma-separated list of allowed origins |
| RULES_INDEX | mental-health-rules | Pinecone index name |

### Rate Limiting

- **Default**: 30 requests per minute per IP address
- **Window**: 60 seconds
- **Response**: 429 Too Many Requests when limit exceeded

```
Retry-After: 12 seconds
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1681234567
```

## Assessment Data Structure

### Input Validation
All fields must be integers from 1-10 representing health metrics:

- **sleep**: Hours of sleep (1-24 converted to 1-10 scale)
- **screen_time**: Daily screen hours (0-24 converted to 1-10 scale)
- **activity**: Minutes of physical activity per day (converted to 1-10 scale)
- **stress**: Self-reported stress level (1-10)
- **mood**: Self-reported mood (1-10)

### Processing Flow

1. **Validation**: Check all assessment fields are valid integers
2. **Retrieval**: Query Pinecone for relevant health guidelines
3. **Analysis**: Send assessment + guidelines to Gemini AI
4. **Generation**: AI produces clinical snapshot, insights, and recommendations
5. **Response**: Return structured assessment results

## Error Handling

### Common Errors

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| 400 | Invalid assessment data | Malformed request | Check JSON structure |
| 429 | Rate limit exceeded | Too many requests | Wait & retry |
| 500 | AI service unavailable | Gemini/OpenRouter error | Check API keys |
| 503 | Pinecone unavailable | Vector DB error | Check Pinecone status |

### Logging

All errors are logged with:
- Timestamp
- Error code
- Error message
- Request ID (for tracing)
- Stack trace (development only)

## Performance Optimization

- **Response Caching**: Brief cache of assessment results (5 minutes)
- **Batch Processing**: Support for multiple assessments in single request
- **Connection Pooling**: Reused API connections to reduce latency
- **Compression**: gzip compression for responses over 1KB

Typical response time: 1.2 - 2.5 seconds (includes AI processing)

## Security Considerations

1. **API Key Protection**: Never commit `.env` files
2. **CORS Validation**: Only allow specified frontend origin
3. **Rate Limiting**: Prevent DOS attacks
4. **Input Validation**: Strict validation of assessment data
5. **HTTPS**: Use HTTPS in production
6. **Error Messages**: Generic error messages in production (avoid leaking details)

## Deployment

### Production Checklist

- [ ] Set ENVIRONMENT=production
- [ ] Update CORS_ORIGINS to match frontend domain
- [ ] Use HTTPS endpoint
- [ ] Enable rate limiting with appropriate thresholds
- [ ] Set up error logging/monitoring
- [ ] Configure Pinecone for production tier
- [ ] Use stable Gemini model version
- [ ] Set NODE_ENV=production
- [ ] Configure process manager (PM2 recommended)

### Using PM2

```bash
npm install -g pm2
pm2 start server.js --name "mindwell-api"
pm2 save
pm2 startup
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server.js .
EXPOSE 5000
CMD ["node", "server.js"]
```

## Troubleshooting

### API Key Issues

**Error**: "FATAL: OPENROUTER_API_KEY is not set"
- **Solution**: Ensure .env file exists and has OPENROUTER_API_KEY
- Check env file is in backend/ directory (not parent)

### Pinecone Connection Failed

**Error**: "Cannot connect to Pinecone"
- **Solution**: 
  - Verify PINECONE_API_KEY is correct
  - Check Pinecone dashboard for index status
  - Ensure RULES_INDEX name matches Pinecone index

### Rate Limit Errors

**Error**: 429 Too Many Requests
- **Solution**: 
  - Increase RATE_LIMIT_RPM in .env if needed
  - Implement client-side request queuing
  - Add exponential backoff retry logic

### Slow Responses

**Typical**: 1.2 - 2.5 seconds
- **If slower**: Check Gemini API status, Pinecone latency
- **Optimization**: Reduce prompt complexity or use faster model

## Development Guidelines

1. **API Design**: REST endpoints with clear semantics
2. **Error Handling**: Consistent error response format
3. **Logging**: Structured logging for debugging
4. **Testing**: Manual API testing with curl/Postman
5. **Documentation**: Keep README and API docs in sync

## Testing the API

### Using curl

```bash
# Assessment
curl -X POST http://localhost:5000/api/assess \
  -H "Content-Type: application/json" \
  -d '{"assessment":{"sleep":6,"screen_time":8,"activity":3,"stress":7,"mood":5}}'

# Health check
curl http://localhost:5000/api/health

# Statistics
curl http://localhost:5000/api/stats
```

### Using Postman

Import the API endpoints into Postman for GUI testing.

**Headers:**
- Content-Type: application/json
- (Optional) Authorization: Bearer YOUR_API_KEY

## License

© 2026 Mind Well. All rights reserved.
