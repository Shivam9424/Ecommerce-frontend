import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

// Reads the email from the JWT so the avatar can show its first letter
function getEmail() {
  try {
    const token = localStorage.getItem("token");
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).sub || "";
  } catch {
    return "";
  }
}

export default function Navbar() {
  const { isLoggedIn, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const query = new URLSearchParams(location.search);
  const activeCategory = location.pathname === "/" ? query.get("categoryId") : null;

  useEffect(() => {
    api.get("/api/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  // Keep the search box in step with the URL
  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get("keyword") || "");
  }, [location.search]);

  const loadCount = () => {
    if (!isLoggedIn) {
      setCount(0);
      return;
    }
    api.get("/api/cart")
      .then((res) => setCount(res.data.totalItems))
      .catch(() => setCount(0));
  };

  // Refresh the cart number on every page change and when login state changes
  useEffect(() => {
    loadCount();
    setMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, location.pathname]);

  // Refresh when a product is added from any page
  useEffect(() => {
    window.addEventListener("cart-updated", loadCount);
    return () => window.removeEventListener("cart-updated", loadCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // Close the account menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/?keyword=${encodeURIComponent(q)}` : "/");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = (getEmail()[0] || "U").toUpperCase();

  return (
    <header className="site-nav">
      <div className="site-nav-inner glass">
        <Link to="/" className="brand" aria-label="MyShop home">
          <span className="brand-mark">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l1 13H5L6 7z" />
              <path d="M9 7a3 3 0 016 0" />
            </svg>
          </span>
          MyShop
        </Link>

        <nav className="nav-links" aria-label="Categories">
          {categories.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              to={`/?categoryId=${c.id}`}
              className={activeCategory === String(c.id) ? "active" : ""}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <form className="nav-search" onSubmit={handleSearch} role="search">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search products"
            aria-label="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="nav-actions">
          <Link to="/cart" className="icon-btn" aria-label={`Cart, ${count} items`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.4 11.2a1 1 0 001 .8h8.9a1 1 0 001-.8L20 8H6.2" />
              <circle cx="9.5" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>

          {isLoggedIn ? (
            <div className="menu-wrap" ref={menuRef}>
              <button
                className="avatar"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Account menu"
                aria-expanded={menuOpen}
              >
                {initial}
              </button>
              {menuOpen && (
                <div className="menu">
                  <Link to="/orders">My orders</Link>
                  {role === "ADMIN" && <Link to="/admin/products">Manage products</Link>}
                  <button onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-btn">Log in</Link>
              <Link to="/register" className="nav-btn primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
