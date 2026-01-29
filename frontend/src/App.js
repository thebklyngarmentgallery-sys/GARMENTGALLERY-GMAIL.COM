import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ShoppingBag, Menu, X, Instagram, Twitter, ChevronRight, Plus, Edit2, Trash2, LogOut, Upload, Image } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Brand Assets
const LOGO_URL = "https://customer-assets.emergentagent.com/job_bklyn-garment/artifacts/1r1tm1n1_Screenshot_20260118_214108_Text%20on%20Video%20%281%29.png";

// ============ NAVBAR ============
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" data-testid="nav-logo">
          <img src={LOGO_URL} alt="The Bklyn Garment Gallery" />
        </Link>
        
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/shop" onClick={() => setMenuOpen(false)} data-testid="nav-shop">Shop</Link>
          <Link to="/lookbook" onClick={() => setMenuOpen(false)} data-testid="nav-lookbook">Lookbook</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} data-testid="nav-about">About</Link>
        </div>

        <div className="nav-actions">
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} data-testid="menu-toggle">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

// ============ FOOTER ============
const Footer = () => (
  <footer className="footer" data-testid="footer">
    <div className="footer-container">
      <div className="footer-brand">
        <img src={LOGO_URL} alt="The Bklyn Garment Gallery" className="footer-logo" />
        <p>Unisex streetwear for the culture.<br />Born in Brooklyn, shipped worldwide.</p>
      </div>
      <div className="footer-links">
        <h4>Shop</h4>
        <Link to="/shop?category=tees">Tees</Link>
        <Link to="/shop?category=hoodies">Hoodies</Link>
        <Link to="/shop?category=sweats">Sweats</Link>
        <Link to="/shop?category=hats">Hats</Link>
      </div>
      <div className="footer-links">
        <h4>Info</h4>
        <Link to="/about">About Us</Link>
        <Link to="/lookbook">Lookbook</Link>
        <Link to="/admin">Admin</Link>
      </div>
      <div className="footer-social">
        <h4>Follow Us</h4>
        <div className="social-icons">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram size={20} /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter size={20} /></a>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>&copy; 2020-{new Date().getFullYear()} The Bklyn Garment Gallery. All rights reserved.</p>
    </div>
  </footer>
);

// ============ HOME PAGE ============
const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featuredRes, newRes] = await Promise.all([
        axios.get(`${API}/products?featured=true`),
        axios.get(`${API}/products?new_arrival=true`)
      ]);
      setFeaturedProducts(featuredRes.data.slice(0, 4));
      setNewArrivals(newRes.data.slice(0, 4));
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  };

  return (
    <div className="home" data-testid="home-page">
      {/* Hero Section */}
      <section className="hero" data-testid="hero-section">
        <div className="hero-content">
          <img src={LOGO_URL} alt="The Bklyn Garment Gallery Est.2020" className="hero-logo" />
          <p className="hero-tagline">Unisex streetwear for the culture. Born in Brooklyn, shipped worldwide.</p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn btn-primary" data-testid="shop-now-btn">Shop Now</Link>
            <Link to="/lookbook" className="btn btn-secondary" data-testid="view-lookbook-btn">View Lookbook</Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="section" data-testid="featured-section">
        <div className="section-header">
          <span className="section-label">Collection</span>
          <h2>Featured</h2>
          <Link to="/shop" className="view-all">View All <ChevronRight size={16} /></Link>
        </div>
        <div className="product-grid">
          {featuredProducts.length > 0 ? featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          )) : (
            <p className="no-products">No featured products yet. Add some from the admin panel!</p>
          )}
        </div>
      </section>

      {/* Made to Order Section */}
      <section className="mto-section" data-testid="mto-section">
        <div className="mto-content">
          <h2>MADE TO ORDER</h2>
          <p>Every piece is printed fresh in Brooklyn by our partners at <strong>Aesthetic BK</strong>.</p>
          <p className="mto-time">7-10 days print time + shipping worldwide</p>
          <Link to="/shop" className="btn btn-primary">Shop Collection</Link>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="section" data-testid="new-arrivals-section">
        <div className="section-header">
          <span className="section-label">Just Dropped</span>
          <h2>New Arrivals</h2>
          <Link to="/shop" className="view-all">View All <ChevronRight size={16} /></Link>
        </div>
        <div className="product-grid">
          {newArrivals.length > 0 ? newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          )) : (
            <p className="no-products">No new arrivals yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story-section" data-testid="story-section">
        <div className="story-image">
          <img src="https://images.unsplash.com/photo-1602152427184-7ab78e93fb63?w=800" alt="Brooklyn streetwear" />
        </div>
        <div className="story-content">
          <span className="section-label">Our Story</span>
          <h2>Born in Brooklyn</h2>
          <p>The Bklyn Garment Gallery was founded in 2020 with a simple mission: create high-quality, unisex streetwear that celebrates the raw energy and creativity of Brooklyn's diverse culture.</p>
          <Link to="/about" className="btn btn-secondary">Learn More</Link>
        </div>
      </section>
    </div>
  );
};

