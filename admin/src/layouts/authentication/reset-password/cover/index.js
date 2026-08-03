import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/bg-reset-cover.jpeg";
import { authService } from "services/auth";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    setError("");
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <CoverLayout coverHeight="50vh" image={bgImage}>
        <Card>
          <MDBox variant="gradient" bgColor="primary" borderRadius="lg" coloredShadow="primary"
            mx={2} mt={-3} py={2} mb={1} textAlign="center">
            <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>Set New Password</MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            {success ? (
              <MDBox textAlign="center" py={4}>
                <MDTypography variant="h5" color="success" mb={2}>Password updated!</MDTypography>
                <MDTypography variant="body2" color="text" mb={3}>Your password has been reset.</MDTypography>
                <MDButton component={Link} to="/authentication/sign-in" variant="gradient" color="primary">Go to Sign In</MDButton>
              </MDBox>
            ) : (
              <MDBox component="form" role="form" onSubmit={handleReset}>
                {error && <MDBox mb={2}><MDTypography variant="caption" color="error">{error}</MDTypography></MDBox>}
                <MDBox mb={3}>
                  <MDInput type="password" label="New Password" variant="standard" fullWidth required
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                </MDBox>
                <MDBox mb={3}>
                  <MDInput type="password" label="Confirm Password" variant="standard" fullWidth required
                    value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </MDBox>
                <MDButton type="submit" variant="gradient" color="primary" fullWidth
                  disabled={loading || !password || !confirm}
                  startIcon={loading ? <CircularProgress size={20} /> : null}>
                  {loading ? "Resetting..." : "Reset Password"}
                </MDButton>
              </MDBox>
            )}
          </MDBox>
        </Card>
      </CoverLayout>
    );
  }

  return (
    <CoverLayout coverHeight="50vh" image={bgImage}>
      <Card>
        <MDBox variant="gradient" bgColor="primary" borderRadius="lg" coloredShadow="primary"
          mx={2} mt={-3} py={2} mb={1} textAlign="center">
          <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>Reset Password</MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            You will receive an email with reset instructions
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {success ? (
            <MDBox textAlign="center" py={4}>
              <MDTypography variant="h5" color="success" mb={2}>Email sent!</MDTypography>
              <MDTypography variant="body2" color="text" mb={3}>Check your inbox for a password reset link.</MDTypography>
              <MDButton component={Link} to="/authentication/sign-in" variant="gradient" color="primary">Go to Sign In</MDButton>
            </MDBox>
          ) : (
            <MDBox component="form" role="form" onSubmit={handleForgot}>
              {error && <MDBox mb={2}><MDTypography variant="caption" color="error">{error}</MDTypography></MDBox>}
              <MDBox mb={4}>
                <MDInput type="email" label="Email" variant="standard" fullWidth required
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </MDBox>
              <MDButton type="submit" variant="gradient" color="primary" fullWidth
                disabled={loading || !email}
                startIcon={loading ? <CircularProgress size={20} /> : null}>
                {loading ? "Sending..." : "Reset Password"}
              </MDButton>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Remember your password?{" "}
                  <MDTypography component={Link} to="/authentication/sign-in" variant="button" color="primary" fontWeight="medium" textGradient>Sign In</MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default ResetPassword;
