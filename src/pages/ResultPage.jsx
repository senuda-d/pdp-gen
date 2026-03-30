import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Download, ChevronDown, FileText, File } from "lucide-react";
import { generatePDPStream } from "../services/aiService";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);
  
  const userAnswers = location.state?.userAnswers;

  // Stream generation on mount if userAnswers are provided
  useEffect(() => {
    if (!userAnswers) return;
    
    let isCancelled = false;
    
    const streamResponse = async () => {
      setIsGenerating(true);
      setError("");
      setResult("");
      
      try {
        const stream = await generatePDPStream(userAnswers);
        for await (const chunk of stream) {
          if (isCancelled) break;
          setResult(prev => prev + chunk);
          
          // Auto-scroll to bottom while generating
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setError(err.message || "Failed to generate your plan.");
        }
      } finally {
        if (!isCancelled) setIsGenerating(false);
      }
    };
    
    streamResponse();
    
    return () => { isCancelled = true; };
  }, [userAnswers]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!userAnswers) {
    return (
      <div className="container">
        <div className="error-message">No data found. Please fill out the form first.</div>
        <button className="secondary-btn" onClick={() => navigate("/")} style={{ marginTop: '1rem' }}>
          Back to Form
        </button>
      </div>
    );
  }

  const handlePdfExport = () => {
    setIsDropdownOpen(false);
    window.print();
  };

  const handleWordExport = () => {
    setIsDropdownOpen(false);
    const contentElement = document.getElementById("markdown-content");
    if (!contentElement) return;

    const content = contentElement.innerHTML;
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head><meta charset='utf-8'><title>Personal Development Plan</title>" +
      "<style>" +
      "body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }" +
      "h1, h2, h3 { color: #1a1a1a; }" +
      "p { margin-bottom: 1em; }" +
      "</style>" +
      "</head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;

    // Use Blob to handle large documents reliably
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = url;
    fileDownload.download = 'Personal_Development_Plan.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container result-page">
      <header className="header" style={{ marginBottom: "2rem" }}>
         <button className="secondary-btn back-btn" onClick={() => navigate("/")} disabled={isGenerating}>
            &larr; Back to Generator
         </button>
      </header>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div id="pdp-result" className="result-container fadeIn" style={{ marginTop: 0 }}>
          <div className="result-header">
            <h2>
              {isGenerating ? "Generating Your Plan..." : "Your Personal Development Plan"}
              {isGenerating && <span className="spinner" style={{ display: 'inline-block', marginLeft: '12px', width: '14px', height: '14px', borderColor: '#6c63ff', borderTopColor: 'transparent' }}></span>}
            </h2>
            
            <div className="dropdown-container" ref={dropdownRef}>
              <button 
                className="print-btn dropdown-toggle" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                disabled={isGenerating || !result}
                style={{ opacity: (isGenerating || !result) ? 0.5 : 1 }}
              >
                <Download size={18} style={{ marginRight: "8px" }} />
                Export As
                <ChevronDown size={18} style={{ marginLeft: "6px" }} />
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu" style={{ position: 'absolute', right: 0, marginTop: '5px', background: 'white', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '180px' }}>
                  <button className="dropdown-item" onClick={handlePdfExport} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 15px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                    <FileText size={16} style={{ marginRight: "8px" }} />
                    PDF Document
                  </button>
                  <button className="dropdown-item" onClick={handleWordExport} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 15px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #eee' }}>
                    <File size={16} style={{ marginRight: "8px" }} />
                    Word Document
                  </button>
                </div>
              )}
            </div>
          </div>
          <div id="markdown-content" className="markdown-content">
            <ReactMarkdown>{result || (isGenerating ? "*Analyzing your profile and generating personalized insights...*" : "")}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultPage;
