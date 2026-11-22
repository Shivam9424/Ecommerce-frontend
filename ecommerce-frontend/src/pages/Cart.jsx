import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null); // item being changed right now
  const { logout } = useAuth();
  const navigate = useNavigate();

  // One place to handle errors from every cart call
  const handleError = useCallback((err, fallback) => {
    if (!err.response) {
      setError("Cannot reach the server. Is the backend running?");
    } else if (err.response.status === 403 || err.response.status === 401) {
      // Token missing or expired: log out and ask the user to login again
      logout();
      navigate("/login");
    } else {
      setError(err.response.data?.error || fallback);
    }
  }, [logout, navigate]);

  useEffect(() => {
    let active = true;

    api.get("/api/cart")
      .then((res) => {
        if (active) setCart(res.data);
      })
      .catch((err) => {
        if (active) handleError(err, "Could not load your cart.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [handleError]);

  const changeQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    setError("");
    setBusyId(item.itemId);
    try {
      const res = await api.put(`/api/cart/items/${item.itemId}`, { quantity: newQty });
      setCart(res.data);
    } catch (err) {
      handleError(err, "Could not update the quantity.");
    } finally {
      setBusyId(null);
    }
  };

  const removeItem = async (item) => {
    setError("");
    setBusyId(item.itemId);
    try {
      const res = await api.delete(`/api/cart/items/${item.itemId}`);
      setCart(res.data);
    } catch (err) {
      handleError(err, "Could not remove the item.");
    } finally {
      setBusyId(null);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Remove all items from your cart?")) return;
    setError("");
    try {
      await api.delete("/api/cart");
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
    } catch (err) {
      handleError(err, "Could not clear the cart.");
    }
  };

  const money = (n) => "₹" + Number(n).toLocaleString("en-IN");

  if (loading) return <div className="center">Loading your cart...</div>;

  return (
    <div className="container">
      <h2>Your Cart</h2>
      {error && <div className="error">{error}</div>}

      {!cart || cart.items.length === 0 ? (
        <div className="center">
          <p>Your cart is empty.</p>
          <Link to="/">Continue shopping</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div className="cart-row" key={item.itemId}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="img-placeholder">No image</div>
                )}

                <div className="cart-info">
                  <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                  <div className="price">{money(item.price)}</div>
                </div>

                <div className="qty-box">
                  <button
                    onClick={() => changeQuantity(item, item.quantity - 1)}
                    disabled={busyId === item.itemId || item.quantity <= 1}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => changeQuantity(item, item.quantity + 1)}
                    disabled={busyId === item.itemId}
                  >
                    +
                  </button>
                </div>

                <div style={{ minWidth: 90, textAlign: "right" }}>
                  <b>{money(item.subtotal)}</b>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeItem(item)}
                  disabled={busyId === item.itemId}
                >
                  Remove
                </button>
              </div>
            ))}

            <button className="remove-btn" onClick={clearCart}>Clear cart</button>
          </div>

          <div className="cart-summary">
            <h3>Order summary</h3>
            <div className="summary-row">
              <span>Items</span>
              <span>{cart.totalItems}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{money(cart.totalAmount)}</span>
            </div>
            <button className="btn" onClick={() => navigate("/checkout")}>
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}