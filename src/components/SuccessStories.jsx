import React, { useEffect } from "react";
import "./SuccessStories.css";

const SuccessStories = () => {
  useEffect(() => {
    const audio = new Audio("/assets/success-voice.mp3"); // Voice file
    audio.play().catch(error => console.log("Audio play error: ", error));
  }, []);

  return (
    <section className="success-stories">
      <div className="parallax-bg"></div>
      <h2 className="section-title">Hall of Fame</h2>
      
      {/* Transformations Section */}
      <div className="transformations">
        {[1, 2, 3].map((item, index) => (
          <div className="transformation-card" key={index}>
            <div className="before-after-slider">
            <img src={`${process.env.PUBLIC_URL}/anshuBefor-${item}.jpg`} alt="Before" className="before" />
            <img src={`${process.env.PUBLIC_URL}/anshuAfter-${item}.jpg`} alt="After" className="after" />
            </div>
            <p className="description">"I transformed my life with FitMitra!"</p>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="testimonials">
        {["Amazing journey!", "Life-changing experience!", "Best decision ever!"].map((quote, index) => (
          <div className="testimonial-card" key={index}>
            <p className="quote">{quote}</p>
            <div className="rating">⭐⭐⭐⭐⭐</div>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="milestones">
        <div className="milestone-card">
          <h3>1000+</h3>
          <p>Transformations Achieved</p>
        </div>
        <div className="milestone-card">
          <h3>500+</h3>
          <p>People Reached Their Goals</p>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
