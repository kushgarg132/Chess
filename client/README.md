# Chess Client - Next.js

A modern, responsive chess game client built with Next.js, TypeScript, and Tailwind CSS. This client connects to your Java-based chess server via WebSockets.

## Features

- 🎮 **Real-time Chess Gameplay**: Connect to your chess server and play in real-time
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS
- 🔌 **WebSocket Integration**: Seamless connection to your Java chess server
- 📱 **Mobile Responsive**: Works perfectly on all device sizes
- ♟️ **Chess.js Integration**: Full chess move validation and game state management
- 🎯 **Interactive Board**: Click-based piece movement with visual feedback
- 📊 **Game Information**: Turn indicators, move history, and connection status

## Prerequisites

- Node.js 18+ and npm
- Your Java chess server running on `localhost:8080`
- The server should have WebSocket endpoint at `/ws/chess/{roomId}`

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How to Play

1. **Enter your name** and a **room ID**
2. **Generate a random room ID** or enter an existing one
3. **Share the room ID** with a friend
4. **Both players join the same room**
5. **First player becomes white**, second player becomes black
6. **Start playing chess!**

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/             # React components
│   ├── ChessBoard.tsx     # Chess board component
│   ├── ConnectionForm.tsx # Connection form
│   └── GameRoom.tsx       # Game room interface
└── hooks/                 # Custom hooks
    └── useWebSocket.ts    # WebSocket connection hook
```

## Components

### ConnectionForm
- Player name input
- Room ID input with random generation
- Connection instructions
- Beautiful landing page

### GameRoom
- Game header with connection status
- Sidebar with game information
- Chess board in the center
- Chat/messages panel

### ChessBoard
- Interactive 8x8 chess board
- Piece movement with validation
- Visual feedback for selected pieces and valid moves
- Responsive design for mobile and desktop

## WebSocket Protocol

The client communicates with your server using the following message format:

### Join Message
```json
{
  "type": "join",
  "name": "PlayerName"
}
```

### Move Message
```json
{
  "type": "move",
  "from": "e2",
  "to": "e4",
  "promotion": "QUEEN"  // Optional, for pawn promotion
}
```

## Configuration

### Server URL
The WebSocket URL is hardcoded to `ws://localhost:8080`. To change this:

1. Update the `useWebSocket.ts` hook
2. Modify the `wsUrl` variable in the `connect` function

### Styling
The app uses Tailwind CSS. Customize colors and styling in:
- `tailwind.config.ts`
- Component className props
- `globals.css`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding Features

- **New Game Modes**: Extend the `GameRoom` component
- **Chat System**: Enhance the messages panel
- **Game Analysis**: Add move analysis tools
- **Sound Effects**: Integrate audio for moves and captures

## Troubleshooting

### Connection Issues
- Ensure your Java chess server is running on port 8080
- Check that WebSocket endpoint `/ws/chess/{roomId}` is accessible
- Verify no firewall or proxy is blocking WebSocket connections

### Game Issues
- Refresh the page if the game state becomes inconsistent
- Check browser console for WebSocket errors
- Ensure both players are in the same room

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Chess.js** - Chess game logic and validation
- **Lucide React** - Beautiful icons
- **WebSocket API** - Real-time communication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your server is running and accessible
3. Ensure WebSocket support is enabled
4. Check the network tab for connection issues

---

**Happy Chess Playing! ♟️**
