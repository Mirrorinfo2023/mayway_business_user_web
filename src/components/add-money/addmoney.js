'use client';

import React, { useState, useEffect } from 'react';
import {
    Button, Grid, Typography, TextField,
    Radio, RadioGroup, FormControlLabel,
    Select, MenuItem, Box, CircularProgress,
    Card, CardContent, Stepper, Step, StepLabel, Chip,
    useMediaQuery, useTheme, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip as MuiChip, Container
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ComputerIcon from '@mui/icons-material/Computer';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import Image from 'next/image';
import styles from './AddMoneyRequestHistory.module.css';
import { DataEncrypt, DataDecrypt } from '../../../utils/encryption';
import api from '../../../utils/api';
import ReCAPTCHA from "react-google-recaptcha";


const steps = ['Amount', 'Method', 'Details', 'Confirm', 'Success'];


export default function AddMoneyRequestHistory() {
    const [activeTab, setActiveTab] = useState(1); // 0: Add Money, 1: Request Status
    const [step, setStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [amount, setAmount] = useState('');
    const [utr, setUtr] = useState('');
    const [paymentMode, setPaymentMode] = useState('UPI');
    const [proof, setProof] = useState(null);
    const [loading, setLoading] = useState(false);
    const [requestHistory, setRequestHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
    const isLandscape = useMediaQuery('(orientation: landscape)');
    const [captchaToken, setCaptchaToken] = useState(null);

    const goNext = () => setStep(step + 1);
    const handleFileChange = (e) => setProof(e.target.files[0]);

    const handleAddMoneyClick = () => {
        setActiveTab(0);
        setStep(1);
    };

    const handleRequestStatusClick = () => {
        setActiveTab(1);
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'Approved':
                return <MuiChip label="Approved" color="success" size="small" />;
            case 'pending':
                return <MuiChip label="Pending" color="warning" size="small" />;
            case 'Rejected':
                return <MuiChip label="Rejected" color="error" size="small" />;
            default:
                return <MuiChip label="Unknown" size="small" />;
        }
    };

    const handleSubmitRequest = async () => {
        try {
            setLoading(true);

            // 1️⃣ CAPTCHA check
            if (!captchaToken) {
                alert("Please complete the CAPTCHA before submitting.");
                setLoading(false);
                return;
            }

            // 2️⃣ Get user ID from session
            const userId = sessionStorage.getItem("id");
            if (!userId) {
                alert("User not found in session. Please login again.");
                setLoading(false);
                return;
            }

            // 3️⃣ Prepare payload
            const payload = {
                user_id: userId,
                amount,
                category: selectedMethod,
                trans_no: utr,
                wallet: "main"
            };

            // 4️⃣ Encrypt payload
            const encryptedData = DataEncrypt(JSON.stringify(payload));
            const formData = new FormData();
            formData.append("data", encryptedData);

            if (proof) {
                formData.append("img", proof);
            }

            console.log("📤 Encrypted Data:", encryptedData);

            // 5️⃣ Send request to backend
            const response = await api.post(
                "/api/add_money/53aeb245864f03638400271b8a13ac38bad62be5",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            // 6️⃣ Decrypt response (DataDecrypt already returns an object)
            let responseData;
            try {
                responseData = DataDecrypt(response.data.data || response.data);
                console.log("✅ Decrypted Response Object:", responseData);
            } catch (err) {
                console.warn("⚠️ Failed to decrypt response:", err);
                responseData = response.data; // fallback if not encrypted
            }

            // 7️⃣ Handle success or failure
            if (responseData.status === 200) {
                alert("💰 Add money request submitted successfully!");
                goNext();
            } else {
                throw new Error(responseData.message || "Request failed on server side");
            }

        } catch (error) {
            console.error("❌ Add Money Request Error:", error);
            alert(error.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };




    useEffect(() => {
        if (activeTab === 1) {
            fetchAddMoneyHistory();
        }
    }, [activeTab]);


    const fetchAddMoneyHistory = async () => {
        try {
            setLoadingHistory(true);

            // ✅ Get user ID from sessionStorage
            const userId = sessionStorage.getItem("id");

            // ✅ Prepare payload only if user exists
            let responseData = null;
            if (userId) {
                const payload = { user_id: userId, wallet: 'Main' };
                const encryptedPayload = { encReq: DataEncrypt(JSON.stringify(payload)) };

                console.log('📤 Sending encrypted payload:', encryptedPayload);

                const response = await api.post(
                    '/api/add_money/098263ebb9bde3adcfc7761f4072b46c9fc7e9eb',
                    encryptedPayload,
                    { headers: { 'Content-Type': 'application/json' } }
                );

                responseData = response.data;

                // ✅ Decrypt response if it comes as string
                if (typeof responseData === 'string') {
                    responseData = DataDecrypt(responseData);
                    console.log("responseData fetchAddMoneyHistory ", responseData)
                    if (typeof responseData === 'string') {
                        responseData = JSON.parse(responseData);
                    }
                }
            }

            // ✅ If no user ID or empty data, return 2 static records
            if (!userId || !responseData || !responseData.data || responseData.data.length === 0) {
                console.warn("No add money history found, returning 2 static records.");

            } else {
                setRequestHistory(responseData.data);
            }

        } catch (error) {
            console.error('❌ Fetch Add Money History Error:', error);

            // ✅ fallback static records on error
            setRequestHistory([
              
            ]);
        } finally {
            setLoadingHistory(false);
        }
    };






    return (
        <Box className={`
      ${styles.container} 
      ${isMobile ? styles.mobile : ''} 
      ${isTablet ? styles.tablet : ''} 
      ${isDesktop ? styles.desktop : ''} 
      ${isLargeScreen ? styles.largeScreen : ''}
      ${isLandscape ? styles.landscape : ''}
    `}>
            {/* Full Screen Container */}
            <Box className={styles.fullScreenContent}>

                {/* Header Section */}
                <Box className={styles.headerSection}>
                    <Box className={styles.headerContent}>
                        <PaymentIcon className={styles.headerIcon} />
                        <Box>
                            <Typography className={styles.title}>Wallet Management</Typography>
                            <Typography className={styles.subtitle}>
                                {activeTab === 0 ? 'Add money to your wallet securely' : 'Track your add money requests'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Navigation Buttons */}
                    <Box className={styles.navigationButtons}>
                            <Button
                            variant={activeTab === 1 ? "contained" : "outlined"}
                            onClick={handleRequestStatusClick}
                            startIcon={<HistoryIcon />}
                            sx={{
                                borderRadius: '16px',
                                padding: '16px 32px',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                minWidth: '160px',
                                // Active button styling
                                ...(activeTab === 1 ? {
                                    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                                    color: 'white !important',
                                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #f7931e, #ff6b35)',
                                        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.6)',
                                        transform: 'translateY(-2px)',
                                        color: 'white !important'
                                    }
                                } : {
                                    // Inactive button styling
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white !important',
                                    border: '2px solid rgba(255, 255, 255, 0.5)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: '2px solid rgba(255, 255, 255, 0.8)',
                                        transform: 'translateY(-2px)',
                                        color: 'white !important',
                                        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)'
                                    }
                                }),
                                // Responsive styles
                                ...(isMobile && {
                                    padding: '14px 24px',
                                    fontSize: '1rem',
                                    minWidth: 'auto',
                                    width: '100%'
                                }),
                                ...(isDesktop && {
                                    padding: '8px',
                                    fontSize: '1rem',
                                    minWidth: '180px'
                                })
                            }}
                            size={isDesktop ? "large" : "medium"}
                        >
                            Request Status
                        </Button>

                        <Button
                            variant={activeTab === 0 ? "contained" : "outlined"}
                            onClick={handleAddMoneyClick}
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: '16px',
                                padding: '5px',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: '1rem',
                                minWidth: '160px',
                                // Active button styling
                                ...(activeTab === 0 ? {
                                    background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                                    color: 'white !important',
                                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #f7931e, #ff6b35)',
                                        boxShadow: '0 6px 20px rgba(255, 107, 53, 0.6)',
                                        transform: 'translateY(-2px)',
                                        color: 'white !important'
                                    }
                                } : {
                                    // Inactive button styling
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white !important',
                                    border: '2px solid rgba(255, 255, 255, 0.5)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: '2px solid rgba(255, 255, 255, 0.8)',
                                        transform: 'translateY(-2px)',
                                        color: 'white !important',
                                        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.2)'
                                    }
                                }),
                                // Responsive styles
                                ...(isMobile && {
                                    padding: '14px 24px',
                                    fontSize: '1rem',
                                    minWidth: 'auto',
                                    width: '100%'
                                }),
                                ...(isDesktop && {
                                    padding: '5px',
                                    fontSize: '1.2rem',
                                    minWidth: '180px'
                                })
                            }}
                            size={isDesktop ? "large" : "medium"}
                        >
                            Add Money
                        </Button>

                    </Box>
                </Box>

                {/* Main Content Area */}
                <Box className={styles.mainContent}>

                    {/* Add Money Tab Content */}
                    {activeTab === 0 && (
                        <Box className={styles.addMoneyContent}>

                            {/* Stepper - Full Width */}
                            <Box className={styles.stepperContainer}>
                                <Stepper
                                    activeStep={step - 1}
                                    className={styles.stepper}
                                    alternativeLabel={!isMobile}
                                >
                                    {steps.map((label) => (
                                        <Step key={label}>
                                            <StepLabel
                                                StepIconProps={{
                                                    sx: {
                                                        '&.Mui-completed': { color: '#4caf50' },
                                                        '&.Mui-active': { color: '#1976d2' },
                                                        fontSize: isMobile ? '1.5rem' : '2rem',
                                                        width: isMobile ? 32 : 40,
                                                        height: isMobile ? 32 : 40
                                                    }
                                                }}
                                            >
                                                <Typography variant={isMobile ? "caption" : "body2"} className={styles.stepLabelText}>
                                                    {label}
                                                </Typography>
                                            </StepLabel>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>

                            {/* Step Content Container */}
                            <Card className={styles.stepCard}>
                                <CardContent className={styles.stepCardContent}>

                                    {/* Step 1: Enter Amount */}
                                    {step === 1 && (
                                        <Box className={styles.stepContent}>
                                            <Typography variant="h5" className={styles.stepTitle}>
                                                Enter Amount
                                            </Typography>

                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Amount"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className={styles.amountInput}
                                                InputProps={{
                                                    startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }}>₹</Typography>,
                                                    sx: {
                                                        fontSize: '1.2rem',
                                                        height: isDesktop ? '50px' : '56px'
                                                    }
                                                }}
                                                placeholder="Enter amount"
                                            />

                                            <Typography variant="h6" className={styles.quickSelectLabel}>
                                                Quick Select
                                            </Typography>

                                            <Grid container spacing={2} className={styles.amountButtons}>
                                                {[500, 1000, 2500, 5000, 10000, 20000].map((val) => (
                                                    <Grid item xs={4} sm={4} md={4} key={val}>
                                                        <Chip
                                                            label={`₹${val.toLocaleString()}`}
                                                            onClick={() => setAmount(val.toString())}
                                                            variant={amount === val.toString() ? 'filled' : 'outlined'}
                                                            color="primary"
                                                            className={styles.amountChip}
                                                            sx={{
                                                                fontSize: isDesktop ? '1.1rem' : '1rem',
                                                                height: isDesktop ? '60px' : '52px',
                                                                width: '100%'
                                                            }}
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            <Box className={styles.buttonContainer}>
                                                <Button
                                                    variant="contained"
                                                    disabled={!amount}
                                                    onClick={goNext}
                                                    fullWidth
                                                    className={styles.primaryButton}
                                                    size="large"
                                                >
                                                    Continue
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Step 2: Select Method */}
                                    {step === 2 && (
                                        <Box className={styles.stepContent}>
                                            <Typography variant="h5" className={styles.stepTitle}>
                                                Choose Payment Method
                                            </Typography>

                                            <RadioGroup
                                                value={selectedMethod}
                                                onChange={(e) => setSelectedMethod(e.target.value)}
                                                className={styles.radioGroup}
                                            >
                                                <Grid container spacing={3}>
                                                    {['UPI Transfer', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Net Banking'].map((method) => (
                                                        <Grid item xs={12} md={6} lg={4} key={method}>
                                                            <Card
                                                                className={`${styles.methodCard} ${selectedMethod === method ? styles.methodCardSelected : ''}`}
                                                                onClick={() => setSelectedMethod(method)}
                                                            >
                                                                <FormControlLabel
                                                                    value={method}
                                                                    control={<Radio size="large" />}
                                                                    label={
                                                                        <Typography className={styles.methodLabelText}>
                                                                            {method}
                                                                        </Typography>
                                                                    }
                                                                    className={styles.methodLabel}
                                                                />
                                                            </Card>
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </RadioGroup>

                                            <Box className={styles.buttonContainer}>
                                                <Button
                                                    variant="contained"
                                                    disabled={!selectedMethod}
                                                    onClick={goNext}
                                                    fullWidth
                                                    className={styles.primaryButton}
                                                    size="large"
                                                >
                                                    Continue to Payment
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Step 3: QR Code & Bank Details */}
                                    {step === 3 && (
                                        <Box className={`${styles.stepContent} ${styles.center}`}>
                                            <AccountBalanceIcon className={styles.bankIcon} />
                                            <Typography variant="h5" className={styles.stepTitle}>
                                                Bank Transfer Details
                                            </Typography>

                                            <Box className={styles.qrBankContainer}>
                                                {/* QR Code Section */}
                                                <Card variant="outlined" className={styles.qrCard}>
                                                    <Box className={styles.qrContainer}>
                                                        {isMobile && isLandscape ? (
                                                            <Box className={styles.qrPlaceholder}>
                                                                <QrCode2Icon className={styles.qrIcon} />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Scan QR Code
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <>
                                                                <Image
                                                                    src="/upi_qr1.png"
                                                                    alt="QR Code"
                                                                    width={isLargeScreen ? 280 : isDesktop ? 240 : 200}
                                                                    height={isLargeScreen ? 280 : isDesktop ? 240 : 200}
                                                                    className={styles.qrImage}
                                                                />
                                                                <Typography className={styles.qrText}>mirrorhub@hdfcbank</Typography>
                                                            </>
                                                        )}
                                                    </Box>
                                                </Card>

                                                {/* Bank Details Section */}
                                                <Card className={styles.bankCard}>
                                                    <CardContent className={styles.bankContent}>
                                                        <Box className={styles.bankDetailItem}>
                                                            <Typography variant="subtitle1" color="text.secondary">Bank Name</Typography>
                                                            <Typography variant="h6" className={styles.bankDetailValue}>IndusInd Bank</Typography>
                                                        </Box>

                                                        <Box className={styles.bankDetailItem}>
                                                            <Typography variant="subtitle1" color="text.secondary">Account Number</Typography>
                                                            <Typography variant="h6" className={styles.bankDetailValue}>259112421742</Typography>
                                                        </Box>

                                                        <Box className={styles.bankDetailItem}>
                                                            <Typography variant="subtitle1" color="text.secondary">Account Holder</Typography>
                                                            <Typography variant="h6" className={styles.bankDetailValue}>Mirrorinfo tech Pvt Ltd</Typography>
                                                        </Box>

                                                        <Box className={styles.bankDetailItem}>
                                                            <Typography variant="subtitle1" color="text.secondary">IFSC Code</Typography>
                                                            <Typography variant="h6" className={styles.bankDetailValue}>INDB0000173</Typography>
                                                        </Box>

                                                        <Box className={styles.bankDetailItem}>
                                                            <Typography variant="subtitle1" color="text.secondary">Account Type</Typography>
                                                            <Typography variant="h6" className={styles.bankDetailValue}>Saving Account</Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Box>

                                            <Box className={styles.buttonContainer}>
                                                <Button
                                                    variant="contained"
                                                    onClick={goNext}
                                                    fullWidth
                                                    className={styles.primaryButton}
                                                    size="large"
                                                    startIcon={<ComputerIcon />}
                                                >
                                                    I have made the payment
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Step 4: Submit Request */}
                                    {step === 4 && (
                                        <Box className={styles.stepContent}>
                                            <Typography variant="h6" className={styles.stepTitle}>
                                                Payment Confirmation
                                            </Typography>

                                            {/* 💰 Amount Input */}
                                            <Grid container spacing={3} className={styles.formGrid} sx={{ mt: 1 }}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Amount to be added"
                                                        value={`₹${amount}`}
                                                        InputProps={{
                                                            readOnly: true,
                                                        }}
                                                        className={styles.formField}
                                                        size="small"
                                                        sx={{
                                                            '& .MuiInputBase-input': {
                                                                fontWeight: 600,
                                                                fontSize: '1.1rem',
                                                                color: '#2e7d32',
                                                            },
                                                        }}
                                                    />
                                                </Grid>

                                                {/* UTR Number */}
                                                <Grid item xs={12} md={6}>
                                                    <TextField
                                                        fullWidth
                                                        type="number"
                                                        label="UTR Number"
                                                        value={utr}
                                                        onChange={(e) => setUtr(e.target.value)}
                                                        className={styles.formField}
                                                        size="small"
                                                        placeholder="Enter UTR number"
                                                    />
                                                </Grid>

                                                {/* Payment Mode */}
                                                <Grid item xs={12} md={6}>
                                                    <Select
                                                        fullWidth
                                                        value={paymentMode}
                                                        onChange={(e) => setPaymentMode(e.target.value)}
                                                        className={styles.formField}
                                                        size="small"
                                                        displayEmpty
                                                    >
                                                        <MenuItem value="">Select Payment Mode</MenuItem>
                                                        <MenuItem value="UPI">UPI</MenuItem>
                                                        <MenuItem value="IMPS">Cash</MenuItem>
                                                        <MenuItem value="NEFT">Cheque</MenuItem>
                                                    </Select>
                                                </Grid>
                                            </Grid>

                                            {/* Upload + CAPTCHA Row */}
                                            <Grid container spacing={3} alignItems="center">
                                                <Grid item xs={12} md={6}>
                                                    <input
                                                        hidden
                                                        id="proof-upload"
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        accept="image/*,.pdf,.doc,.docx"
                                                    />
                                                    <label htmlFor="proof-upload" className={styles.uploadLabel}>
                                                        <Button
                                                            component="span"
                                                            variant="outlined"
                                                            fullWidth
                                                            startIcon={<CloudUploadIcon />}
                                                            className={styles.uploadButton}
                                                            size="medium"
                                                        >
                                                            {proof ? `Uploaded: ${proof.name}` : 'Upload Payment Proof'}
                                                        </Button>
                                                    </label>

                                                    {proof && (
                                                        <Typography
                                                            variant="body2"
                                                            color="success.main"
                                                            sx={{ mt: 1, textAlign: 'center' }}
                                                        >
                                                            File: {proof.name} ({(proof.size / 1024).toFixed(2)} KB)
                                                        </Typography>
                                                    )}
                                                </Grid>

                                                <Grid item xs={12} md={6}>
                                                    <Box>
                                                        <ReCAPTCHA
                                                            sitekey="6LdHTbwrAAAAAGawIo2escUPr198m8cP3o_ZzZK1"
                                                            onChange={(token) => setCaptchaToken(token)}
                                                            onExpired={() => setCaptchaToken(null)}
                                                            theme="light"
                                                        />
                                                    </Box>
                                                </Grid>
                                            </Grid>

                                            {/* Submit Button */}
                                            <Box className={styles.buttonContainer} sx={{ mt: 4 }}>
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    disabled={!amount || !utr || !paymentMode || !proof || loading}
                                                    onClick={handleSubmitRequest}
                                                    className={styles.primaryButton}
                                                    size="medium"
                                                    sx={{ height: 39 }}
                                                >
                                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Step 5: Success */}
                                    {step === 5 && (
                                        <Box className={`${styles.stepContent} ${styles.center}`}>
                                            <div className={styles.successWrapper}>
                                                <CheckCircleIcon className={styles.successIcon} />
                                                <Typography variant="h4" className={styles.successTitle}>
                                                    Request Successful!
                                                </Typography>
                                            </div>

                                            <Typography variant="h6" className={styles.successMessage}>
                                                Your money is on its way and will be added to your wallet within one working day.
                                            </Typography>

                                            <Box className={styles.successDetails}>
                                                <Typography variant="body1" color="text.secondary">
                                                    Transaction ID: TXN{Date.now().toString().slice(-8)}
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary">
                                                    Amount: ₹{amount}
                                                </Typography>
                                                <Typography variant="body1" color="text.secondary">
                                                    Date: {new Date().toLocaleDateString()}
                                                </Typography>
                                            </Box>

                                            <Box className={styles.buttonContainer}>
                                                <Button
                                                    variant="contained"
                                                    onClick={() => {
                                                        setStep(1);
                                                        setActiveTab(1); // Switch to request status tab
                                                    }}
                                                    className={styles.primaryButton}
                                                    size="large"
                                                >
                                                    View Request Status
                                                </Button>
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Box>
                    )}

                  {/* Request Status Tab Content */}
{activeTab === 1 && (
    <Box className={styles.historyContainer}>
        {/* Premium Header */}
        <Box sx={{ 
            textAlign: 'center', 
            mb: 4,
            background: 'linear-gradient(135deg, #0997f5ff 0%, #0c42f5ff 100%)',
            borderRadius: 3,
            py: 3,
            px: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            border: '2px solid #000000',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #ffffff, #cccccc, #999999)',
            }
        }}>
            <PaymentIcon sx={{ 
                fontSize: 48, 
                color: 'white', 
                mb: 2,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
            }} />
            <Typography variant="h4" sx={{ 
                fontWeight: '800', 
                color: 'white',
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                letterSpacing: '0.5px'
            }}>
                Transaction History
            </Typography>
            <Typography variant="h6" sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
                mt: 1
            }}>
                Track your wallet transactions
            </Typography>
        </Box>

        {loadingHistory ? (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                py: 10,
                border: '2px solid #000000',
                borderRadius: 3,
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <CircularProgress size={70} thickness={3} sx={{ color: '#000000', mb: 3 }} />
                <Typography variant="h6" sx={{ color: '#000000', fontWeight: '600' }}>
                    Loading Transactions...
                </Typography>
            </Box>
        ) : requestHistory.length === 0 ? (
            <Box sx={{ 
                textAlign: 'center', 
                py: 10, 
                px: 4,
                border: '2px solid #000000',
                borderRadius: 3,
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}>
                <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    mb: 3,
                    border: '3px solid #000000',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }}>
                    <HistoryIcon sx={{ 
                        fontSize: 60, 
                        color: '#000000'
                    }} />
                </Box>
                <Typography variant="h4" sx={{ 
                    fontWeight: '700', 
                    mb: 2, 
                    color: '#000000',
                }}>
                    No Transactions Found
                </Typography>
                <Typography variant="h6" sx={{ 
                    mb: 4, 
                    color: '#000000', // Changed to black
                    maxWidth: '400px',
                    mx: 'auto',
                    lineHeight: 1.6
                }}>
                    Start by adding money to your wallet to see your transaction history here.
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleAddMoneyClick}
                    startIcon={<AddIcon />}
                    size="large"
                    sx={{
                        background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                        borderRadius: 3,
                        px: 5,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
                        border: '2px solid #000000',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: 'white',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #333333 0%, #000000 100%)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6)',
                            transform: 'translateY(-2px)'
                        },
                        '&:active': {
                            transform: 'translateY(0)'
                        }
                    }}
                >
                    Add Funds
                </Button>
            </Box>
        ) : (
            <TableContainer 
                component={Paper} 
                sx={{ 
                    maxHeight: '70vh', 
                    overflow: 'auto',
                    border: '2px solid #000000',
                    borderRadius: 3,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
                    backgroundColor: '#ffffff',
                    '&::-webkit-scrollbar': {
                        width: 12,
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#f0f0f0',
                        borderRadius: 2,
                        borderLeft: '2px solid #000000'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'linear-gradient(180deg, #000000 0%, #333333 100%)',
                        borderRadius: 2,
                        border: '2px solid #ffffff',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: 'linear-gradient(180deg, #333333 0%, #000000 100%)',
                    }
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow sx={{
                            background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                            '& .MuiTableCell-root': { 
                                py: 3,
                                fontWeight: '800',
                                color: 'black', // Header text black
                                fontSize: '1rem',
                                borderRight: '1px solid rgba(5, 5, 5, 0.3)',
                                borderBottom: '2px solid #0e0d0dff',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                '&:first-of-type': {
                                    borderTopLeftRadius: '12px',
                                },
                                '&:last-child': {
                                    borderRight: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderTopRightRadius: '12px',
                                }
                            }
                        }}>
                            <TableCell sx={{ color: 'white' }}>Sr No</TableCell>
                            <TableCell sx={{ color: 'white' }}>Order ID</TableCell>
                            <TableCell sx={{ color: 'white' }}>Date & Time</TableCell>
                            <TableCell sx={{ color: 'white' }}>UTR No</TableCell>
                            <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                            <TableCell sx={{ color: 'white' }}>Receipt</TableCell>
                            <TableCell sx={{ color: 'white' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white' }}>Approved On</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requestHistory.map((request, index) => (
                            <TableRow
                                key={request.id || index}
                                hover
                                sx={{
                                    background: index % 2 === 0 ? '#ffffff' : '#f8f8f8',
                                    borderBottom: '1px solid #000000',
                                    transition: 'all 0.3s ease',
                                    '& .MuiTableCell-root': { 
                                        py: 2.5,
                                        borderBottom: '1px solid #000000',
                                        borderRight: '1px solid #000000',
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        color: '#000000', // All table data text black
                                        '&:last-child': {
                                            borderRight: '1px solid #000000'
                                        }
                                    },
                                    '&:hover': {
                                        background: '#f0f0f0',
                                        transform: 'translateX(4px)',
                                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
                                        '& .MuiTableCell-root': {
                                            fontWeight: '600',
                                            color: '#000000'
                                        }
                                    },
                                    '&:last-child': {
                                        borderBottom: '1px solid #000000',
                                        '& .MuiTableCell-root': {
                                            borderBottom: '1px solid #000000'
                                        }
                                    }
                                }}
                            >
                                <TableCell sx={{ 
                                    fontWeight: '700', 
                                    color: '#000000', // Black
                                    fontSize: '1.1rem'
                                }}>
                                    <Box sx={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #000000, #333333)',
                                        color: 'white', // Number white on black background
                                        fontSize: '0.9rem',
                                        fontWeight: '800',
                                        border: '1px solid #000000'
                                    }}>
                                        {index + 1}
                                    </Box>
                                </TableCell>
                                
                                <TableCell sx={{ 
                                    fontWeight: '700', 
                                    color: '#000000', // Black
                                    fontFamily: 'monospace'
                                }}>
                                    #{request.id ? request.id.toString().padStart(6, '0') : 'N/A'}
                                </TableCell>
                                
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" fontWeight="600" color="#000000"> {/* Black */}
                                            {request.date || 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" color="#000000" fontWeight="500"> {/* Black */}
                                            {request.time || ''}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                
                                <TableCell sx={{ 
                                    fontFamily: 'monospace',
                                    fontWeight: '600',
                                    color: '#000000', // Black
                                    background: 'rgba(0,0,0,0.05)',
                                    borderRadius: 1,
                                    px: 1,
                                    border: '1px solid #000000'
                                }}>
                                    {request.utr || request.trans_no || 'N/A'}
                                </TableCell>
                                
                                <TableCell sx={{ 
                                    fontWeight: '800', 
                                    color: '#000000', // Black
                                    fontSize: '1.1rem',
                                    background: 'rgba(0,0,0,0.05)',
                                    borderRadius: 1,
                                    border: '1px solid #000000'
                                }}>
                                    ₹{request.amount ? request.amount.toLocaleString() : '0'}
                                </TableCell>
                                
                                <TableCell align="center">
                                    {request.screenshot || request.img ? (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => window.open(request.screenshot || request.img, '_blank')}
                                            startIcon={<CloudUploadIcon />}
                                            sx={{
                                                background: 'linear-gradient(135deg, #000000, #333333)',
                                                borderRadius: 2,
                                                px: 2,
                                                py: 0.8,
                                                fontWeight: '700',
                                                fontSize: '0.8rem',
                                                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                color: 'white', // Button text white
                                                border: '1px solid #000000',
                                                '&:hover': {
                                                    background: 'linear-gradient(135deg, #333333, #000000)',
                                                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            }}
                                        >
                                            View
                                        </Button>
                                    ) : (
                                        <Typography 
                                            variant="body2" 
                                            color="#000000" // Black
                                            fontStyle="italic"
                                            fontWeight="500"
                                            sx={{
                                                padding: '8px 12px',
                                                background: 'rgba(0,0,0,0.03)',
                                                borderRadius: 1,
                                                border: '1px solid #000000'
                                            }}
                                        >
                                            No Receipt
                                        </Typography>
                                    )}
                                </TableCell>
                                
                                <TableCell align="center">
                                    <MuiChip 
                                        label={request.status || 'Pending'}
                                        color={
                                            request.status === 'Approved' ? 'success' : 
                                            request.status === 'Rejected' ? 'error' : 'warning'
                                        }
                                        size="medium"
                                        variant="filled"
                                        sx={{
                                            fontWeight: '800',
                                            minWidth: 100,
                                            fontSize: '0.75rem',
                                            boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            border: '2px solid #000000',
                                            color: 'white' // Chip text white
                                        }}
                                    />
                                </TableCell>
                                
                                <TableCell sx={{ 
                                    color: '#000000', // Black
                                    fontWeight: '800',
                                    background: 'rgba(0,0,0,0.05)',
                                    borderRadius: 1,
                                    border: '1px solid #000000'
                                }}>
                                    {request.approve_date || request.approved_date || 'Pending'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
    </Box>
)}
                </Box>
            </Box>
        </Box>
    );
}