export default function TypingIndicator({ typers }) {
  if (!typers || typers.length === 0) return null;

  const label =
    typers.length === 1 ? `${typers[0]} is typing`
    : typers.length === 2 ? `${typers[0]} and ${typers[1]} are typing`
    : 'Several people are typing';

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span /><span /><span />
      </div>
      <span>{label}…</span>
    </div>
  );
}
