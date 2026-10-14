import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import logoImg from "../assets/logo.jpg";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
} from "react-icons/hi";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome back to Volta!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-effects">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <img src={logoImg} alt="Volta Shield" className="auth-brand-logo-img" />
            <div className="auth-brand-text">
              <span className="brand-name">VOLTA</span>
              <span className="brand-sub">FINANCIAL TECH</span>
            </div>
          </div>
          <h1 className="auth-title">Welcome to Volta</h1>
          <p className="auth-subtitle">Access your institutional digital ledger & accounts</p>
        </div>

        <div className="auth-badges-row">
          <span className="auth-pill"><HiOutlineShieldCheck /> 256-Bit ACID</span>
          <span className="auth-pill"><HiOutlineLightningBolt /> Instant Settlement</span>
          <span className="auth-pill"><HiOutlineSparkles /> Double-Entry</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-field-wrapper">
              <HiOutlineMail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Security Password</label>
            <div className="input-field-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={submitting}
          >
            {submitting ? (
              <span className="btn-spinner"></span>
            ) : (
              <>
                Access Account <HiOutlineArrowRight />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          New to Volta? <Link to="/register">Open an account</Link>
        </p>
      </div>
    </div>
  );
}
