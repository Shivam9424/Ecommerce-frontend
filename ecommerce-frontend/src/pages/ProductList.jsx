import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Pagination from "../components/Pagination";

const TILE_CLASSES = ["tile-a", "tile-b", "tile-c"];

function HeroTile({ product, className }) {
  const [failed, setFailed] = useState(false);
  return (
    <Link to={`/products/${product.id}`} className={`tile ${className}`} aria-label={product.name}>
      {product.imageUrl && !failed ? (
        <img src={product.imageUrl} alt={product.name} onError={() => setFailed(true)} />
      ) : (
        <div className="tile-fallback">{product.name.charAt(0).toUpperCase()}</div>
      )}
      <span className="tile-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
    </Link>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="feature">
      <span className="feature-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const categoryId = searchParams.get("categoryId") || "";
  const page = Number(searchParams.get("page") || 0);

  const [sort, setSort] = useState("id,asc");
  const [searchInput, setSearchInput] = useState(keyword);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Change one or more URL params. An empty value removes the param.
  const update = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next);
  };

  useEffect(() => {
    setSearchInput(keyword);
  }, [keyword]);

  useEffect(() => {
    api.get("/api/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const [sortBy, direction] = sort.split(",");
    const params = { page, size: 8, sortBy, direction };
    if (keyword) params.keyword = keyword;
    if (categoryId) params.categoryId = categoryId;

    setLoading(true);
    setError("");
    api.get("/api/products", { params })
      .then((res) => {
        setProducts(res.data.content);
        setPageInfo({
          totalPages: res.data.totalPages,
          totalElements: res.data.totalElements,
        });
      })
      .catch((err) => {
        setError(err.response ? "Could not load products." : "Cannot reach the server. Is the backend running?");
      })
      .finally(() => setLoading(false));
  }, [keyword, categoryId, sort, page]);

  const activeCategory = categories.find((c) => String(c.id) === categoryId);
  const hasFilters = Boolean(keyword || categoryId);
  const isHome = !hasFilters && page === 0;
  const heroProducts = products.slice(0, 3);

  const title = keyword
    ? `Results for “${keyword}”`
    : activeCategory
    ? activeCategory.name
    : "All products";

  const goShopping = () =>
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });

  const clearFilters = () => {
    setSort("id,asc");
    setSearchParams({});
  };

  const submitSearch = (e) => {
    e.preventDefault();
    update({ keyword: searchInput.trim(), page: "" });
  };

  return (
    <>
      {isHome && (
        <section className="hero">
          <div className="hero-panel glass">
            <div className="hero-main">
              <div>
                <h1>Good finds, delivered to your door.</h1>
                <p className="lead">
                  Browse the catalogue, add what you like to your cart, and check out in a few clicks.
                </p>
                <div className="hero-actions">
                  <button className="hero-cta" onClick={goShopping}>Browse products</button>
                  {pageInfo.totalElements > 0 && (
                    <span className="hero-meta">
                      {pageInfo.totalElements} products in {categories.length} categories
                    </span>
                  )}
                </div>
              </div>

              {heroProducts.length > 0 && (
                <div className="collage">
                  {heroProducts.map((p, i) => (
                    <HeroTile key={p.id} product={p} className={TILE_CLASSES[i]} />
                  ))}
                </div>
              )}
            </div>

            <div className="features">
              <Feature
                title="Secure sign-in"
                text="Your account is protected with token-based login."
                icon={
                  <svg {...svgProps}>
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 018 0v3" />
                  </svg>
                }
              />
              <Feature
                title="Live stock"
                text="Quantities are checked every time you add or order."
                icon={
                  <svg {...svgProps}>
                    <path d="M21 8l-9-5-9 5 9 5 9-5z" />
                    <path d="M3 8v8l9 5 9-5V8" />
                  </svg>
                }
              />
              <Feature
                title="Order history"
                text="See every order and its status in one place."
                icon={
                  <svg {...svgProps}>
                    <path d="M9 6h11M9 12h11M9 18h11" />
                    <path d="M4 6h.01M4 12h.01M4 18h.01" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>
      )}

      <section className="shop" id="products">
        <aside className="filters glass" aria-label="Filters">
          <form onSubmit={submitSearch} role="search">
            <h3 className="filter-title">Search</h3>
            <div className="side-search">
              <input
                type="search"
                placeholder="Product name"
                aria-label="Search by product name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" aria-label="Search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </button>
            </div>
          </form>

          <div>
            <h3 className="filter-title">Categories</h3>
            <ul className="cat-list">
              <li>
                <button
                  className="cat-btn"
                  aria-pressed={!categoryId}
                  onClick={() => update({ categoryId: "", page: "" })}
                >
                  All categories
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    className="cat-btn"
                    aria-pressed={String(c.id) === categoryId}
                    onClick={() => update({ categoryId: c.id, page: "" })}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="filter-title">Sort by</h3>
            <select
              className="sort-select"
              aria-label="Sort products"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                update({ page: "" });
              }}
            >
              <option value="id,asc">Default</option>
              <option value="price,asc">Price: low to high</option>
              <option value="price,desc">Price: high to low</option>
              <option value="name,asc">Name: A to Z</option>
            </select>
          </div>

          {(hasFilters || sort !== "id,asc") && (
            <button className="clear-btn" onClick={clearFilters}>Clear all filters</button>
          )}
        </aside>

        <div>
          <div className="results-head">
            <h2>{title}</h2>
            {!loading && !error && (
              <span>
                {pageInfo.totalElements} {pageInfo.totalElements === 1 ? "product" : "products"}
              </span>
            )}
          </div>

          {error && <div className="error" role="alert">{error}</div>}

          {loading && (
            <div className="product-grid" aria-busy="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="skeleton" key={i} />
              ))}
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="empty">
              <h3>No products match your filters</h3>
              <p>Try a different word or choose another category.</p>
              {hasFilters && (
                <button className="btn-sm" onClick={clearFilters}>Clear filters</button>
              )}
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="product-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={pageInfo.totalPages}
            onChange={(p) => update({ page: p === 0 ? "" : p })}
          />
        </div>
      </section>
    </>
  );
}
