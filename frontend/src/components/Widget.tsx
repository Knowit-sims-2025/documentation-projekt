import React from "react";

export default function Widget({
  title,
  children,
  headerControls,
  onHide,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  headerControls?: React.ReactNode;
  onHide: () => void;
}) {
  return (
    <div className="card">
      <div className="widget__header">
        <h3>{title}</h3>
        <div className="widget__controls">
          {headerControls}
          <button className="widget__remove" onClick={onHide} title="Ta bort">
            ✕
          </button>
        </div>
      </div>
      <div className="widget__body">{children}</div>
    </div>
  );
}
