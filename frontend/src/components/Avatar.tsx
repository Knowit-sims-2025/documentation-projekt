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

  //splittar namnet på space och sätter sedan Initialerna.
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        onError={() => setImgError(true)}
        title="User avatar or initials if no avatar is set"
      />
    );
  }

  return (
    <div
      className={className}
      aria-label={name}
      title="User avatar or initials if no avatar is set"
    >
      {initials}
    </div>
  );
}
