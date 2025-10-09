import React, { useState } from "react";
import type { Theme } from "../hooks/useTheme";
import ThemeToggle from "./ThemeToggle";
import SettingsButton from "./button/SettingsButton";
import SettingsMenu from "./SettingsMenu";
import { useAuth } from "../features/AuthContext";
import { Avatar } from "./Avatar";

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export default function Header({ theme, setTheme }: HeaderProps) {
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Enkel utloggningsfunktion som en platshållare
  const handleLogout = () => {
    alert("Loggar ut...");
    setIsMenuOpen(false);
  };

  return (
    <header className="app__header">
      <div className="container">
        <div className="header__left">
          <SettingsButton onClick={() => setIsMenuOpen((prev) => !prev)} />
          <SettingsMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          >
            {currentUser && (
              <div className="settings-menu__user-info">
                <Avatar
                  name={currentUser.displayName}
                  src={currentUser.avatarUrl}
                  size={40}
                />
                <div className="settings-menu__user-details">
                  <span className="settings-menu__user-name">
                    {currentUser.displayName}
                  </span>
                  <span className="settings-menu__user-email muted">
                    {currentUser.totalPoints} poäng
                  </span>
                </div>
              </div>
            )}
            <div className="settings-menu__separator" />
            <a href="#">Min Profil</a>
            <a href="#">Teaminställningar</a>
            <div className="settings-menu__separator" />
            <button onClick={handleLogout}>Logga ut</button>
          </SettingsMenu>
        </div>
        <h1 className="header__center">Dashboard</h1>
        <div className="header__right">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
}
