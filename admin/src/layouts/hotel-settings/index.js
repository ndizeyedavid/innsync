import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";
import ImageUpload from "components/ImageUpload";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "INR", "BRL"];
const TIMEZONES = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Asia/Dubai", "Asia/Kolkata", "Australia/Sydney", "Pacific/Auckland"];

function HotelSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  const { data: hotel, isLoading, error } = useQuery({
    queryKey: ["hotelSettings"],
    queryFn: () => hotelManagerAPI.getHotelSettings(),
  });

  useEffect(() => {
    if (hotel && !isDirty) setForm(hotel);
  }, [hotel, isDirty]);

  const saveMutation = useMutation({
    mutationFn: (data) => hotelManagerAPI.updateHotelSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelSettings"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDashboard"] });
      setIsDirty(false);
      setSaved(true);
    },
    onError: () => setSaved(true),
  });

  const update = (field) => (e) => {
    setIsDirty(true);
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Hotel name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (form.phone && !/^[\d\s\-+()]{7,20}$/.test(form.phone)) e.phone = "Invalid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    saveMutation.mutate(form);
  };

  const handleCancel = () => {
    if (hotel) setForm({ ...hotel });
  };

  if (isLoading) return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} display="flex" justifyContent="center"><CircularProgress /></MDBox>
      <Footer />
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="info">
                <MDTypography variant="h6" color="white">Hotel Settings</MDTypography>
              </MDBox>
              <MDBox pt={4} px={3} pb={3}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>Failed to load settings</Alert>}

                <MDBox component="form" role="form">
                  <MDBox mb={3}>
                    <TextField label="Hotel Name" variant="outlined" fullWidth value={form.name || ""} onChange={update("name")}
                      error={!!errors.name} helperText={errors.name} />
                  </MDBox>
                  <MDBox mb={3}>
                    <TextField label="Address" variant="outlined" fullWidth value={form.address || ""} onChange={update("address")} />
                  </MDBox>
                  <MDBox mb={3}>
                    <TextField label="Description" variant="outlined" fullWidth multiline rows={2} value={form.description || ""} onChange={update("description")} />
                  </MDBox>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <MDBox mb={3}>
                        <TextField type="time" label="Check-in Time" variant="outlined" fullWidth value={form.checkInTime || "14:00"} onChange={update("checkInTime")} InputLabelProps={{ shrink: true }} />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDBox mb={3}>
                        <TextField type="time" label="Check-out Time" variant="outlined" fullWidth value={form.checkOutTime || "11:00"} onChange={update("checkOutTime")} InputLabelProps={{ shrink: true }} />
                      </MDBox>
                    </Grid>
                  </Grid>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <MDBox mb={3}>
                        <TextField label="Phone Number" variant="outlined" fullWidth value={form.phone || ""} onChange={update("phone")}
                          error={!!errors.phone} helperText={errors.phone} />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDBox mb={3}>
                        <TextField label="Email" variant="outlined" fullWidth value={form.email || ""} onChange={update("email")}
                          error={!!errors.email} helperText={errors.email} />
                      </MDBox>
                    </Grid>
                  </Grid>
                  <MDBox mb={3}>
                    <TextField label="Currency" select variant="outlined" fullWidth value={form.currency || "USD"} onChange={update("currency")}>
                      {CURRENCIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>
                  </MDBox>
                  <MDBox mb={3}>
                    <TextField label="Timezone" select variant="outlined" fullWidth value={form.timezone || "UTC"} onChange={update("timezone")}>
                      {TIMEZONES.map((tz) => <MenuItem key={tz} value={tz}>{tz}</MenuItem>)}
                    </TextField>
                  </MDBox>
                  <MDBox mb={3}>
                    <TextField label="Cancellation Policy" variant="outlined" fullWidth multiline rows={3} value={form.cancellationPolicy || ""} onChange={update("cancellationPolicy")}
                      placeholder="e.g. Free cancellation up to 24 hours before check-in" />
                  </MDBox>
                  <MDBox mb={3}>
                    <TextField label="Social Links (comma-separated URL:label)" variant="outlined" fullWidth value={
                      form.socialLinks ? Object.entries(form.socialLinks).map(([k, v]) => `${v}:${k}`).join(", ") : ""
                    } onChange={(e) => {
                      const links = {};
                      e.target.value.split(",").filter(Boolean).forEach((pair) => {
                        const [url, label] = pair.trim().split(":");
                        if (url) links[label?.trim() || "Link"] = url.trim();
                      });
                      setForm((f) => ({ ...f, socialLinks: Object.keys(links).length > 0 ? links : null }));
                    }}
                      placeholder="e.g. https://instagram.com/innsync:Instagram, https://facebook.com/innsync:Facebook" />
                  </MDBox>
                  <MDBox mb={3}>
                    <ImageUpload label="Hotel Photo" value={form.imageUrl || ""}
                      onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} height={180} />
                  </MDBox>
                  <MDBox mt={4} mb={1} display="flex" gap={2}>
                    <MDButton variant="gradient" color="info" fullWidth onClick={handleSave} disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Saving..." : "Save Changes"}
                    </MDButton>
                    <MDButton variant="outlined" color="secondary" onClick={handleCancel} disabled={saveMutation.isPending}>
                      Cancel
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} message="Settings saved" />
    </DashboardLayout>
  );
}

export default HotelSettings;
