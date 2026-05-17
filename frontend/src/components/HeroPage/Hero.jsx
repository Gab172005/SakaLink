import { useState, useEffect, useRef } from "react";
import { useProducts } from "../../features/useProducts";
import AnimatedCounter from "../common/AnimatedCounter";
import "./Hero.css";

function SkeletonCard() {
  return (
    <div className="product-card card-loading">
      <div className="card-image-container skeleton-img" />
      <div className="card-body">
        <div className="card-name skeleton-line" style={{ width: "80%" }}>&nbsp;</div>
        <div className="card-origin skeleton-line" style={{ width: "55%", height: "11px" }}>&nbsp;</div>
        <div className="card-price skeleton-line" style={{ width: "40%", marginTop: "10px" }}>&nbsp;</div>
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const unit = product.unit || "kg";

  //gets everything after the " / " (e.g., "CALABARZON").
  const regionName = product.region?.split(" / ")[1] || product.region
  const defaultImage = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80";

  return (  
    <div className="product-card">
      <div className="card-image-container">
        <img 
          src={product.image || defaultImage} 
          alt={product.name} 
          className="card-image"
          onError={(e) => { e.target.src = defaultImage; }}
        />
      </div>
      <div className="card-body">
        <div className="card-name">{product.name}</div>
        <div className="card-origin">{regionName}</div>
        <div className="card-price">₱{product.price} / {unit}</div>
      </div>
    </div>
  );
}

export default function Hero({ openModal }) {
  const { products, loading } = useProducts({ sortBy: "name", order: "asc" });
  const [displayProducts, setDisplayProducts] = useState([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const trackRef = useRef(null);

  //randomize the products shown on the hero page
  useEffect(() => {
    if (!products || products.length === 0) return;

    //copies the array then sorts randomly depending if positive or not
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    ///... is the spread operator, which creates a copy of our array
    setDisplayProducts(shuffled);
    setCarouselIdx(0); 
  }, [products]);

  const slide = (dir) => {
    const max = Math.max(0, displayProducts.length - 3);
    setCarouselIdx((prev) => Math.max(0, Math.min(prev + dir, max)));
  };

  useEffect(() => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector(".product-card");
    if (!card) return;
    const cardW = card.offsetWidth;
    const gap = 16;
    trackRef.current.style.transform = `translateX(-${carouselIdx * (cardW + gap)}px)`;
  }, [carouselIdx, displayProducts, loading]);

  return (
    <section className="hero">
      <div className="hero-left">
        <h1 className="hero-tagline">
          Fresh from the<br />
          <span className="highlight">Farm</span>, Direct<br />
          to your Table
        </h1>
        <div className="hero-buttons">
          <a
            className="btn btn-primary"
            href="#"
            onClick={(e) => { e.preventDefault(); openModal("login"); }}
          >
            Login
          </a>
          <a
            className="btn btn-secondary"
            href="#"
            onClick={(e) => { e.preventDefault(); openModal("signup"); }}
          >
            Sign Up
          </a>
        </div>
        <div className="hero-stats">
          <div>
            <div className="stat-value">
              <AnimatedCounter target={1200} suffix="+" />
            </div>
            <div className="stat-label">Verified Farmers</div>
          </div>
          <div>
            <div className="stat-value">
              <AnimatedCounter target={300} suffix="+" />
            </div>
            <div className="stat-label">Product Types</div>
          </div>
          <div>
            <div className="stat-value">
              <AnimatedCounter target={48} suffix="hr" />
            </div>
            <div className="stat-label">Farm to Door</div>
          </div>
        </div>
      </div>

      <div className="hero-right">
        <button className="carousel-btn" onClick={() => slide(-1)}>&#8592;</button>
        <div className="carousel-wrapper">
          <div className="carousel-track" ref={trackRef}>
            {loading
              ? [0, 1, 2].map((i) => <SkeletonCard key={i} />)
              : displayProducts.map((p, i) => <ProductCard key={p._id || i} product={p} index={i} />)
            }
          </div>
        </div>
        <button className="carousel-btn" onClick={() => slide(1)}>&#8594;</button>
      </div>
    </section>
  );
}