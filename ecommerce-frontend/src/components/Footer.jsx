import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link to="/" className="brand">
            <span className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 7h12l1 13H5L6 7z" />
                <path d="M9 7a3 3 0 016 0" />
              </svg>
            </span>
            MyShop
          </Link>
          <p>
            A full-stack demo store: browse products, fill a cart, and place orders.
          </p>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/">All products</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">My orders</Link></li>
          </ul>
        </div>

        <div>
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Log in</Link></li>
            <li><Link to="/register">Create an account</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-note">
        <span>© {new Date().getFullYear()} MyShop. Demo project, no real payments.</span>
        <span>Built with Spring Boot, React and MySQL</span>
      </div>
    </footer>
  );
}
