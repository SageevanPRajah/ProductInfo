import React from 'react';
import { MdEmail, MdLock, MdPerson } from 'react-icons/md';

const Register = () => {
    return (
        <div style={styles.pageContainer}>
            {/* Added page container */}
            <div style={styles.container}>
                {/* Logo */}
                <div style={styles.logoContainer}>
                    <img
                        src="https://pplx-res.cloudinary.com/image/upload/v1742377254/user_uploads/vrxQUNtPaIhOpUi/Logo-removebg-preview-1.jpg"
                        alt="Product Info Hub Logo"
                        style={styles.logo}
                    />
                </div>

                {/* Full Name Input */}
                <div style={styles.inputContainer}>
                    <MdPerson style={styles.inputIcon} />
                    <input
                        type="text"
                        placeholder="Full Name"
                        style={styles.input}
                    />
                </div>

                {/* Email Input */}
                <div style={styles.inputContainer}>
                    <MdEmail style={styles.inputIcon} />
                    <input
                        type="email"
                        placeholder="Email"
                        style={styles.input}
                    />
                </div>

                {/* Password Input */}
                <div style={styles.inputContainer}>
                    <MdLock style={styles.inputIcon} />
                    <input
                        type="password"
                        placeholder="Password"
                        style={styles.input}
                    />
                </div>

                {/* Confirm Password Input */}
                <div style={styles.inputContainer}>
                    <MdLock style={styles.inputIcon} />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        style={styles.input}
                    />
                </div>

                {/* Register Button */}
                <button style={styles.registerButton}>Register</button>

                {/* Login Link */}
                <div style={styles.loginContainer}>
                    I have an account? <a href="/login" style={styles.loginLink}>Login</a>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        // Styles for centering the form and background
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh', // Make sure it covers the entire screen height
         
        position: 'relative',  // For absolute positioning of circles
        overflow: 'hidden', // Hide any potential overflow
    },
    container: {
        width: '350px',
        padding: '30px',
        backgroundColor: '#fff',
        borderRadius: '15px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Arial, sans-serif',
    },
    logoContainer: {
        marginBottom: '25px',
    },
    logo: {
        width: '200px',
        height: 'auto',
    },
    inputContainer: {
        width: '100%',
        position: 'relative',
        marginBottom: '20px',
    },
    inputIcon: {
        position: 'absolute',
        left: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#888',
    },
    input: {
        width: '100%',
        padding: '12px 40px',
        borderRadius: '5px',
        border: '1px solid #ddd',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    registerButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        marginBottom: '20px',
    },
    loginContainer: {
        fontSize: '14px',
    },
    loginLink: {
        color: '#007bff',
        textDecoration: 'none',
    },
};

export default Register;
