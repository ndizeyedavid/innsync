/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Housekeeping() {
  // Mock data for now - will connect to backend later
  const rooms = [
    { number: "101", type: "Ocean Suite", status: "clean", lastCleaned: "2 hours ago" },
    { number: "102", type: "Ocean Suite", status: "dirty", lastCleaned: "Yesterday" },
    { number: "201", type: "Garden View", status: "in-progress", lastCleaned: "4 hours ago" },
    { number: "202", type: "Garden View", status: "clean", lastCleaned: "1 hour ago" },
    { number: "301", type: "Standard", status: "dirty", lastCleaned: "Yesterday" },
    { number: "302", type: "Standard", status: "maintenance", lastCleaned: "N/A" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "clean":
        return "success";
      case "dirty":
        return "error";
      case "in-progress":
        return "info";
      case "maintenance":
        return "secondary";
      default:
        return "default";
    }
  };

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
                bgColor="warning"
                borderRadius="lg"
                coloredShadow="warning"
              >
                <MDTypography variant="h6" color="white">
                  Housekeeping
                </MDTypography>
              </MDBox>
              <MDBox pt={4} px={3}>
                <Grid container spacing={3}>
                  {rooms.map((room) => (
                    <Grid item xs={12} sm={6} md={4} key={room.number}>
                      <Card sx={{ p: 2 }}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center">
                          <MDTypography variant="h6" fontWeight="medium">
                            Room {room.number}
                          </MDTypography>
                          <Chip
                            label={room.status}
                            color={getStatusColor(room.status)}
                            size="small"
                          />
                        </MDBox>
                        <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
                          {room.type}
                        </MDTypography>
                        <MDTypography
                          variant="caption"
                          color="text"
                          sx={{ display: "block", mt: 1 }}
                        >
                          Last cleaned: {room.lastCleaned}
                        </MDTypography>
                        <MDBox mt={2} display="flex" gap={1}>
                          {room.status !== "clean" && room.status !== "maintenance" && (
                            <MDButton variant="gradient" color="success" size="small" fullWidth>
                              Mark as Clean
                            </MDButton>
                          )}
                          {room.status === "clean" && (
                            <MDButton variant="outlined" color="info" size="small" fullWidth>
                              Assign Task
                            </MDButton>
                          )}
                        </MDBox>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Housekeeping;
