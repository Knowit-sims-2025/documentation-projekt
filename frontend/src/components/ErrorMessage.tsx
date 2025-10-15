export function ErrorMessage({ message }: { message: string }) {
  return <p style={{ color: "var(--err)" }}>Fel: {message}</p>;
}
