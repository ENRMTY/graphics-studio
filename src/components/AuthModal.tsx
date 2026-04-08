import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/apiClient";

interface Props {
  onClose: () => void;
}

export function AuthModal({ onClose }: Props) {
  const { login, register } = useAuth();

  // use states
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name.trim() || undefined);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal auth-modal">
        {/* header */}
        <div className="auth-modal-header">
          <h3>{mode === "login" ? "Sign In" : "Create Account"}</h3>
          <button
            className="auth-modal-close btn btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="input"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={mode === "login"}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="input"
              type="password"
              placeholder={
                mode === "register" ? "At least 8 characters" : "Your password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: 4 }}
          >
            {loading
              ? mode === "login"
                ? "Signing in…"
                : "Creating account…"
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        {/* footer toggle */}
        <div className="auth-modal-footer">
          {mode === "login" ? (
            <span>
              Don't have an account?{" "}
              <button
                className="auth-link"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
              >
                Create one
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                className="auth-link"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Sign in
              </button>
            </span>
          )}
        </div>

        {/* info note */}
        <div className="auth-info-note">
          Sign in to sync your teams, competitions and drafts, and access them from any device.
          Without an account your data is saved locally only.
        </div>
      </div>
    </div>
  );
}
