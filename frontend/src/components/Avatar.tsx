// En enkel Avatar-komponent som visar antingen en profilbild (src)
// eller en fallback med initialer om bilden saknas.

export function Avatar({
  name,
  src,
  className = "leaderboard-avatar",
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  //om en bild finns, visa den
  if (src) return <img src={src} alt={name} className={className} />;

  //om ingen bild finns, visa initialer
  // 1. dela upp namnet i delar (förnamn, efternamn, etc)
  // 2. ta första bokstaven i varje del
  // 3. ta högst två bokstäver
  // 4. gör om till versaler
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  //rendera en div som visar initialerna
  return (
    <div className={className} aria-label={name}>
      {initials}
    </div>
  );
}
