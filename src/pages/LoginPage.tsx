import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartyPopper } from "lucide-react";
import { signIn, signUp } from "../services/firebase/auth.service";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      navigate("/parties");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro inesperado.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md border border-slate-200 p-8 space-y-6">
        <div className="flex items-center space-x-3 text-indigo-600">
          <PartyPopper className="h-8 w-8" />
          <h1 className="text-2xl font-extrabold text-slate-800">FestPay</h1>
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 rounded-md transition ${mode === "signin" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-md transition ${mode === "signup" ? "bg-white shadow text-indigo-600" : "text-slate-500"}`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-rose-600 font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {submitting
              ? "Aguarde..."
              : mode === "signup"
                ? "Criar conta"
                : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};
