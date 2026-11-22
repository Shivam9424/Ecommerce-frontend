import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const empty = {
  name: "", description: "", price: "", stockQuantity: "", imageUrl: "", categoryId: "",
};

export default function ProductForm() {
  const { id } = useParams();           // present only when editing
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [catMessage, setCatMessage] = useState("");

  useEffect(() => {
    api.get("/api/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/admin/products/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description || "",
          price: String(p.price),
          stockQuantity: String(p.stockQuantity),
          imageUrl: p.imageUrl || "",
          categoryId: String(p.categoryId ?? ""),
        });
      })
      .catch((err) => {
        setError(err.response?.status === 404 ? "Product not found." : "Could not load the product.");
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setCatMessage("");
    try {
      const res = await api.post("/api/admin/categories", { name });
      setCategories([...categories, res.data]);
      setForm({ ...form, categoryId: String(res.data.id) });
      setNewCategory("");
      setCatMessage(`Category "${res.data.name}" added.`);
    } catch (err) {
      setCatMessage(err.response?.status === 409
        ? "That category already exists."
        : "Could not add the category.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    const stock = Number(form.stockQuantity);

    if (!form.name.trim()) return setError("Name is required.");
    if (form.price === "" || isNaN(price) || price < 0) return setError("Enter a valid price.");
    if (form.stockQuantity === "" || !Number.isInteger(stock) || stock < 0)
      return setError("Stock must be a whole number, 0 or more.");
    if (!form.categoryId) return setError("Please choose a category.");

    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stockQuantity: stock,
      imageUrl: form.imageUrl.trim(),
      categoryId: Number(form.categoryId),
    };

    setSaving(true);
    try {
      if (isEdit) await api.put(`/api/admin/products/${id}`, body);
      else await api.post("/api/admin/products", body);
      navigate("/admin/products");
    } catch (err) {
      if (!err.response) setError("Cannot reach the server. Is the backend running?");
      else if (err.response.status === 403 || err.response.status === 401)
        setError("Access denied. Please log in again as an admin.");
      else setError(err.response.data?.error || "Could not save the product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="center">Loading...</div>;

  return (
    <div className="container">
      <div className="form-card">
        <h2>{isEdit ? "Edit product" : "Add product"}</h2>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>

          <div className="row2">
            <div className="field">
              <label>Price (₹)</label>
              <input type="number" step="0.01" min="0" name="price"
                     value={form.price} onChange={handleChange} required />
            </div>
            <div className="field">
              <label>Stock quantity</label>
              <input type="number" min="0" step="1" name="stockQuantity"
                     value={form.stockQuantity} onChange={handleChange} required />
            </div>
          </div>

          <div className="field">
            <label>Image URL (optional)</label>
            <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
          </div>

          <div className="field">
            <label>Category</label>
            <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="inline-add">
              <input
                placeholder="Or add a new category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button type="button" className="btn-sm grey" onClick={addCategory}>Add</button>
            </div>
            {catMessage && <div className="muted" style={{ textAlign: "left" }}>{catMessage}</div>}
          </div>

          <div className="form-actions">
            <button className="btn" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Add product"}
            </button>
            <Link to="/admin/products" className="btn-sm grey" style={{ alignSelf: "center" }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}