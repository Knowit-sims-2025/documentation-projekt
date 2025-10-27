import React, { useEffect, useState } from "react";
import fallbackAvatar from "../../assets/avatar.svg";

type NullString = { String?: string; Valid?: boolean };

export interface AvatarProps {
  name: string;
  src?: string | NullString | null;
  className?: string;
  size?: number;
}

// Hjälpare: plocka ut sträng-URL från string | NullString | null
function toSrc(v: unknown): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v.trim() || undefined;
  if (typeof v === "object" && v !== null && "String" in (v as any)) {
    const ns = v as NullString;
    if (ns.Valid === false) return undefined;
    return (ns.String ?? "").trim() || undefined;
  }
  return undefined;
}

export function Avatar({
  name,
  src,
  className = "leaderboard__avatar",
  size,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  // Normalisera källan (hanterar NullString och whitespace)
  const srcUrl = toSrc(src);
  const showImg = !!srcUrl && !imgError;

  // Nollställ felstatus när källan byts
  useEffect(() => {
    setImgError(false);
  }, [srcUrl]);

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
      {srcUrl && (
        <img
          src={srcUrl}
          alt={name}
          onError={() => setImgError(true)}
          onLoad={() => setImgError(false)}
          className="leaderboard__avatar-img"
          style={{ display: showImg ? "block" : "none" }}
          loading="lazy"
        />
      )}
      {!showImg && (
        <img
          src={fallbackAvatar}
          alt="default avatar"
          className="leaderboard__avatar-img"
        />
      )}
    </div>
  );
}

export default Avatar;

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
