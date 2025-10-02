import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can add API call to authenticate user
    console.log("Login data:", form);
    alert("Login successful!");
    navigate("/"); // redirect to home page
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          <button type="submit">Login</button>
        </form>

        <p>
          Don’t have an account? <span className="link" onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}
