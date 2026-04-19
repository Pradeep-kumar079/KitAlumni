import React, { useState, useEffect } from "react";
import "./ImageSlider.css";

const images = [
  "/uploads/slide1.jpg",
  "/uploads/slide2.jpg",
  "/uploads/slide3.jpg",
  "/uploads/slide4.jpg",
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="slider">
      {/* Image */}
      <img
        src={images[currentIndex]}
        alt="slide"
        className="slide-image"
      />

      {/* Buttons */}
      <button className="prev" onClick={goToPrev}>
        &#10094;
      </button>

      <button className="next" onClick={goToNext}>
        &#10095;
      </button>

      {/* Dots */}
      <div className="dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={index === currentIndex ? "dot active" : "dot"}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;