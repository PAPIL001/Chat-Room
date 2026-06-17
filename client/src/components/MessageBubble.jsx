import { getColour, initials } from '../App';

export default function MessageBubble({ msg, currentUser }) {
  const isSent = msg.user === currentUser;
  const colour  = getColour(msg.avatarSeed ?? 0);

  const timeStr = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`msg-row ${isSent ? 'sent' : 'recv'}`}>
      <div className="avatar" style={{ background: colour }}>
        {initials(msg.user)}
      </div>
      <div className="bubble-wrap">
        {!isSent && (
          <div className="bubble-sender">{msg.user}</div>
        )}
        <div className="bubble">{msg.text}</div>
        <div className="bubble-time">{timeStr}</div>
      </div>
    </div>
  );
}
