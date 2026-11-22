import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/register", form);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      if (!err.response) {
        setError("Cannot reach the server. Is the backend running?");
      } else {
        setError(err.response.data?.error || "Registration failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Create account</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn" disabled={loading}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      <p className="muted">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}