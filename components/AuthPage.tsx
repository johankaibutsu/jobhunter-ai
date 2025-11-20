import React, { useState } from "react";
import {
  UserCircle,
  ArrowRight,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  CheckCircle,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { supabase } from "../utils/supabaseClient";

interface Props {
  onLogin: () => void; // Just signal success, App will fetch data
  onDemoLogin: () => void; // Handle guest access
}

export const AuthPage: React.FC<Props> = ({ onLogin, onDemoLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    targetRole: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        // Sign In
        const { data, error: authError } =
          await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

        if (authError) throw authError;

        // STRICT CHECK: Ensure email is confirmed even if Supabase returns a session
        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut();
          throw new Error(
            "Please confirm your email address before logging in. Check your inbox.",
          );
        }

        onLogin();
      } else {
        // Sign Up
        const siteUrl =
          (import.meta as any).env.VITE_SITE_URL || window.location.origin;

        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: formData.email,
            password: formData.password,
            options: {
              emailRedirectTo: siteUrl,
              data: {
                full_name: formData.name,
                target_role: formData.targetRole,
              },
            },
          },
        );

        if (authError) throw authError;

        if (
          authData.session &&
          authData.user &&
          !authData.user.email_confirmed_at
        ) {
          await supabase.auth.signOut();
          setSuccessMsg(
            `Account created! We sent a confirmation link to ${formData.email}.`,
          );
          setIsLogin(true);
          setFormData((prev) => ({ ...prev, password: "" }));
          return;
        }

        if (authData.session) {
          onLogin();
        } else {
          setSuccessMsg(
            `Account created! We sent a confirmation link to ${formData.email}.`,
          );
          setIsLogin(true);
          setFormData((prev) => ({ ...prev, password: "" }));
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Authentication failed";
      if (msg.includes("Could not find the table")) {
        msg =
          "Database setup missing. Please run the provided 'supabase_setup.sql' script in your Supabase SQL Editor.";
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-slide-up">
        <div className="bg-slate-900 p-8 text-center">
          <div className="flex justify-center mb-4">
            <UserCircle className="w-12 h-12 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">JobHunter AI</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Your intelligent career copilot
          </p>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-8 bg-slate-100 p-1 rounded-xl">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              onClick={() => {
                setIsLogin(true);
                setError(null);
                setSuccessMsg(null);
              }}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}
              onClick={() => {
                setIsLogin(false);
                setError(null);
                setSuccessMsg(null);
              }}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{" "}
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />{" "}
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <input
                    required={!isLogin}
                    type="text"
                    className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 placeholder-slate-400"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  required
                  type="email"
                  className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 placeholder-slate-400"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  required
                  type="password"
                  className="w-full pl-10 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 placeholder-slate-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}{" "}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={onDemoLogin}
              className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl font-semibold hover:bg-emerald-100 transition-colors flex justify-center items-center gap-2"
            >
              <Sparkles className="w-5 h-5" /> Try Demo Account
            </button>
            <p className="text-xs text-center text-slate-400 mt-2">
              Test all features instantly. No sign up required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
