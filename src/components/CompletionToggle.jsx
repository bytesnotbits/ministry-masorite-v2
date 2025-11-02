import './CompletionToggle.css';

function CompletionToggle({ showCompleted, onToggle }) {
  return (
    <div className="completion-toggle-container">
      <label className="completion-toggle-label">
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={(e) => onToggle(e.target.checked)}
          className="completion-toggle-checkbox"
        />
        <span className="completion-toggle-text">Show Completed</span>
      </label>
    </div>
  );
}

export default CompletionToggle;
