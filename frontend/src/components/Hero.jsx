import { useState, useEffect, useRef } from "react";
import { useProducts } from "../hooks/useProducts";
import "./Hero.css";

const CARD_COLORS = ["#a8d672", "#e8828a", "#d4c97a", "#7ac8a8", "#f0a060", "#8ab8e0"];
const CARD_EMOJIS = ["🥬", "🍅", "🌽", "🥕", "🧅", "🍆"];

function SkeletonCard() {
  return (
    <div className="product-card card-loading">
      <div className="card-image-placeholder skeleton-img" />
      <div className="card-body">
        <div className="card-name skeleton-line" style={{ width: "80%" }}>&nbsp;</div>
        <div className="card-origin skeleton-line" style={{ width: "55%", height: "11px" }}>&nbsp;</div>
        <div className="card-price skeleton-line" style={{ width: "40%", marginTop: "10px" }}>&nbsp;</div>
      </div>
    </div>
  );
}

function ProductCard({ product, index }) {
  const unit = product.productType === 2 ? "pc" : "kg";
  const origin = product.productDescription || (product.productType === 1 ? "Crop" : "Poultry");
  return (
    <div className="product-card">
      <div
        className="card-image-placeholder"
        style={{ background: CARD_COLORS[index % CARD_COLORS.length] }}
      >
        <span>{CARD_EMOJIS[index % CARD_EMOJIS.length]}</span>
      </div>
      <div className="card-body">
        <div className="card-name">{product.productName}</div>
        <div className="card-origin">{origin}</div>
        <div className="card-price">₱{product.price} / {unit}</div>
      </div>
    </div>
  );
}

export default function Hero({ openModal }) {
  const { products, loading } = useProducts({ sortBy: "productName", order: "asc" });
  const [carouselIdx, setCarouselIdx] = useState(0);
  const trackRef = useRef(null);

  const slide = (dir) => {
    const max = Math.max(0, products.length - 3);
    setCarouselIdx((prev) => Math.max(0, Math.min(prev + dir, max)));
  };

  useEffect(() => { setCarouselIdx(0); }, [products]);

  useEffect(() => {
    if (!trackRef.current) return;
    const card = trackRef.current.querySelector(".product-card");
    if (!card) return;
    const cardW = card.offsetWidth;
    const gap = 16;
    trackRef.current.style.transform = `translateX(-${carouselIdx * (cardW + gap)}px)`;
  }, [carouselIdx, products, loading]);

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
            <div className="stat-value">1,200+</div>
            <div className="stat-label">Verified Farmers</div>
          </div>
          <div>
            <div className="stat-value">300+</div>
            <div className="stat-label">Product Types</div>
          </div>
          <div>
            <div className="stat-value">48hr</div>
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
              : products.map((p, i) => <ProductCard key={p._id || i} product={p} index={i} />)
            }
          </div>
        </div>
        <button className="carousel-btn" onClick={() => slide(1)}>&#8594;</button>
      </div>
    </section>
  );
}