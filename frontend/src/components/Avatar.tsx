import React, { useState } from "react";
import fallbackAvatar from "../assets/avatar.svg";

interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
  size?: number;
}

export function Avatar({
  name,
  src,
  className = "leaderboard__avatar",
  size,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // === 1. Initialer som text-fallback ===
  const initials = name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // === 2. Försök ladda bild; annars använd fallback ===
  const showInitials = imgError && !!name;
  const showFallback = imgError || !src;

  const handleError = () => setImgError(true);
  const handleLoad = () => setImgError(false);

  // === 3. Skapa style-objekt BARA om 'size' är angiven ===
  const style = size
    ? { width: size, height: size, fontSize: size * 0.45 }
    : undefined;

  return (
    <div
      className={className}
      title={`Avatar för ${name}`}
      style={style}
      aria-label={`Avatar för ${name}`}
    >
      {!showFallback ? (
        <img
          src={src}
          alt={name}
          onError={handleError}
          onLoad={handleLoad}
          className="leaderboard__avatar-img"
        />
      ) : showInitials ? (
        <span className="leaderboard__avatar-initials">{initials}</span>
      ) : (
        <img
          src={fallbackAvatar}
          alt="default avatar"
          className="leaderboard__avatar-img"
        />
      )}
    </div>
  );
}
