import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const LOW_STOCK = 5;

export default function ProductCard({ product }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const addToCart = async () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    setError("");
    setAdding(true);
    try {
      await api.post("/api/cart/items", { productId: product.id, quantity: 1 });
      window.dispatchEvent(new Event("cart-updated"));
      setDone(true);
      setTimeout(() => setDone(false), 1500);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) navigate("/login");
      else setError(err.response?.data?.error || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  const outOfStock = product.stockQuantity === 0;
  const lowStock = !outOfStock && product.stockQuantity <= LOW_STOCK;
  const price = "₹" + Number(product.price).toLocaleString("en-IN");

  return (
    <article className="p-card">
      <Link to={`/products/${product.id}`} className="p-img" aria-label={product.name}>
        {product.imageUrl && !imgFailed ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="p-noimg">{product.name.charAt(0).toUpperCase()}</div>
        )}
        {outOfStock && <span className="p-flag out">Out of stock</span>}
        {lowStock && <span className="p-flag">Only {product.stockQuantity} left</span>}
      </Link>

      <div className="p-body">
        <div className="p-cat">{product.categoryName}</div>
        <Link to={`/products/${product.id}`} className="p-name" title={product.name}>
          {product.name}
        </Link>

        <div className="p-row">
          <span className="p-price">{price}</span>
          <button
            className={`add-cart ${done ? "done" : ""}`}
            onClick={addToCart}
            disabled={adding || outOfStock}
          >
            {outOfStock ? "Unavailable" : done ? "Added" : adding ? "Adding..." : "Add to cart"}
          </button>
        </div>
        {error && <div className="p-err" role="alert">{error}</div>}
      </div>
    </article>
  );
}
