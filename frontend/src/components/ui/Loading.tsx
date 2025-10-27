export function Loading({ text = "Laddar..." }: { text?: string }) {
  return <p className="muted">{text}</p>;
}