// ============ PRODUCT CARD ============
const ProductCard = ({ product }) => (
  <Link to={`/product/${product.id}`} className="product-card" data-testid={`product-card-${product.id}`}>
    <div className="product-image">
      <img src={product.image_url} alt={product.name} />
      {product.new_arrival && <span className="badge new">New</span>}
    </div>
    <div className="product-info">
      <h3>{product.name}</h3>
      <p className="product-category">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
    </div>
  </Link>
);

// ============ SHOP PAGE ============
const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/categories`)
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data.categories);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="shop-page" data-testid="shop-page">
      <div className="shop-header">
        <h1>Shop All</h1>
        <p>Premium streetwear, made to order in Brooklyn</p>
      </div>

      <div className="category-filter" data-testid="category-filter">
        <button 
          className={activeCategory === "all" ? "active" : ""} 
          onClick={() => setActiveCategory("all")}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={activeCategory === cat.id ? "active" : ""}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="product-grid large">
          {filteredProducts.length > 0 ? filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          )) : (
            <p className="no-products">No products in this category yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ============ PRODUCT DETAIL PAGE ============
const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API}/products/${id}`);
      setProduct(res.data);
      if (res.data.sizes?.length > 0) {
        setSelectedSize(res.data.sizes[0]);
      }
    } catch (e) {
      console.error("Error fetching product:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!product) return <div className="not-found">Product not found</div>;

  return (
    <div className="product-detail" data-testid="product-detail-page">
      <div className="product-detail-image">
        <img src={product.image_url} alt={product.name} />
      </div>
      <div className="product-detail-info">
        <span className="product-category-label">{product.category}</span>
        <h1>{product.name}</h1>
        <p className="product-detail-price">${product.price.toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
        
        {product.sizes?.length > 0 && (
          <div className="size-selector">
            <label>Size</label>
            <div className="size-options">
              {product.sizes.map(size => (
                <button 
                  key={size}
                  className={selectedSize === size ? "active" : ""}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn btn-primary btn-large" data-testid="add-to-cart-btn">
          <ShoppingBag size={20} /> Add to Cart
        </button>

        <div className="product-meta">
          <p><strong>Made to Order</strong> - 7-10 days print time</p>
          <p>Printed in Brooklyn by Aesthetic BK</p>
        </div>
      </div>
    </div>
  );
};

// ============ LOOKBOOK PAGE ============
const Lookbook = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLookbook();
  }, []);

  const fetchLookbook = async () => {
    try {
      const res = await axios.get(`${API}/lookbook`);
      setItems(res.data);
    } catch (e) {
      console.error("Error fetching lookbook:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lookbook-page" data-testid="lookbook-page">
      <div className="page-header">
        <h1>Lookbook</h1>
        <p>Style inspiration from the streets of Brooklyn</p>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : items.length > 0 ? (
        <div className="lookbook-grid">
          {items.map(item => (
            <div key={item.id} className="lookbook-item" data-testid={`lookbook-item-${item.id}`}>
              <img src={item.image_url} alt={item.title} />
              <div className="lookbook-overlay">
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-content">Lookbook coming soon. Check back for style inspiration!</p>
      )}
    </div>
  );
};

// ============ ABOUT PAGE ============
const About = () => (
  <div className="about-page" data-testid="about-page">
    <div className="page-header">
      <h1>About Us</h1>
    </div>

    <div className="about-content">
      <div className="about-image">
        <img src={LOGO_URL} alt="The Bklyn Garment Gallery" />
      </div>
      <div className="about-text">
        <h2>Born in Brooklyn</h2>
        <p>The Bklyn Garment Gallery was established in 2020. Our brand has been cultivated by the culture, and vibe of Brooklyn, and New York City.</p>
        <p>We have artistic and original Garments that stand out in any environment. Pull up and experience Grand style.</p>
        
        <h3>Made to Order</h3>
        <p>Every piece is printed fresh in Brooklyn by our partners at <strong>Aesthetic BK</strong>. This means:</p>
        <ul>
          <li>No waste - we only make what you order</li>
          <li>Fresh prints every time</li>
          <li>7-10 days print time + worldwide shipping</li>
        </ul>

        <h3>The Culture</h3>
        <p>Unisex streetwear for the culture. We celebrate the raw energy and creativity of Brooklyn's diverse community through every piece we create.</p>
      </div>
    </div>
  </div>
);

// ============ ADMIN LOGIN ============
const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/admin/login`, { username, password });
      localStorage.setItem("adminToken", res.data.token);
      onLogin();
    } catch (e) {
      setError(e.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login" data-testid="admin-login">
      <div className="login-card">
        <img src={LOGO_URL} alt="Logo" className="login-logo" />
        <h2>Admin Login</h2>
        {error && <p className="error-message" data-testid="login-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              data-testid="username-input"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              data-testid="password-input"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} data-testid="login-submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============ ADMIN DASHBOARD ============
const AdminDashboard = ({ onLogout }) => {
  const [products, setProducts] = useState([]);
  const [lookbook, setLookbook] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showLookbookForm, setShowLookbookForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, lookbookRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/lookbook`)
      ]);
      setProducts(productsRes.data);
      setLookbook(lookbookRes.data);
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, { headers });
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      alert("Error deleting product");
    }
  };

  const handleDeleteLookbook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lookbook item?")) return;
    try {
      await axios.delete(`${API}/lookbook/${id}`, { headers });
      setLookbook(lookbook.filter(l => l.id !== id));
    } catch (e) {
      alert("Error deleting lookbook item");
    }
  };

  return (
    <div className="admin-dashboard" data-testid="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={onLogout} className="btn btn-secondary" data-testid="logout-btn">
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === "products" ? "active" : ""} 
          onClick={() => setActiveTab("products")}
          data-testid="products-tab"
        >
          Products ({products.length})
        </button>
        <button 
          className={activeTab === "lookbook" ? "active" : ""} 
          onClick={() => setActiveTab("lookbook")}
          data-testid="lookbook-tab"
        >
          Lookbook ({lookbook.length})
        </button>
      </div>

      {activeTab === "products" && (
        <div className="admin-section">
          <div className="section-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
              data-testid="add-product-btn"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>

          {showProductForm && (
            <ProductForm 
              product={editingProduct}
              onClose={() => { setShowProductForm(false); setEditingProduct(null); }}
              onSave={() => { fetchData(); setShowProductForm(false); setEditingProduct(null); }}
              headers={headers}
            />
          )}

          <div className="admin-grid">
            {products.map(product => (
              <div key={product.id} className="admin-card" data-testid={`admin-product-${product.id}`}>
                <img src={product.image_url} alt={product.name} />
                <div className="admin-card-info">
                  <h3>{product.name}</h3>
                  <p>{product.category} - ${product.price.toFixed(2)}</p>
                  <div className="admin-card-badges">
                    {product.featured && <span className="badge">Featured</span>}
                    {product.new_arrival && <span className="badge new">New</span>}
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button onClick={() => { setEditingProduct(product); setShowProductForm(true); }} data-testid={`edit-product-${product.id}`}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="delete" data-testid={`delete-product-${product.id}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "lookbook" && (
        <div className="admin-section">
          <div className="section-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowLookbookForm(true)}
              data-testid="add-lookbook-btn"
            >
              <Plus size={16} /> Add Lookbook Image
            </button>
          </div>

          {showLookbookForm && (
            <LookbookForm 
              onClose={() => setShowLookbookForm(false)}
              onSave={() => { fetchData(); setShowLookbookForm(false); }}
              headers={headers}
            />
          )}

          <div className="admin-grid lookbook">
            {lookbook.map(item => (
              <div key={item.id} className="admin-card lookbook" data-testid={`admin-lookbook-${item.id}`}>
                <img src={item.image_url} alt={item.title} />
                <div className="admin-card-info">
                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}
                </div>
                <div className="admin-card-actions">
                  <button onClick={() => handleDeleteLookbook(item.id)} className="delete" data-testid={`delete-lookbook-${item.id}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============ PRODUCT FORM ============
const ProductForm = ({ product, onClose, onSave, headers }) => {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    category: product?.category || "tees",
    image_url: product?.image_url || "",
    sizes: product?.sizes?.join(", ") || "S, M, L, XL, XXL",
    featured: product?.featured || false,
    new_arrival: product?.new_arrival || false,
    in_stock: product?.in_stock ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...form,
      price: parseFloat(form.price),
      sizes: form.sizes.split(",").map(s => s.trim()).filter(Boolean)
    };

    try {
      if (product) {
        await axios.put(`${API}/products/${product.id}`, data, { headers });
      } else {
        await axios.post(`${API}/products`, data, { headers });
      }
      onSave();
    } catch (e) {
      alert("Error saving product: " + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="product-form-modal">
      <div className="modal">
        <div className="modal-header">
          <h2>{product ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                required
                data-testid="product-name-input"
              />
            </div>
            <div className="form-group">
              <label>Price *</label>
              <input 
                type="number" 
                step="0.01"
                value={form.price} 
                onChange={(e) => setForm({...form, price: e.target.value})}
                required
                data-testid="product-price-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({...form, description: e.target.value})}
              required
              data-testid="product-description-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select 
                value={form.category} 
                onChange={(e) => setForm({...form, category: e.target.value})}
                data-testid="product-category-select"
              >
                <option value="tees">Tees</option>
                <option value="hoodies">Hoodies</option>
                <option value="sweats">Sweats</option>
                <option value="hats">Hats</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sizes (comma separated)</label>
              <input 
                type="text" 
                value={form.sizes} 
                onChange={(e) => setForm({...form, sizes: e.target.value})}
                data-testid="product-sizes-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL *</label>
            <input 
              type="url" 
              value={form.image_url} 
              onChange={(e) => setForm({...form, image_url: e.target.value})}
              placeholder="https://..."
              required
              data-testid="product-image-input"
            />
            {form.image_url && (
              <div className="image-preview">
                <img src={form.image_url} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-checkboxes">
            <label>
              <input 
                type="checkbox" 
                checked={form.featured}
                onChange={(e) => setForm({...form, featured: e.target.checked})}
                data-testid="product-featured-checkbox"
              />
              Featured Product
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={form.new_arrival}
                onChange={(e) => setForm({...form, new_arrival: e.target.checked})}
                data-testid="product-new-arrival-checkbox"
              />
              New Arrival
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={form.in_stock}
                onChange={(e) => setForm({...form, in_stock: e.target.checked})}
                data-testid="product-in-stock-checkbox"
              />
              In Stock
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} data-testid="save-product-btn">
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============ LOOKBOOK FORM ============
const LookbookForm = ({ onClose, onSave, headers }) => {
  const [form, setForm] = useState({
    title: "",
    image_url: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/lookbook`, form, { headers });
      onSave();
    } catch (e) {
      alert("Error saving lookbook item: " + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" data-testid="lookbook-form-modal">
      <div className="modal">
        <div className="modal-header">
          <h2>Add Lookbook Image</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input 
              type="text" 
              value={form.title} 
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
              data-testid="lookbook-title-input"
            />
          </div>

          <div className="form-group">
            <label>Image URL *</label>
            <input 
              type="url" 
              value={form.image_url} 
              onChange={(e) => setForm({...form, image_url: e.target.value})}
              placeholder="https://..."
              required
              data-testid="lookbook-image-input"
            />
            {form.image_url && (
              <div className="image-preview">
                <img src={form.image_url} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({...form, description: e.target.value})}
              data-testid="lookbook-description-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} data-testid="save-lookbook-btn">
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============ ADMIN PAGE WRAPPER ============
const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setChecking(false);
      return;
    }

    try {
      await axios.get(`${API}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAuthenticated(true);
    } catch (e) {
      localStorage.removeItem("adminToken");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
  };

  if (checking) return <div className="loading">Loading...</div>;

  return isAuthenticated ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  );
};

// ============ MAIN APP ============
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={
            <>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/lookbook" element={<Lookbook />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
