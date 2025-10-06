import React, { useState } from "react";

export function Avatar({
  name,
  src,
  className = "leaderboard-avatar",
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  /**
   * Beräkna initialer:
   * - trimma whitespace
   * - splitta på mellanrum
   * - ta första bokstaven från upp till två ord
   * - fallback till "?" om namnet är tomt
   * Memoiserad för att inte räkna om i onödan.
   */
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  /**
   * Om vi har en bildkälla och den inte felat → rendera <img>.
   * onError: om bilden inte går att ladda växlar vi till initialer.
   *
   * Tillgänglighet (alt):
   * - alt={name} är rimligt om namnet inte finns precis bredvid i UI:t.

   */
  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        onError={() => setImgError(true)}
      />
    );
  }

  /**
   * Fallback: visa initialer.
   * role="img" + aria-label: låter skärmläsare behandla denna som en bild med namn.
   * Om namnet redan läses upp någon annanstans intill: sätt aria-hidden istället.
   */

  return (
    <div className={className} aria-label={name}>
      {initials}
    </div>
  );
}
