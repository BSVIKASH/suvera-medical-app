import React, { useState, useEffect } from 'react';
import '../../styles/Auth.css';

const UserLogin = ({ onLogin, onSwitchToSignup, onBack }) => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('phone');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = () => {
    if (phone.length === 10) {
      setStep('otp');
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      alert('OTP sent to your phone: 123456');
    } else {
      alert('Please enter a valid 10-digit phone number');
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers and single character
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value !== '' && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
        }
      }

      // Check if all fields are filled
      if (newOtp.every(digit => digit !== '') && index === 5) {
        // FIX: Pass the 'newOtp' directly to verify, don't wait for state update
        handleVerifyOtp(newOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // FIX: Accept an argument 'finalOtp'. If not provided, use state 'otp'.
  const handleVerifyOtp = (finalOtp = otp) => {
    const enteredOtp = finalOtp.join('');
    
    if (enteredOtp.length !== 6) {
      alert('Please enter the complete 6-digit OTP');
      return;
    }

    if (enteredOtp === '123456') {
      onLogin();
    } else {
      alert('Invalid OTP. Please try again.');
      // Clear OTP fields
      setOtp(['', '', '', '', '', '']);
      // Focus first input
      setTimeout(() => {
        const firstInput = document.getElementById('otp-0');
        if (firstInput) {
          firstInput.focus();
        }
      }, 0);
    }
  };

  const handleResendOtp = () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      alert('New OTP sent to your phone: 123456');
    }
  };

  return (
    <div className="auth-container">
      <nav className="auth-nav">
        <div className="auth-nav-content">
          <h1>🏥 Emergency Help System</h1>
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
        </div>
      </nav>

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h2>Patient Login</h2>
            <p className="auth-subtitle">Access your emergency medical services</p>
          </div>
          
          {step === 'phone' ? (
            <div className="form-group">
              <label htmlFor="phone">Mobile Number</label>
              <div className="input-with-icon">
                <span className="input-icon">📱</span>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="form-input"
                  maxLength="10"
                />
              </div>
              <button 
                type="button" 
                onClick={handleSendOtp} 
                className="auth-btn"
                disabled={phone.length !== 10}
              >
                📲 Send OTP
              </button>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>Enter Verification Code</label>
                <p className="otp-instructions">
                  Enter the 6-digit code sent to <strong>+1 {phone}</strong>
                </p>
                
                <div className="otp-timer">
                  {timer > 0 ? `Code expires in ${timer}s` : 'Code expired'}
                </div>

                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`otp-input ${digit ? 'filled' : ''}`}
                      maxLength="1"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button 
                  type="button" 
                  onClick={() => handleVerifyOtp()} 
                  className="auth-btn"
                  disabled={otp.some(digit => digit === '')}
                >
                  ✅ Verify OTP
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp(['', '', '', '', '', '']);
                  }}
                  className="back-btn"
                >
                  ↩ Change Number
                </button>

                <div className="resend-otp">
                  {canResend ? (
                    <span className="resend-link" onClick={handleResendOtp}>
                      Resend OTP
                    </span>
                  ) : (
                    <span style={{ color: '#718096' }}>
                      Resend OTP in {timer}s
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="auth-footer">
            <p>
              New to Emergency Help System?{' '}
              <span className="auth-link" onClick={onSwitchToSignup}>
                Create Account
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;