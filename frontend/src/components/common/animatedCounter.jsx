import { useState, useEffect } from "react";

export default function AnimatedCounter({ target, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const easeOutQuad = progress * (2 - progress);//makes it so the counter is really fast at the start then slows down
      
      setCount(Math.floor(easeOutQuad * target));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [target, duration]);

  return (
    <>
      {count.toLocaleString()}{suffix}
    </>
  );
}