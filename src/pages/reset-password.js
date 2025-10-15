import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import api from "../../utils/api";
import withAuth from "../../utils/withAuth";
import { callAlert } from "../../redux/actions/alert";
import Layout from "@/components/Dashboard/layout";
import {
    Grid, Paper, TableContainer, Button, Typography, Box, TextField
} from "@mui/material";
import Cookies from "js-cookie";
import ReCAPTCHA from "react-google-recaptcha";

function TransactionHistory(props) {
    const [mobile_no, setmobile_no] = useState('');
    const [old_password, setold_password] = useState('');
    const [new_password, setnew_password] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const uid = Cookies.get('uid');
    const mobile = Cookies.get('mobile');

    useEffect(() => {
        if (mobile) setmobile_no(mobile);
    }, [mobile]);

    const validateFields = () => {
        const newErrors = {};
        if (!old_password) newErrors.old_password = "Old password is required";
        if (!new_password) newErrors.new_password = "New password is required";
        if (!recaptchaToken) newErrors.recaptcha = "Please verify you are human";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateFields()) return;

        const formData = {
            userid: uid,
            oldpassword: old_password,
            password: new_password
        };

        try {
            const response = await api.post("/api/users/admin-reset-password", formData);
            if (response.status === 200) {
                alert('Reset password successfully');
                Cookies.remove('uid');
                Cookies.remove('role');
            } else {
                dispatch(callAlert({ message: response.data.error, type: 'FAILED' }));
            }
        } catch (error) {
            console.error('Error updating :', error);
            dispatch(callAlert({ message: error.message, type: 'FAILED' }));
        }
    };

    return (
        <Layout>
            <Grid container spacing={2} sx={{ padding: 2 }}>
                {/* Row 1: Mobile No + Old Password */}
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Box display={'inline-block'} mt={1} mb={1} style={{ width: '40%' }}>
                            <Typography variant="h5" sx={{ padding: 2 }}>Reset Password</Typography>
                        </Box>
                    </TableContainer>
                </Grid>
                <Grid container item spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Mobile No"
                            variant="outlined"
                            value={mobile_no}
                            InputProps={{ readOnly: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="Old Password"
                            variant="outlined"
                            type="password"
                            value={old_password}
                            onChange={(e) => setold_password(e.target.value)}
                            error={!!errors.old_password}
                            helperText={errors.old_password}
                        />
                    </Grid>
                </Grid>

                {/* Row 2: New Password + reCAPTCHA */}
                <Grid container item spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            label="New Password"
                            variant="outlined"
                            type="password"
                            value={new_password}
                            onChange={(e) => setnew_password(e.target.value)}
                            error={!!errors.new_password}
                            helperText={errors.new_password}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <ReCAPTCHA
                            sitekey="6LdHTbwrAAAAAGawIo2escUPr198m8cP3o_ZzZK1"
                            onChange={(token) => {
                                setRecaptchaToken(token);
                                if (errors.recaptcha) setErrors(prev => ({ ...prev, recaptcha: null }));
                            }}
                        />
                        {errors.recaptcha && (
                            <Typography variant="body2" color="error">{errors.recaptcha}</Typography>
                        )}
                    </Grid>
                </Grid>

                {/* Row 3: Submit button aligned right */}
                <Grid container item>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="success"
                            size="medium"
                            onClick={handleSubmit}
                        >
                            Change Password
                        </Button>
                    </Grid>
                </Grid>
            </Grid>

        </Layout>
    );
}

export default withAuth(TransactionHistory);
