// src/features/auth/LoginForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

export default function LoginForm() {
  const { login, isLoading } = useAuth();
  const [authorId, setAuthorId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(authorId.trim());
      // Vid lyckad login försvinner overlayen (isAuthenticated blir true)
    } catch (err: any) {
      const msg = String(err?.message ?? "Login failed");
      setError(msg.length > 200 ? "Login failed" : msg);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="card"
      style={{ width: 380, padding: 24 }}
    >
      <h2>Logga in</h2>
      <p className="muted">Ange ditt Confluence Author ID</p>

      <label style={{ display: "block", marginTop: 12 }}>
        <span style={{ display: "block", marginBottom: 6 }}>
          Confluence Author ID
        </span>
        <input
          ref={inputRef}
          value={authorId}
          onChange={(e) => setAuthorId(e.target.value)}
          placeholder="ex: 5d123abc456def7890..."
          required
          style={{ width: "100%", padding: "10px 12px" }}
        />
      </label>

      {error && (
        <div role="alert" style={{ marginTop: 12 }}>
          <small style={{ color: "salmon" }}>{error}</small>
        </div>
      )}

      <button
        disabled={isLoading || !authorId.trim()}
        style={{ marginTop: 16, width: "100%", padding: "10px 12px" }}
      >
        {isLoading ? "Loggar in..." : "Logga in"}
      </button>
    </form>
  );
}
