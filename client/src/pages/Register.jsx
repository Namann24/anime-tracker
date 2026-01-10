import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import SagaButton from "../components/common/SagaButton";
import SagaInput from "../components/common/SagaInput";
import SagaLogo from "../components/common/SagaLogo";

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await registerUser({ username, email, password });
      navigate("/login", {
        state: {
          message: "Legacy established! You may now access the archive.",
          type: "success"
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Legacy inception failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent relative overflow-hidden px-4 transition-colors duration-500">

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[var(--saga-surface)]/80 backdrop-blur-xl border border-[var(--saga-border)] rounded-[40px] shadow-2xl p-8 md:p-12 animate-in fade-in zoom-in duration-700">

          {/* Logo & Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6 scale-125">
              <SagaLogo />
            </div>
            <h2 className="text-shonen-bold text-4xl text-[var(--saga-text)] mb-3 uppercase tracking-tighter">
              Create <span className="text-red-600">Legacy</span>
            </h2>
            <div className="inline-block border border-[var(--saga-border)] bg-[var(--saga-bg)]/50 rounded px-2 py-0.5 mb-3">
              <span className="text-[9px] font-black uppercase text-[var(--saga-text-dim)] tracking-[0.2em] relative top-px">New Protocol // Initiation</span>
            </div>
            <p className="text-[var(--saga-text-dim)] text-sm italic">
              "Begin your chronicle within the halls of the archive."
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-8 p-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <div className="w-1 h-4 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--saga-text-dim)] uppercase tracking-[0.2em] ml-1">Warrior Name</label>
              <SagaInput
                placeholder="legend_soul"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="!bg-[var(--saga-background)]/50 !text-[var(--saga-text)] !placeholder-[var(--saga-text-dim)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--saga-text-dim)] uppercase tracking-[0.2em] ml-1">Archive Identity</label>
              <SagaInput
                type="email"
                placeholder="legend@saga.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="!bg-[var(--saga-background)]/50 !text-[var(--saga-text)] !placeholder-[var(--saga-text-dim)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--saga-text-dim)] uppercase tracking-[0.2em] ml-1">Access Cipher</label>
              <SagaInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="!bg-[var(--saga-background)]/50 !text-[var(--saga-text)] !placeholder-[var(--saga-text-dim)]"
              />
            </div>

            <SagaButton
              type="submit"
              variant="primary"
              full
              disabled={isLoading}
              className="py-5"
            >
              {isLoading ? "Forging Legacy..." : "Join the Saga →"}
            </SagaButton>
          </form>

          <div className="mt-12 text-center text-[10px] font-bold text-[var(--saga-text-dim)] uppercase tracking-widest">
            Already have a legacy?{" "}
            <Link to="/login" className="text-[var(--saga-text)] hover:text-red-500 transition-colors hover:underline underline-offset-8">
              Portal Access
            </Link>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="flex flex-col items-center mt-12 gap-3">
          <div className="w-8 h-[1px] bg-[var(--saga-border)]"></div>
          <p className="text-[var(--saga-text-dim)] text-[10px] font-black uppercase tracking-[0.4em]">
            SAGA ARCHIVE • {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
