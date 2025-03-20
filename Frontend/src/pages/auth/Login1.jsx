import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Login1 = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Placeholder functions for handling login
  const handleGoogleLogin = () => {
    alert("Google Login clicked!");
  };

  const handlefaceBookLogin = () => {
    alert("Facebook Login clicked!");
  };

  const handleLogin = () => {
    // Placeholder validation logic
    if (!email || !password) {
      setError('Please enter both email and password.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format.');
    } else if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
    } else {
      // Here you would typically call an API to validate credentials
      // For demonstration, just reset error and alert success
      setError(null);
      alert('Login successful!');
    }
  };

  return (
    <div style={styles.container}>
      {/* Logo */}
      <div style={styles.logoContainer}>
        <img
          src="https://pplx-res.cloudinary.com/image/upload/v1742377254/user_uploads/vrxQUNtPaIhOpUi/Logo-removebg-preview-1.jpg"
          alt="Logo"
          style={styles.logo}
        />
      </div>

      {/* Social Login Buttons */}
      <div style={styles.socialContainer}>
        <button
          onClick={handleGoogleLogin}
          style={styles.socialButton}
        >
          <FcGoogle style={styles.socialIcon} />
          <span style={styles.buttonText}>Login with Google</span>
        </button>
        <button
          onClick={handlefaceBookLogin}
          style={styles.facebookButton}
        >
          <FaFacebook style={styles.socialIcon} />
          <span style={styles.buttonText}>Login with Facebook</span>
        </button>
      </div>

      <p style={styles.orText}>OR</p>

      {/* Form */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Email</label>
        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Password</label>
        <div style={styles.passwordInputContainer}>
          <input
            type={passwordVisible ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <span
            style={styles.passwordToggle}
            onClick={togglePasswordVisibility}
          >
            {passwordVisible ? '\u25CF' : '\u25CB'}
          </span>
        </div>
        <a href="#" style={styles.forgotLink}>
          Forgot Password?
        </a>
      </div>

      <div style={styles.rememberMe}>
        <input type="checkbox" id="rememberMe" />
        <label htmlFor="rememberMe" style={styles.rememberLabel}>
          Remember me
        </label>
      </div>

      {error && (
        <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>
      )}

      <button style={styles.signInButton} onClick={handleLogin}>
        Login
      </button>

      {/* Register Link */}
      <p style={styles.registerLink}>
        Don't have an account? <a href="#" style={styles.link}>
            <Link to='/register'>Register</Link></a>
      </p>
    </div>
  );
};

const styles = {
  container: {
    width: '400px',
    margin: 'auto',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  logo: {
    width: '200px',
    height: 'auto',
  },
  socialContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  socialButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    cursor: 'pointer',
    color: '#000',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  facebookButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    color: '#000',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    width: '20px',
    height: '20px',
    marginRight: '5px',
  },
  buttonText: {
    fontSize: '11px',
    whiteSpace: 'nowrap',
    overflow: 'visible',
    textOverflow: 'unset',
  },
  orText: {
    textAlign: 'center',
    color: '#6c757d',
    marginBottom: '15px',
  },
  formGroup: {
    marginBottom: '10px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    marginBottom: '3px',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    borderColor: '#ddd',
    fontSize: '12px',
  },
  forgotLink: {
    color: '#007bff',
    textDecoration: 'none',
    fontSize: '10px',
    textAlign: 'right',
    display: 'block',
    marginTop: '3px',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  rememberLabel: {
    fontSize: '12px',
    marginLeft: '3px',
  },
  signInButton: {
    width: '100%',
    padding: '8px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
  },
  passwordInputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  passwordToggle: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#888',
  },
  registerLink: {
    textAlign: 'center',
    marginTop: '10px',
    fontSize: '12px'
  },
  socialIcon: {
    width: '20px',
    height: '20px',
    marginRight: '5px',
  }
};

export default Login1;
