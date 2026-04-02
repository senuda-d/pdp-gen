import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import kpcData from "../data/kpc-questions.json";

function KpcPage() {
  const navigate = useNavigate();

  // Load saved KPC raw answers if they exist
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("pdp_kpc_raw_answers");
    return saved ? JSON.parse(saved) : {};
  });

  const [result, setResult] = useState(null);

  // Persist raw answers so the user doesn't lose them
  useEffect(() => {
    localStorage.setItem("pdp_kpc_raw_answers", JSON.stringify(answers));
  }, [answers]);

  const handleChange = (id, value) => {
    setAnswers({
      ...answers,
      [id]: parseInt(value, 10), // Since it's a 1-6 scale
    });
  };

  const calculateScore = () => {
    // Check if all questions are answered
    const allAnswered = kpcData.questions.every((q) => answers[q.id] !== undefined);
    if (!allAnswered) {
      alert("Please answer all questions before calculating.");
      return;
    }

    // Dimensions
    const dimensions = { Knowledge: 0, Personality: 0, Character: 0 };
    
    kpcData.questions.forEach((q) => {
      let val = answers[q.id];
      if (dimensions[q.dimension] !== undefined) {
        dimensions[q.dimension] += val;
      }
    });

    const total = Object.values(dimensions).reduce((acc, curr) => acc + curr, 0);

    setResult({
      dimensions,
      total,
    });
  };

  const handleSaveAndReturn = () => {
    if (!result) return;
    
    // Store the structured results
    const scoreResult = {
      k: result.dimensions.Knowledge,
      p: result.dimensions.Personality,
      c: result.dimensions.Character,
      total: result.total,
      type: 'kpc-result'
    };
    
    // Load existing FormPage answers
    const savedFormAnswers = localStorage.getItem("pdp_answers");
    const formAnswers = savedFormAnswers ? JSON.parse(savedFormAnswers) : {};
    
    // Save to id: 21
    formAnswers["21"] = scoreResult;
    localStorage.setItem("pdp_answers", JSON.stringify(formAnswers));
    
    navigate("/");
  };

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      <header className="header">
        <button onClick={() => navigate('/')} className="secondary-btn" style={{ position: 'absolute', top: '20px', left: '20px' }}>
          &larr; Back
        </button>
        <h1 className="title">{kpcData.assessment}</h1>
        <p className="subtitle">{kpcData.description}</p>
      </header>

      <div className="form-container">
        <div className="section shadow-hover">
          <p style={{ marginBottom: "20px", color: "#666" }}>
            Please select the option that best describes how much you agree with each statement.
          </p>
          <div className="section-grid">
            {kpcData.questions.map((item) => (
              <div key={item.id} className="form-group" style={{ marginBottom: "24px", borderBottom: "1px solid #eee", paddingBottom: "16px" }}>
                <label style={{ fontSize: "1.1rem", marginBottom: "12px" }}>
                  {item.id}. {item.text}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {Object.entries(kpcData.scale.labels).map(([val, label]) => (
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", background: answers[item.id] === parseInt(val) ? "#f0f0ff" : "#fff", padding: "8px 12px", borderRadius: "8px", border: answers[item.id] === parseInt(val) ? "2px solid #6c63ff" : "1px solid #ddd", transition: "all 0.2s" }}>
                      <input
                        type="radio"
                        name={`kpc-${item.id}`}
                        value={val}
                        checked={answers[item.id] === parseInt(val)}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                        style={{ display: "none" }}
                      />
                      <span style={{ fontWeight: answers[item.id] === parseInt(val) ? "600" : "400", color: answers[item.id] === parseInt(val) ? "#6c63ff" : "#333", fontSize: "0.95rem" }}>
                        {parseInt(val)} - {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {!result && (
            <div className="actions" style={{ justifyContent: "center", marginTop: "20px" }}>
              <button className="submit-btn" onClick={calculateScore}>
                Calculate Score
              </button>
            </div>
          )}
        </div>

        {result && (
          <div className="section shadow-hover" style={{ marginTop: "30px", background: "#f8f9fa", border: "2px solid #6c63ff" }}>
            <h2 className="section-title" style={{ textAlign: "center", color: "#6c63ff" }}>Your KPC Results</h2>
            
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", margin: "30px 0", gap: "20px" }}>
              <div style={{ textAlign: "center", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", minWidth: "160px", flex: "1 1 200px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>Knowledge</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#333" }}>{result.dimensions.Knowledge}</p>
                <small style={{ color: "#888" }}>/ 24</small>
              </div>
              <div style={{ textAlign: "center", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", minWidth: "160px", flex: "1 1 200px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>Personality</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#333" }}>{result.dimensions.Personality}</p>
                <small style={{ color: "#888" }}>/ 24</small>
              </div>
              <div style={{ textAlign: "center", padding: "20px", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", minWidth: "160px", flex: "1 1 200px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>Character</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, color: "#333" }}>{result.dimensions.Character}</p>
                <small style={{ color: "#888" }}>/ 24</small>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>Total Score</h3>
              <p style={{ fontSize: "3rem", fontWeight: "bold", margin: 0, color: "#6c63ff" }}>{result.total}</p>
              <small style={{ color: "#888" }}>/ 72</small>
            </div>

            <div className="actions" style={{ justifyContent: "center" }}>
              <button className="submit-btn" onClick={handleSaveAndReturn}>
                Save to Form & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KpcPage;
