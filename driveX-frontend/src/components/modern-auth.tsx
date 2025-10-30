"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { initiateGoogleOAuth } from "@/lib/supabase-oauth";
import { authAPI } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function ModernAuthForm() {
  const router = useRouter();
  const { setToken, setUser } = useAuth();
  const [isActive, setIsActive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const handleLogin = async (values: LoginValues) => {
    setLoading(true);
    setError(null);
    try {
      const { authAPI } = await import("@/lib/api");

      const response = await authAPI.login({
        email: values.email,
        password: values.password,
      });

      if (!response.success) {
        throw new Error(response.message || "Login failed");
      }

      const { accessToken, name, email } = response.data;

      // Set token first
      setToken(accessToken);

      // Get complete user info including ID
      const userResponse = await authAPI.getCurrentUser(accessToken);
      if (userResponse.success) {
        setUser({
          id: userResponse.data.id,
          name: userResponse.data.name,
          email: userResponse.data.email,
        });
      } else {
        // Fallback if /me endpoint fails
        setUser({
          id: name, // Temporary fallback
          name,
          email,
        });
      }

      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterValues) => {
    setLoading(true);
    setError(null);
    try {
      const { authAPI } = await import("@/lib/api");

      const response = await authAPI.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (!response.success) {
        throw new Error(response.message || "Registration failed");
      }

      const { accessToken, name, email } = response.data;

      // Set token first
      setToken(accessToken);

      // Get complete user info including ID
      const userResponse = await authAPI.getCurrentUser(accessToken);
      if (userResponse.success) {
        setUser({
          id: userResponse.data.id,
          name: userResponse.data.name,
          email: userResponse.data.email,
        });
      } else {
        // Fallback if /me endpoint fails
        setUser({
          id: name, // Temporary fallback
          name,
          email,
        });
      }

      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(circle, rgba(193, 207, 214, 1) 70%, rgba(252, 244, 227, 1) 99%)",
      }}
    >
      <div className={`auth-container ${isActive ? "active" : ""}`}>
        {/* Sign Up Form */}
        <div className="form-container sign-up">
          <form onSubmit={registerForm.handleSubmit(handleRegister)}>
            <h1>Create Account</h1>
            <div className="google-auth">
              <button
                type="button"
                className="google-btn"
                onClick={initiateGoogleOAuth}
              >
                <div className="google-logo">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                Continue with Google
              </button>
            </div>
            <div className="divider">
              <span>or</span>
            </div>
            <input
              type="text"
              placeholder="Name"
              className={registerForm.formState.errors.name ? "error" : ""}
              {...registerForm.register("name")}
            />
            {registerForm.formState.errors.name && (
              <span className="error-message">
                {registerForm.formState.errors.name.message}
              </span>
            )}
            <input
              type="email"
              placeholder="Email"
              className={registerForm.formState.errors.email ? "error" : ""}
              {...registerForm.register("email")}
            />
            {registerForm.formState.errors.email && (
              <span className="error-message">
                {registerForm.formState.errors.email.message}
              </span>
            )}
            <input
              type="password"
              placeholder="Password"
              className={registerForm.formState.errors.password ? "error" : ""}
              {...registerForm.register("password")}
            />
            {registerForm.formState.errors.password && (
              <span className="error-message">
                {registerForm.formState.errors.password.message}
              </span>
            )}
            {error && <span className="error-message">{error}</span>}
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in">
          <form onSubmit={loginForm.handleSubmit(handleLogin)}>
            <h1>Sign In</h1>
            <div className="google-auth">
              <button
                type="button"
                className="google-btn"
                onClick={initiateGoogleOAuth}
              >
                <div className="google-logo">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>
                Continue with Google
              </button>
            </div>
            <div className="divider">
              <span>or</span>
            </div>
            <input
              type="email"
              placeholder="Email"
              className={loginForm.formState.errors.email ? "error" : ""}
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email && (
              <span className="error-message">
                {loginForm.formState.errors.email.message}
              </span>
            )}
            <input
              type="password"
              placeholder="Password"
              className={loginForm.formState.errors.password ? "error" : ""}
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <span className="error-message">
                {loginForm.formState.errors.password.message}
              </span>
            )}
            <Link href="/forgot-password" className="forgot-password-link">
              Forget Your Password?
            </Link>
            {error && <span className="error-message">{error}</span>}
            <button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome back to</h1>
              <div className="drivex-logo">DriveX</div>
              <p>Enter your credentials to access all features</p>
              <button
                className="hidden signin-btn"
                type="button"
                onClick={() => {
                  console.log("Sign In button clicked");
                  setIsActive(false);
                }}
              >
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>New here?</h1>
              <div className="drivex-logo">Join DriveX</div>
              <p>Create your account to start using all features</p>
              <button
                className="hidden signup-btn"
                type="button"
                onClick={() => {
                  console.log("Sign Up button clicked");
                  setIsActive(true);
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          background-color: rgba(244, 233, 215, 0.95);
          border-radius: 30px;
          box-shadow: 0 8px 32px rgba(45, 27, 30, 0.15);
          border: 1px solid rgba(184, 196, 169, 0.3);
          position: relative;
          overflow: hidden;
          width: 768px;
          max-width: 100%;
          min-height: 480px;
          backdrop-filter: blur(10px);
        }

        .auth-container p {
          font-size: 14px;
          line-height: 20px;
          letter-spacing: 0.3px;
          margin: 20px 0;
          color: #2d1b1e;
        }

        .auth-container span {
          font-size: 12px;
          color: #5a4d3a;
        }

        .auth-container a {
          color: #d97d55;
          font-size: 13px;
          text-decoration: none;
          margin: 15px 0 10px;
        }

        .auth-container a:hover {
          color: #6fa4af;
        }

        .forgot-password-link {
          color: #d97d55 !important;
          font-size: 12px !important;
          text-decoration: none !important;
          margin: 8px 0 15px 0 !important;
          display: inline-block !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
        }

        .forgot-password-link:hover {
          color: #6fa4af !important;
          text-decoration: underline !important;
        }

        .auth-container h1 {
          color: #2d1b1e;
          margin-bottom: 10px;
          font-size: 32px;
          font-weight: 300;
          font-family: "Playfair Display", serif;
          letter-spacing: 0.5px;
        }

        .auth-container button {
          background-color: #d97d55;
          color: #fff;
          font-size: 12px;
          padding: 10px 45px;
          border: 1px solid transparent;
          border-radius: 8px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-top: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auth-container button:hover {
          background-color: #6fa4af;
          transform: translateY(-1px);
        }

        .auth-container button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-container button.hidden {
          background-color: transparent;
          border: 2px solid #fff;
          color: #fff;
          padding: 12px 50px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auth-container button.hidden:hover {
          background-color: #fff;
          color: #512da8;
        }

        .signup-btn {
          background-color: rgba(255, 255, 255, 0.15) !important;
          border: 2px solid rgba(255, 255, 255, 0.8) !important;
          color: #fff !important;
          padding: 12px 30px !important;
          border-radius: 25px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          margin-top: 20px !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 9999 !important;
          backdrop-filter: blur(5px) !important;
        }

        .signup-btn:hover {
          background-color: rgba(244, 233, 215, 0.95) !important;
          color: #2d1b1e !important;
          border-color: rgba(244, 233, 215, 0.95) !important;
          transform: translateY(-2px) !important;
        }

        .signin-btn {
          background-color: rgba(255, 255, 255, 0.15) !important;
          border: 2px solid rgba(255, 255, 255, 0.8) !important;
          color: #fff !important;
          padding: 12px 30px !important;
          border-radius: 25px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          margin-top: 20px !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          z-index: 9999 !important;
          backdrop-filter: blur(5px) !important;
        }

        .signin-btn:hover {
          background-color: rgba(244, 233, 215, 0.95) !important;
          color: #2d1b1e !important;
          border-color: rgba(244, 233, 215, 0.95) !important;
          transform: translateY(-2px) !important;
        }

        .auth-container form {
          background-color: rgba(244, 233, 215, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          height: 100%;
        }

        .auth-container input {
          background-color: rgba(244, 233, 215, 0.8);
          border: 1px solid rgba(184, 196, 169, 0.4);
          margin: 8px 0;
          padding: 10px 15px;
          font-size: 13px;
          border-radius: 8px;
          width: 100%;
          outline: none;
          color: #2d1b1e;
          transition: all 0.3s ease;
        }

        .auth-container input:focus {
          border-color: #d97d55;
          background-color: rgba(244, 233, 215, 1);
        }

        .auth-container input.error {
          border: 1px solid #dc2626;
        }

        .error-message {
          color: #f44336;
          font-size: 11px;
          margin-top: -6px;
          margin-bottom: 8px;
        }

        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
        }

        .sign-in {
          left: 0;
          width: 50%;
          z-index: 2;
          background-color: rgba(244, 233, 215, 1);
        }

        .auth-container.active .sign-in {
          transform: translateX(100%);
          background-color: rgba(244, 233, 215, 1);
        }

        .sign-up {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
          background-color: rgba(244, 233, 215, 1);
        }

        .auth-container.active .sign-up {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: move 0.6s;
          background-color: rgba(244, 233, 215, 1);
        }

        @keyframes move {
          0%,
          49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%,
          100% {
            opacity: 1;
            z-index: 5;
          }
        }

        .google-auth {
          margin: 20px 0;
          width: 100%;
        }

        .google-btn {
          width: 100%;
          background-color: #fff;
          border: 1px solid rgba(184, 196, 169, 0.4);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #2d1b1e;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0;
        }

        .google-btn:hover {
          background-color: #f8f9fa;
          border-color: #d97d55;
          box-shadow: 0 2px 8px rgba(217, 125, 85, 0.15);
        }

        .google-logo {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .divider {
          position: relative;
          width: 100%;
          margin: 20px 0;
          text-align: center;
          display: flex;
          align-items: center;
        }

        .divider::before,
        .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background-color: rgba(184, 196, 169, 0.4);
        }

        .divider span {
          background-color: rgba(244, 233, 215, 1);
          padding: 0 15px;
          color: #5a4d3a;
          font-size: 12px;
          font-weight: bold;
          position: relative;
          z-index: 1;
          text-transform: uppercase;
        }

        .toggle-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: all 0.6s ease-in-out;
          border-radius: 150px 0 0 100px;
          z-index: 1000;
        }

        .auth-container.active .toggle-container {
          transform: translateX(-100%);
          border-radius: 0 150px 100px 0;
        }

        .toggle {
          background: linear-gradient(
            135deg,
            #d97d55 0%,
            #6fa4af 50%,
            #b8c4a9 100%
          );
          height: 100%;
          color: #fff;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: all 0.6s ease-in-out;
        }

        .auth-container.active .toggle {
          transform: translateX(50%);
        }

        .toggle-panel {
          position: absolute;
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 30px;
          text-align: center;
          top: 0;
          transform: translateX(0);
          transition: all 0.6s ease-in-out;
        }

        .toggle-left {
          transform: translateX(-200%);
        }

        .auth-container.active .toggle-left {
          transform: translateX(0);
        }

        .toggle-right {
          right: 0;
          transform: translateX(0);
        }

        .auth-container.active .toggle-right {
          transform: translateX(200%);
        }

        h1 {
          margin-bottom: 10px;
        }

        .drivex-logo {
          font-family: "New Rocker", cursive;
          font-size: 2.5rem;
          font-weight: bold;
          color: rgba(244, 233, 215, 0.95);
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          margin: 10px 0 15px 0;
          letter-spacing: 2px;
        }
      `}</style>
    </div>
  );
}
