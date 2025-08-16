const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const roleEl = document.getElementById('role');
const turnEl = document.getElementById('turn');
const messagesEl = document.getElementById('messages');
const connectBtn = document.getElementById('connect');

let ws = null;
let state = {
  board: Array.from({length:8}, ()=>Array(8).fill(null)),
  turn: 'WHITE',
  self: 'SPECTATOR'
};
let selected = null; // {f,r}

function algebraic(f, r) {
  return String.fromCharCode('a'.charCodeAt(0) + f) + String.fromCharCode('1'.charCodeAt(0) + r);
}

function squareId(f, r) { return `sq-${f}-${r}`; }

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function addMessage(text, type='info') {
  const d = document.createElement('div');
  d.className = `msg ${type}`;
  d.textContent = text;
  messagesEl.appendChild(d);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function renderBoard() {
  clearChildren(boardEl);
  for (let r = 7; r >= 0; r--) {
    for (let f = 0; f < 8; f++) {
      const sq = document.createElement('div');
      sq.className = `square ${(f + r) % 2 === 0 ? 'light' : 'dark'}`;
      sq.id = squareId(f, r);
      const piece = state.board[r][f];
      if (piece) {
        const p = document.createElement('div');
        p.className = 'piece';
        p.textContent = pieceIcon(piece);
        sq.appendChild(p);
      }
      sq.addEventListener('click', () => onSquareClick(f, r));
      boardEl.appendChild(sq);
    }
  }
}

function pieceIcon(code) {
  // code like 'wP', 'bK'
  const color = code[0] === 'w' ? '♙♖♘♗♕♔' : '♟♜♞♝♛♚';
  const map = { 'P':0, 'R':1, 'N':2, 'B':3, 'Q':4, 'K':5 };
  return color[map[code[1]]];
}

function onSquareClick(f, r) {
  // enforce turn and ownership on selection
  if (!selected) {
    const piece = state.board[r][f];
    if (!piece) return;
    const isWhite = piece[0] === 'w';
    if ((state.self === 'WHITE' && !isWhite) || (state.self === 'BLACK' && isWhite)) return;
    if ((state.turn === 'WHITE' && !isWhite) || (state.turn === 'BLACK' && isWhite === true && state.self === 'BLACK')) {
      // allow only when it's your turn
    }
    selected = {f, r};
    document.getElementById(squareId(f, r)).classList.add('selected');
  } else {
    const from = selected;
    if (from.f === f && from.r === r) {
      document.getElementById(squareId(f, r)).classList.remove('selected');
      selected = null;
      return;
    }
    sendMove(algebraic(from.f, from.r), algebraic(f, r));
    document.getElementById(squareId(from.f, from.r)).classList.remove('selected');
    selected = null;
  }
}

function updateState(m) {
  if (m.board) state.board = m.board;
  if (m.turn) state.turn = m.turn;
  if (m.self) state.self = m.self;
  renderBoard();
  roleEl.textContent = state.self;
  turnEl.textContent = state.turn;
  if (m.message) addMessage(m.message, m.type === 'error' ? 'error' : 'info');
}

function connect() {
  const name = document.getElementById('name').value.trim();
  let room = document.getElementById('room').value.trim();
  if (!room) {
    room = 'lobby';
    document.getElementById('room').value = room;
  }
  if (ws) ws.close();

  const proto = location.protocol === 'https:' ? 'wss' : 'ws';

  // Optional override via global or <meta name="ws-base" content="...">
  let wsBase = window.CHESS_WS_BASE;
  if (!wsBase) {
    const meta = document.querySelector('meta[name="ws-base"]');
    if (meta && meta.content) wsBase = meta.content;
  }
  // If opened via file:// and no override provided, default to local backend
  if (!wsBase && location.protocol === 'file:') {
    wsBase = 'ws://localhost:8080';
  }

  let url;
  if (wsBase) {
    // wsBase can be:
    // - full ws(s)://host[:port][/prefix]
    // - absolute path like /app/ws
    // - host:port
    if (/^wss?:\/\//i.test(wsBase)) {
      url = `${wsBase.replace(/\/$/, '')}/ws/chess/${encodeURIComponent(room)}`;
    } else if (wsBase.startsWith('/')) {
      url = `${proto}://${location.host}${wsBase.replace(/\/$/, '')}/chess/${encodeURIComponent(room)}`;
    } else {
      url = `${proto}://${wsBase.replace(/\/$/, '')}/ws/chess/${encodeURIComponent(room)}`;
    }
  } else {
    // Determine target host automatically and use the page's directory as base when served by backend.
    let host = location.host;
    let basePath = location.pathname.replace(/\/[^\/]*$/, ''); // directory of current page ('' if at root)
    const isIdeServer = location.port === '63342' || location.pathname.includes('/src/main/webapp');

    if (isIdeServer) {
      // When served by IDE static server, talk to backend on 8080; assume backend is at root unless overridden.
      host = `${location.hostname}:8080`;
      basePath = '';
    }

    url = `${proto}://${host}${basePath}/ws/chess/${encodeURIComponent(room)}`;
  }

  console.debug('WebSocket URL:', url);
  ws = new WebSocket(url);

  ws.onopen = () => {
    statusEl.textContent = `Connected to room "${room}"`;
    if (name) {
      ws.send(JSON.stringify({type: 'join', name}));
    } else {
      ws.send(JSON.stringify({type: 'join'}));
    }
  };

  ws.onmessage = ev => {
    try {
      const m = JSON.parse(ev.data);
      updateState(m);
    } catch (e) {
      console.error('Bad message', e);
    }
  };

  ws.onerror = (e) => {
    statusEl.textContent = 'Connection error (see console)';
    console.error('WebSocket error event:', e);
  };

  ws.onclose = (e) => {
    statusEl.textContent = `Disconnected (code ${e.code}${e.reason ? ', ' + e.reason : ''})`;
    console.warn('WebSocket closed:', e);
  };
}

function sendMove(from, to) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({type: 'move', from, to}));
}

connectBtn.addEventListener('click', connect);

// Auto-fill room from URL hash ?room=ID or #ID, and allow optional ?wsBase=...
(function initFromUrl(){
  const params = new URLSearchParams(location.search);
  const room = params.get('room') || (location.hash ? location.hash.substring(1) : '');
  if (room) document.getElementById('room').value = room;

  const wsBase = params.get('wsBase');
  if (wsBase) {
    window.CHESS_WS_BASE = wsBase;
  }
})();

renderBoard();
