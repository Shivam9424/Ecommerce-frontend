import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/useAuth";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadedPage, setLoadedPage] = useState(null);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const placedOrderId = location.state?.placedOrderId;
  const loading = loadedPage !== page;

  useEffect(() => {
    let active = true;

    api.get("/api/orders", { params: { page, size: 5 } })
      .then((res) => {
        if (!Array.isArray(res.data?.content) || !Number.isInteger(res.data?.totalPages)) {
          throw new Error("The server returned an invalid orders response.");
        }
        if (active) {
          setOrders(res.data.content);
          setTotalPages(res.data.totalPages);
          setError("");
        }
      })
      .catch((err) => {
        if (!active) return;
        if (!err.response) {
          setError(err.message || "Cannot reach the server. Is the backend running?");
        } else if (err.response.status === 401 || err.response.status === 403) {
          logout();
          navigate("/login");
        } else {
          setError(
            err.response.data?.error ||
              err.response.data?.message ||
              "Could not load your orders.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadedPage(page);
      });

    return () => {
      active = false;
    };
  }, [page, logout, navigate]);

  const changePage = (nextPage) => {
    setError("");
    setPage(nextPage);
  };

  const money = (n) => "₹" + Number(n).toLocaleString("en-IN");
  const formatDate = (d) =>
    new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="container">
      <h2>My Orders</h2>

      {placedOrderId && (
        <div className="success">
          Order #{placedOrderId} placed successfully. Thank you for shopping!
        </div>
      )}
      {error && <div className="error">{error}</div>}
      {loading && <div className="center">Loading...</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="center">
          <p>You have not placed any orders yet.</p>
          <Link to="/">Start shopping</Link>
        </div>
      )}

      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-head">
            <div>
              <b>Order #{order.id}</b>
              <div className="order-meta">{formatDate(order.createdAt)}</div>
            </div>
            <span className={`badge ${order.status}`}>{order.status}</span>
          </div>

          {order.items.map((item, i) => (
            <div className="item-line" key={i}>
              <span>
                <Link to={`/products/${item.productId}`}>{item.productName}</Link>
                {" "}× {item.quantity}
              </span>
              <span>{money(item.subtotal)}</span>
            </div>
          ))}

          <div className="order-meta" style={{ marginTop: 10 }}>
            Ship to: {order.shippingAddress}
          </div>
          <div className="order-total">Total: {money(order.totalAmount)}</div>
        </div>
      ))}

      <Pagination page={page} totalPages={totalPages} onChange={changePage} />
    </div>
  );
}