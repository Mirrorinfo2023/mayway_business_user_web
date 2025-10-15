import React, { useState, useEffect } from 'react';
import style from '../components/Otp/VerifyOtp.module.css';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import VerifyOtp from '../components/Otp/VerifyOtp';
// Mock utility functions (replace with your actual utilities)
const utility = {
  DataEncrypt: (data) => {
    return btoa(JSON.stringify(data));
  },
  DataDecrypt: (encryptedData) => {
    try {
      return JSON.parse(atob(encryptedData));
    } catch (error) {
      return encryptedData;
    }
  }
};

// OTP Service
const otpService = {
  sendOtp: async (mobileNumber, category = "login") => {
    try {
      const requestData = {
        type: "Mobile",
        mode: 'API',
        mobile: mobileNumber,
        email: "",
        name: "",
        category: category
      };

      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encReq: utility.DataEncrypt(requestData) })
      });

      const data = await response.json();
      const decryptedResponse = utility.DataDecrypt(data);
      return typeof decryptedResponse === 'string' ? JSON.parse(decryptedResponse) : decryptedResponse;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyOtp: async (mobileNumber, category, otp) => {
    try {
      const requestData = {
        type: "Mobile",
        mode: 'API',
        mobile: mobileNumber,
        category: category,
        otp: otp,
      };

      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encReq: utility.DataEncrypt(requestData) })
      });

      const data = await response.json();
      const decryptedResponse = utility.DataDecrypt(data);
      return typeof decryptedResponse === 'string' ? JSON.parse(decryptedResponse) : decryptedResponse;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default function OtpVerifyPage() {
  const router = useRouter();
  const { mobile: queryMobile, categories } = router.query;

  const [mobile, setMobile] = useState(null);
  const [isOtpOpen, setIsOtpOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: false, message: '' });

  // Load mobile from sessionStorage or query param
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionMobile = sessionStorage.getItem('mobile');
      const mobileToUse = queryMobile || sessionMobile;

      if (!mobileToUse) {
        router.replace('/login');
      } else {
        setMobile(mobileToUse);
      }
    }
  }, [queryMobile, router]);

  const clearAlert = () => {
    setAlert({ open: false, type: false, message: '' });
  };

  useEffect(() => {
    if (alert.open) {
      const timer = setTimeout(clearAlert, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.open]);

  const handleVerifyOtp = async (otp) => {
    setIsLoading(true);
    clearAlert();

    try {
      const verifyCategories = categories || "login";

      const response = await otpService.verifyOtp(mobile, verifyCategories, otp);

      if (response.status === 200) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('otp_verified', 'true');
          sessionStorage.setItem('otp_verified_at', new Date().toISOString());
        }
        Cookies.set('otp_verified', 'true', { expires: 1 });

        setAlert({ open: true, type: true, message: 'OTP verified successfully!' });
        setIsOtpOpen(false);
        setTimeout(() => router.replace('/dashboard'));
      } else {
        setAlert({ open: true, type: false, message: response.message || 'OTP verification failed!' });
        router.replace('/dashboard');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setAlert({
        open: true,
        type: false,
        message: error.message || 'OTP verification failed. Please try again.'
      });
      router.replace('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseOtp = () => {
    setIsOtpOpen(false);
    router.back();
  };

  const handleChangeNumber = () => {
    setIsOtpOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('mobile');
      sessionStorage.removeItem('token');
    }
    Cookies.remove('mobile');
    Cookies.remove('token');
    router.replace('/login');
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      clearAlert();

      const resendCategories = categories || "login";

      const response = await otpService.sendOtp(mobile, resendCategories);

      if (response.status === 200) {
        setAlert({ open: true, type: true, message: 'OTP sent successfully!' });
      } else {
        setAlert({ open: true, type: false, message: response.message || 'Failed to resend OTP' });
      }
    } catch (error) {
      console.error('Failed to resend OTP:', error);

      if (error.message?.includes('User not exists')) {
        setAlert({ open: true, type: false, message: 'User not found. Please check your mobile number.' });
      } else if (error.message?.includes('User already exists')) {
        setAlert({ open: true, type: false, message: 'User already registered.' });
      } else {
        setAlert({ open: true, type: false, message: 'Failed to resend OTP. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testNumbers = ['9096608606', '1111111111'];
  const isTestNumber = mobile && testNumbers.includes(mobile);

  if (!mobile) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>Loading...</div>
        <button
          onClick={() => router.replace('/login')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Alert Component */}
      {alert.open && (
        <div style={{
          padding: '12px 16px',
          margin: '16px',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          animation: 'slideDown 0.3s ease',
          background: alert.type ? '#d4edda' : '#f8d7da',
          border: `1px solid ${alert.type ? '#c3e6cb' : '#f5c6cb'}`,
          color: alert.type ? '#155724' : '#721c24'
        }}>
          <span>{alert.message}</span>
          <button onClick={clearAlert} style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            padding: 0,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ×
          </button>
        </div>
      )}

      {isTestNumber && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '12px 16px',
          margin: '16px',
          textAlign: 'center',
          color: '#856404'
        }}>
          <p>🔒 <strong>Test Mode:</strong> Use OTP <code>000000</code> for verification</p>
        </div>
      )}

      <VerifyOtp
        isOpen={isOtpOpen}
        onClose={handleCloseOtp}
        onVerify={handleVerifyOtp}
        onChangeNumber={handleChangeNumber}
        onResendOtp={handleResendOtp}
        phoneNumber={mobile}
        isLoading={isLoading}
        isTestNumber={isTestNumber}
      />

      <style jsx>{`
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
