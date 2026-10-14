import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import logoImg from "../assets/logo.jpg";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineSparkles,
} from "react-icons/hi";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      toast.success("Welcome to Volta!");
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
          <h1 className="auth-title">Open Volta Account</h1>
          <p className="auth-subtitle">Institutional double-entry ledger & multi-account banking</p>
        </div>

        <div className="auth-badges-row">
          <span className="auth-pill"><HiOutlineShieldCheck /> Zero-Trust</span>
          <span className="auth-pill"><HiOutlineLightningBolt /> Instant Setup</span>
          <span className="auth-pill"><HiOutlineSparkles /> Free ₹ Demo Faucet</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <div className="input-field-wrapper">
              <HiOutlineUser className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Alex Morgan"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-field-wrapper">
              <HiOutlineMail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="alex@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password (Minimum 8 Characters)</label>
            <div className="input-field-wrapper">
              <HiOutlineLockClosed className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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
                Create Account <HiOutlineArrowRight />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
