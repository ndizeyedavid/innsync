import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

function HotelSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: hotel, isLoading, error } = useQuery({
    queryKey: ["hotelSettings"],
    queryFn: () => hotelManagerAPI.getHotelSettings(),
  });

  useEffect(() => {
    if (hotel) setForm(hotel);
  }, [hotel]);

  const saveMutation = useMutation({
    mutationFn: (data) => hotelManagerAPI.updateHotelSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelSettings"] });
      setSaved(true);
    },
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

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
                    <MDInput type="text" label="Hotel Name" variant="standard" fullWidth value={form.name || ""} onChange={update("name")} />
                  </MDBox>
                  <MDBox mb={3}>
                    <MDInput type="text" label="Address" variant="standard" fullWidth value={form.address || ""} onChange={update("address")} />
                  </MDBox>
                  <MDBox mb={3}>
                    <MDInput type="text" label="Description" variant="standard" fullWidth multiline rows={2} value={form.description || ""} onChange={update("description")} />
                  </MDBox>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <MDBox mb={3}>
                        <MDInput type="time" label="Check-in Time" variant="standard" fullWidth value={form.checkInTime || "14:00"} onChange={update("checkInTime")} />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDBox mb={3}>
                        <MDInput type="time" label="Check-out Time" variant="standard" fullWidth value={form.checkOutTime || "11:00"} onChange={update("checkOutTime")} />
                      </MDBox>
                    </Grid>
                  </Grid>
                  <MDBox mb={3}>
                    <MDInput type="tel" label="Phone Number" variant="standard" fullWidth value={form.phone || ""} onChange={update("phone")} />
                  </MDBox>
                  <MDBox mb={3}>
                    <MDInput type="email" label="Email" variant="standard" fullWidth value={form.email || ""} onChange={update("email")} />
                  </MDBox>
                  <MDBox mt={4} mb={1}>
                    <MDButton variant="gradient" color="info" fullWidth onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
                      {saveMutation.isPending ? "Saving..." : "Save Changes"}
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
