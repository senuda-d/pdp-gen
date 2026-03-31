import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Download, ChevronDown, FileText, File, AlertTriangle, Clock, Bot } from "lucide-react";
import { generatePDPStream } from "../services/aiService";

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

  return null;
};

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef(null);

  const userAnswers = location.state?.userAnswers;
  const selectedModel = location.state?.selectedModel;

  // Stream generation on mount if userAnswers are provided
  useEffect(() => {
    if (!userAnswers) return;

    let isCancelled = false;

    const streamResponse = async () => {
      setIsGenerating(true);
      setError("");
      setResult("");

      try {
        const stream = await generatePDPStream(userAnswers, selectedModel);
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

    let content = contentElement.innerHTML;
    // Replace the HTML hr generated by ReactMarkdown with MsWord page break tag
    content = content.replace(/<hr[^>]*>/gi, '<br clear="all" style="page-break-before:always" />');

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

  const handleMarkdownExport = () => {
    setIsDropdownOpen(false);

    // Using the raw result perfectly preserves the original `[page xx]` structure from the AI generated payload.
    const blob = new Blob(['\ufeff', result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = url;
    fileDownload.download = 'Personal_Development_Plan.md';
    fileDownload.click();
    document.body.removeChild(fileDownload);
    URL.revokeObjectURL(url);
  };

  // Turn `[page 01]` notation into horizontal markdown lines so `<hr>` natively translates onto the webpage
  const displayResult = result.replace(/\[page \s*\d+\]/gi, '\n\n---\n\n');

  return (
    <div className="container result-page">
      <header className="header" style={{ marginBottom: "2rem" }}>
        <button className="secondary-btn back-btn" onClick={() => navigate("/")} disabled={isGenerating}>
          &larr; Back to Generator
        </button>
      </header>

      {error ? (
        <div className={
          (error.toLowerCase().includes("quota") || error.includes("429") || error.toLowerCase().includes("limit"))
            ? "quota-error-card fadeIn"
            : "error-message"
        }>
          {(error.toLowerCase().includes("quota") || error.includes("429") || error.toLowerCase().includes("limit") || error.toLowerCase().includes("failed")) ? (
            <div className="quota-content">
              <div className="quota-icon-wrapper">
                <AlertTriangle size={32} />
              </div>
              <div className="quota-info">
                <h3>Oops, we ran into an error!</h3>
                <p>If you think it's an issue with the model you selected, just select another one and try again, buddy!</p>
                <div className="quota-notice">
                  <Clock size={16} />
                  <span>Don't worry, we got you! We saved all your data locally. If you're feeling exhausted, come back later; your progress is safe with us. Or, just go back and pick a different model to retry!</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '1.5rem' }}>
                  <button className="secondary-btn" onClick={() => navigate("/")} style={{ flex: 1 }}>
                    Pick Another Model & Retry
                  </button>
                  <button className="secondary-btn" onClick={() => navigate("/")} style={{ flex: 1, backgroundColor: '#f0f0f0', border: 'none' }}>
                    Take a Break
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>Action Failed</div>
              {error}
              <button className="secondary-btn" onClick={() => navigate("/")} style={{ marginTop: '1rem', display: 'block' }}>
                Try Again
              </button>
            </>
          )}
        </div>
      ) : (
        <div id="pdp-result" className="result-container fadeIn" style={{ marginTop: 0 }}>
          <div className="result-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(() => {
                if (!selectedModel) return null;
                const logoUrl = getProviderLogo(selectedModel);
                return logoUrl ? (
                  <img src={logoUrl} alt="AI Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                ) : (
                  <Bot size={28} color="#6c63ff" />
                );
              })()}
              <span>{isGenerating ? "Generating Your Plan..." : "Your Personal Development Plan"}</span>
              {isGenerating && <span className="spinner" style={{ display: 'inline-block', marginLeft: '12px', width: '14px', height: '14px', borderColor: '#6c63ff', borderTopColor: 'transparent' }}></span>}
            </h2>

            <div className="dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
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
                  <button className="dropdown-item" onClick={handleMarkdownExport} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '10px 15px', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #eee' }}>
                    <FileText size={16} style={{ marginRight: "8px" }} />
                    Markdown File
                  </button>
                </div>
              )}
            </div>
          </div>
          <div id="markdown-content" className="markdown-content">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{displayResult || (isGenerating ? "*Analyzing your profile and generating personalized insights...*" : "")}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultPage;
