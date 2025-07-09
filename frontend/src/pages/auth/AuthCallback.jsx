// src/pages/auth/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Now you can fetch user profile or update context
      navigate('/'); // or wherever your dashboard is
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <p>Signing you in…</p>;
}
