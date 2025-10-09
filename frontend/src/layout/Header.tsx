import React, { useRef, useState } from "react";
import type { Theme } from "../hooks/useTheme";
import ThemeToggle from "../components/ThemeToggle";
import SettingsButton from "../components/buttons/SettingsButton";
import SettingsMenu from "../components/SettingsMenu";
import { useAuth } from "../features/AuthContext";
import { Avatar } from "../components/Avatar";

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export default function Header({ theme, setTheme }: HeaderProps) {
  const { currentUser, updateCurrentUserAvatar } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enkel utloggningsfunktion som en platshållare
  const handleLogout = () => {
    alert("Loggar ut...");
    setIsMenuOpen(false);
  };

  // Triggrar den dolda filväljaren
  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Hanterar filuppladdningen när en fil har valts
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    const formData = new FormData();
    formData.append("userId", String(currentUser.id));
    formData.append("uploadFile", file);

    try {
      const response = await fetch("/api/v1/upload/avatar", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Kunde inte ladda upp filen.");

      const result = await response.json();
      updateCurrentUserAvatar(result.avatarUrl); // Uppdatera avataren i hela appen!
      setIsMenuOpen(false); // Stäng menyn
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Något gick fel vid uppladdningen av din avatar.");
    }
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

            {/* Admin-specifika länkar som bara visas om användaren är admin */}
            {currentUser?.isAdmin && (
              <>
                <div className="settings-menu__separator" />
                <a href="#/admin/users">Hantera användare</a>
                <a href="#/admin/system">Systeminställningar</a>
              </>
            )}

            <button onClick={handleAvatarButtonClick}>Byt avatar</button>
            <div className="settings-menu__separator" />
            <button onClick={handleLogout}>Logga ut</button>
          </SettingsMenu>
        </div>
        <h1 className="header__center">Dashboard</h1>
        <div className="header__right">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
      {/* Dold filväljare som vi kan trigga */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/png, image/jpeg, image/gif"
      />
    </header>
  );
}
