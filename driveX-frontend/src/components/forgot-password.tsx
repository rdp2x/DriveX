"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IS_MOCK, authAPI } from "@/lib/api";
import ButtonSpinner from "@/components/button-spinner";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = React.useState("");

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (values: ForgotPasswordValues) => {
    setLoading(true);
    setError(null);

    try {
      if (IS_MOCK) {
        // Mock mode: simulate success
        setSubmittedEmail(values.email);
        setSuccess(true);
        return;
      }

      // Use the authAPI instead of direct fetch
      await authAPI.forgotPassword(values.email);

      setSubmittedEmail(values.email);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
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
        <div className="forgot-password-container">
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
            <h1>Check your email</h1>
            <p>Password reset link sent to:</p>
            <div className="email-display">{submittedEmail}</div>
            <p className="instruction">
              Click the link in the email to reset your password. If you don't
              see the email, check your spam folder.
            </p>
            <button onClick={() => router.push("/auth")} className="back-btn">
              Back to Sign In
            </button>
          </div>
        </div>

        <style jsx>{`
          .forgot-password-container {
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
          }

          .email-display {
            background-color: rgba(184, 196, 169, 0.2);
            border: 1px solid rgba(184, 196, 169, 0.4);
            border-radius: 8px;
            padding: 12px 16px;
            color: #2d1b1e;
            font-weight: 500;
            font-size: 14px;
            word-break: break-word;
          }

          .instruction {
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

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle, rgba(193, 207, 214, 1) 70%, rgba(252, 244, 227, 1) 99%)",
      }}
    >
      <div className="forgot-password-container">
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

          <p>Forgot Password?</p>
          <p>
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email"
              className={form.formState.errors.email ? "error" : ""}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <span className="error-message">
                {form.formState.errors.email.message}
              </span>
            )}
          </div>

          {error && <span className="error-message">{error}</span>}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? <ButtonSpinner /> : "Send Reset Link"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .forgot-password-container {
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
