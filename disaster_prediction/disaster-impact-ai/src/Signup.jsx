import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css"; // we’ll create this for styling

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can add API call to register user
    console.log("Signup data:", form);
    alert("Signup successful!");
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input type="text" name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            Password
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          <button type="submit">Sign Up</button>
        </form>

        <p>
          Already have an account? <span className="link" onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
}
