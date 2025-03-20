import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import TermsCondition from "./TermsCondition.jsx";
import { FaEnvelope, FaUser, FaLock } from "react-icons/fa";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setShowTermsModal(true);
  };

  const handleAcceptTerms = async () => {
    setShowTermsModal(false);
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:5559/users/register",
        formData
      );
      if (response.data.success) {
        login(response.data.token, response.data.user, true);
        navigate("/profile");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTerms = () => {
    setShowTermsModal(false);
  };

  return (
    <div
      className="w-screen h-screen flex flex-col justify-center items-center"
      style={{
        backgroundImage: "url('/backrd4.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="flex justify-center mb-5">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-[200px] h-auto"
          />
        </div>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        <form onSubmit={handleRegister}>
          {[
            { name: "email", type: "email", placeholder: "Email", icon: <FaEnvelope /> },
            { name: "fullName", type: "text", placeholder: "Full Name", icon: <FaUser /> },
            { name: "password", type: "password", placeholder: "Password", icon: <FaLock /> },
            { name: "confirmPassword", type: "password", placeholder: "Confirm Password", icon: <FaLock /> },
          ].map((field, index) => (
            <div key={index} className="mb-4 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {field.icon}
              </div>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={formData[field.name]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          I have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
      {showTermsModal && <TermsCondition onAccept={handleAcceptTerms} onCancel={handleCancelTerms} loading={loading} />}
    </div>
  );
};

export default Register;