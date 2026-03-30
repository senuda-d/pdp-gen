import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormPage from "./pages/FormPage";
import ResultPage from "./pages/ResultPage";
import Footer from "./components/Footer";
import Header from "./components/Header";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Header />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<FormPage />} />
            <Route path="/result" element={<ResultPage />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;