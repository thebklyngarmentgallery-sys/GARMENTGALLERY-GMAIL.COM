import React, { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Menu, X, Instagram, Twitter, ArrowRight, Plus, Edit2, Trash2, LogOut, Filter, ChevronDown, Play } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Brand Assets
const LION_LOGO = "https://customer-assets.emergentagent.com/job_brooklyn-apparel/artifacts/52egaafw_Screenshot_20260127_224900_Motionleap.png";
const STORE_BG = "https://customer-assets.emergentagent.com/job_brooklyn-apparel/artifacts/6by5inuw_Screenshot_20260127_230855_DuckDuckGo.jpg";
const BROOKLYN_STREET_BG = "https://customer-assets.emergentagent.com/job_brooklyn-apparel/artifacts/dcdmq9v9_Screenshot_20260127_230834_DuckDuckGo.jpg";
const BROOKLYN_STREET_SCENE = "https://customer-assets.emergentagent.com/job_brooklyn-apparel/artifacts/qw30zhxq_Screenshot_20260127_230606_DuckDuckGo.jpg";

// ============ NAVBAR ============
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar" data-testid="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" data-testid="nav-logo">
          <img src={LION_LOGO} alt="The Bklyn Garment Gallery" />
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
        <img src={LION_LOGO} alt="The Bklyn Garment Gallery" className="footer-logo" />
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
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchVideos();
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

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API}/videos`);
      setVideos(res.data.slice(0, 4));
    } catch (e) {
      console.error("Error fetching videos:", e);
    }
  };

  return (
    <div className="home" data-testid="home-page">
      {/* Hero Section */}
      <section className="hero" data-testid="hero-section" style={{backgroundImage: `url(${STORE_BG})`}}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <img src={LION_LOGO} alt="The Bklyn Garment Gallery Est.2020" className="hero-logo" />
          <p className="hero-tagline">Unisex streetwear for the culture. Born in Brooklyn, shipped worldwide.</p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn btn-primary" data-testid="shop-now-btn">
              SHOP NOW <ArrowRight size={18} />
            </Link>
            <Link to="/lookbook" className="btn btn-outline" data-testid="view-lookbook-btn">
              VIEW LOOKBOOK
            </Link>
          </div>
          <div className="scroll-indicator">
            <ChevronDown size={24} />
          </div>
        </div>
      </section>

      {/* Made to Order Section - Brooklyn Street */}
      <section className="mto-hero" data-testid="mto-section" style={{backgroundImage: `url(${BROOKLYN_STREET_BG})`}}>
        <div className="mto-overlay"></div>
        <div className="mto-hero-content">
          <h2>MADE TO ORDER</h2>
          <p className="mto-description">Every piece is printed fresh in Brooklyn by our partners at Aesthetic BK.</p>
          <p className="mto-time">7-10 days print time + shipping worldwide</p>
          <Link to="/shop" className="btn btn-primary">SHOP COLLECTION</Link>
        </div>
      </section>

      {/* Video Showcase Section */}
      <section className="video-section" data-testid="video-section">
        <div className="section-header center">
          <span className="section-label yellow">SEE IT IN ACTION</span>
          <h2>THE CULTURE</h2>
        </div>
        <div className="video-grid">
          {videos.length > 0 ? videos.map(video => (
            <VideoPlayer 
              key={video.id}
              videoUrl={video.video_url} 
              title={video.title}
            />
          )) : (
            <>
              <div className="video-placeholder">
                <Play size={48} />
                <p>Add videos from admin panel</p>
              </div>
              <div className="video-placeholder">
                <Play size={48} />
                <p>Add videos from admin panel</p>
              </div>
            </>
          )}
        </div>
        <p className="video-caption">Street style. Brooklyn made. Culture driven.</p>
      </section>

      {/* Just Dropped Section */}
      <section className="section dark" data-testid="new-arrivals-section">
        <div className="section-header">
          <span className="section-label yellow">JUST DROPPED</span>
          <h2>New Arrivals</h2>
        </div>
        <div className="product-grid">
          {newArrivals.length > 0 ? newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          )) : (
            <p className="no-products">No new arrivals yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Worldwide Made to Order Details */}
      <section className="mto-details" data-testid="mto-details">
        <span className="section-label red">WORLDWIDE</span>
        <h2>MADE TO ORDER</h2>
        <p className="mto-text">Every garment is printed fresh when you order. We partner with Aesthetic BK, a local Brooklyn print house, to ensure the highest quality on every piece.</p>
        <ul className="mto-list">
          <li>7-10 days print time</li>
          <li>Printed in Brooklyn by Aesthetic BK</li>
          <li>Worldwide shipping available</li>
        </ul>
        <Link to="/shop" className="btn btn-primary">SHOP NOW <ArrowRight size={18} /></Link>
      </section>

      {/* Connect With Us Section */}
      <section className="connect-section" data-testid="connect-section">
        <span className="section-label red">GET IN TOUCH</span>
        <h2>CONNECT WITH US</h2>
        <p className="connect-text">Have questions? We'd love to hear from you. Reach out to our team.</p>
        <a href="mailto:hello@bklyngarment.com" className="email-link">hello@bklyngarment.com</a>
      </section>

      {/* Brooklyn Street Scene */}
      <section className="brooklyn-scene" data-testid="brooklyn-scene">
        <p className="brooklyn-quote">We believe in quality over quantity, craftsmanship over trends, and community over competition.</p>
        <p className="brooklyn-subtext">Born in Brooklyn. Made for anyone, anywhere in the world.</p>
        <div className="brooklyn-image">
          <img src={BROOKLYN_STREET_SCENE} alt="Brooklyn Street Scene" />
        </div>
      </section>
    </div>
  );
};

// ============ VIDEO PLAYER ============
const VideoPlayer = ({ videoUrl, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Convert YouTube URL to embed format if needed
  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="video-player" data-testid="video-player">
      {!isPlaying ? (
        <div className="video-thumbnail" onClick={() => setIsPlaying(true)}>
          <div className="play-button">
            <Play size={48} fill="white" />
          </div>
          <p className="video-title">{title}</p>
        </div>
      ) : (
        <iframe
          src={`${getEmbedUrl(videoUrl)}?autoplay=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
};

