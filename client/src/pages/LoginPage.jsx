import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-login-gradient)",
        padding: 16,
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: 400, padding: 48 }}>
        <h1
          style={{
            textAlign: "center",
            fontFamily: "var(--font-family)",
            color: "var(--color-accent)",
            fontSize: "var(--font-size-2xl)",
            marginBottom: 4,
          }}
        >
          BetterReads
        </h1>
        <p style={{ textAlign: "center", color: "var(--color-text-muted)", marginBottom: 32 }}>
          Your personal book tracker
        </p>
        {error && (
          <div
            style={{
              background: "rgba(231,76,60,0.1)",
              color: "var(--color-danger)",
              padding: "8px 16px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: "var(--font-size-sm)",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="u">Username</label>
            <input
              id="u"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="p">Password</label>
            <input
              id="p"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "8px 16px", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
