import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SagaButton from "../components/common/SagaButton";
import SagaInput from "../components/common/SagaInput";
import SagaLogo from "../components/common/SagaLogo";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      setSuccess(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. The archive denies access.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--saga-bg)] relative overflow-hidden px-4 transition-colors duration-500">
      {/* Background Ambience */}
      <div className="absolute inset-0 halftone opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-[var(--saga-surface)]/80 backdrop-blur-xl border border-[var(--saga-border)] rounded-[40px] shadow-2xl p-8 md:p-12 animate-in fade-in zoom-in duration-700">

          {/* Logo & Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6 scale-125">
              <SagaLogo />
            </div>
            <h2 className="text-shonen-bold text-4xl text-[var(--saga-text)] mb-3 uppercase tracking-tighter">
              Welcome <span className="text-red-600">Back</span>
            </h2>
            <p className="text-[var(--saga-text-dim)] text-sm italic">
              "Continue your epic journey through the archive."
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-8 p-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <div className="w-1 h-4 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-green-600/10 border border-green-600/20 text-green-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
              <div className="w-1 h-4 bg-green-600 rounded-full"></div>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
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
              {isLoading ? "Validating..." : "Enter the Saga →"}
            </SagaButton>
          </form>

          <div className="mt-12 text-center text-[10px] font-bold text-[var(--saga-text-dim)] uppercase tracking-widest">
            New to the saga?{" "}
            <Link to="/register" className="text-[var(--saga-text)] hover:text-red-500 transition-colors hover:underline underline-offset-8">
              Create Legacy
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
