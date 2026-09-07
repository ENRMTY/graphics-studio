// external
import React, { useState } from "react";

// internal
import { ApiError } from "../services/apiClient";
import { authService } from "../services/authService";
import { Icons } from "./Icons";

interface Props {
  onClose: () => void;
}

type Step = "email" | "otp" | "password";

export function PasswordResetModal({ onClose }: Props) {
  // states
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (step === "email") {
        await authService.requestPasswordReset(email);
        setStep("otp");
      } else if (step === "otp") {
        if (!/^\d{6}$/.test(otp)) {
          setError("Enter the 6-digit code from the server log.");
          return;
        }
        setStep("password");
      } else {
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }
        await authService.resetPassword(email, otp, newPassword);
        onClose();
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const title =
    step === "email"
      ? "Forgot Password"
      : step === "otp"
        ? "Check Your Email"
        : "Set New Password";

  return (
    <div
      className="modal-overlay"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal auth-modal">
        <div className="auth-modal-header">
          <h3>{title}</h3>
          <button
            className="auth-modal-close btn btn-icon"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            X
          </button>
        </div>

        <p className="auth-modal-description">
          {step === "email" &&
            "Enter your account email to receive a reset code."}
          {step === "otp" &&
            "An OTP was sent to your email. Enter it to continue."}
          {step === "password" && "Choose a new password for your account."}
        </p>

        <form onSubmit={handleSubmit}>
          {step === "email" && (
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">
                Email
              </label>
              <input
                id="reset-email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoFocus
              />
            </div>
          )}

          {step === "otp" && (
            <div className="form-group">
              <label className="form-label" htmlFor="reset-otp">
                One-time password
              </label>
              <input
                id="reset-otp"
                className="input reset-otp-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, ""))
                }
                required
                autoFocus
              />
            </div>
          )}

          {step === "password" && (
            <div>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-password">
                  New password
                </label>
                <div className="password-input-wrap">
                  <input
                    id="reset-password"
                    className="input"
                    type={showNewPassword ? "text" : "password"}
                    minLength={8}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    className="password-visibility-btn"
                    type="button"
                    onClick={() => setShowNewPassword((visible) => !visible)}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirm-password">
                  Confirm new password
                </label>
                <div className="password-input-wrap">
                  <input
                    id="confirm-password"
                    className="input"
                    type={showConfirmPassword ? "text" : "password"}
                    minLength={8}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                  <button
                    className="password-visibility-btn"
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: 4 }}
          >
            {loading
              ? "Please wait..."
              : step === "email"
                ? "Send OTP"
                : step === "otp"
                  ? "Verify OTP"
                  : "Reset Password"}
          </button>
        </form>

        <div className="auth-modal-footer">
          <button className="auth-link" onClick={onClose} type="button">
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
}
