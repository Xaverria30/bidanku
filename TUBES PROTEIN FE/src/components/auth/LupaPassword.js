import { useState } from 'react';
import './Auth.css';
import pinkLogo from '../../assets/images/pink-logo.png';
import authService from '../../services/auth.service';

function LupaPassword({ onBack, onLogin, onToVerifikasiOTP }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await authService.forgotPasswordRequest({ email });

      if (response.success) {
        // Navigasi ke verifikasi OTP dengan email
        onToVerifikasiOTP(email);
      } else {
        setError(response.message || 'Gagal mengirim kode verifikasi');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      setError(error.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="form-card">
          <div className="logo-container">
            <div className="logo">
              <img src={pinkLogo} alt="Pink Logo" className="auth-logo-img" />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <h3 style={{
              color: 'white',
              fontSize: '20px',
              textAlign: 'center',
              marginBottom: '15px',
              fontWeight: '600'
            }}>
              Lupa Password?
            </h3>

            <p style={{
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '30px',
              opacity: '0.9'
            }}>
              Masukkan email
            </p>

            {error && (
              <div className="error-message" style={{
                color: '#ff6b6b',
                textAlign: 'center',
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderRadius: '5px'
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Mengirim...' : 'Kirim'}
            </button>

            <div className="link-text">
              <a href="#" onClick={(e) => { e.preventDefault(); onLogin(); }}>
                Kembali ke Masuk
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LupaPassword;
