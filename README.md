# ScamShield

AI-powered fraud prevention assistant designed to help identify and prevent scams, particularly targeting elderly users.

## Project Structure

This is a monorepo containing:

```
scamshield/
├── packages/
│   ├── shared/          # Shared types, constants, utilities, validators
│   ├── web/             # React frontend application
│   └── server/          # Express.js backend API
├── package.json         # Root workspace configuration
└── tsconfig.base.json   # Base TypeScript configuration
```

### Packages

- **@scamshield/shared** - Shared code between frontend and backend
  - Types and interfaces
  - Constants and configuration
  - Utility functions
  - Zod validation schemas

- **@scamshield/web** - React 19 frontend application
  - Modern UI with Tailwind CSS
  - Dark/light theme support
  - Accessible design for elderly users
  - Real-time scam analysis

- **@scamshield/server** - Express.js backend API
  - RESTful API endpoints
  - Gemini AI integration
  - Rate limiting and security
  - File upload handling

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0
- Google Gemini API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/scamshield.git
   cd scamshield
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

### Development

Run the frontend only:
```bash
npm run dev
```

Run the backend only:
```bash
npm run dev:server
```

Run both frontend and backend:
```bash
npm run dev:all
```

### Build

Build all packages:
```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analyze` | Analyze content for scams |
| GET | `/api/v1/analyze/:id/status` | Get analysis status |
| GET | `/api/v1/history` | Get analysis history |
| POST | `/api/v1/chat` | Send follow-up message |
| POST | `/api/v1/search/verify` | Verify scam with web search |
| GET | `/api/v1/user/preferences` | Get user preferences |
| PUT | `/api/v1/user/preferences` | Update preferences |
| GET | `/api/v1/health` | Health check |

## Features

- **Multi-modal Analysis**: Analyze text, images, and audio files
- **AI-Powered Detection**: Uses Google Gemini for intelligent scam detection
- **Web Verification**: Cross-reference scams with web search
- **Follow-up Chat**: Ask questions about analysis results
- **Text-to-Speech**: Read results aloud for accessibility
- **History Tracking**: Keep track of analyzed messages
- **Educational Content**: Learn about common scam types
- **Chrome Extension**: Protect your Gmail inbox (coming soon)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |
| `PORT` | Server port (default: 4000) | No |
| `CORS_ORIGINS` | Allowed CORS origins | No |
| `VITE_API_URL` | Backend API URL for frontend | No |

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons

### Backend
- Node.js
- Express.js
- TypeScript
- Google Gemini AI
- Zod validation

### Shared
- TypeScript
- Zod schemas
- Common utilities

## License

MIT
