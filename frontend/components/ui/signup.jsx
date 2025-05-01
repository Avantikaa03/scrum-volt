"use client"

import React, { useState } from 'react';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name.';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Please enter a username.';
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert(
        `Sign Up successful!\n\nName: ${formData.name}\nUsername: ${formData.username}\nEmail: ${formData.email}`
      );
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});
    }
  };

  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#000000',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#e0e0e0',
      margin: 0,
      padding: '1rem',
    },
    formWrapper: {
      backgroundColor: '#121212',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)',
      width: '320px',
    },
    heading: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      color: '#ffffff',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      marginBottom: '0.3rem',
      fontWeight: 'bold',
      color: '#b0b0b0',
    },
    input: {
      padding: '0.5rem',
      marginBottom: '1rem',
      border: '1px solid #444444',
      borderRadius: '4px',
      fontSize: '1rem',
      backgroundColor: '#222222',
      color: '#e0e0e0',
    },
    error: {
      color: '#ff6b6b',
      fontSize: '0.875rem',
      marginTop: '-0.75rem',
      marginBottom: '1rem',
    },
    submitButton: {
      backgroundColor: '#1a73e8',
      color: 'white',
      padding: '0.75rem',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
      fontWeight: 'bold',
    },
    submitButtonHover: {
      backgroundColor: '#155ab6',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        <h2 style={styles.heading}>Create Account</h2>
        <form style={styles.form} onSubmit={handleSubmit} noValidate>
          <label htmlFor="name" style={styles.label}>Name</label>
          <input
            id="name"
            name="name"
            type="text"
            style={styles.input}
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <div style={styles.error}>{errors.name}</div>}

          <label htmlFor="username" style={styles.label}>Username</label>
          <input
            id="username"
            name="username"
            type="text"
            style={styles.input}
            value={formData.username}
            onChange={handleChange}
            required
          />
          {errors.username && <div style={styles.error}>{errors.username}</div>}

          <label htmlFor="email" style={styles.label}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            style={styles.input}
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div style={styles.error}>{errors.email}</div>}

          <label htmlFor="password" style={styles.label}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            style={styles.input}
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          {errors.password && <div style={styles.error}>{errors.password}</div>}

          <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            style={styles.input}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          {errors.confirmPassword && <div style={styles.error}>{errors.confirmPassword}</div>}

          <button
            type="submit"
            style={styles.submitButton}
            onMouseOver={e => e.currentTarget.style.backgroundColor = styles.submitButtonHover.backgroundColor}
            onMouseOut={e => e.currentTarget.style.backgroundColor = styles.submitButton.backgroundColor}
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;
