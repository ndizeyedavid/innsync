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

// Services
import { authService } from "services/auth";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function SignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Note: Hotel managers should not be able to sign up publicly.
    // This is a placeholder for future use (e.g., self-service sign-up for hotels if needed).
    // For now, we'll just show a message.
    setLoading(false);
    setError("Please contact your administrator to create an account.");
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="primary"
          borderRadius="lg"
          coloredShadow="primary"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            InnSync Hotel
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Sign up for an account
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {success ? (
            <MDBox textAlign="center" py={4}>
              <MDTypography variant="h5" color="success" mb={2}>
                Account created!
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={3}>
                Please check your email for verification.
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
              <MDBox mb={2}>
                <MDInput type="text" label="Full Name" variant="standard" fullWidth required />
              </MDBox>
              <MDBox mb={2}>
                <MDInput type="email" label="Email" variant="standard" fullWidth required />
              </MDBox>
              <MDBox mb={2}>
                <MDInput type="password" label="Password" variant="standard" fullWidth required />
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton
                  type="submit"
                  variant="gradient"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? "Signing up..." : "Sign up"}
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Already have an account?{" "}
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

export default SignUp;
