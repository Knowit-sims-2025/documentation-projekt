import React, { useState } from "react";
import fallbackAvatar from "../assets/avatar.svg";

interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
  size?: number; // px-storlek om du vill styra lokalt
}

export function Avatar({
  name,
  src,
  className = "leaderboard__avatar",
  size = 28,
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
  const showFallback = imgError || !src;
  const showInitials = imgError && !fallbackAvatar;

  const handleError = () => setImgError(true);
  const handleLoad = () => setImgError(false);

  // === 3. CSS-stöd för storlek ===
  const style = { width: size, height: size, fontSize: size * 0.45 };

  return (
    <div
      className={className}
      title={name}
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
          alt={name}
          className="leaderboard__avatar-img"
        />
      )}
    </div>
  );
}

// import React, { useState } from "react";

// export function Avatar({
//   name,
//   src,
//   className = "leaderboard-avatar",
// }: {
//   name: string;
//   src?: string;
//   className?: string;
// }) {
//   const [imgError, setImgError] = useState(false);

//   /**
//    * Beräkna initialer:
//    * - trimma whitespace
//    * - splitta på mellanrum
//    * - ta första bokstaven från upp till två ord
//    * - fallback till "?" om namnet är tomt
//    * Memoiserad för att inte räkna om i onödan.
//    */
//   const initials = name
//     .split(" ")
//     .map((p) => p[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();

//   /**
//    * Om vi har en bildkälla och den inte felat → rendera <img>.
//    * onError: om bilden inte går att ladda växlar vi till initialer.
//    *
//    * Tillgänglighet (alt):
//    * - alt={name} är rimligt om namnet inte finns precis bredvid i UI:t.

//    */
//   if (src && !imgError) {
//     return (
//       <img
//         src={src}
//         alt={name}
//         className={className}
//         onError={() => setImgError(true)}
//       />
//     );
//   }

//   /**
//    * Fallback: visa initialer.
//    * role="img" + aria-label: låter skärmläsare behandla denna som en bild med namn.
//    * Om namnet redan läses upp någon annanstans intill: sätt aria-hidden istället.
//    */

//   return (
//     <div className={className} aria-label={name}>
//       {initials}
//     </div>
//   );
// }
