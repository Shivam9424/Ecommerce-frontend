import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Pagination from "../../components/Pagination";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = { page, size: 10 };
    if (keyword) params.keyword = keyword;

    api.get("/api/admin/products", { params })
      .then((res) => {
        setProducts(res.data.content);
        setTotalPages(res.data.totalPages);
      })
      .catch((err) => {
        if (!err.response) setError("Cannot reach the server. Is the backend running?");
        else if (err.response.status === 403 || err.response.status === 401)
          setError("Access denied. Please log in again as an admin.");
        else setError("Could not load products.");
      })
      .finally(() => setLoading(false));
  }, [page, keyword, reloadKey]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(keywordInput.trim());
  };

  const hideProduct = async (p) => {
    if (!window.confirm(`Hide "${p.name}"? Customers will no longer see it.`)) return;
    setBusyId(p.id);
    setError("");
    setMessage("");
    try {
      await api.delete(`/api/admin/products/${p.id}`);
      setMessage(`"${p.name}" is now hidden.`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.error || "Could not hide the product.");
    } finally {
      setBusyId(null);
    }
  };

  const restoreProduct = async (p) => {
    setBusyId(p.id);
    setError("");
    setMessage("");
    try {
      await api.put(`/api/admin/products/${p.id}/restore`);
      setMessage(`"${p.name}" is visible again.`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(err.response?.data?.error || "Could not restore the product.");
    } finally {
      setBusyId(null);
    }
  };

  const money = (n) => "₹" + Number(n).toLocaleString("en-IN");

  return (
    <div className="container">
      <h2>Manage Products</h2>

      <div className="admin-bar">
        <form onSubmit={handleSearch}>
          <input
            placeholder="Search by name..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
          <button className="btn-sm" type="submit">Search</button>
        </form>
        <Link to="/admin/products/new" className="btn-sm green">+ Add product</Link>
      </div>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      {loading && <div className="center">Loading...</div>}

      {!loading && !error && products.length === 0 && (
        <div className="center">No products found.</div>
      )}

      {products.length > 0 && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Category</th><th>Price</th>
                <th>Stock</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.active ? "" : "hidden-row"}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.categoryName}</td>
                  <td>{money(p.price)}</td>
                  <td>{p.stockQuantity}</td>
                  <td>
                    <span className={`badge ${p.active ? "ACTIVE" : "HIDDEN"}`}>
                      {p.active ? "ACTIVE" : "HIDDEN"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={`/admin/products/${p.id}/edit`} className="btn-sm grey">Edit</Link>
                      {p.active ? (
                        <button className="btn-sm red" onClick={() => hideProduct(p)} disabled={busyId === p.id}>
                          Hide
                        </button>
                      ) : (
                        <button className="btn-sm green" onClick={() => restoreProduct(p)} disabled={busyId === p.id}>
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}