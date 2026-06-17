import { useState } from 'react';

export default function LoginScreen({ onJoin }) {
  const [username, setUsername]   = useState('');
  const [roomnumber, setRoomnumber] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const u = username.trim();
    const r = roomnumber.trim();
    if (!u || !r) return;
    onJoin(u, r);
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">💬</div>
          <div className="login-brand-text">
            <h1>ChatterUp</h1>
            <span>Real-time rooms, instant connection</span>
          </div>
        </div>

        <p>Pick a name and a room to jump straight into the conversation.</p>

        <form onSubmit={handleSubmit} id="login-form">
          <div className="field">
            <label htmlFor="username-input">Your Name</label>
            <div className="field-wrap">
              <span className="field-icon">👤</span>
              <input
                id="username-input"
                type="text"
                placeholder="e.g. Alex"
                autoComplete="off"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="room-input">Room ID</label>
            <div className="field-wrap">
              <span className="field-icon">#</span>
              <input
                id="room-input"
                type="text"
                placeholder="e.g. general"
                autoComplete="off"
                required
                value={roomnumber}
                onChange={e => setRoomnumber(e.target.value)}
              />
            </div>
          </div>

          <button id="join-btn" className="join-btn" type="submit">
            Join Room →
          </button>
        </form>
      </div>
    </div>
  );
}
