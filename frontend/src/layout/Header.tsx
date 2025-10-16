import React, { useRef, useState } from "react";
import type { Theme } from "../hooks/useTheme";
import ThemeToggle from "../components/ThemeToggle";
import SettingsButton from "../components/buttons/SettingsButton";
import SettingsMenu from "../components/SettingsMenu";
import { useAuth } from "../features/auth/AuthContext";
import { Avatar } from "../components/Avatar";
import { authFetch } from "../services/auth"; // ← för att skicka Authorization på upload

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export default function Header({ theme, setTheme }: HeaderProps) {
  const { currentUser, logout, updateCurrentUserAvatar } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Riktig utloggning
  const handleLogout = () => {
    logout(); // rensar token + state
    setIsMenuOpen(false); // stäng menyn
    // Login-overlay tar över automatiskt eftersom isAuthenticated blir false
  };

  // Triggar dold filväljare
  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Ladda upp avatar (skicka JWT med authFetch, låt browsern sätta multipart boundary)
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    const formData = new FormData();
    formData.append("userId", String(currentUser.id));
    formData.append("uploadFile", file);

    try {
      const response = await authFetch("/api/v1/upload/avatar", {
        method: "POST",
        body: formData,
      });
      if (!response.ok)
        throw new Error(`Kunde inte ladda upp filen: ${response.status}`);

      const result = await response.json();
      // Förutsätter att backend returnerar { avatarUrl: "..." }
      updateCurrentUserAvatar(result.avatarUrl);
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Något gick fel vid uppladdningen av din avatar.");
    } finally {
      // nollställ input så samma fil kan väljas igen om man vill
      if (fileInputRef.current) fileInputRef.current.value = "";
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
                  size={40} // ← fixad typo här
                />
                <div className="settings-menu__user-details">
                  <span className="settings-menu__user-name">
                    {currentUser.displayName}
                  </span>
                  <span className="settings-menu__user-email muted">
                    {currentUser.totalPoints ?? 0} poäng
                  </span>
                </div>
              </div>
            )}

            <div className="settings-menu__separator" />
            <a href="#">Min Profil</a>
            <a href="#">Teaminställningar</a>

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

      {/* Dold filväljare */}
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
