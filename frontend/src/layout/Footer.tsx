import React from "react";

export default function Footer() {
  return (
    <footer className="app__footer">
      <div className="container">
        <span>&copy; {new Date().getFullYear()} Gamification App</span>
      </div>
    </footer>
  );
}
