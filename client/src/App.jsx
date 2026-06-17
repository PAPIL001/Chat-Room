import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';

// Deterministic colour palette for avatars
export const COLOURS = [
  '#6c63ff','#ec4899','#f59e0b','#10b981',
  '#3b82f6','#ef4444','#8b5cf6','#14b8a6',
  '#f97316','#06b6d4','#84cc16','#a855f7'
];

export function getColour(seed) {
  return COLOURS[seed % COLOURS.length];
}

export function initials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default function App() {
  const [session, setSession] = useState(null); // { username, roomnumber, avatarSeed }

  function handleJoin(username, roomnumber) {
    const avatarSeed = Math.floor(Math.random() * COLOURS.length);
    setSession({ username, roomnumber, avatarSeed });
  }

  return session
    ? <ChatScreen session={session} />
    : <LoginScreen onJoin={handleJoin} />;
}
