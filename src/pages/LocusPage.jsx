import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import locusData from "../data/locus-of-control-question.json";

function LocusPage() {
  const navigate = useNavigate();

  // Load saved Locus raw answers if they exist
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("pdp_locus_raw_answers");
    return saved ? JSON.parse(saved) : {};
  });

  const [result, setResult] = useState(null);

  // Persist raw answers so the user doesn't lose them
  useEffect(() => {
    localStorage.setItem("pdp_locus_raw_answers", JSON.stringify(answers));
  }, [answers]);

  const handleChange = (id, value) => {
    setAnswers({
      ...answers,
      [id]: value,
    });
  };

  const calculateScore = () => {
    // Check if all questions are answered
    const allAnswered = locusData.questions.every((q) => answers[q.id]);
    if (!allAnswered) {
      alert("Please answer all questions before calculating.");
      return;
    }

    let bCount = 0;
    
    locusData.questions.forEach((q) => {
      if (answers[q.id] === "B") {
        bCount++;
      }
    });

    let interpretation = "";
    let desc = "";
    if (bCount <= 3) {
      interpretation = locusData.scoring.interpretation.internal.label;
      desc = locusData.scoring.interpretation.internal.description;
    } else if (bCount <= 6) {
      interpretation = locusData.scoring.interpretation.mixed.label;
      desc = locusData.scoring.interpretation.mixed.description;
    } else {
      interpretation = locusData.scoring.interpretation.external.label;
      desc = locusData.scoring.interpretation.external.description;
    }

    setResult({
      score: bCount,
      interpretation,
      desc
    });
  };

  const handleSaveAndReturn = () => {
    if (!result) return;
    
    // Format the answer - just the numeric score as requested
    const formattedScore = `${result.score}`;
    
    // Load existing FormPage answers
    const savedFormAnswers = localStorage.getItem("pdp_answers");
    const formAnswers = savedFormAnswers ? JSON.parse(savedFormAnswers) : {};
    
    // Save to id: 22 (What is your locus of control score?)
    formAnswers["22"] = formattedScore;
    localStorage.setItem("pdp_answers", JSON.stringify(formAnswers));
    
    navigate("/");
  };

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      <header className="header">
        <button onClick={() => navigate('/')} className="secondary-btn" style={{ position: 'absolute', top: '20px', left: '20px' }}>
          &larr; Back
        </button>
        <h1 className="title">{locusData.assessment}</h1>
        <p className="subtitle">{locusData.description}</p>
      </header>

      <div className="form-container">
        <div className="section shadow-hover">
          <p style={{ marginBottom: "20px", color: "#666" }}>
            For each pair of statements, please select the one that you most strongly agree with.
          </p>
          <div className="section-grid">
            {locusData.questions.map((item) => (
              <div key={item.id} className="form-group" style={{ marginBottom: "24px", borderBottom: "1px solid #eee", paddingBottom: "16px" }}>
                <label style={{ fontSize: "1.1rem", marginBottom: "12px", color: "#777" }}>
                  {item.id} - {item.category}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {["A", "B"].map((opt) => (
                    <label key={opt} style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", background: answers[item.id] === opt ? "#f0f0ff" : "#fff", padding: "12px 16px", borderRadius: "8px", border: answers[item.id] === opt ? "2px solid #6c63ff" : "1px solid #ddd", transition: "all 0.2s" }}>
                      <input
                        type="radio"
                        name={`locus-${item.id}`}
                        value={opt}
                        checked={answers[item.id] === opt}
                        onChange={(e) => handleChange(item.id, e.target.value)}
                        style={{ marginTop: "4px" }}
                      />
                      <span style={{ fontWeight: answers[item.id] === opt ? "500" : "400", color: answers[item.id] === opt ? "#6c63ff" : "#333", fontSize: "1rem", lineHeight: "1.5" }}>
                        {item.options[opt].text}
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
          <div className="section shadow-hover" style={{ marginTop: "30px", background: "#f8f9fa", border: "2px solid #6c63ff", textAlign: "center", padding: "40px 20px" }}>
            <h2 className="section-title" style={{ textAlign: "center", color: "#6c63ff" }}>Your Results</h2>
            
            <div style={{ margin: "30px 0" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#666" }}>External Locus Score</h3>
              <p style={{ fontSize: "4rem", fontWeight: "bold", margin: 0, color: "#333" }}>{result.score}</p>
              <small style={{ color: "#888", fontSize: "1.2rem" }}>/ 9</small>
            </div>

            <div style={{ background: "#e8eaf6", padding: "20px", borderRadius: "12px", display: "inline-block", maxWidth: "500px", marginBottom: "30px" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#3f51b5", fontSize: "1.5rem" }}>{result.interpretation}</h3>
              <p style={{ margin: 0, color: "#555", fontSize: "1.1rem", lineHeight: "1.5" }}>{result.desc}</p>
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

export default LocusPage;
