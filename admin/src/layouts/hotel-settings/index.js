/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function HotelSettings() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Hotel Settings
                </MDTypography>
              </MDBox>
              <MDBox pt={4} px={3} pb={3}>
                <MDBox component="form" role="form">
                  <MDBox mb={3}>
                    <MDInput
                      type="text"
                      label="Hotel Name"
                      variant="standard"
                      fullWidth
                      defaultValue="InnSync Demo Hotel"
                    />
                  </MDBox>
                  <MDBox mb={3}>
                    <MDInput
                      type="text"
                      label="Address"
                      variant="standard"
                      fullWidth
                      defaultValue="123 Main Street, City, Country"
                    />
                  </MDBox>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <MDBox mb={3}>
                        <MDInput
                          type="time"
                          label="Check-in Time"
                          variant="standard"
                          fullWidth
                          defaultValue="14:00"
                        />
                      </MDBox>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDBox mb={3}>
                        <MDInput
                          type="time"
                          label="Check-out Time"
                          variant="standard"
                          fullWidth
                          defaultValue="12:00"
                        />
                      </MDBox>
                    </Grid>
                  </Grid>
                  <MDBox mb={3}>
                    <MDInput
                      type="tel"
                      label="Phone Number"
                      variant="standard"
                      fullWidth
                      defaultValue="+1 555 123 4567"
                    />
                  </MDBox>
                  <MDBox mb={3}>
                    <MDInput
                      type="email"
                      label="Email"
                      variant="standard"
                      fullWidth
                      defaultValue="info@innsync.dev"
                    />
                  </MDBox>
                  <MDBox mt={4} mb={1}>
                    <MDButton variant="gradient" color="info" fullWidth>
                      Save Changes
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default HotelSettings;
