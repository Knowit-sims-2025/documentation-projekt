import React from "react";
function Widget({
  title,
  children,
  onHide,
}: {
  title: string;
  children: React.ReactNode;
  onHide?: () => void;
}) {
  return (
    <div className="card panel">
      <div className="panel__header drag-handle">
        <h3 className="panel__title">{title}</h3>
        <div className="panel__actions">
          {onHide && (
            <button className="panel__btn" onClick={onHide} title="Dölj">
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="panel__body">{children}</div>
    </div>
  );
}
