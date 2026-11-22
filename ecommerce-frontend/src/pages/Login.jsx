import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);
      const { token, role } = res.data ?? {};

      if (typeof token !== "string" || token.length === 0) {
        setError("The server response did not include an authentication token.");
        return;
      }

      login(token, role);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (!err.response) {
        setError("Cannot reach the server. Is the backend running?");
      } else if (status === 401 || status === 403) {
        setError("Invalid email or password");
      } else {
        setError(
          err.response.data?.error ||
            err.response.data?.message ||
            "Something went wrong. Try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Login</h2>

      {location.state?.registered && (
        <div className="success">Registered successfully. Please login.</div>
      )}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="muted">
        New here? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}