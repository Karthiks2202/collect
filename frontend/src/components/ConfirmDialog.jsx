import "./ConfirmDialog.css";

/**
 * ConfirmDialog — reusable in-app confirmation modal.
 *
 * Props:
 *   isOpen    {boolean}  — show/hide the dialog
 *   title     {string}   — heading text
 *   message   {string}   — body text
 *   onConfirm {function} — called when the user clicks the confirm button
 *   onCancel  {function} — called when the user dismisses the dialog
 *   confirmLabel {string} — optional label for the confirm button (default "Delete")
 *   icon      {string}   — optional emoji icon (default "🗑️")
 */
function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  icon = "🗑️",
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <span className="confirm-icon">{icon}</span>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button type="button" className="confirm-cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-delete-btn" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