// ============ PRODUCT CARD ============
const ProductCard = ({ product }) => (
  <Link to={`/product/${product.id}`} className="product-card" data-testid={`product-card-${product.id}`}>
    <div className="product-image">
      <img src={product.image_url} alt={product.name} />
      {product.new_arrival && <span className="badge-new">NEW</span>}
    </div>
    <div className="product-info">
      <h3>{product.name}</h3>
      <p className="product-price">${product.price.toFixed(2)}</p>
    </div>
  </Link>
);

// ============ SHOP PAGE ============
const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
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

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  return (
    <div className="shop-page" data-testid="shop-page">
      <div className="shop-header">
        <span className="section-label yellow">COLLECTION</span>
        <h1>SHOP</h1>
      </div>

      <div className="shop-controls">
        <button className="filter-btn" onClick={() => setShowFilters(!showFilters)} data-testid="filters-btn">
          <Filter size={18} /> FILTERS
        </button>
        <div className="sort-dropdown">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} data-testid="sort-select">
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel" data-testid="filter-panel">
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
      )}

      <p className="product-count">{sortedProducts.length} products</p>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="product-grid shop-grid">
          {sortedProducts.length > 0 ? sortedProducts.map(product => (
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
        {product.new_arrival && <span className="badge-new">NEW</span>}
      </div>
      <div className="product-detail-info">
        <span className="product-category-label">{product.category.toUpperCase()}</span>
        <h1>{product.name}</h1>
        <p className="product-detail-price">${product.price.toFixed(2)}</p>
        <p className="product-description">{product.description}</p>
        
        {product.sizes?.length > 0 && (
          <div className="size-selector">
            <label>SIZE</label>
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

        <button className="btn btn-primary btn-full" data-testid="add-to-cart-btn">
          ADD TO CART <ArrowRight size={18} />
        </button>

        <div className="product-meta">
          <h4>MADE TO ORDER</h4>
          <ul>
            <li>7-10 days print time</li>
            <li>Printed in Brooklyn by Aesthetic BK</li>
            <li>Worldwide shipping available</li>
          </ul>
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
        <span className="section-label yellow">STYLE</span>
        <h1>LOOKBOOK</h1>
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
      <span className="section-label yellow">OUR STORY</span>
      <h1>ABOUT US</h1>
    </div>

    <div className="about-content">
      <div className="about-image">
        <img src={LION_LOGO} alt="The Bklyn Garment Gallery" />
      </div>
      <div className="about-text">
        <h2>Born in Brooklyn</h2>
        <p>The Bklyn Garment Gallery was established in 2020. Our brand has been cultivated by the culture, and vibe of Brooklyn, and New York City.</p>
        <p>We have artistic and original Garments that stand out in any environment. Pull up and experience Grand style.</p>
        
        <h3>MADE TO ORDER</h3>
        <p>Every garment is printed fresh when you order. We partner with Aesthetic BK, a local Brooklyn print house, to ensure the highest quality on every piece.</p>
        <ul>
          <li>7-10 days print time</li>
          <li>Printed in Brooklyn by Aesthetic BK</li>
          <li>Worldwide shipping available</li>
        </ul>
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
        <img src={LION_LOGO} alt="Logo" className="login-logo" />
        <h2>ADMIN LOGIN</h2>
        {error && <p className="error-message" data-testid="login-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>USERNAME</label>
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
            <label>PASSWORD</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              data-testid="password-input"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} data-testid="login-submit-btn">
            {loading ? "LOGGING IN..." : "LOGIN"}
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
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [showLookbookForm, setShowLookbookForm] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("adminToken");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, lookbookRes, videosRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/lookbook`),
        axios.get(`${API}/videos?active_only=false`)
      ]);
      setProducts(productsRes.data);
      setLookbook(lookbookRes.data);
      setVideos(videosRes.data);
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

  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await axios.delete(`${API}/videos/${id}`, { headers });
      setVideos(videos.filter(v => v.id !== id));
    } catch (e) {
      alert("Error deleting video");
    }
  };

  return (
    <div className="admin-dashboard" data-testid="admin-dashboard">
      <div className="admin-header">
        <img src={LION_LOGO} alt="Logo" className="admin-logo" />
        <h1>ADMIN DASHBOARD</h1>
        <button onClick={onLogout} className="btn btn-outline" data-testid="logout-btn">
          <LogOut size={16} /> LOGOUT
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
          className={activeTab === "videos" ? "active" : ""} 
          onClick={() => setActiveTab("videos")}
          data-testid="videos-tab"
        >
          Videos ({videos.length})
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
              <Plus size={16} /> ADD PRODUCT
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
                {product.new_arrival && <span className="badge-new">NEW</span>}
                <div className="admin-card-info">
                  <h3>{product.name}</h3>
                  <p>{product.category} - ${product.price.toFixed(2)}</p>
                  {product.featured && <span className="badge-featured">Featured</span>}
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
              <Plus size={16} /> ADD LOOKBOOK IMAGE
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

      {activeTab === "videos" && (
        <div className="admin-section">
          <div className="section-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowVideoForm(true)}
              data-testid="add-video-btn"
            >
              <Plus size={16} /> ADD VIDEO
            </button>
          </div>

          {showVideoForm && (
            <VideoForm 
              onClose={() => setShowVideoForm(false)}
              onSave={() => { fetchData(); setShowVideoForm(false); }}
              headers={headers}
            />
          )}

          <div className="admin-grid">
            {videos.map(video => (
              <div key={video.id} className="admin-card video" data-testid={`admin-video-${video.id}`}>
                <div className="video-thumb">
                  <Play size={32} />
                </div>
                <div className="admin-card-info">
                  <h3>{video.title}</h3>
                  <p className="video-url">{video.video_url}</p>
                </div>
                <div className="admin-card-actions">
                  <button onClick={() => handleDeleteVideo(video.id)} className="delete" data-testid={`delete-video-${video.id}`}>
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
          <h2>{product ? "EDIT PRODUCT" : "ADD PRODUCT"}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>NAME *</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                required
                data-testid="product-name-input"
              />
            </div>
            <div className="form-group">
              <label>PRICE *</label>
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
            <label>DESCRIPTION *</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({...form, description: e.target.value})}
              required
              data-testid="product-description-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CATEGORY *</label>
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
              <label>SIZES (comma separated)</label>
              <input 
                type="text" 
                value={form.sizes} 
                onChange={(e) => setForm({...form, sizes: e.target.value})}
                data-testid="product-sizes-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>IMAGE URL *</label>
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
            <button type="button" onClick={onClose} className="btn btn-outline">CANCEL</button>
            <button type="submit" className="btn btn-primary" disabled={loading} data-testid="save-product-btn">
              {loading ? "SAVING..." : "SAVE PRODUCT"}
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
          <h2>ADD LOOKBOOK IMAGE</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>TITLE *</label>
            <input 
              type="text" 
              value={form.title} 
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
              data-testid="lookbook-title-input"
            />
          </div>

          <div className="form-group">
            <label>IMAGE URL *</label>
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
            <label>DESCRIPTION (optional)</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({...form, description: e.target.value})}
              data-testid="lookbook-description-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-outline">CANCEL</button>
            <button type="submit" className="btn btn-primary" disabled={loading} data-testid="save-lookbook-btn">
              {loading ? "SAVING..." : "SAVE"}
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
