# Chat Bridge

A real-time chat application built with React, TypeScript, and Node.js. This application enables users to connect, chat, and share media in real-time using WebSockets.

## Features

- Real-time messaging with Socket.IO
- User authentication and authorization
- File and media sharing with Cloudinary integration
- Responsive design for mobile and desktop
- Dark/light theme support
- Contact list and chat management
- Message timestamps and status indicators

## Tech Stack

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- Redux Toolkit for state management
- React Router for navigation
- Socket.IO client for real-time communication

### Backend

- Node.js with Express
- MongoDB with Mongoose
- Socket.IO for real-time connections
- JWT for authentication
- Cloudinary for media storage
- bcryptjs for password hashing

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/Shafin5714/chat-bridge.git
   cd chat-bridge
   ```

2. **Install dependencies**

   ```bash
   # Install all dependencies for both client and server
   npm run install:all
   ```

3. **Configure environment variables**

   **Server Configuration:**

   ```bash
   cd server
   cp .env.example .env
   ```

   Edit the `.env` file with your configuration:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/chatbridge
   NODE_ENV=development
   JWT_EXPIRES_IN=1h
   JWT_SECRET="YourSecretKey"
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

   **Client Configuration:**

   ```bash
   cd ../client
   cp .env.example .env
   ```

   Edit the `.env` file with your backend URL:

   ```env
   VITE_BASE_URL=http://localhost:5000/api
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. **Start the application**

   ```bash
   # Start both server and client concurrently
   npm run dev
   ```

   Or start them separately:

   ```bash
   # Terminal 1 - Start Server
   cd server
   npm run dev

   # Terminal 2 - Start Client
   cd client
   npm run dev
   ```

### Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
chat-bridge/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── features/       # Feature-based modules
│   │   ├── lib/           # Utility functions
│   │   ├── routes/        # Route definitions
│   │   ├── store/         # Redux store
│   │   └── App.tsx        # Main App component
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend server
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── lib/          # Library utilities
│   │   ├── middlewares/  # Express middlewares
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── server.js     # Main server file
│   └── package.json
└── package.json          # Root package.json
```

## Scripts

- `npm run install:all` - Install dependencies for both client and server
- `npm run dev` - Start both server and client in development mode
- `npm run build` - Build the client application for production
- `npm run lint` - Run ESLint on the client code

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Author

Shafin5714 - [@Shafin5714](https://github.com/Shafin5714)

## Support

For support, please open an issue in the [GitHub Issues](https://github.com/Shafin5714/chat-bridge/issues) page.
