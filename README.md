# AutoHotkey Generator

AutoHotkey Generator is a web application that creates automation scripts from plain English descriptions using AI, with a React frontend and an Express backend.

## Features

- **AI-Powered Script Generation**: Convert natural language descriptions into AutoHotkey scripts
- **User Authentication**: Secure login and registration system
- **Script Management**: Save, organize, and manage your generated scripts
- **Subscription Plans**: Flexible pricing with monthly and pay-per-script options
- **Instant Downloads**: Get ready-to-run .ahk files
- **Script History**: Access and reuse your previously generated scripts

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- shadcn/ui component library
- React Router for navigation
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Stripe integration for payments
- OpenAI/Anthropic API integration
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Stripe account (for payments)
- OpenAI or Anthropic API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd autohotkey-generator
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the `server/` directory with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. Start the development server
```bash
npm run start
```

This will start both the frontend (port 5173) and backend (port 3000) concurrently.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API request functions
│   │   ├── contexts/       # React contexts
│   │   └── hooks/          # Custom hooks
│   └── ...
├── server/                 # Express backend
│   ├── config/             # Configuration files
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   └── server.js           # Server entry point
└── ...
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Scripts
- `POST /api/scripts/generate` - Generate AutoHotkey script
- `POST /api/scripts` - Save a script
- `GET /api/scripts` - Get user's scripts
- `GET /api/scripts/:id` - Get specific script
- `PUT /api/scripts/:id` - Update script
- `DELETE /api/scripts/:id` - Delete script

### User
- `GET /api/user/me` - Get current user info
- `GET /api/user/usage` - Get user usage statistics

### Subscriptions
- `GET /api/subscriptions/plans` - Get subscription plans
- `POST /api/subscriptions/checkout` - Create checkout session
- `GET /api/subscriptions/status` - Get subscription status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.