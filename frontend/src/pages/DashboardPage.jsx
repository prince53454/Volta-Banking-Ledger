import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAccounts, createAccount, getAccountBalance } from "../api/accounts";
import { createTransaction, getTransactions, depositFunds } from "../api/transactions";
import toast from "react-hot-toast";
import logoImg from "../assets/logo.jpg";
import cardHeroImg from "../assets/card-hero.jpg";
import {
  HiOutlinePlusCircle,
  HiOutlineCash,
  HiOutlineLogout,
  HiOutlineRefresh,
  HiOutlineSwitchHorizontal,
  HiOutlineCreditCard,
  HiOutlineChartBar,
  HiOutlineShieldCheck,
  HiOutlineClipboardCopy,
  HiOutlineCheck,
  HiOutlineArrowDown,
  HiOutlineArrowUp,
  HiOutlineLockClosed,
  HiOutlineUserCircle,
  HiOutlineDatabase,
  HiOutlineSparkles,
  HiOutlineLightningBolt,
  HiOutlineWifi
} from "react-icons/hi";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active navigation tab: 'dashboard' | 'transfer' | 'accounts' | 'security'
  const [activeTab, setActiveTab] = useState("dashboard");

  // State
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Transfer form state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
  });
  const [transferring, setTransferring] = useState(false);

  // Deposit faucet state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositForm, setDepositForm] = useState({
    accountId: "",
    amount: "1000",
  });
  const [depositing, setDepositing] = useState(false);

  // Fetch accounts, balances, and transactions
  const loadAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      // 1. Accounts
      const accData = await getAccounts();
      const loadedAccounts = accData.accounts || [];
      setAccounts(loadedAccounts);

      // 2. Balances
      const balanceMap = {};
      await Promise.all(
        loadedAccounts.map(async (acc) => {
          try {
            const balRes = await getAccountBalance(acc._id);
            balanceMap[acc._id] = balRes.balance;
          } catch {
            balanceMap[acc._id] = 0;
          }
        })
      );
      setBalances(balanceMap);

      // 3. Transactions
      try {
        const txnData = await getTransactions();
        setTransactions(txnData.transactions || []);
      } catch (err) {
        console.warn("Could not load transactions:", err.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load ledger data");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Copy account ID to clipboard
  function handleCopy(id) {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Account ID copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  }

  // Create new account
  async function handleCreateAccount() {
    setCreatingAccount(true);
    try {
      await createAccount();
      toast.success("New ledger account created!");
      await loadAllData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreatingAccount(false);
    }
  }

  // Process money transfer
  async function handleTransfer(e) {
    e.preventDefault();
    if (!transferForm.fromAccount || !transferForm.toAccount || !transferForm.amount) {
      toast.error("Please fill in fromAccount, toAccount, and amount");
      return;
    }
    if (transferForm.fromAccount === transferForm.toAccount) {
      toast.error("Sender and recipient account cannot be the same");
      return;
    }
    if (Number(transferForm.amount) <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    setTransferring(true);
    try {
      const idempotencyKey = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await createTransaction({
        fromAccount: transferForm.fromAccount,
        toAccount: transferForm.toAccount,
        amount: Number(transferForm.amount),
        idempotencyKey,
      });

      toast.success("Transfer processed successfully!");
      setTransferForm({ fromAccount: "", toAccount: "", amount: "" });
      setShowTransferModal(false);
      await loadAllData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTransferring(false);
    }
  }

  // Process Deposit / Faucet
  async function handleDeposit(e) {
    e.preventDefault();
    if (!depositForm.accountId || !depositForm.amount || Number(depositForm.amount) <= 0) {
      toast.error("Select an account and enter a positive amount");
      return;
    }

    setDepositing(true);
    try {
      await depositFunds({
        accountId: depositForm.accountId,
        amount: Number(depositForm.amount),
      });
      toast.success(`Deposited ₹${depositForm.amount} successfully!`);
      setShowDepositModal(false);
      await loadAllData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDepositing(false);
    }
  }

  // Logout
  async function handleLogout() {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    }
  }

  const totalBalance = Object.values(balances).reduce((sum, b) => sum + (b || 0), 0);

  return (
    <div className="dashboard-page">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logoImg} alt="Volta" className="sidebar-logo-img" />
          <div className="sidebar-logo-text">
            <span className="brand-title">VOLTA</span>
            <span className="brand-badge">CAPITAL</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <HiOutlineChartBar />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${activeTab === "transfer" ? "active" : ""}`}
            onClick={() => setActiveTab("transfer")}
          >
            <HiOutlineSwitchHorizontal />
            <span>Transfer</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${activeTab === "accounts" ? "active" : ""}`}
            onClick={() => setActiveTab("accounts")}
          >
            <HiOutlineCreditCard />
            <span>Accounts</span>
          </button>

          <button
            type="button"
            className={`sidebar-link ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <HiOutlineShieldCheck />
            <span>Security</span>
          </button>
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <HiOutlineLogout />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content View */}
      <main className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div>
            <h1 className="dashboard-greeting">
              Welcome back, <span>{user?.name || "User"}</span>
            </h1>
            <p className="dashboard-subtitle">
              {activeTab === "dashboard" && "Volta Institutional Double-Entry Ledger & Multi-Account Overview"}
              {activeTab === "transfer" && "Execute peer-to-peer ledger transfers with idempotency protection"}
              {activeTab === "accounts" && "Manage your registered bank accounts and ledger entries"}
              {activeTab === "security" && "Identity, zero-trust authorization and audit ledger integrity"}
            </p>
          </div>
          <div className="topbar-actions" style={{ alignItems: "center" }}>
            <div className="topbar-user-pill">
              <div className="user-avatar-circle">
                {user?.name ? user.name[0].toUpperCase() : "U"}
                <span className="user-online-dot"></span>
              </div>
              <div className="user-pill-info">
                <span className="user-pill-name">{user?.name || "User"}</span>
                <span className="user-pill-role">Verified</span>
              </div>
            </div>
            <button className="btn-icon" onClick={loadAllData} title="Refresh All Data">
              <HiOutlineRefresh />
            </button>
          </div>
        </header>

        {/* ==============================
            TAB 1: DASHBOARD
            ============================== */}
        {activeTab === "dashboard" && (
          <section className="tab-pane">
            {/* Hero Spotlight Card */}
            <div className="hero-spotlight-card">
              <div className="hero-content-left">
                <span className="hero-tag">
                  <HiOutlineSparkles /> Aurora Platinum Ledger
                </span>
                <h2 className="hero-title">Institutional Wealth &amp; Settlement</h2>
                <p className="hero-desc">
                  Double-entry accounting with real-time aggregation and atomic ACID multi-account transfers.
                </p>
                <div className="hero-actions">
                  <button
                    className="action-btn action-btn-primary"
                    onClick={() => {
                      if (accounts.length > 0 && !transferForm.fromAccount) {
                        setTransferForm((prev) => ({ ...prev, fromAccount: accounts[0]._id }));
                      }
                      setShowTransferModal(true);
                    }}
                  >
                    <HiOutlineSwitchHorizontal /> Instant Transfer
                  </button>
                  <button
                    className="action-btn action-btn-secondary"
                    onClick={() => {
                      if (accounts.length > 0 && !depositForm.accountId) {
                        setDepositForm((prev) => ({ ...prev, accountId: accounts[0]._id }));
                      }
                      setShowDepositModal(true);
                    }}
                  >
                    <HiOutlineArrowDown /> Faucet Deposit
                  </button>
                </div>
              </div>
              <div className="hero-visual-right">
                <img
                  src={cardHeroImg}
                  alt="Volta Aurora Card"
                  className="hero-card-img"
                />
              </div>
            </div>
            {/* Stat Cards */}
            <div className="stats-grid">
              <div className="stat-card stat-card-primary">
                <div className="stat-card-top">
                  <span className="stat-label">Total Balance</span>
                  <HiOutlineCash className="stat-icon" />
                </div>
                <p className="stat-value">
                  ₹{totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="stat-sub">Across {accounts.length} active account{accounts.length !== 1 ? "s" : ""}</p>
              </div>

              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Total Accounts</span>
                  <HiOutlineCreditCard className="stat-icon" />
                </div>
                <p className="stat-value">{accounts.length}</p>
                <p className="stat-sub">{accounts.filter(a => a.status === "ACTIVE").length} Active</p>
              </div>

              <div className="stat-card">
                <div className="stat-card-top">
                  <span className="stat-label">Transactions</span>
                  <HiOutlineSwitchHorizontal className="stat-icon" />
                </div>
                <p className="stat-value">{transactions.length}</p>
                <p className="stat-sub">Recorded in Immutable Ledger</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-actions">
              <button
                className="action-btn action-btn-primary"
                onClick={handleCreateAccount}
                disabled={creatingAccount}
              >
                <HiOutlinePlusCircle />
                {creatingAccount ? "Creating..." : "New Account"}
              </button>
              <button
                className="action-btn action-btn-secondary"
                onClick={() => {
                  if (accounts.length > 0 && !transferForm.fromAccount) {
                    setTransferForm((prev) => ({ ...prev, fromAccount: accounts[0]._id }));
                  }
                  setShowTransferModal(true);
                }}
              >
                <HiOutlineSwitchHorizontal />
                Send Money
              </button>
              <button
                className="action-btn action-btn-secondary"
                onClick={() => {
                  if (accounts.length > 0 && !depositForm.accountId) {
                    setDepositForm((prev) => ({ ...prev, accountId: accounts[0]._id }));
                  }
                  setShowDepositModal(true);
                }}
              >
                <HiOutlineArrowDown />
                Deposit / Add Funds
              </button>
            </div>

            {/* Accounts Preview */}
            <div className="accounts-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 className="section-title" style={{ margin: 0 }}>Your Accounts</h2>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--accent-violet)", cursor: "pointer", fontWeight: "600" }}
                  onClick={() => setActiveTab("accounts")}
                >
                  View All &rarr;
                </button>
              </div>

              {loadingData ? (
                <div className="accounts-loading"><div className="spinner"></div></div>
              ) : accounts.length === 0 ? (
                <div className="empty-state">
                  <HiOutlineCreditCard className="empty-icon" />
                  <h3>No accounts found</h3>
                  <p>Create your first ledger account to start transacting</p>
                  <button className="action-btn action-btn-primary" onClick={handleCreateAccount}>
                    <HiOutlinePlusCircle /> Create Account
                  </button>
                </div>
              ) : (
                <div className="accounts-grid">
                  {accounts.slice(0, 3).map((acc, idx) => (
                    <div key={acc._id} className={`account-card account-card-${idx % 3}`}>
                      <div className="account-card-header">
                        <span className={`account-status status-${acc.status.toLowerCase()}`}>
                          {acc.status}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <HiOutlineWifi style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.45)", transform: "rotate(90deg)" }} />
                          <span className="account-currency">{acc.currency}</span>
                        </div>
                      </div>
                      <div className="card-emv-chip"></div>
                      <p className="account-balance">
                        ₹{balances[acc._id] != null ? balances[acc._id].toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span className="account-id" style={{ margin: 0 }}>
                          ID: •••• {acc._id.slice(-6).toUpperCase()}
                        </span>
                        <button
                          type="button"
                          className="copy-pill"
                          onClick={() => handleCopy(acc._id)}
                          title="Copy Full ID"
                        >
                          {copiedId === acc._id ? <HiOutlineCheck color="#10b981" /> : <HiOutlineClipboardCopy />}
                          {copiedId === acc._id ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <p className="account-date">
                        Created {new Date(acc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions Preview */}
            <div style={{ marginTop: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h2 className="section-title" style={{ margin: 0 }}>Recent Activity</h2>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--accent-violet)", cursor: "pointer", fontWeight: "600" }}
                  onClick={() => setActiveTab("transfer")}
                >
                  View All &rarr;
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="empty-state" style={{ padding: "30px 20px" }}>
                  <HiOutlineSwitchHorizontal className="empty-icon" style={{ fontSize: "32px", marginBottom: "8px" }} />
                  <p>No transactions recorded yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>From Account</th>
                        <th>To Account</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(0, 5).map((txn) => {
                        const isSender = accounts.some((a) => a._id === txn.fromAccount);
                        const isReceiver = accounts.some((a) => a._id === txn.toAccount);
                        return (
                          <tr key={txn._id}>
                            <td>{new Date(txn.createdAt).toLocaleDateString()} {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                            <td>
                              {isSender && isReceiver ? (
                                <span style={{ color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <HiOutlineSwitchHorizontal /> Internal
                                </span>
                              ) : isSender ? (
                                <span style={{ color: "var(--accent-rose)", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <HiOutlineArrowUp /> Debit
                                </span>
                              ) : (
                                <span style={{ color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <HiOutlineArrowDown /> Credit
                                </span>
                              )}
                            </td>
                            <td>
                              <span className="copy-pill" onClick={() => handleCopy(txn.fromAccount)}>
                                •••• {txn.fromAccount?.slice(-6).toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <span className="copy-pill" onClick={() => handleCopy(txn.toAccount)}>
                                •••• {txn.toAccount?.slice(-6).toUpperCase()}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>
                              ₹{txn.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                            <td>
                              <span className={`badge badge-${txn.status.toLowerCase()}`}>
                                {txn.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==============================
            TAB 2: TRANSFER
            ============================== */}
        {activeTab === "transfer" && (
          <section className="tab-pane">
            {/* Direct Faucet Box */}
            <div className="deposit-box">
              <div className="deposit-info">
                <h3>Need funds to test transfers?</h3>
                <p>Deposit test currency directly into any of your active accounts instantly.</p>
              </div>
              <button
                className="action-btn action-btn-primary"
                onClick={() => {
                  if (accounts.length > 0) {
                    setDepositForm((p) => ({ ...p, accountId: accounts[0]._id }));
                  }
                  setShowDepositModal(true);
                }}
              >
                <HiOutlineArrowDown /> Add Demo Funds
              </button>
            </div>

            {/* Transfer Card Form */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-lg)", padding: "28px", marginBottom: "32px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <HiOutlineSwitchHorizontal color="var(--accent-violet)" />
                Initiate New Ledger Transfer
              </h2>

              <form onSubmit={handleTransfer} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", alignItems: "flex-end" }}>
                <div className="input-group">
                  <label>Sender Account (From)</label>
                  <select
                    name="fromAccount"
                    value={transferForm.fromAccount}
                    onChange={(e) => setTransferForm({ ...transferForm, fromAccount: e.target.value })}
                  >
                    <option value="">Select source account</option>
                    {accounts.filter(a => a.status === "ACTIVE").map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        •••• {acc._id.slice(-6).toUpperCase()} (₹{(balances[acc._id] || 0).toLocaleString("en-IN")})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Recipient Account ID (To)</label>
                  <input
                    type="text"
                    placeholder="Recipient 24-char ObjectId"
                    value={transferForm.toAccount}
                    onChange={(e) => setTransferForm({ ...transferForm, toAccount: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="auth-btn"
                    style={{ margin: 0, height: "48px" }}
                    disabled={transferring}
                  >
                    {transferring ? <span className="btn-spinner"></span> : "Execute Transfer"}
                  </button>
                </div>
              </form>
            </div>

            {/* Complete Transaction History */}
            <div>
              <h2 className="section-title">All Immutable Ledger Transactions</h2>
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <HiOutlineSwitchHorizontal className="empty-icon" />
                  <h3>No transactions recorded yet</h3>
                  <p>Execute your first transfer to record entries in the MongoDB Ledger</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Date & Time</th>
                        <th>From Account</th>
                        <th>To Account</th>
                        <th>Amount</th>
                        <th>Idempotency Key</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => (
                        <tr key={txn._id}>
                          <td>
                            <span className="copy-pill" onClick={() => handleCopy(txn._id)}>
                              •••• {txn._id.slice(-6).toUpperCase()}
                            </span>
                          </td>
                          <td>{new Date(txn.createdAt).toLocaleString()}</td>
                          <td>
                            <span className="copy-pill" onClick={() => handleCopy(txn.fromAccount)}>
                              {txn.fromAccount?.slice(0, 8)}...{txn.fromAccount?.slice(-6)}
                            </span>
                          </td>
                          <td>
                            <span className="copy-pill" onClick={() => handleCopy(txn.toAccount)}>
                              {txn.toAccount?.slice(0, 8)}...{txn.toAccount?.slice(-6)}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                            ₹{txn.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--text-muted)" }}>
                            {txn.idempotencyKey}
                          </td>
                          <td>
                            <span className={`badge badge-${txn.status.toLowerCase()}`}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ==============================
            TAB 3: ACCOUNTS
            ============================== */}
        {activeTab === "accounts" && (
          <section className="tab-pane">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>Registered Bank Accounts</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                  Each account maintains an independent, double-entry balance ledger.
                </p>
              </div>

              <button
                className="action-btn action-btn-primary"
                onClick={handleCreateAccount}
                disabled={creatingAccount}
              >
                <HiOutlinePlusCircle />
                {creatingAccount ? "Creating..." : "Add New Account"}
              </button>
            </div>

            {loadingData ? (
              <div className="accounts-loading"><div className="spinner"></div></div>
            ) : accounts.length === 0 ? (
              <div className="empty-state">
                <HiOutlineCreditCard className="empty-icon" />
                <h3>No accounts found</h3>
                <p>Create an account to begin using Ledger</p>
                <button className="action-btn action-btn-primary" onClick={handleCreateAccount}>
                  <HiOutlinePlusCircle /> Create Account
                </button>
              </div>
            ) : (
              <div className="accounts-grid">
                {accounts.map((acc, idx) => (
                  <div key={acc._id} className={`account-card account-card-${idx % 3}`}>
                    <div className="account-card-header">
                      <span className={`account-status status-${acc.status.toLowerCase()}`}>
                        {acc.status}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <HiOutlineWifi style={{ fontSize: "18px", color: "rgba(255, 255, 255, 0.45)", transform: "rotate(90deg)" }} />
                        <span className="account-currency">{acc.currency}</span>
                      </div>
                    </div>
                    <div className="card-emv-chip"></div>
                    <p className="account-balance">
                      ₹{balances[acc._id] != null ? balances[acc._id].toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "0.00"}
                    </p>

                    <div style={{ marginBottom: "14px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                        ACCOUNT ID
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "13px", color: "var(--text-secondary)" }}>
                          {acc._id}
                        </span>
                        <button
                          type="button"
                          className="copy-pill"
                          onClick={() => handleCopy(acc._id)}
                        >
                          {copiedId === acc._id ? <HiOutlineCheck color="#10b981" /> : <HiOutlineClipboardCopy />}
                          {copiedId === acc._id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <p className="account-date" style={{ marginBottom: "16px" }}>
                      Opened: {new Date(acc.createdAt).toLocaleDateString()}
                    </p>

                    {/* Card Actions */}
                    <div style={{ display: "flex", gap: "8px", position: "relative", zIndex: 1 }}>
                      <button
                        type="button"
                        className="btn-cancel"
                        style={{ padding: "8px 12px", fontSize: "12px" }}
                        onClick={() => {
                          setTransferForm({ fromAccount: acc._id, toAccount: "", amount: "" });
                          setShowTransferModal(true);
                        }}
                      >
                        Send From Here
                      </button>
                      <button
                        type="button"
                        className="btn-cancel"
                        style={{ padding: "8px 12px", fontSize: "12px", borderColor: "rgba(16, 185, 129, 0.3)", color: "var(--accent-emerald)" }}
                        onClick={() => {
                          setDepositForm({ accountId: acc._id, amount: "1000" });
                          setShowDepositModal(true);
                        }}
                      >
                        Deposit ₹
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ==============================
            TAB 4: SECURITY
            ============================== */}
        {activeTab === "security" && (
          <section className="tab-pane">
            <h2 className="section-title">Identity & Security Center</h2>

            <div className="security-grid">
              {/* Profile details */}
              <div className="security-card">
                <h3><HiOutlineUserCircle /> User Identity</h3>
                <div className="security-list">
                  <div className="security-row">
                    <span className="security-label">Full Name</span>
                    <span className="security-val">{user?.name || "N/A"}</span>
                  </div>
                  <div className="security-row">
                    <span className="security-label">Email Address</span>
                    <span className="security-val">{user?.email || "N/A"}</span>
                  </div>
                  <div className="security-row">
                    <span className="security-label">User ID</span>
                    <span className="security-val">
                      <span className="copy-pill" onClick={() => handleCopy(user?._id)}>
                        {user?._id || "N/A"}
                      </span>
                    </span>
                  </div>
                  <div className="security-row">
                    <span className="security-label">Account Role</span>
                    <span className="badge badge-completed">STANDARD USER</span>
                  </div>
                </div>
              </div>

              {/* Session Security */}
              <div className="security-card">
                <h3><HiOutlineLockClosed /> Session & Authentication</h3>
                <div className="security-list">
                  <div className="security-row">
                    <span className="security-label">Auth Protocol</span>
                    <span className="security-val">JWT (JSON Web Token)</span>
                  </div>
                  <div className="security-row">
                    <span className="security-label">Storage Mechanism</span>
                    <span className="security-val">HttpOnly Cookie + Bearer</span>
                  </div>
                  <div className="security-row">
                    <span className="security-label">Token Invalidation</span>
                    <span className="security-val">Active Blacklist Table</span>
                  </div>
                  <div className="security-row">
                    <span className="security-label">Token Expiration</span>
                    <span className="security-val">3 Days Rolling</span>
                  </div>
                </div>
              </div>

              {/* Ledger Architecture */}
              <div className="security-card">
                <h3><HiOutlineDatabase /> Double-Entry Ledger Protection</h3>
                <div className="security-list">
                  <div className="security-row">
                    <span className="security-label">ACID Transactions</span>
                    <span className="badge badge-completed">ENABLED</span>
                  </div>
                  <div className="security-row">
                    <span className="security-label">Idempotency Guard</span>
                    <span className="badge badge-completed">UNIQUE KEY ENFORCED</span>
                  </div>
                  <div className="security-row">
                    <span className="security-label">Ledger Immutability</span>
                    <span className="badge badge-completed">DELETE/UPDATE PROHIBITED</span>
                  </div>
                  <div className="security-row">
                    <span className="security-label">Password Hash</span>
                    <span className="security-val">Bcrypt (Salt Rounds: 10)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <div style={{ marginTop: "32px", display: "flex", gap: "16px" }}>
              <button
                className="action-btn"
                style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--accent-rose)", border: "1px solid rgba(244, 63, 94, 0.3)" }}
                onClick={handleLogout}
              >
                <HiOutlineLogout /> Invalidate Session & Sign Out
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ==============================
          MODAL: SEND MONEY
          ============================== */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">
              <HiOutlineSwitchHorizontal /> Send Money
            </h2>
            <form onSubmit={handleTransfer} className="transfer-form">
              <div className="input-group">
                <label>From Account</label>
                <select
                  name="fromAccount"
                  value={transferForm.fromAccount}
                  onChange={(e) => setTransferForm({ ...transferForm, fromAccount: e.target.value })}
                >
                  <option value="">Select source account</option>
                  {accounts
                    .filter((a) => a.status === "ACTIVE")
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        •••• {acc._id.slice(-6).toUpperCase()} — ₹
                        {balances[acc._id] != null ? balances[acc._id].toLocaleString("en-IN") : "0.00"}
                      </option>
                    ))}
                </select>
              </div>

              <div className="input-group">
                <label>Recipient Account ID</label>
                <input
                  type="text"
                  placeholder="Paste 24-character Account ID"
                  value={transferForm.toAccount}
                  onChange={(e) => setTransferForm({ ...transferForm, toAccount: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                />
                <div className="quick-amounts">
                  {[500, 1000, 2500, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className="amount-chip"
                      onClick={() => setTransferForm((prev) => ({ ...prev, amount: val.toString() }))}
                    >
                      ₹{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowTransferModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="auth-btn"
                  disabled={transferring}
                >
                  {transferring ? <span className="btn-spinner"></span> : "Send Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================
          MODAL: DEPOSIT / FAUCET
          ============================== */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{ color: "var(--accent-emerald)" }}>
              <HiOutlineArrowDown /> Deposit Test Funds
            </h2>
            <form onSubmit={handleDeposit} className="transfer-form">
              <div className="input-group">
                <label>Target Account</label>
                <select
                  value={depositForm.accountId}
                  onChange={(e) => setDepositForm({ ...depositForm, accountId: e.target.value })}
                >
                  <option value="">Select target account</option>
                  {accounts
                    .filter((a) => a.status === "ACTIVE")
                    .map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        •••• {acc._id.slice(-6).toUpperCase()} (Current: ₹{(balances[acc._id] || 0).toLocaleString("en-IN")})
                      </option>
                    ))}
                </select>
              </div>

              <div className="input-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1000"
                  value={depositForm.amount}
                  onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                />
                <div className="quick-amounts">
                  {[1000, 5000, 10000, 25000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      className="amount-chip"
                      onClick={() => setDepositForm((prev) => ({ ...prev, amount: val.toString() }))}
                    >
                      +₹{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowDepositModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="auth-btn"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)" }}
                  disabled={depositing}
                >
                  {depositing ? <span className="btn-spinner"></span> : "Deposit Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
