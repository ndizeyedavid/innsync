import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Alert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import PageLayout from "examples/LayoutContainers/PageLayout";
import { hotelManagerAPI } from "services/hotelManager";

const steps = ["Hotel Details", "Contact & Times", "Done"];

function Onboarding() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");

  const { data: existingSettings } = useQuery({
    queryKey: ["hotelSettings"],
    queryFn: hotelManagerAPI.getHotelSettings,
  });

  useEffect(() => {
    if (existingSettings?.name && existingSettings.name.trim().length > 0) {
      navigate("/dashboard", { replace: true });
    }
  }, [existingSettings, navigate]);
  const [form, setForm] = useState({
    name: "", address: "", description: "",
    phone: "", email: "",
    checkInTime: "14:00", checkOutTime: "11:00",
  });

  const saveMutation = useMutation({
    mutationFn: (data) => hotelManagerAPI.updateHotelSettings(data),
    onSuccess: () => navigate("/dashboard"),
    onError: (err) => setError(err?.response?.data?.message || "Save failed"),
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const canNext = () => {
    if (activeStep === 0) return form.name.trim().length > 0 && form.address.trim().length > 0;
    if (activeStep === 1) return form.phone.trim().length > 0 && form.email.trim().length > 0;
    return true;
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((s) => s + 1);
    } else {
      saveMutation.mutate(form);
    }
  };

  return (
    <PageLayout>
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ backgroundColor: "#f0f2f5" }}>
        <Card sx={{ maxWidth: 600, width: "100%", mx: 2 }}>
          <MDBox variant="gradient" bgColor="primary" borderRadius="lg" coloredShadow="primary"
            mx={2} mt={-3} p={3} textAlign="center"
          >
            <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
              Welcome to InnSync
            </MDTypography>
            <MDTypography display="block" variant="button" color="white" my={1}>
              Set up your hotel to get started
            </MDTypography>
          </MDBox>

          <MDBox pt={3} px={3}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>
          </MDBox>

          <MDBox p={3}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {activeStep === 0 && (
              <MDBox display="flex" flexDirection="column" gap={3}>
                <MDTypography variant="h6">Tell us about your hotel</MDTypography>
                <MDInput type="text" label="Hotel Name *" variant="standard" fullWidth
                  value={form.name} onChange={update("name")} />
                <MDInput type="text" label="Address *" variant="standard" fullWidth
                  value={form.address} onChange={update("address")} />
                <MDInput type="text" label="Description" variant="standard" fullWidth multiline rows={2}
                  value={form.description} onChange={update("description")} />
              </MDBox>
            )}

            {activeStep === 1 && (
              <MDBox display="flex" flexDirection="column" gap={3}>
                <MDTypography variant="h6">Contact details &amp; times</MDTypography>
                <MDInput type="tel" label="Phone Number *" variant="standard" fullWidth
                  value={form.phone} onChange={update("phone")} />
                <MDInput type="email" label="Email *" variant="standard" fullWidth
                  value={form.email} onChange={update("email")} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <MDInput type="time" label="Check-in Time" variant="standard" fullWidth
                      value={form.checkInTime} onChange={update("checkInTime")} />
                  </Grid>
                  <Grid item xs={6}>
                    <MDInput type="time" label="Check-out Time" variant="standard" fullWidth
                      value={form.checkOutTime} onChange={update("checkOutTime")} />
                  </Grid>
                </Grid>
              </MDBox>
            )}

            {activeStep === 2 && (
              <MDBox textAlign="center" py={4}>
                <MDTypography variant="h5" color="success" mb={2}>All set!</MDTypography>
                <MDTypography variant="body2" color="text">
                  Review your details and click Finish to start managing your hotel.
                </MDTypography>
                <MDBox mt={3} textAlign="left" bgColor="grey-100" p={2} borderRadius="md">
                  <MDTypography variant="body2"><strong>Hotel:</strong> {form.name}</MDTypography>
                  <MDTypography variant="body2"><strong>Address:</strong> {form.address}</MDTypography>
                  <MDTypography variant="body2"><strong>Phone:</strong> {form.phone}</MDTypography>
                  <MDTypography variant="body2"><strong>Email:</strong> {form.email}</MDTypography>
                  <MDTypography variant="body2"><strong>Check-in:</strong> {form.checkInTime} / <strong>Check-out:</strong> {form.checkOutTime}</MDTypography>
                </MDBox>
              </MDBox>
            )}

            <MDBox mt={4} display="flex" justifyContent="space-between">
              <MDButton variant="outlined" color="secondary" disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => s - 1)}
              >
                Back
              </MDButton>
              <MDButton variant="gradient" color="primary" onClick={handleNext}
                disabled={!canNext() || saveMutation.isPending}
              >
                {activeStep === steps.length - 1
                  ? (saveMutation.isPending ? "Saving..." : "Finish")
                  : "Next"}
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </PageLayout>
  );
}

export default Onboarding;
