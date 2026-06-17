import { getColour, initials } from '../App';

export default function OnlinePanel({ users, currentUser, isOpen, onClose }) {
  return (
    <aside className={`online-panel${isOpen ? ' panel-open' : ''}`}>
      <div className="panel-header">
        <span>Online — {users.length}</span>
        {isOpen && (
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1
            }}
            aria-label="Close panel"
          >✕</button>
        )}
      </div>

      <div className="panel-users">
        {users.map((u, i) => (
          <div className="panel-user" key={u.username + i}>
            <div
              className="panel-avatar"
              style={{ background: getColour(u.avatarSeed ?? i) }}
            >
              {initials(u.username)}
              <span className="online-badge" />
            </div>
            <span className="panel-username">{u.username}</span>
            {u.username === currentUser && (
              <span className="panel-you">you</span>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <div style={{ color: 'var(--muted)', fontSize: '.8rem', padding: '12px 10px' }}>
            No one online yet…
          </div>
        )}
      </div>
    </aside>
  );
}
