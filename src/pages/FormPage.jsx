import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Info, ChevronDown, Check, Bot } from "lucide-react";
import data from "../data/questions.json";
import sampleData from "../data/sampleData.json";

const getProviderLogo = (modelId) => {
  if (!modelId) return null;
  const id = modelId.toLowerCase();

  // Standard Providers
  if (id.includes('google') || id.includes('gemma')) return "https://api.iconify.design/logos:google-icon.svg";
  if (id.includes('meta') || id.includes('llama')) return "https://api.iconify.design/logos:meta-icon.svg";
  if (id.includes('openai') || id.includes('gpt')) return "https://api.iconify.design/logos:openai-icon.svg";
  if (id.includes('mistral') || id.includes('mixtral')) return "https://api.iconify.design/logos:mistral-ai.svg";
  if (id.includes('anthropic') || id.includes('claude')) return "https://api.iconify.design/logos:anthropic-icon.svg";
  if (id.includes('cohere')) return "https://api.iconify.design/logos:cohere-icon.svg";
  if (id.includes('huggingface')) return "https://api.iconify.design/logos:huggingface-icon.svg";
  if (id.includes('microsoft') || id.includes('phi')) return "https://api.iconify.design/logos:microsoft-icon.svg";
  if (id.includes('nvidia') || id.includes('nemotron')) return "https://api.iconify.design/logos:nvidia.svg";
  if (id.includes('x-ai') || id.includes('grok')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/X_logo_2023.svg/512px-X_logo_2023.svg.png";

  // Specialized Providers (using Iconify or reliable CDNs to avoid ORB blocks)
  if (id.includes('venice')) return "https://api.iconify.design/logos:mistral-ai.svg"; // Venice usually uses Mistral
  if (id.includes('qwen')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Qwen_logo.svg/3840px-Qwen_logo.svg.png";
  if (id.includes('glm') || id.includes('zhipu') || id.includes('z-ai')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Z.ai_%28company_logo%29.svg/250px-Z.ai_%28company_logo%29.svg.png";
  if (id.includes('deepseek')) return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/DeepSeek_logo.svg/512px-DeepSeek_logo.svg.png";

  // Fallbacks for niche providers
  if (id.includes('arcee')) return "https://i.tracxn.com/logo/company/arcee_ai_3e7e1235-f8cd-418a-a3d0-6c4403f77245";
  if (id.includes('liquid')) return "https://ik.imagekit.io/parallel/employee/prl-c__4h-Desy0";
  if (id.includes('stepfun') || id.includes('step-')) return "https://www.stepfun.com/favicon.ico";
  if (id.includes('minimax')) return "https://www.minimaxi.com/favicon.ico";

  return null; // Signals we should use the Lucide Bot fallback
};

function FormPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem("pdp_answers");
    return saved ? JSON.parse(saved) : sampleData;
  });
  // Persist answers to local storage
  useEffect(() => {
    localStorage.setItem("pdp_answers", JSON.stringify(answers));
  }, [answers]);

  const [error, setError] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("google/gemini-2.5-flash:free");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("https://openrouter.ai/api/v1/models")
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          const freeModels = data.data
            .filter(m => m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0")
            .map(m => ({ id: m.id, name: m.name }));
          setModels(freeModels);

          // Only change default if the currently selected one turns out to not be free.
          // Wait, actually Google Gemini 2.5 Flash Free is a great default if it exists.
          const hasDefault = freeModels.some(m => m.id === "google/gemini-2.5-flash:free");
          if (!hasDefault && freeModels.length > 0) {
            setSelectedModel(freeModels[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (key, value) => {
    setAnswers({
      ...answers,
      [key]: value,
    });
  };

  const handleSubmit = () => {
    // Check if at least some answers are provided
    if (Object.keys(answers).length === 0) {
      setError("Please fill in at least some details before submitting.");
      return;
    }
    setError("");

    // Map user answers
    const userResponses = {};
    data.questions.forEach((section) => {
      section.items.forEach((item) => {
        if (answers[item.id]) {
          let ans = answers[item.id];
          if (typeof ans === 'object' && ans !== null) {
            if (ans.type === 'kpc-result') {
              ans = `Knowledge: ${ans.k || 0}, Personality: ${ans.p || 0}, Character: ${ans.c || 0} (Total: ${ans.total || 0})`;
            } else if (ans.type === 'psycap-result') {
              ans = `Hope: ${ans.hope || 0}, Efficacy: ${ans.efficacy || 0}, Resilience: ${ans.resilience || 0}, Optimism: ${ans.optimism || 0}`;
            } else {
              ans = `K: ${ans.k || "-"}, P: ${ans.p || "-"}, C: ${ans.c || "-"}`;
            }
          }
          userResponses[item.question] = ans;
        }
      });
    });

    navigate("/result", { state: { userAnswers: userResponses, selectedModel } });
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">AI PDP Generator</h1>
        <p className="subtitle">Answer a few questions and let AI craft your Personal Development Plan.</p>

        <div className="quota-banner fadeIn">
          <Info size={18} className="info-icon" />
          <p>
            <strong>Api Usage Note:</strong> Some models might reach their limits or exhibit temporary issues.
            If your generation fails, don't worry! We save all your inputs locally so you can simply select a different model and try again without re-entering anything.
          </p>
        </div>
      </header>

      <div className="form-container">
        {data.questions.map((section) => (
          <div key={section.section} className="section shadow-hover">
            <h2 className="section-title">{section.section}</h2>

            <div className="section-grid">
              {section.items.map((item) => (
                <div key={item.id} className="form-group">
                  <label>{item.question}</label>

                  {item.id === 21 || item.id === 22 ? (
                    <div style={{ 
                      display: "flex", 
                      flexDirection: "row", 
                      gap: "16px", 
                      alignItems: "flex-start", 
                      width: "100%", 
                      flexWrap: "wrap" 
                    }}>
                      <div style={{ flex: "1 1 300px" }}>
                        {item.id === 21 ? (() => {
                          let val = answers[item.id];
                          let k = "", p = "", c = "";
                          
                          if (typeof val === "object" && val !== null) {
                            if (val.type === 'kpc-result') {
                              k = val.k || ""; p = val.p || ""; c = val.c || "";
                            } else {
                              // migration from early psycap attempt
                              k = val.hope || val.k || ""; 
                              p = val.efficacy || val.p || ""; 
                              c = val.resilience || val.c || "";
                            }
                          } else if (typeof val === "string") {
                            let parts = val.split(" ").filter(s => s.trim());
                            if (parts.length >= 3) {
                              k = parts[0]; p = parts[1]; c = parts[2];
                            } else {
                              k = val;
                            }
                          }

                          const update = (obj) => {
                            const newK = parseInt(obj.k) || 0;
                            const newP = parseInt(obj.p) || 0;
                            const newC = parseInt(obj.c) || 0;
                            handleChange(item.id, { ...obj, total: newK + newP + newC, type: 'kpc-result' });
                          };

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {[
                                { label: 'Knowledge', key: 'k', val: k },
                                { label: 'Personality', key: 'p', val: p },
                                { label: 'Character', key: 'c', val: c }
                              ].map(dim => (
                                <div key={dim.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ minWidth: '95px', fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>{dim.label}:</span>
                                  <input 
                                    type="text" 
                                    placeholder="Value" 
                                    value={dim.val} 
                                    onChange={(ev) => {
                                      const newVals = { k, p, c };
                                      newVals[dim.key] = ev.target.value;
                                      update(newVals);
                                    }} 
                                    style={{ flex: 1, margin: 0 }} 
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        })() : (
                          <input
                            type="text"
                            placeholder={item.placeholder}
                            value={answers[item.id] || ""}
                            onChange={(e) => handleChange(item.id, e.target.value)}
                            style={{ width: '100%' }}
                          />
                        )}
                      </div>
                      <button 
                        type="button" 
                        className="secondary-btn" 
                        onClick={() => navigate(item.id === 21 ? '/kpc' : '/locus')} 
                        style={{ 
                          whiteSpace: "nowrap", 
                          padding: "12px 20px", 
                          height: "45px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "160px"
                        }}
                      >
                        {item.id === 21 ? 'Calculate KPC' : 'Calculate Locus'}
                      </button>
                    </div>
                  ) : item.type === "select" ? (
                    <select
                      value={answers[item.id] || ""}
                      onChange={(e) => handleChange(item.id, e.target.value)}
                    >
                      <option value="" disabled>{item.placeholder || "Select an option"}</option>
                      {(item.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <>
                      {item.type === "input" ? (
                        <input
                          type="text"
                          placeholder={item.placeholder}
                          value={answers[item.id] || ""}
                          onChange={(e) => handleChange(item.id, e.target.value)}
                        />
                      ) : (
                        <textarea
                          rows="3"
                          placeholder={item.placeholder}
                          value={answers[item.id] || ""}
                          onChange={(e) => handleChange(item.id, e.target.value)}
                        />
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="actions" style={{ flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
          <label style={{ fontWeight: 600, color: '#333' }}>Select AI Model for Generation:</label>

          <div
            ref={dropdownRef}
            style={{ position: 'relative', width: '100%' }}
          >
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0e0e0',
                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', textAlign: 'left',
                transition: 'all 0.2s', outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6c63ff'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                {(() => {
                  const activeModelObj = models.find(m => m.id === selectedModel);
                  if (!activeModelObj) {
                    return <><Bot size={20} color="#666" /> <span>Loading free models...</span></>;
                  }
                  const logoUrl = getProviderLogo(activeModelObj.id);
                  return (
                    <>
                      {logoUrl ? (
                        <img src={logoUrl} alt={activeModelObj.name} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                      ) : (
                        <Bot size={20} color="#6c63ff" />
                      )}
                      <span style={{ fontSize: '0.95rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeModelObj.name || activeModelObj.id}
                      </span>
                    </>
                  );
                })()}
              </div>
              <ChevronDown size={18} color="#666" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {isDropdownOpen && models.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px',
                background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '300px', overflowY: 'auto', zIndex: 20
              }}>
                {models.map(m => {
                  const isSelected = m.id === selectedModel;
                  const logoUrl = getProviderLogo(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                        background: isSelected ? '#f8f8ff' : 'transparent', border: 'none', borderBottom: '1px solid #f0f0f0',
                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s'
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) e.currentTarget.style.background = '#f5f5f5';
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {logoUrl ? (
                        <img src={logoUrl} alt={m.name} style={{ width: 20, height: 20, objectFit: 'contain' }} />
                      ) : (
                        <Bot size={20} color={isSelected ? "#6c63ff" : "#666"} />
                      )}

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? '#6c63ff' : '#333' }}>
                          {m.name || m.id}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>
                          {m.id.split(':')[0]}
                        </span>
                      </div>

                      {isSelected && <Check size={18} color="#6c63ff" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="test-controls" style={{ marginTop: '0' }}>
          <button className="secondary-btn" onClick={() => setAnswers({})}>Clear All Inputs</button>
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
        >
          Generate My Plan
        </button>
      </div>
    </div>
  );
}

export default FormPage;
