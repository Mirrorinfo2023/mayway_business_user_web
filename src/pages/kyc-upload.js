"use client";
import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Stepper,
    Step,
    StepLabel,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    InputAdornment,
    IconButton,
    Alert,
    Paper
} from "@mui/material";
import {
    ArrowBack,
    CloudUpload,
    Description,
    ContactPage,
    Home,
    CreditCard,
    Person,
    People,
    AccountBalance,
    Business,
    Badge,
    PhotoCamera,
    CheckCircle
} from "@mui/icons-material";
import { useRouter } from 'next/router';
import Layout from '@/components/Dashboard/layout';
import ReCAPTCHA from "react-google-recaptcha";
import api from "../../utils/api";
import { DataEncrypt } from "../../utils/encryption";
import { CircularProgress } from '@mui/material';

const steps = ["Aadhaar", "PAN", "Bank", "Company", "Status"];

export default function KYCPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [completed, setCompleted] = useState({});
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);

    const [submissionSuccess, setSubmissionSuccess] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        user_id: "",
        // Aadhaar
        aadhaarNo: "",
        address: "",
        aadhaarFront: null,
        aadhaarBack: null,
        // PAN
        panNo: "",
        nominee: "",
        nomineeRelation: "",
        panPhoto: null,
        // Bank
        accNo: "",
        bankName: "",
        holderName: "",
        ifsc: "",
        bankDoc: null,
        // Company
        businessType: "",
        shopActNumber: "",
        shopActFile: null,
        udyogAadharNumber: "",
        udyogAadharFile: null,
        gstNumber: "",
        gstFile: null,
        moaFile: null,
        incorporationFile: null,
        // Status
        status: "Pending",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Get user ID from session storage
        const userId = sessionStorage.getItem('id');
        if (userId) {
            setFormData(prev => ({ ...prev, user_id: userId }));
        }
    }, []);

    const showAlert = (message, severity = 'info') => {
        alert({ open: true, message, severity });
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    const handleFileUpload = (fieldName, file) => {
        const fileSize = file.size / 1024 / 1024; // in MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

        if (!allowedTypes.includes(file.type)) {
            showAlert('Please upload only JPG, PNG, or PDF files', 'error');
            return;
        }

        if (fileSize > 5) {
            showAlert('File size should be less than 5MB', 'error');
            return;
        }

        setFormData(prev => ({
            ...prev,
            [fieldName]: file
        }));
    };

    const validateStep = () => {
        let tempErrors = {};

        switch (activeStep) {
            case 0: // Aadhaar
                if (!formData.aadhaarNo) tempErrors.aadhaarNo = "Aadhaar number required";
                else if (!/^\d{12}$/.test(formData.aadhaarNo))
                    tempErrors.aadhaarNo = "Enter valid 12-digit Aadhaar";
                if (!formData.address) tempErrors.address = "Address required";
                if (!formData.aadhaarFront) tempErrors.aadhaarFront = "Upload Aadhaar front";
                if (!formData.aadhaarBack) tempErrors.aadhaarBack = "Upload Aadhaar back";
                break;

            case 1: // PAN
                if (!formData.panNo) tempErrors.panNo = "PAN number required";
                else if (!/[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(formData.panNo))
                    tempErrors.panNo = "Invalid PAN format";
                if (!formData.nominee) tempErrors.nominee = "Nominee required";
                if (!formData.nomineeRelation) tempErrors.nomineeRelation = "Relation required";
                if (!formData.panPhoto) tempErrors.panPhoto = "Upload PAN photo";
                break;

            case 2: // Bank
                if (!formData.accNo) tempErrors.accNo = "Account number required";
                if (!formData.bankName) tempErrors.bankName = "Bank name required";
                if (!formData.holderName) tempErrors.holderName = "Holder name required";
                if (!formData.ifsc) tempErrors.ifsc = "IFSC required";
                if (!formData.bankDoc) tempErrors.bankDoc = "Upload bank document";
                break;

            case 3: // Company
                if (!formData.businessType) {
                    tempErrors.businessType = "Business type required";
                } else {
                    // Common fields for both business types
                    if (!formData.shopActNumber) tempErrors.shopActNumber = "Shop Act number required";
                    if (!formData.shopActFile) tempErrors.shopActFile = "Shop Act document required";
                    if (!formData.udyogAadharNumber) tempErrors.udyogAadharNumber = "Udyog Aadhar number required";
                    if (!formData.udyogAadharFile) tempErrors.udyogAadharFile = "Udyog Aadhar document required";
                    if (!formData.gstNumber) tempErrors.gstNumber = "GST number required";
                    if (!formData.gstFile) tempErrors.gstFile = "GST document required";

                    // Additional fields for Pvt Ltd
                    if (formData.businessType === "pvt_ltd") {
                        if (!formData.moaFile) tempErrors.moaFile = "MOA document required";
                        if (!formData.incorporationFile) tempErrors.incorporationFile = "Incorporation certificate required";
                    }
                }
                break;

            case 4: // Status - No validation needed
                if (!recaptchaToken && !submissionSuccess) tempErrors.recaptchaToken = "Please complete the reCAPTCHA verification";
                break;
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            const newCompleted = completed;
            newCompleted[activeStep] = true;
            setCompleted(newCompleted);
            setActiveStep((prevStep) => prevStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    // Function to reset all form data
    const resetFormData = () => {
        const userId = formData.user_id; // Preserve user_id
        setFormData({
            user_id: userId,
            aadhaarNo: "",
            address: "",
            aadhaarFront: null,
            aadhaarBack: null,
            panNo: "",
            nominee: "",
            nomineeRelation: "",
            panPhoto: null,
            accNo: "",
            bankName: "",
            holderName: "",
            ifsc: "",
            bankDoc: null,
            businessType: "",
            shopActNumber: "",
            shopActFile: null,
            udyogAadharNumber: "",
            udyogAadharFile: null,
            gstNumber: "",
            gstFile: null,
            moaFile: null,
            incorporationFile: null,
            status: "Pending",
        });
        setCompleted({});
        setRecaptchaToken(null);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return;

        setLoading(true);
        try {
            const data = new FormData();

            // ✅ Append all text fields
            data.append("user_id", formData.user_id);
            data.append("pan_number", formData.panNo);
            data.append("aadhar_number", formData.aadhaarNo);
            data.append("account_number", formData.accNo);
            data.append("account_holder", formData.holderName);
            data.append("bank_name", formData.bankName);
            data.append("ifsc_code", formData.ifsc);
            data.append("nominee_name", formData.nominee);
            data.append("nominee_relation", formData.nomineeRelation);
            data.append("full_address", formData.address);

            // ✅ Append company details
            data.append("business_type", formData.businessType);
            data.append("shop_act_number", formData.shopActNumber);
            data.append("udyog_aadhar_number", formData.udyogAadharNumber);
            data.append("gst_number", formData.gstNumber);

            // ✅ Append files
            if (formData.panPhoto) data.append("panImage", formData.panPhoto);
            if (formData.aadhaarFront) data.append("aadharImage", formData.aadhaarFront);
            if (formData.aadhaarBack) data.append("aadharBackImage", formData.aadhaarBack);
            if (formData.bankDoc) data.append("chequeBookImage", formData.bankDoc);
            if (formData.shopActFile) data.append("shopActFile", formData.shopActFile);
            if (formData.udyogAadharFile) data.append("udyogAadharFile", formData.udyogAadharFile);
            if (formData.gstFile) data.append("gstFile", formData.gstFile);
            if (formData.moaFile) data.append("moaFile", formData.moaFile);
            if (formData.incorporationFile) data.append("incorporationFile", formData.incorporationFile);

            const res = await api.post(
                "/api/users/550ecdddb5b8b023dda91594810884c12456d0a3",
                data,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            console.log("KYC Upload Response:", res.data);

            // Set submission success and show success message
            setSubmissionSuccess(true);
            alert("KYC submitted successfully!");

            // Reset form after successful submission
            setTimeout(() => {
                resetFormData();
            }, 3000);

        } catch (err) {
            console.error("KYC Submit Error:", err.response?.data || err.message);
            alert("Error submitting KYC. Please try again.");
        }
        setLoading(false);
    };

    const fieldStyle = {
        borderRadius: 2,
        background: "#fafafa",
        "& .MuiInputBase-input": {
            fontSize: "16px",
            padding: "8px 12px",
        },
        "& .MuiOutlinedInput-root": {
            minHeight: "40px",
        },
    };

    const renderStepContent = () => {
        const fieldBox = { display: "flex", flexDirection: "column", gap: 2, p: 3 };

        switch (activeStep) {
            case 0: // Aadhaar
                return (
                    <Card sx={fieldBox} elevation={3}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ContactPage /> Aadhaar Details
                        </Typography>

                        <TextField
                            label="Aadhaar Number"
                            name="aadhaarNo"
                            value={formData.aadhaarNo}
                            onChange={handleChange}
                            error={!!errors.aadhaarNo}
                            helperText={errors.aadhaarNo}
                            sx={fieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <ContactPage />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Address"
                            name="address"
                            multiline
                            rows={3}
                            value={formData.address}
                            onChange={handleChange}
                            error={!!errors.address}
                            helperText={errors.address}
                            sx={fieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Home />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                fullWidth
                            >
                                {formData.aadhaarFront ? formData.aadhaarFront.name : "Upload Aadhaar Front"}
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => handleFileUpload("aadhaarFront", e.target.files[0])}
                                    accept=".jpg,.jpeg,.png,.pdf"
                                />
                            </Button>
                            {errors.aadhaarFront && <Typography color="error" variant="caption">{errors.aadhaarFront}</Typography>}

                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUpload />}
                                fullWidth
                            >
                                {formData.aadhaarBack ? formData.aadhaarBack.name : "Upload Aadhaar Back"}
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => handleFileUpload("aadhaarBack", e.target.files[0])}
                                    accept=".jpg,.jpeg,.png,.pdf"
                                />
                            </Button>
                            {errors.aadhaarBack && <Typography color="error" variant="caption">{errors.aadhaarBack}</Typography>}
                        </Box>
                    </Card>
                );

            case 1: // PAN
                return (
                    <Card sx={fieldBox} elevation={3}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CreditCard /> PAN Details
                        </Typography>

                        <TextField
                            label="PAN Number"
                            name="panNo"
                            value={formData.panNo}
                            onChange={handleChange}
                            error={!!errors.panNo}
                            helperText={errors.panNo || "Format: ABCDE1234F"}
                            sx={fieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CreditCard />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Nominee Name"
                            name="nominee"
                            value={formData.nominee}
                            onChange={handleChange}
                            error={!!errors.nominee}
                            helperText={errors.nominee}
                            sx={fieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Nominee Relation"
                            name="nomineeRelation"
                            select
                            value={formData.nomineeRelation}
                            onChange={handleChange}
                            error={!!errors.nomineeRelation}
                            helperText={errors.nomineeRelation}
                            sx={fieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <People />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value="Father">Father</MenuItem>
                            <MenuItem value="Mother">Mother</MenuItem>
                            <MenuItem value="Spouse">Spouse</MenuItem>
                            <MenuItem value="Sibling">Sibling</MenuItem>
                            <MenuItem value="Child">Child</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                        >
                            {formData.panPhoto ? formData.panPhoto.name : "Upload PAN Card"}
                            <input
                                type="file"
                                hidden
                                onChange={(e) => handleFileUpload("panPhoto", e.target.files[0])}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                        </Button>
                        {errors.panPhoto && <Typography color="error" variant="caption">{errors.panPhoto}</Typography>}
                    </Card>
                );

            case 2: // Bank
                return (
                    <Card sx={fieldBox} elevation={3}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalance /> Bank Details
                        </Typography>

                        <TextField
                            label="Account Number"
                            name="accNo"
                            value={formData.accNo}
                            onChange={handleChange}
                            error={!!errors.accNo}
                            helperText={errors.accNo}
                            sx={fieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Badge />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Bank Name"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            error={!!errors.bankName}
                            helperText={errors.bankName}
                            sx={fieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountBalance />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Account Holder Name"
                            name="holderName"
                            value={formData.holderName}
                            onChange={handleChange}
                            error={!!errors.holderName}
                            helperText={errors.holderName}
                            sx={fieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="IFSC Code"
                            name="ifsc"
                            value={formData.ifsc}
                            onChange={handleChange}
                            error={!!errors.ifsc}
                            helperText={errors.ifsc}
                            sx={fieldStyle}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Description />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                        >
                            {formData.bankDoc ? formData.bankDoc.name : "Upload Bank Document (Passbook/Cancelled Cheque)"}
                            <input
                                type="file"
                                hidden
                                onChange={(e) => handleFileUpload("bankDoc", e.target.files[0])}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                        </Button>
                        {errors.bankDoc && <Typography color="error" variant="caption">{errors.bankDoc}</Typography>}
                    </Card>
                );

            case 3: // Company
                return (
                    <Card sx={fieldBox} elevation={3}>
                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business /> Company Details
                        </Typography>

                        <FormControl fullWidth error={!!errors.businessType} sx={fieldStyle}>
                            <InputLabel>Business Type</InputLabel>
                            <Select
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleChange}
                                label="Business Type"
                            >
                                <MenuItem value="proprietor">Proprietor</MenuItem>
                                <MenuItem value="pvt_ltd">Private Limited</MenuItem>
                            </Select>
                            {errors.businessType && <Typography color="error" variant="caption">{errors.businessType}</Typography>}
                        </FormControl>

                        {/* Common fields for both business types */}
                        <TextField
                            label="Shop Act Number"
                            name="shopActNumber"
                            value={formData.shopActNumber}
                            onChange={handleChange}
                            error={!!errors.shopActNumber}
                            helperText={errors.shopActNumber}
                            sx={fieldStyle}
                        />

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                        >
                            {formData.shopActFile ? formData.shopActFile.name : "Upload Shop Act Document"}
                            <input
                                type="file"
                                hidden
                                onChange={(e) => handleFileUpload("shopActFile", e.target.files[0])}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                        </Button>
                        {errors.shopActFile && <Typography color="error" variant="caption">{errors.shopActFile}</Typography>}

                        <TextField
                            label="Udyog Aadhar Number"
                            name="udyogAadharNumber"
                            value={formData.udyogAadharNumber}
                            onChange={handleChange}
                            error={!!errors.udyogAadharNumber}
                            helperText={errors.udyogAadharNumber}
                            sx={fieldStyle}
                        />

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                        >
                            {formData.udyogAadharFile ? formData.udyogAadharFile.name : "Upload Udyog Aadhar Document"}
                            <input
                                type="file"
                                hidden
                                onChange={(e) => handleFileUpload("udyogAadharFile", e.target.files[0])}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                        </Button>
                        {errors.udyogAadharFile && <Typography color="error" variant="caption">{errors.udyogAadharFile}</Typography>}

                        <TextField
                            label="GST Number"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleChange}
                            error={!!errors.gstNumber}
                            helperText={errors.gstNumber}
                            sx={fieldStyle}
                        />

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                        >
                            {formData.gstFile ? formData.gstFile.name : "Upload GST Certificate"}
                            <input
                                type="file"
                                hidden
                                onChange={(e) => handleFileUpload("gstFile", e.target.files[0])}
                                accept=".jpg,.jpeg,.png,.pdf"
                            />
                        </Button>
                        {errors.gstFile && <Typography color="error" variant="caption">{errors.gstFile}</Typography>}

                        {/* Additional fields for Pvt Ltd */}
                        {formData.businessType === "pvt_ltd" && (
                            <>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                >
                                    {formData.moaFile ? formData.moaFile.name : "Upload MOA (Memorandum of Association)"}
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e) => handleFileUpload("moaFile", e.target.files[0])}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                    />
                                </Button>
                                {errors.moaFile && <Typography color="error" variant="caption">{errors.moaFile}</Typography>}

                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<CloudUpload />}
                                >
                                    {formData.incorporationFile ? formData.incorporationFile.name : "Upload Incorporation Certificate"}
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e) => handleFileUpload("incorporationFile", e.target.files[0])}
                                        accept=".jpg,.jpeg,.png,.pdf"
                                    />
                                </Button>
                                {errors.incorporationFile && <Typography color="error" variant="caption">{errors.incorporationFile}</Typography>}
                            </>
                        )}
                    </Card>
                );

            case 4: // Status
                return (
                    <Card sx={{ p: 4, textAlign: "center" }} elevation={3}>
                        {submissionSuccess ? (
                            // Success State
                            <Box>
                                <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
                                <Typography variant="h4" gutterBottom color="success.main">
                                    KYC Submitted Successfully!
                                </Typography>
                                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                    Current Status: <strong>Pending</strong>
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                                    Your KYC application has been submitted successfully and is currently under review.
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    You will be notified once your KYC is verified. This process usually takes 24-48 hours.
                                </Typography>

                                <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        What is Next?
                                    </Typography>
                                    <Typography variant="body2" textAlign="left">
                                        • Your documents are being verified<br />
                                        • You will receive a confirmation email/SMS<br />
                                        • Check your KYC status in the profile section<br />
                                        • Contact support if you have any questions
                                    </Typography>
                                </Box>

                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        resetFormData();
                                        setActiveStep(0);
                                        setSubmissionSuccess(false);
                                    }}
                                    sx={{ mt: 3 }}
                                >
                                    Submit Another KYC
                                </Button>
                            </Box>
                        ) : (
                            // Pre-submission State
                            <Box>
                                <Typography variant="h5" gutterBottom color="primary">
                                    KYC Submission Ready
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3 }}>
                                    Please verify all the information you have provided and complete the reCAPTCHA to submit your KYC application.
                                </Typography>

                                <Box sx={{ my: 3, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Documents Uploaded:
                                    </Typography>
                                    <Typography variant="body2">
                                        • Aadhaar Card: {formData.aadhaarFront && formData.aadhaarBack ? "✅" : "❌"}<br />
                                        • PAN Card: {formData.panPhoto ? "✅" : "❌"}<br />
                                        • Bank Document: {formData.bankDoc ? "✅" : "❌"}<br />
                                        • Company Documents: {
                                            formData.shopActFile && formData.udyogAadharFile && formData.gstFile &&
                                                (formData.businessType !== "pvt_ltd" || (formData.moaFile && formData.incorporationFile)) ? "✅" : "❌"
                                        }
                                    </Typography>
                                </Box>

                                <ReCAPTCHA
                                    sitekey="6LdHTbwrAAAAAGawIo2escUPr198m8cP3o_ZzZK1"
                                    onChange={(token) => setRecaptchaToken(token)}
                                />
                                {errors.recaptchaToken && <Typography color="error" variant="caption">{errors.recaptchaToken}</Typography>}
                            </Box>
                        )}
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <Container>
            {/* Alert */}
            {alert.open && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <IconButton onClick={() => router.push('/profile')} sx={{ mr: 2 }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            KYC Verification
                        </Typography>
                    </Box>

                    {/* Stepper - Hide when submission is successful */}
                    {!submissionSuccess && (
                        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    )}

                    {/* Step Content */}
                    {renderStepContent()}

                    {/* Navigation Buttons - Hide when submission is successful */}
                    {!submissionSuccess && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                            <Button
                                onClick={handleBack}
                                disabled={activeStep === 0}
                                variant="outlined"
                                size="large"
                            >
                                Back
                            </Button>

                            <Box>
                                {activeStep === steps.length - 1 ? (
                                    <Button
                                        variant="contained"
                                        onClick={handleSubmit}
                                        size="large"
                                        disabled={loading || !recaptchaToken}
                                        startIcon={loading ? <CircularProgress size={20} /> : null}
                                    >
                                        {loading ? "Submitting..." : "Submit KYC"}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        size="large"
                                    >
                                        Next
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
}