import React from "react";
import lockIcon from "../assets/lock.svg";
import unlockIcon from "../assets/lock_open.svg";

export default function Widget({
  title,
  children,
  headerControls,
  onHide,
  isLocked,
  onToggleLock,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  headerControls?: React.ReactNode;
  onHide: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
}) {
  return (
    <div className={`card ${isLocked ? "is-locked" : ""}`}>
      <div className={`widget__header ${isLocked ? "is-locked" : ""}`}>
        <h3>{title}</h3>
        <div className="widget__controls">
          {headerControls}
          <button
            className="widget__lock"
            onClick={onToggleLock}
            title={isLocked ? "Lås upp widget" : "Lås widget"}
          >
            <img
              src={isLocked ? lockIcon : unlockIcon}
              alt={isLocked ? "Låst" : "Olåst"}
              width="16"
              height="16"
            />
          </button>

          <button className="widget__remove" onClick={onHide} title="Minimera">
            -
          </button>
        </div>
      </div>
      <div className="widget__body">{children}</div>
    </div>
  );
}
