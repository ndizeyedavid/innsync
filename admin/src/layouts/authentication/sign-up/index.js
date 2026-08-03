import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import { useAuth } from "contexts/AuthContext";
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function SignUp() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(formRef.current);
    const name = form.get("name");
    const email = form.get("email");
    const password = form.get("password");

    if (!name || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      await signup(name, email, password);
      navigate("/onboarding");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox variant="gradient" bgColor="primary" borderRadius="lg" coloredShadow="primary"
          mx={2} mt={-3} p={3} mb={1} textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            InnSync Hotel
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Create your hotel account
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit} ref={formRef}>
            {error && (
              <MDBox mb={2}>
                <MDTypography variant="caption" color="error" fontWeight="medium">{error}</MDTypography>
              </MDBox>
            )}
            <MDBox mb={2}>
              <MDInput type="text" label="Full Name" name="name" variant="standard" fullWidth required />
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="email" label="Email" name="email" variant="standard" fullWidth required />
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="password" label="Password (min 8 chars)" name="password" variant="standard" fullWidth required />
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="primary" fullWidth disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Creating account..." : "Sign up"}
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography component="a" href="/authentication/sign-in" variant="button" color="primary" fontWeight="medium" textGradient
                  onClick={(e) => { e.preventDefault(); navigate("/authentication/sign-in"); }}
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default SignUp;
