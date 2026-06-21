/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

// react-router-dom components
import { Link } from "react-router-dom";
import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Placeholder for reset password logic
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <CoverLayout coverHeight="50vh" image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="primary"
          borderRadius="lg"
          coloredShadow="primary"
          mx={2}
          mt={-3}
          py={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>
            Reset Password
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            You will receive an email with reset instructions
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {success ? (
            <MDBox textAlign="center" py={4}>
              <MDTypography variant="h5" color="success" mb={2}>
                Email sent!
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={3}>
                Check your inbox for a password reset link.
              </MDTypography>
              <MDButton
                component={Link}
                to="/authentication/sign-in"
                variant="gradient"
                color="primary"
              >
                Go to Sign In
              </MDButton>
            </MDBox>
          ) : (
            <MDBox component="form" role="form" onSubmit={handleSubmit}>
              {error && (
                <MDBox mb={2}>
                  <MDTypography variant="caption" color="error" fontWeight="medium">
                    {error}
                  </MDTypography>
                </MDBox>
              )}
              <MDBox mb={4}>
                <MDInput type="email" label="Email" variant="standard" fullWidth required />
              </MDBox>
              <MDBox mt={6} mb={1}>
                <MDButton
                  type="submit"
                  variant="gradient"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? "Sending..." : "Reset Password"}
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Remember your password?{" "}
                  <MDTypography
                    component={Link}
                    to="/authentication/sign-in"
                    variant="button"
                    color="primary"
                    fontWeight="medium"
                    textGradient
                  >
                    Sign In
                  </MDTypography>
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
