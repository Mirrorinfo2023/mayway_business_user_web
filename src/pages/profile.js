// pages/profile.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Avatar,
    Tabs,
    Tab,
    Container,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    InputAdornment,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Loyalty,
    MonetizationOn,
    Share,
    AccountCircle,
    Edit,
    Receipt,
    Help,
    Settings,
    ExitToApp,
    LocationOn,
    CalendarToday,
    Person,
    Add,
    Delete,
    Close,
    AccessTime,
    Refresh
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import AppLogo from '../../public/mirror_logo.png'
import Cookies from "js-cookie";
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Layout from '@/components/Dashboard/layout';
import api from "../../utils/api"
import { DataEncrypt, DataDecrypt } from "../../utils/encryption"
import DeactivateAccount from "./DeactivateAccount"
import ReCAPTCHA from "react-google-recaptcha";
// In the imports section of profile.js, add:
import { Description } from '@mui/icons-material';
import KYCStepper from "./kyc-upload"
// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
        </div>
    );
}

export default function Profile() {
    const [userData, setUserData] = useState({});
    const [balance, setBalance] = useState({
        wallet: 0,
        cashback: 0,
        totalCashback: 0,
        referralPoints: 0
    });
    const [anchorEl, setAnchorEl] = React.useState(null);

    const router = useRouter();

    const [subTabValue, setSubTabValue] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [pincodeData, setPincodeData] = useState({ state: '', city: '' });
    const genders = ['Male', 'Female', 'Other'];

    // IP Whitelist State
    const [ipAddresses, setIpAddresses] = useState(['']);
    const [loading, setLoading] = useState(false);

    // OTP Verification State
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [sendOtpLoading, setSendOtpLoading] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    // Alert State
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info'); // 'success', 'error', 'warning', 'info'

    // Update Profile Form State
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        pincode: '',
        state: '',
        city: '',
        postOfficeName: '',
        circle: '',
        district: '',
        division: '',
        region: '',
        birthDate: null,
        gender: '',
        address: '',
        aniversary_date: null
    });

    const [reminderSettings, setReminderSettings] = useState({
        threshold: 500,
        interval: 15,
        whatsapp: true,
        email: true,
        call: false
    });

    // Add this state near your other state declarations
    const [ipHistory, setIpHistory] = useState([]);
    const [ipHistoryLoading, setIpHistoryLoading] = useState(false);

    // Add this function to fetch IP history
    const fetchIPHistory = async () => {
        setIpHistoryLoading(true);
        try {
            const userId = sessionStorage.getItem('id');
            if (!userId) throw new Error('User ID not found');

            const payload = {
                user_id: userId
            };

            const encReq = DataEncrypt(JSON.stringify(payload));
            const res = await api.post('/api/users/get-user-ips-list', { encReq });

            const decrypted = DataDecrypt(res.data);
            console.log("decrypted ", decrypted)
            const data = typeof decrypted === 'string' ? JSON.parse(decrypted) : decrypted;

            if (data.status === 200) {
                setIpHistory(data.data || []);
            } else {
                showAlert(`Failed to fetch IP history: ${data.message || 'Unknown error'}`, 'error');
            }
        } catch (err) {
            console.error('Error fetching IP history:', err);
            showAlert('Failed to fetch IP history', 'error');
        } finally {
            setIpHistoryLoading(false);
        }

    };

    // Call this function when the IP Whitelist tab is activated
    useEffect(() => {
        if (subTabValue === 2) { // IP Whitelist tab
            fetchIPHistory();
        }
    }, [subTabValue]);
    // Show Alert Function
    const showAlert = (message, severity = 'info') => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    };

    // Handle Alert Close
    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlertOpen(false);
    };

    // OTP Timer Effect
    useEffect(() => {
        let interval;
        if (timerActive && otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (otpTimer === 0) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, otpTimer]);

    // Start OTP Timer
    const startOtpTimer = () => {
        setOtpTimer(60); // 1 minute
        setTimerActive(true);
    };

    // Format timer to MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Update the addIpField function
    const addIpField = () => {
        if (ipAddresses.length < 3) {
            setIpAddresses([...ipAddresses, '']);
        } else {
            showAlert('You can only add up to 3 IP addresses', 'warning');
        }
    };

    // Remove IP Address Field
    const removeIpField = (index) => {
        if (ipAddresses.length > 1) {
            const newIps = ipAddresses.filter((_, i) => i !== index);
            setIpAddresses(newIps);
        }
    };

    // Update IP Address
    const updateIpAddress = (index, value) => {
        const newIps = [...ipAddresses];
        newIps[index] = value;
        setIpAddresses(newIps);
    };

    // Send OTP for IP Whitelist
    const sendOtpForIpWhitelist = async () => {
        setSendOtpLoading(true);

        try {
            const userId = sessionStorage.getItem('id');
            const mobile = sessionStorage.getItem('mobile') || '';
            const email = sessionStorage.getItem('email') || '';
            const name = `${sessionStorage.getItem('first_name') || ''} ${sessionStorage.getItem('last_name') || ''}`.trim();

            if (!userId) throw new Error('User ID not found');

            // 1️⃣ Validate IPs
            const validIps = ipAddresses
                .filter(ip => ip.trim() !== '')
                .map(ip => ip.trim());

            if (validIps.length === 0) {
                showAlert('Please enter at least one IP address', 'warning');
                return;
            }

            if (!reminderSettings.recaptchaToken) {
                showAlert('Please verify you are not a robot', 'warning');
                return;
            }

            const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
            const invalidIps = validIps.filter(ip => !ipRegex.test(ip));

            if (invalidIps.length > 0) {
                showAlert(`Invalid IP address format: ${invalidIps.join(', ')}`, 'error');
                return;
            }

            // 2️⃣ Prepare payload — same structure as `handleRequestOtp`
            const reqData = {
                mode: 'API',
                type: 'Mobile',
                category: 'IP Whitelist Verify',
                user_id: userId,
                mobile,
                email,
                name
            };

            // 3️⃣ Encrypt request
            const encReq = DataEncrypt(JSON.stringify(reqData));

            // 4️⃣ Send API request (with token header if available)
            const token = sessionStorage.getItem('token') || userData?.token || '';
            const response = await api.post('/api/otp/8930cae4a942a0286226f1651dfbff89216174c8', { encReq }, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            // 5️⃣ Decrypt response
            const decryptedResponse = DataDecrypt(response.data);

            if (decryptedResponse.status === 200) {
                setOtpSent(true);
                setOtpDialogOpen(true);
                startOtpTimer();
                showAlert('OTP sent successfully! Please check your registered mobile/email.', 'success');
            } else {
                throw new Error(decryptedResponse.message || 'OTP request failed');
            }

        } catch (error) {
            console.error('Error sending OTP:', error);

            let errorMsg = 'Failed to send OTP. Please try again.';

            if (error?.response?.status === 400 || error?.response?.status === 500) {
                try {
                    const decryptedError = DataDecrypt(error.response.data);
                    errorMsg = decryptedError.message || errorMsg;
                } catch (decryptErr) {
                    errorMsg = error.response?.data || errorMsg;
                }
            }

            showAlert(errorMsg, 'error');

        } finally {
            setSendOtpLoading(false);
        }
    };

    // Verify OTP
    const verifyOtp = async () => {
        setOtpLoading(true);

        try {
            const userId = sessionStorage.getItem('id');
            const mobile = sessionStorage.getItem('mobile') || '';
            const email = sessionStorage.getItem('email') || '';
            const name = `${sessionStorage.getItem('first_name') || ''} ${sessionStorage.getItem('last_name') || ''}`.trim();
            const token = sessionStorage.getItem('token') || userData?.token || '';

            if (!userId) throw new Error('User ID not found');
            if (!otp.trim()) {
                showAlert('Please enter OTP', 'warning');
                return;
            }

            // 1️⃣ Prepare data in same format as handleVerifyOtp
            const reqData = {
                otp: otp.trim(),
                mode: 'API',
                type: 'Mobile',
                category: 'IP Whitelist Verify',
                user_id: userId,
                mobile,
                email,
                name
            };

            // 2️⃣ Encrypt request
            const encReq = DataEncrypt(JSON.stringify(reqData));

            // 3️⃣ Send encrypted request (with auth token if available)
            const response = await api.post(
                '/api/otp/3ae2750febeb3583bec28c67c42063120cb72963',
                { encReq },
                token ? { headers: { Authorization: `Bearer ${token}` } } : {}
            );

            // 4️⃣ Decrypt and process response
            const decryptedResponse = DataDecrypt(response.data);
            const data = typeof decryptedResponse === 'string'
                ? JSON.parse(decryptedResponse)
                : decryptedResponse;

            if (data.status === 200) {
                setOtpVerified(true);
                setOtpDialogOpen(false);
                setTimerActive(false);
                showAlert('OTP verified successfully! You can now submit your IP addresses for approval.', 'success');
            } else {
                showAlert(`OTP verification failed: ${data.message || 'Invalid OTP'}`, 'error');
            }

        } catch (error) {
            console.error('Error verifying OTP:', error);

            let errorMsg = 'Failed to verify OTP. Please try again.';

            if (error?.response?.status === 400 || error?.response?.status === 500) {
                try {
                    const decryptedError = DataDecrypt(error.response.data);
                    errorMsg = decryptedError.message || errorMsg;
                } catch {
                    errorMsg = error.response?.data || errorMsg;
                }
            }

            showAlert(errorMsg, 'error');

        } finally {
            setOtpLoading(false);
        }
    };

    // Submit IP Whitelist Request
    const submitIpWhitelist = async () => {
        setLoading(true);

        try {
            const userId = sessionStorage.getItem('id');
            if (!userId) throw new Error('User ID not found');

            // Filter out empty IP addresses and create array
            const validIps = ipAddresses
                .filter(ip => ip.trim() !== '')
                .map(ip => ip.trim());

            if (validIps.length === 0) {
                showAlert('Please enter at least one IP address', 'warning');
                return;
            }

            // Validate IP addresses format
            const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
            const invalidIps = validIps.filter(ip => !ipRegex.test(ip));

            if (invalidIps.length > 0) {
                showAlert(`Invalid IP address format: ${invalidIps.join(', ')}`, 'error');
                return;
            }
            // Check IP limit
            if (validIps.length > 3) {
                showAlert('You can only add up to 3 IP addresses', 'error');
                return;
            }
            // Create payload with array of IP addresses
            const payload = {
                user_id: userId,
                ip_addresses: validIps
            };

            const encReq = DataEncrypt(JSON.stringify(payload));
            const res = await api.post('/api/users/add-whitelistip-req', { encReq });

            const decrypted = DataDecrypt(res.data);
            const data = typeof decrypted === 'string' ? JSON.parse(decrypted) : decrypted;

            if (data.status === 200) {
                alert(`Successfully submitted ${validIps.length} IP address(es) for approval`, 'success');
                setIpAddresses(['']);
                setOtp('');
                setOtpVerified(false);
                setOtpSent(false);
                setReminderSettings(prev => ({ ...prev, recaptchaToken: '' }));
                // Refresh IP history after successful submission
                fetchIPHistory();
            } else {
                showAlert(`Failed to submit IP addresses: ${data.message || 'Unknown error'}`, 'error');
            }

        } catch (err) {
            console.error('Error submitting IP whitelist:', err);
            showAlert('Failed to submit IP addresses', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Reset OTP state when dialog closes
    const handleOtpDialogClose = () => {
        setOtpDialogOpen(false);
        setOtp('');
        setOtpLoading(false);
    };

    // Reset OTP verification state
    const resetOtpVerification = () => {
        setOtpVerified(false);
        setOtpSent(false);
        setOtp('');
        setTimerActive(false);
        setOtpTimer(0);
        setReminderSettings(prev => ({ ...prev, recaptchaToken: '' }));
    };

    // Resend OTP
    const handleResendOtp = () => {
        setOtp('');
        sendOtpForIpWhitelist();
    };

    // Rest of your existing functions remain the same...
    const saveReminderSettings = async () => {
        if (!reminderSettings.recaptchaToken) {
            showAlert("Please verify you are not a robot", "warning");
            return;
        }

        try {
            const userId = sessionStorage.getItem('id');
            if (!userId) throw new Error('User ID not found in session');

            const payload = {
                user_id: userId,
                threshold: reminderSettings.threshold,
                interval: reminderSettings.interval,
                whatsapp: reminderSettings.whatsapp,
                email: reminderSettings.email,
                call: reminderSettings.call
            };

            const encReq = DataEncrypt(JSON.stringify(payload));

            const res = await api.post('/api/wallet/3d0426cb4eecf64d963966f6da3852804c20r431', { encReq });
            const data = res.data
            if (res.status === 200) {
                showAlert("Notification settings saved successfully!", "success");
            } else {
                showAlert(`Failed to save Notification settings: ${data.message || 'Unknown error'}`, "error");
            }
        } catch (err) {
            console.error('Error saving Notification settings:', err);
            showAlert("Failed to save Notification settings", "error");
        }
    };

    const handleTabChange = (event, newValue) => setTabValue(newValue);
    const [userId, setUserId] = useState(null);
    useEffect(() => {
        const id = sessionStorage.getItem('id');
        setUserId(id);
    }, []);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const userId = sessionStorage.getItem('id');
                if (!userId) return;

                // Fetch Profile
                const encProfileReq = DataEncrypt(JSON.stringify({ id: userId }));
                const profileRes = await api.post(
                    '/api/users/63c6ad33e3395d611c35ed9ef749fd8fe4ae2bb4',
                    { encReq: encProfileReq }
                );
                let profileDataDecrypted = DataDecrypt(profileRes.data);
                if (typeof profileDataDecrypted === 'string') profileDataDecrypted = JSON.parse(profileDataDecrypted);

                if (!(profileDataDecrypted.status === 200 && profileDataDecrypted.data?.length > 0)) {
                    console.error('Profile not found:', profileDataDecrypted.message);
                    return;
                }

                const user = profileDataDecrypted.data[0];

                // Fetch Wallet
                const encWalletReq = DataEncrypt(JSON.stringify({ user_id: userId }));
                const walletRes = await api.post(
                    `/api/wallet/e1af0d84d643e7c955bee1ee6d03a8b9a88a07fd`,
                    { encReq: encWalletReq },
                    { headers: { "Content-Type": "application/json" } }
                );
                let walletDecrypted = DataDecrypt(walletRes.data);
                if (typeof walletDecrypted === "string") walletDecrypted = JSON.parse(walletDecrypted);

                // Set User State
                setUserData({
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    mlm_id: user.mlm_id || '',
                    mobile: user.mobile || '',
                    email: user.email || '',
                    refered_by: user.referred_by || '',
                    ref_last_name: user.ref_last_name || '',
                    ref_first_name: user.ref_first_name || '',
                    refered_mobile: user.ref_mobile || '',
                    rank: user.rank || '',
                    is_portfolio: user.is_portfolio || 0,
                    profile_pic: user.profile_pic || null
                });

                // Set Profile Form State
                setProfileData({
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    pincode: user.pincode || '',
                    state: user.state || '',
                    city: user.city || '',
                    postOfficeName: user.postOfficeName || '',
                    circle: user.circle || '',
                    district: user.district || '',
                    division: user.division || '',
                    region: user.region || '',
                    address: user.address || '',
                    birthDate: user.dob ? new Date(user.dob) : null,
                    gender: user.gender || '',
                    aniversary_date: user.aniversary_date ? new Date(user.aniversary_date) : null,
                    profile_pic_file: null,
                    profile_pic_preview: user.profile_pic || null
                });

                // Set Balance State
                setBalance({
                    wallet: walletDecrypted.walletBalance || 0,
                    cashback: walletDecrypted.cashbackBalance || 0,
                    totalCashback: walletDecrypted.total_earning || 0,
                    referralPoints: walletDecrypted.affiliateBalance || 0,
                    affiliateBalance: walletDecrypted.affiliateBalance || 0,
                    affiliateIncome: walletDecrypted.affiliateIncome || 0,
                    todayIncome: walletDecrypted.today_income || 0,
                    primeBalance: walletDecrypted.primeBalance || 0,
                    epinWallet: walletDecrypted.epinWalletBalance || 0,
                    voucher: walletDecrypted.voucher || 0,
                    rank: walletDecrypted.rank || user.rank || ''
                });

                // Fetch Pincode Info if available
                if (user.pincode) {
                    const encReq = DataEncrypt(JSON.stringify({ pincode: user.pincode }));
                    const res = await api.post(
                        "/api/pincode/916e4eb592f2058c43a3face75b0f9d49ef2bd17",
                        { encReq },
                        { headers: { "Content-Type": "application/json" } }
                    );

                    let decrypted = DataDecrypt(res.data);
                    if (typeof decrypted === 'string') decrypted = JSON.parse(decrypted);

                    if (decrypted.status === 200 && decrypted.data.length > 0) {
                        const pincodeInfo = decrypted.data[0];
                        const fullAddress = [
                            pincodeInfo.Office_name,
                            pincodeInfo.Division,
                            pincodeInfo.District,
                            pincodeInfo.State,
                            pincodeInfo.Pincode
                        ].filter(Boolean).join(', ');

                        setProfileData(prev => ({
                            ...prev,
                            state: pincodeInfo.State || '',
                            city: pincodeInfo.District || '',
                            circle: pincodeInfo.Circle || '',
                            division: pincodeInfo.Division || '',
                            postOfficeName: pincodeInfo.Office_name || '',
                            region: pincodeInfo.Region || '',
                            address: fullAddress || '',
                        }));
                    }
                }

                // Update sessionStorage
                Object.entries(user).forEach(([key, value]) => {
                    sessionStorage.setItem(key, value ?? '');
                });

            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        }

        fetchUserData();
    }, []);

    // Rest of your existing functions (handleProfilePicClick, handleProfilePicChange, handleProfileUpdate, etc.)
    const handleProfilePicClick = () => {
        document.getElementById('profilePicInput').click();
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData(prev => ({
                ...prev,
                profile_pic_file: file,
                profile_pic_preview: URL.createObjectURL(file)
            }));
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (!profileData.recaptchaToken) {
            showAlert("Please verify you are not a robot", "warning");
            return;
        }

        try {
            const userId = sessionStorage.getItem('id');
            if (!userId) {
                showAlert("User not found", "error");
                return;
            }

            const payload = {
                user_id: userId,
                pincode: profileData.pincode || '',
                postOfficeName: profileData.postOfficeName || '',
                circle: profileData.circle || '',
                district: profileData.district || '',
                division: profileData.division || '',
                region: profileData.region || '',
                dob: profileData.birthDate ? profileData.birthDate.toISOString().split('T')[0] : null,
                address: profileData.address || '',
                aniversary_date: profileData.aniversary_date || null,
                gender: profileData.gender || ''
            };

            if (!profileData.profile_pic_file) {
                const res = await api.post(
                    '/api/users/978d91c8d62d882a00631e74fa6c6863616ebc13',
                    payload,
                    { headers: { 'Content-Type': 'application/json' } }
                );
                const data = res.data;
                if (data.status === 200) {
                    showAlert("Profile updated successfully!", "success");
                    Object.entries(payload).forEach(([key, value]) => sessionStorage.setItem(key, value));
                } else {
                    showAlert("Failed to update profile: " + (data.message || "Unknown error"), "error");
                }
            } else {
                const formData = new FormData();
                formData.append("img", profileData.profile_pic_file);
                Object.entries(payload).forEach(([key, value]) =>
                    formData.append(key, value ?? "")
                );

                const res = await api.post(
                    '/api/users/978d91c8d62d882a00631e74fa6c6863616ebc13',
                    formData
                );
                const data = res.data;
                if (data.status === 200) {
                    showAlert("Profile updated successfully!", "success");
                    Object.entries(payload).forEach(([key, value]) => sessionStorage.setItem(key, value));
                } else {
                    showAlert("Failed to update profile: " + (data.message || "Unknown error"), "error");
                }
            }
        } catch (err) {
            console.error(err);
            showAlert("Something went wrong while updating profile.", "error");
        }
    };

    const handleInputChange = (field) => (event) => {
        setProfileData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleDateChange = (date) => {
        setProfileData(prev => ({
            ...prev,
            birthDate: date
        }));
    };

    const handlePincodeChange = async (e) => {
        const value = e.target.value;
        setProfileData(prev => ({ ...prev, pincode: value }));

        if (value.length === 6) {
            try {
                const encReq = DataEncrypt(JSON.stringify({ pincode: value }));
                const res = await api.post(
                    "/api/pincode/916e4eb592f2058c43a3face75b0f9d49ef2bd17",
                    { encReq },
                    { headers: { "Content-Type": "application/json" } }
                );

                let decrypted = DataDecrypt(res.data);
                if (typeof decrypted === 'string') decrypted = JSON.parse(decrypted);

                if (decrypted.status === 200 && decrypted.data.length > 0) {
                    const pincodeInfo = decrypted.data[0];
                    const fullAddress = [
                        pincodeInfo.Office_name,
                        pincodeInfo.Division,
                        pincodeInfo.District,
                        pincodeInfo.State,
                        pincodeInfo.Pincode
                    ].filter(Boolean).join(', ');

                    setProfileData(prev => ({
                        ...prev,
                        pincode: pincodeInfo.Pincode || prev.pincode,
                        state: pincodeInfo.State || '',
                        city: pincodeInfo.District || '',
                        circle: pincodeInfo.Circle || '',
                        division: pincodeInfo.Division || '',
                        office_name: pincodeInfo.Office_name || '',
                        region: pincodeInfo.Region || '',
                        address: fullAddress
                    }));
                }
            } catch (err) {
                console.error("Pincode API error:", err);
            }
        }
    };

    const handleLogout = () => {
        setAnchorEl(null);
        Cookies.remove('department');
        Cookies.remove('uid');
        const role = Cookies.get('role');
        Cookies.remove('role');
        sessionStorage.clear();
        localStorage.clear();
        router.push('/login');
    };

    return (
        <Layout>
            <Box sx={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)', py: 2, px: 1, minHeight: '100vh' }}>
                <Container maxWidth="xl">
                    {/* Alert Snackbar */}
                    <Snackbar
                        open={alertOpen}
                        autoHideDuration={6000}
                        onClose={handleAlertClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={handleAlertClose}
                            severity={alertSeverity}
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            {alertMessage}
                        </Alert>
                    </Snackbar>

                    {/* Profile Header */}
                    <Card
                        sx={{
                            borderRadius: 2,
                            boxShadow: 3,
                            mb: 2,
                            background: 'linear-gradient(135deg, #1976d2 0%, #7b1fa2 100%)',
                            color: 'white',
                            p: 2
                        }}
                    >
                        <Grid
                            container
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={3}
                        >
                            <Grid item xs={12} md={6}>
                                <Grid
                                    container
                                    alignItems="center"
                                    spacing={2}
                                    justifyContent={{ xs: 'center' }}
                                >
                                    <Grid item>
                                        <Avatar
                                            sx={{
                                                width: 80,
                                                height: 80,
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                cursor: 'pointer'
                                            }}
                                            onClick={handleProfilePicClick}
                                            src={profileData.profile_pic_preview || userData.profile_pic || undefined}
                                        >
                                            <Loyalty sx={{ fontSize: 40 }} />
                                        </Avatar>
                                        <input
                                            type="file"
                                            id="profilePicInput"
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                            onChange={handleProfilePicChange}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h5" fontWeight="bold">
                                            {userData.first_name} {userData.last_name}
                                        </Typography>
                                        <Typography variant="body2">MLM ID: {userData.mlm_id}</Typography>
                                        <Typography variant="body2">Mobile: {userData.mobile}</Typography>
                                        <Typography variant="body2">Email: {userData.email}</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid
                                item
                                xs={12}
                                md={6}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: { xs: 'center' },
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography variant="body2">Referred By: {userData.ref_first_name}{" "}{userData.ref_last_name}</Typography>
                                <Typography variant="body2">Mobile:  {userData.refered_mobile}</Typography>
                            </Grid>
                        </Grid>
                    </Card>

                    {/* Tabs Section */}
                    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                                <Tab icon={<AccountCircle />} label="Overview" />
                                <Tab icon={<Description />} label="KYC Upload" /> {/* Add this line */}
                                <Tab icon={<Edit />} label="Update Profile" />
                                <Tab icon={<Receipt />} label="Terms & Conditions" />
                                <Tab icon={<Help />} label="About Us" />
                                <Tab icon={<Settings />} label="Settings" />
                                <Tab icon={<ExitToApp />} label="Logout" />
                            </Tabs>
                        </Box>

                        {/* Overview Tab */}
                        <TabPanel value={tabValue} index={0}>
                            <Grid container spacing={2} sx={{ mb: 1, padding: "25px" }}>
                                {[
                                    { label: 'Wallet Balance', value: balance.wallet, icon: <Loyalty sx={{ fontSize: 24, color: '#757575' }} />, bg: '#f0f4c3', color: 'text.primary' },
                                    { label: 'Cashback', value: balance.cashback, icon: <MonetizationOn sx={{ fontSize: 24, color: '#2e7d32' }} />, bg: '#e1f5fe', color: 'success.main' },
                                    { label: 'Total Earned', value: balance.totalCashback, icon: <MonetizationOn sx={{ fontSize: 24, color: '#ff9800' }} />, bg: '#fff3e0', color: 'warning.main' },
                                    { label: 'Refer & Earn', value: balance.referralPoints, icon: <Share sx={{ fontSize: 24, color: '#1976d2' }} />, bg: '#e8f5e9', color: 'primary.main' }
                                ].map((card, index) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        md={3}
                                        key={index}
                                    >
                                        <Card
                                            sx={{
                                                borderRadius: 2,
                                                boxShadow: 2,
                                                minHeight: 80,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: card.bg,
                                                py: 1
                                            }}
                                        >
                                            {card.icon}
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                {card.label}
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight="bold" color={card.color}>
                                                ₹ {card.value}
                                            </Typography>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </TabPanel>


                        <TabPanel value={tabValue} index={1}>
                            <Box sx={{ p: 2 }}>
                                <KYCStepper />
                            </Box>
                        </TabPanel>
                        {/* Update Profile Tab */}
                        <TabPanel value={tabValue} index={2}>
                            <Box component="form" onSubmit={handleProfileUpdate}>
                                {/* Personal Information Section */}
                                <Card sx={{ mb: 1, borderRadius: 2, boxShadow: 4, border: '1px solid #e0e0e0', m: 2, backgroundColor: '#FEF7FF' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#1976d2' }}
                                        >
                                            <Person /> Personal Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="First Name"
                                                    size="small"
                                                    fullWidth
                                                    value={profileData.firstName}
                                                    onChange={handleInputChange('firstName')}
                                                    placeholder="Enter first name"
                                                    sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Last Name"
                                                    size="small"
                                                    fullWidth
                                                    value={profileData.lastName}
                                                    onChange={handleInputChange('lastName')}
                                                    placeholder="Enter last name"
                                                    sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <DatePicker
                                                        label="Birth Date"
                                                        value={profileData.birthDate}
                                                        onChange={handleDateChange}
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                size="medium"
                                                                fullWidth
                                                                sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    startAdornment: (
                                                                        <InputAdornment position="start">
                                                                            <CalendarToday color="action" />
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </LocalizationProvider>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControl fullWidth size="small" sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}>
                                                    <InputLabel>Gender</InputLabel>
                                                    <Select
                                                        value={profileData.gender || ''}
                                                        onChange={handleInputChange('gender')}
                                                        label="Gender"
                                                    >
                                                        <MenuItem value="">
                                                            <em>Select Gender</em>
                                                        </MenuItem>
                                                        {genders.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                {/* Address Information Section */}
                                <Card sx={{ m: 2, borderRadius: 2, boxShadow: 4, border: '1px solid #e0e0e0', backgroundColor: '#FEF7FF' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#1976d2' }}
                                        >
                                            <LocationOn /> Address Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="Pincode"
                                                    size="small"
                                                    fullWidth
                                                    value={profileData.pincode}
                                                    onChange={handlePincodeChange}
                                                    placeholder="Enter pincode"
                                                    sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LocationOn color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="State"
                                                    size="small"
                                                    fullWidth
                                                    value={profileData.state || ''}
                                                    InputProps={{
                                                        readOnly: true,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LocationOn color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    label="City"
                                                    size="small"
                                                    fullWidth
                                                    value={profileData.city || ''}
                                                    InputProps={{
                                                        readOnly: true,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LocationOn color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    sx={{ backgroundColor: '#f9f9f9', borderRadius: 1 }}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 2, mb: 2 }}>
                                            <ReCAPTCHA
                                                sitekey="6LdHTbwrAAAAAGawIo2escUPr198m8cP3o_ZzZK1"
                                                onChange={(token) => setProfileData(prev => ({ ...prev, recaptchaToken: token }))}
                                            />
                                        </Box>
                                        <Box sx={{ mt: 3, textAlign: 'right' }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    background: 'linear-gradient(135deg,#1976d2 0%,#7b1fa2 100%)',
                                                    py: 1,
                                                    px: 4,
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
                                                    '&:hover': { boxShadow: '0 5px 10px rgba(0,0,0,0.3)' }
                                                }}
                                            >
                                                Update
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        </TabPanel>

                        <TabPanel value={tabValue} index={3}>
                            <Typography variant="h6" gutterBottom>Terms & Conditions</Typography>
                            <Typography variant="body2">
                                {/* Add your terms and conditions content here */}
                            </Typography>
                        </TabPanel>

                        <TabPanel value={tabValue} index={4}>
                            <Typography variant="h6" gutterBottom>About Us</Typography>
                            <Typography variant="body2">
                                {/* Add your about us content here */}
                            </Typography>
                        </TabPanel>

                        <TabPanel value={tabValue} index={5}>
                            <Card sx={{ m: 2, p: 3, borderRadius: 2, boxShadow: 3 }}>
                                {/* Sub-Tabs */}
                                <Tabs
                                    value={subTabValue}
                                    onChange={(e, newValue) => setSubTabValue(newValue)}
                                    indicatorColor="primary"
                                    textColor="primary"
                                    variant="fullWidth"
                                    sx={{ mb: 2 }}
                                >
                                    <Tab label="Account" />
                                    <Tab label="Notification" />
                                    <Tab label="IP Whitelist" />
                                </Tabs>

                                {/* Account Settings Panel */}
                                {subTabValue === 0 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            Account Settings
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Update your personal information and profile details.
                                        </Typography>
                                        {userId && <DeactivateAccount userId={userId} />}
                                    </Box>
                                )}

                                {/* Notification Settings Panel */}
                                {subTabValue === 1 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            Wallet Balance Reminder
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Get notified when your wallet balance goes below your set amount.
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        label="Low Balance Threshold (₹)"
                                                        type="number"
                                                        fullWidth
                                                        size="small"
                                                        value={reminderSettings.threshold}
                                                        onChange={(e) =>
                                                            setReminderSettings(prev => ({ ...prev, threshold: Number(e.target.value) }))
                                                        }
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl fullWidth size="small">
                                                        <InputLabel>Notification Interval</InputLabel>
                                                        <Select
                                                            value={reminderSettings.interval}
                                                            onChange={(e) =>
                                                                setReminderSettings(prev => ({ ...prev, interval: Number(e.target.value) }))
                                                            }
                                                        >
                                                            <MenuItem value={5}>Every 5 minutes</MenuItem>
                                                            <MenuItem value={15}>Every 15 minutes</MenuItem>
                                                            <MenuItem value={30}>Every 30 minutes</MenuItem>
                                                            <MenuItem value={60}>Every 1 hour</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={reminderSettings.whatsapp}
                                                                onChange={(e) =>
                                                                    setReminderSettings((prev) => ({ ...prev, whatsapp: e.target.checked }))
                                                                }
                                                            />
                                                        }
                                                        label="Notify on WhatsApp"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={reminderSettings.email}
                                                                onChange={(e) =>
                                                                    setReminderSettings((prev) => ({ ...prev, email: e.target.checked }))
                                                                }
                                                            />
                                                        }
                                                        label="Notify via Email"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={reminderSettings.call}
                                                                onChange={(e) =>
                                                                    setReminderSettings((prev) => ({ ...prev, call: e.target.checked }))
                                                                }
                                                            />
                                                        }
                                                        label="Notify via Call"
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <ReCAPTCHA
                                                        sitekey="6LdHTbwrAAAAAGawIo2escUPr198m8cP3o_ZzZK1"
                                                        onChange={(token) =>
                                                            setReminderSettings(prev => ({ ...prev, recaptchaToken: token }))
                                                        }
                                                    />
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Button
                                                        variant="contained"
                                                        fullWidth
                                                        sx={{ mt: 1 }}
                                                        onClick={saveReminderSettings}
                                                    >
                                                        Save Settings
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Box>
                                )}

                                {/* IP Whitelist Panel */}
                                {subTabValue === 2 && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            IP Address Whitelist
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Add IP addresses that are allowed to access your account. Each IP will need admin approval. You can add up to 3 IP addresses.
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: { xs: 'column', md: 'row' },
                                                gap: 2,
                                            }}
                                        >
                                            {/* Left: Add New IP */}
                                            <Box sx={{ flex: 1 }}>
                                                <Card sx={{ p: 2, mb: { xs: 2, md: 0 }, backgroundColor: '#f8f9fa' }}>
                                                    <Typography variant="subtitle1" gutterBottom>
                                                        Add New IP Addresses ({ipAddresses.filter(ip => ip.trim() !== '').length}/3)
                                                    </Typography>

                                                    {/* IP Input + Add Button */}
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            gap: 1,
                                                            mb: 2,
                                                            alignItems: 'center',
                                                            flexWrap: 'wrap',
                                                            flexDirection: { xs: 'column', sm: 'row' }
                                                        }}
                                                    >
                                                        {ipAddresses.map((ip, index) => (
                                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 200 }}>
                                                                <TextField
                                                                    label={`IP Address ${index + 1}`}
                                                                    placeholder="e.g., 192.168.1.1"
                                                                    value={ip}
                                                                    onChange={(e) => updateIpAddress(index, e.target.value)}
                                                                    size="small"
                                                                    sx={{ flex: 1 }}
                                                                    disabled={ipAddresses.filter(ip => ip.trim() !== '').length >= 3 && !ip.trim()}
                                                                />
                                                                {ipAddresses.length > 1 && (
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => removeIpField(index)}
                                                                        color="error"
                                                                    >
                                                                        <Delete />
                                                                    </IconButton>
                                                                )}
                                                            </Box>
                                                        ))}

                                                        <Button
                                                            startIcon={<Add />}
                                                            onClick={addIpField}
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{ height: 40, mt: { xs: 1, sm: 0 } }}
                                                            disabled={ipAddresses.length >= 3 || ipAddresses.filter(ip => ip.trim() !== '').length >= 3}
                                                        >
                                                            Add Another IP
                                                        </Button>
                                                    </Box>

                                                    {ipAddresses.filter(ip => ip.trim() !== '').length >= 3 && (
                                                        <Alert severity="info" sx={{ mb: 2 }}>
                                                            You have reached the maximum limit of 3 IP addresses.
                                                        </Alert>
                                                    )}

                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            mt: 2,
                                                            gap: 1,
                                                            flexDirection: { xs: 'column', sm: 'row' }
                                                        }}
                                                    >
                                                        {!otpVerified ? (
                                                            <>
                                                                <ReCAPTCHA
                                                                    sitekey="6LdHTbwrAAAAAGawIo2escUPr198m8cP3o_ZzZK1"
                                                                    onChange={(token) =>
                                                                        setReminderSettings(prev => ({ ...prev, recaptchaToken: token }))
                                                                    }
                                                                />
                                                                <Button
                                                                    variant="contained"
                                                                    onClick={sendOtpForIpWhitelist}
                                                                    disabled={sendOtpLoading || !reminderSettings.recaptchaToken || ipAddresses.filter(ip => ip.trim() !== '').length === 0}
                                                                    size="small"
                                                                    sx={{
                                                                        ml: { xs: 0, sm: 'auto' },
                                                                        height: 40,
                                                                        whiteSpace: 'nowrap',
                                                                        mt: { xs: 1, sm: 0 }
                                                                    }}
                                                                >
                                                                    {sendOtpLoading ? <CircularProgress size={20} /> : 'Send OTP'}
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Chip
                                                                    label="OTP Verified"
                                                                    color="success"
                                                                    variant="outlined"
                                                                    sx={{ ml: { xs: 0, sm: 'auto' } }}
                                                                />
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    onClick={submitIpWhitelist}
                                                                    disabled={loading}
                                                                    size="small"
                                                                    sx={{
                                                                        height: 40,
                                                                        whiteSpace: 'nowrap',
                                                                        mt: { xs: 1, sm: 0 }
                                                                    }}
                                                                >
                                                                    {loading ? <CircularProgress size={20} /> : 'Submit for Approval'}
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    onClick={resetOtpVerification}
                                                                    size="small"
                                                                    sx={{
                                                                        height: 40,
                                                                        whiteSpace: 'nowrap',
                                                                        mt: { xs: 1, sm: 0 }
                                                                    }}
                                                                >
                                                                    Reset
                                                                </Button>
                                                            </>
                                                        )}
                                                    </Box>
                                                </Card>
                                            </Box>

                                            {/* Right: IP History */}
                                            <Box sx={{ flex: 1 }}>
                                                <Card sx={{ p: 2 }}>
                                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <AccessTime /> IP Whitelist History
                                                    </Typography>

                                                    {ipHistoryLoading ? (
                                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                                            <CircularProgress />
                                                        </Box>
                                                    ) : ipHistory.length > 0 ? (
                                                        <Box sx={{ overflow: 'auto' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                                <thead>
                                                                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                                                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: 'bold' }}>
                                                                            IP Address
                                                                        </th>
                                                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: 'bold' }}>
                                                                            Request Date
                                                                        </th>
                                                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: 'bold' }}>
                                                                            Approved Date
                                                                        </th>
                                                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: 'bold' }}>
                                                                            Status
                                                                        </th>
                                                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e0e0e0', fontWeight: 'bold' }}>
                                                                            Rejected Reason
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {ipHistory.map((ip, index) => (
                                                                        <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                            <td style={{ padding: '12px' }}>
                                                                                <Typography variant="body2" fontWeight="medium">
                                                                                    {ip.ip_address}
                                                                                </Typography>
                                                                            </td>
                                                                            <td style={{ padding: '12px' }}>
                                                                                <Typography variant="body2">
                                                                                    {ip.created_on ? new Date(ip.created_on).toLocaleDateString() : 'N/A'}
                                                                                </Typography>
                                                                            </td>
                                                                            <td style={{ padding: '12px' }}>
                                                                                <Typography variant="body2">
                                                                                    {ip.modified_on ? new Date(ip.modified_on).toLocaleDateString() : 'N/A'}
                                                                                </Typography>
                                                                            </td>
                                                                            <td style={{ padding: '12px' }}>
                                                                                <Chip
                                                                                    label={ip.status || 'Pending'}
                                                                                    color={
                                                                                        ip.status === 'Approved' ? 'success' :
                                                                                            ip.status === 'Rejected' ? 'error' : 'warning'
                                                                                    }
                                                                                    variant="outlined"
                                                                                    size="small"
                                                                                />
                                                                            </td>
                                                                            <td style={{ padding: '12px' }}>
                                                                                <Typography variant="body2" fontWeight="medium">
                                                                                    {ip.reject_reason ? ip.reject_reason : '-'}
                                                                                </Typography>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ textAlign: 'center', p: 3 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                No IP whitelist history found. Add your first IP address above.
                                                            </Typography>
                                                        </Box>
                                                    )}

                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={fetchIPHistory}
                                                            disabled={ipHistoryLoading}
                                                            startIcon={ipHistoryLoading ? <CircularProgress size={16} /> : <Refresh />}
                                                            size="small"
                                                        >
                                                            Refresh History
                                                        </Button>
                                                    </Box>
                                                </Card>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}

                            </Card>
                        </TabPanel>

                        <TabPanel value={tabValue} index={6}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={handleLogout}
                                    sx={{ px: 4, py: 1, fontWeight: 'bold' }}
                                >
                                    Logout
                                </Button>
                            </Box>
                        </TabPanel>

                    </Card>

                    {/* OTP Verification Dialog */}
                    <Dialog
                        open={otpDialogOpen}
                        onClose={handleOtpDialogClose}
                        maxWidth="xs"
                        fullWidth
                    >
                        <DialogTitle sx={{ pb: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6" fontWeight="bold">
                                    Verify OTP for IP Whitelisting
                                </Typography>
                                <IconButton onClick={handleOtpDialogClose} size="small">
                                    <Close />
                                </IconButton>
                            </Box>
                        </DialogTitle>
                        <DialogContent sx={{ pt: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Enter the 6-digit OTP sent to your registered mobile/email to secure your IP whitelist request.
                            </Typography>

                            {/* Timer Display */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                <AccessTime sx={{ fontSize: 18, color: otpTimer > 10 ? 'primary.main' : 'error.main', mr: 1 }} />
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={otpTimer > 10 ? 'primary.main' : 'error.main'}
                                >
                                    {formatTime(otpTimer)}
                                </Typography>
                            </Box>

                            <TextField
                                label="Enter 6-digit OTP"
                                fullWidth
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="XXXXXX"
                                sx={{ mb: 2 }}
                                inputProps={{
                                    maxLength: 6,
                                    style: { textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }
                                }}
                            />

                            {/* Resend OTP Option */}
                            <Box sx={{ textAlign: 'center' }}>
                                {otpTimer === 0 ? (
                                    <Button
                                        variant="text"
                                        onClick={handleResendOtp}
                                        disabled={sendOtpLoading}
                                        size="small"
                                    >
                                        {sendOtpLoading ? 'Sending...' : 'Resend OTP'}
                                    </Button>
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        Resend OTP available in {formatTime(otpTimer)}
                                    </Typography>
                                )}
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={handleOtpDialogClose} color="inherit">
                                Cancel
                            </Button>
                            <Button
                                onClick={verifyOtp}
                                variant="contained"
                                disabled={otpLoading || !otp.trim() || otp.length !== 6}
                                startIcon={otpLoading ? <CircularProgress size={20} /> : null}
                                sx={{ minWidth: 120 }}
                            >
                                {otpLoading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Container>
            </Box>
        </Layout>
    );
}