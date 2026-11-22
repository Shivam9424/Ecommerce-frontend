import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleError = (err, fallback) => {
    if (!err.response) {
      setError("Cannot reach the server. Is the backend running?");
    } else if (err.response.status === 401 || err.response.status === 403) {
      logout();
      navigate("/login");
    } else {
      setError(err.response.data?.error || fallback);
    }
  };

  useEffect(() => {
    api.get("/api/cart")
      .then((res) => setCart(res.data))
      .catch((err) => handleError(err, "Could not load your cart."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (address.trim().length < 10) {
      setError("Please enter your full shipping address (at least 10 characters).");
      return;
    }

    setPlacing(true);
    try {
      const res = await api.post("/api/orders", { shippingAddress: address.trim() });
      navigate("/orders", { state: { placedOrderId: res.data.id } });
    } catch (err) {
      handleError(err, "Could not place the order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const money = (n) => "₹" + Number(n).toLocaleString("en-IN");

  if (loading) return <div className="center">Loading...</div>;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container center">
        {error && <div className="error">{error}</div>}
        <p>Your cart is empty, so there is nothing to check out.</p>
        <Link to="/">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Checkout</h2>
      {error && <div className="error">{error}</div>}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={placeOrder}>
          <h3>Shipping address</h3>
          <textarea
            placeholder="House no, street, city, state, PIN code"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={500}
            required
          />
          <p className="muted" style={{ textAlign: "left" }}>
            Payment is not part of this demo. Placing the order saves it without charging anything.
          </p>
          <button className="btn" disabled={placing}>
            {placing ? "Placing order..." : "Place order"}
          </button>
          <p className="muted"><Link to="/cart">← Back to cart</Link></p>
        </form>

        <div className="cart-summary">
          <h3>Order summary</h3>
          {cart.items.map((item) => (
            <div className="item-line" key={item.itemId}>
              <span>{item.productName} × {item.quantity}</span>
              <span>{money(item.subtotal)}</span>
            </div>
          ))}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{money(cart.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}