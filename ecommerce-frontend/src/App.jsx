import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import AdminProducts from "./pages/admin/AdminProducts";
import ProductForm from "./pages/admin/ProductForm";
import ChatWidget from "./components/ChatWidget";

function NotFound() {
  return (
    <div className="container center">
      <h2>Page not found</h2>
      <Link to="/">Back to products</Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

          <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/products/new" element={<ProtectedRoute adminOnly><ProductForm /></ProtectedRoute>} />
          <Route path="/admin/products/:id/edit" element={<ProtectedRoute adminOnly><ProductForm /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <div className="app">
      <ChatWidget />
      <Footer />
      </div>
    </div>
  );
}
