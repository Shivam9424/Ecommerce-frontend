import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/useAuth";

export default function ProductDetails() {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [productResult, setProductResult] = useState({
    id: null,
    product: null,
    error: "",
  });
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [adding, setAdding] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const loading = productResult.id !== id;
  const product = loading ? null : productResult.product;
  const error = loading ? "" : productResult.error;

  useEffect(() => {
    let active = true;

    api.get(`/api/products/${id}`)
      .then((res) => {
        if (active) {
          setProductResult({ id, product: res.data, error: "" });
        }
      })
      .catch((err) => {
        if (active) {
          const error =
            err.response?.status === 404
              ? "Product not found."
              : err.response
                ? "Could not load the product."
                : "Cannot reach the server.";
          setProductResult({ id, product: null, error });
        }
      })
    return () => {
      active = false;
    };
  }, [id]);

  const handleAdd = async () => {
    setMessage("");
    setActionError("");

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setAdding(true);
    try {
      await api.post("/api/cart/items", {
        productId: product.id,
        quantity: Math.min(quantity, product.stockQuantity),
      });
      setMessage("Added to cart.");
    } catch (err) {
      setActionError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not add to cart.",
      );
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="center">Loading...</div>;
  if (!product) {
    return (
      <div className="container">
        <div className="error">{error || "Product not found."}</div>
        <Link to="/">Back to products</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <p><Link to="/">← Back to products</Link></p>

      <div className="details">
        <div className="img-box">
          {product.imageUrl && !imgFailed ? (
            <img src={product.imageUrl} alt={product.name} onError={() => setImgFailed(true)} />
          ) : (
            <div className="img-placeholder">No image</div>
          )}
        </div>

        <div className="info">
          <div className="category">{product.categoryName}</div>
          <h2>{product.name}</h2>
          <div className="price" style={{ fontSize: 22 }}>
            ₹{Number(product.price).toLocaleString("en-IN")}
          </div>
          <p>{product.description}</p>
          <p>
            {product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : <span className="out">Out of stock</span>}
          </p>

          {message && <div className="success">{message} <Link to="/cart">View cart</Link></div>}
          {actionError && <div className="error">{actionError}</div>}

          {product.stockQuantity > 0 && (
            <div className="qty">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                max={product.stockQuantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
              <button className="add-btn" onClick={handleAdd} disabled={adding}>
                {adding ? "Adding..." : "Add to cart"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}