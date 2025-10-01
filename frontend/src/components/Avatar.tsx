export function Avatar({
  name,
  src,
  className = "leaderboard-avatar",
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  if (src) return <img src={src} alt={name} className={className} />;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className={className} aria-label={name}>
      {initials}
    </div>
  );
}
