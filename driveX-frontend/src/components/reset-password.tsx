"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authAPI } from "@/lib/api";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [token, setToken] = React.useState<string | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  React.useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError(
        "Invalid or missing reset token. Please try requesting a new password reset link."
      );
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams]);

  const handleSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authAPI.resetPassword(token, values.password);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle, rgba(193, 207, 214, 1) 70%, rgba(252, 244, 227, 1) 99%)",
        }}
      >
        <div className="reset-password-container">
          <div className="success-content">
            <div className="success-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" fill="#34a853" />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1>Password Reset Successfully!</h1>
            <p>
              Your password has been updated successfully. You can now sign in
              with your new password.
            </p>
            <button onClick={() => router.push("/auth")} className="back-btn">
              Go to Sign In
            </button>
          </div>
        </div>

        <style jsx>{`
          .reset-password-container {
            background-color: rgba(244, 233, 215, 0.95);
            border-radius: 30px;
            box-shadow: 0 8px 32px rgba(45, 27, 30, 0.15);
            border: 1px solid rgba(184, 196, 169, 0.3);
            padding: 60px 40px;
            width: 100%;
            max-width: 450px;
            text-align: center;
            backdrop-filter: blur(10px);
          }

          .success-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .success-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
          }

          h1 {
            color: #2d1b1e;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
          }

          p {
            color: #5a4d3a;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
            max-width: 300px;
            text-align: center;
          }

          .back-btn {
            background-color: #d97d55;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
          }

          .back-btn:hover {
            background-color: #6fa4af;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    );
  }

  if (!token && error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background:
            "radial-gradient(circle, rgba(193, 207, 214, 1) 70%, rgba(252, 244, 227, 1) 99%)",
        }}
      >
        <div className="reset-password-container">
          <div className="error-content">
            <div className="error-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" fill="#dc2626" />
                <path
                  d="M15 9l-6 6M9 9l6 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1>Invalid Reset Link</h1>
            <p>{error}</p>
            <div className="action-buttons">
              <button
                onClick={() => router.push("/forgot-password")}
                className="primary-btn"
              >
                Request New Link
              </button>
              <button
                onClick={() => router.push("/auth")}
                className="secondary-btn"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .reset-password-container {
            background-color: rgba(244, 233, 215, 0.95);
            border-radius: 30px;
            box-shadow: 0 8px 32px rgba(45, 27, 30, 0.15);
            border: 1px solid rgba(184, 196, 169, 0.3);
            padding: 60px 40px;
            width: 100%;
            max-width: 450px;
            text-align: center;
            backdrop-filter: blur(10px);
          }

          .error-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .error-icon {
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
          }

          h1 {
            color: #2d1b1e;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
          }

          p {
            color: #5a4d3a;
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
            max-width: 300px;
            text-align: center;
          }

          .action-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: 100%;
            margin-top: 10px;
          }

          .primary-btn,
          .secondary-btn {
            border: none;
            border-radius: 8px;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .primary-btn {
            background-color: #d97d55;
            color: #fff;
          }

          .primary-btn:hover {
            background-color: #6fa4af;
            transform: translateY(-1px);
          }

          .secondary-btn {
            background-color: transparent;
            color: #d97d55;
            border: 1px solid #d97d55;
          }

          .secondary-btn:hover {
            background-color: #d97d55;
            color: #fff;
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle, rgba(193, 207, 214, 1) 70%, rgba(252, 244, 227, 1) 99%)",
      }}
    >
      <div className="reset-password-container">
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="back-link">
            <button
              type="button"
              onClick={() => router.push("/auth")}
              className="back-arrow"
            >
              ← Back to Sign In
            </button>
          </div>

          <h1>Reset Your Password</h1>
          <p>
            Enter your new password below. Make sure it's at least 8 characters
            long.
          </p>

          <div className="form-group">
            <input
              type="password"
              placeholder="New Password"
              className={form.formState.errors.password ? "error" : ""}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <span className="error-message">
                {form.formState.errors.password.message}
              </span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm New Password"
              className={form.formState.errors.confirmPassword ? "error" : ""}
              {...form.register("confirmPassword")}
            />
            {form.formState.errors.confirmPassword && (
              <span className="error-message">
                {form.formState.errors.confirmPassword.message}
              </span>
            )}
          </div>

          {error && <span className="error-message">{error}</span>}

          <button
            type="submit"
            disabled={loading || !token}
            className="submit-btn"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .reset-password-container {
          background-color: rgba(244, 233, 215, 0.95);
          border-radius: 30px;
          box-shadow: 0 8px 32px rgba(45, 27, 30, 0.15);
          border: 1px solid rgba(184, 196, 169, 0.3);
          padding: 40px;
          width: 100%;
          max-width: 450px;
          backdrop-filter: blur(10px);
        }

        .back-link {
          margin-bottom: 20px;
        }

        .back-arrow {
          background: none;
          border: none;
          color: #d97d55;
          font-size: 14px;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .back-arrow:hover {
          color: #6fa4af;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        h1 {
          color: #2d1b1e;
          font-size: 24px;
          font-weight: 600;
          text-align: center;
          margin: 0;
        }

        p {
          color: #5a4d3a;
          font-size: 14px;
          line-height: 1.5;
          text-align: center;
          margin: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        input {
          background-color: rgba(244, 233, 215, 0.8);
          border: 1px solid rgba(184, 196, 169, 0.4);
          padding: 12px 16px;
          font-size: 14px;
          border-radius: 8px;
          outline: none;
          color: #2d1b1e;
          transition: all 0.3s ease;
        }

        input:focus {
          border-color: #d97d55;
          background-color: rgba(244, 233, 215, 1);
        }

        input.error {
          border-color: #dc2626;
        }

        .error-message {
          color: #dc2626;
          font-size: 12px;
          margin-top: 4px;
        }

        .submit-btn {
          background-color: #d97d55;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #6fa4af;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}
