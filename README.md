# Chess Game

A full-stack chess application built with modern web technologies, featuring real-time multiplayer gameplay and a responsive user interface.

## 🎯 Features

- **Real-time multiplayer chess** with WebSocket support
- **Modern React frontend** built with Next.js 15 and TypeScript
- **Spring Boot backend** with WebSocket capabilities
- **Responsive design** using Tailwind CSS
- **Chess.js integration** for game logic and validation
- **Beautiful UI components** with Lucide React icons

## 🏗️ Architecture

This project follows a client-server architecture:

- **Frontend (Client)**: Next.js React application with TypeScript
- **Backend (Server)**: Spring Boot Java application with WebSocket support
- **Communication**: Real-time WebSocket connections for game updates

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Java** (JDK 17 or higher)
- **Maven** (for building the server)

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

The server will start on port 8080 by default.

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Chess.js** - Chess game logic library
- **Lucide React** - Beautiful icon library

### Backend
- **Spring Boot 3.5.4** - Java application framework
- **Java 17** - Modern Java runtime
- **WebSocket** - Real-time bidirectional communication
- **Maven** - Build tool and dependency management

## 📁 Project Structure

```
chess/
├── client/                 # Next.js frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies
│   └── README.md          # Frontend documentation
├── server/                # Spring Boot backend
│   ├── src/               # Java source code
│   ├── pom.xml            # Maven configuration
│   └── README.md          # Backend documentation
└── README.md              # This file
```

## 🎮 How to Play

1. Start both the frontend and backend servers
2. Open the application in your browser
3. Create a new game or join an existing one
4. Play chess in real-time with other players

## 🔧 Development

### Available Scripts

**Frontend (client directory):**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Backend (server directory):**
- `mvn spring-boot:run` - Run the application
- `mvn clean install` - Clean and build
- `mvn test` - Run tests

### Code Quality

- **ESLint** configuration for frontend code quality
- **TypeScript** strict mode enabled
- **Maven** for backend build and dependency management

## 🌐 API Endpoints

The backend provides WebSocket endpoints for real-time chess gameplay. Check the server README for detailed API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing documentation in client/ and server/ directories
2. Review the logs for error messages
3. Open an issue on the project repository

---

**Happy Chess Playing! ♟️**
