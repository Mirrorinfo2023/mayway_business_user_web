// components/UnblockUser.jsx
import { Grid, TextField, Button, Typography, InputAdornment, Box, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import { Person, LockOpen } from "@mui/icons-material";
import api from "../../../utils/api";
import styles from "./Login.module.css";
import { DataEncrypt, DataDecrypt } from "../../../utils/encryption"

const UnblockUser = ({ onBack }) => {
  const [mobile, setmobile] = useState("");
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({ open: false, type: false, message: null });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mobile.trim()) {
      setError("Mobile number is required");
      return;
    }

    setLoading(true);
    try {
      // Convert to JSON string before encrypting
      const encReq = DataEncrypt(JSON.stringify({ mobile_no: mobile }));

      const response = await api.post(
        '/api/users/77651f481820ee7a6d33dfde4579d48715f0d1d9',
        { encReq }
      );

      const resData = DataDecrypt(response.data);

      if (resData.status === 200) {
        // Show success alert
        setAlert({ open: true, type: true, message: 'User unblocked successfully!' });
        // Optional: go back after a short delay
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        // Show error alert
        setAlert({ open: true, type: false, message: resData.message || 'Failed to unblock user.' });
      }
    } catch (err) {
      setAlert({ open: true, type: false, message: err.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };



  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3} className={styles.formContainer}>
        <Grid item xs={12}>
          <Typography className={styles.inputLabel}>Mobile</Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter mobile to unblock"
            value={mobile}
            onChange={(e) => {
              setmobile(e.target.value);
              if (error) setError("");
            }}
            error={Boolean(error)}
            helperText={error}
            InputProps={{
              className: styles.textInput,
              startAdornment: (
                <InputAdornment position="start">
                  <Person className={styles.inputIcon} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            endIcon={<Box className={styles.arrowIcon}><LockOpen /></Box>}
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Unblocking...' : 'Unblock User'}
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography className={styles.backLink} onClick={onBack}>
            ← Back to Login
          </Typography>
        </Grid>
      </Grid>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ open: false, type: false, message: null })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setAlert({ open: false, type: false, message: null })}
          severity={alert.type ? 'success' : 'error'}
          variant="filled"
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </form>
  );
};

export default UnblockUser;
