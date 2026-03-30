import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import data from "../data/questions.json";

function FormPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({
    "1": "Kamal",
    "2": "20",
    "3": "Colombo, Sri Lanka",
    "4": "BSc in IT at SLIIT (in progress)",
    "5": "Introverted, analytical, calm, and highly focused on growth.",
    "6": "Integrity, continuous learning, and contributing to the community.",
    "7": "Through hands-on projects, technical blogs, and YouTube tutorials.",
    "8": "Obtain a high-quality internship in full-stack development by next year.",
    "9": "Become a senior software engineer specializing in AI and distributed systems.",
    "10": "Full-stack developer / AI Engineer",
    "11": "Java, Python, React, problem-solving, and system design.",
    "12": "Communication skills, backend architecture, and time management.",
    "13": "Built a comprehensive vehicle management system and a PDP generator.",
    "14": "Balancing academic work with personal projects and business handling.",
    "15": "Limited mentorship opportunities in the local tech scene.",
    "16": "University mentors, tech communities, and peer groups.",
    "17": "1 year",
    "18": "Focus on tech stacks, soft skills, and personal finance.",
    "19": "it241000000",
    "20": "Specializing in Data Science",
    "21": "32 33 19",
    "22": "2",
    "23": "Actively engaged in personal web development projects, leading small collaborative teams.",
    "24": "Hands-on experience across frontend and backend development.",
    "25": "Contributed to academic and personal projects spanning web application development.",
    "26": "Ongoing education in Information Technology (BSc in IT at SLIIT) with practical skills in modern web technologies and active participation in peer study groups and mentorship networks.",
    "27": "1 year 2 semester"
  });
  const [error, setError] = useState("");

  const handleChange = (key, value) => {
    setAnswers({
      ...answers,
      [key]: value,
    });
  };

  const fillTestData = () => {
    setAnswers({
      "1": "John Doe",
      "2": "25",
      "3": "London, UK",
      "4": "BSc in Computer Science (Graduate)",
      "5": "Extroverted, team player, creative, and proactive.",
      "6": "Innovation, transparency, and social responsibility.",
      "7": "Group discussions, interactive courses, and building prototypes.",
      "8": "Securing a junior developer role in a fintech company.",
      "9": "Leading a product development team in a global tech firm.",
      "10": "Frontend Developer",
      "11": "JavaScript, TypeScript, CSS, UI/UX design.",
      "12": "Public speaking, Node.js, and data structures.",
      "13": "Redesigned a non-profit website; built a task manager app.",
      "14": "Finding the right balance between speed and code quality.",
      "15": "Fast-paced changes in the frontend landscape.",
      "16": "Online tech forums, local meetups, and family.",
      "17": "2 years",
      "18": "Advanced React patterns, leadership skills, and fitness.",
      "19": "it241000000",
      "20": "Specializing in Data Science",
      "21": "32 33 19",
      "22": "2",
      "23": "Actively engaged in personal web development projects, leading small collaborative teams.",
      "24": "Hands-on experience across frontend and backend development.",
      "25": "Contributed to academic and personal projects spanning web application development.",
      "26": "Ongoing education in Information Technology (BSc in IT at SLIIT) with practical skills in modern web technologies and active participation in peer study groups and mentorship networks.",
      "27": "1 year 2 semester"
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
          userResponses[item.question] = answers[item.id];
        }
      });
    });

    navigate("/result", { state: { userAnswers: userResponses } });
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">AI PDP Generator</h1>
        <p className="subtitle">Answer a few questions and let AI craft your Personal Development Plan.</p>
      </header>

      <div className="form-container">
        {data.questions.map((section) => (
          <div key={section.section} className="section shadow-hover">
            <h2 className="section-title">{section.section}</h2>

            <div className="section-grid">
              {section.items.map((item) => (
                <div key={item.id} className="form-group">
                  <label>{item.question}</label>

                  {item.type === "input" ? (
                    <input
                      type="text"
                      placeholder={item.placeholder}
                      value={answers[item.id] || ""}
                      onChange={(e) =>
                        handleChange(item.id, e.target.value)
                      }
                    />
                  ) : (
                    <textarea
                      rows="3"
                      placeholder={item.placeholder}
                      value={answers[item.id] || ""}
                      onChange={(e) =>
                        handleChange(item.id, e.target.value)
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <div className="test-controls">
          <button className="secondary-btn" onClick={fillTestData}>Load Another Sample</button>
          <button className="secondary-btn" onClick={() => setAnswers({})}>Clear All</button>
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
