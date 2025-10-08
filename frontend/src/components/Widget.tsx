import React from "react";

export default function Widget({
  title,
  children,
  onHide,
}: {
  title: string;
  children: React.ReactNode;
  onHide: () => void;
}) {
  return (
    <div className="card">
      <div className="widget__header">
        <h3>{title}</h3>
        <button className="widget__remove" onClick={onHide} title="Ta bort">
          ✕
        </button>
      </div>
      <div className="widget__body">{children}</div>
    </div>
  );
}
