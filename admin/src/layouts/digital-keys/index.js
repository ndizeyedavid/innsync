/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function DigitalKeys() {
  const [keys, setKeys] = useState([
    {
      id: 1,
      guest: "Avery Chen",
      room: "101",
      status: "Active",
      validFrom: "2024-01-15 14:00",
      validTo: "2024-01-18 12:00",
    },
    {
      id: 2,
      guest: "Jordan Lee",
      room: "201",
      status: "Revoked",
      validFrom: "2024-01-10 14:00",
      validTo: "2024-01-15 12:00",
    },
    {
      id: 3,
      guest: "Taylor Smith",
      room: "301",
      status: "Active",
      validFrom: "2024-01-14 14:00",
      validTo: "2024-01-17 12:00",
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Revoked":
        return "error";
      default:
        return "info";
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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Digital Keys
                </MDTypography>
              </MDBox>
              <MDBox pt={4} px={3}>
                <Grid container spacing={3}>
                  {keys.map((key) => (
                    <Grid item xs={12} sm={6} md={4} key={key.id}>
                      <Card sx={{ p: 2 }}>
                        <MDBox
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <MDTypography variant="h6" fontWeight="medium">
                            Room {key.room}
                          </MDTypography>
                          <Chip
                            label={key.status}
                            color={getStatusColor(key.status)}
                            size="small"
                          />
                        </MDBox>
                        <MDTypography variant="body2" color="text" mb={1}>
                          <strong>Guest:</strong> {key.guest}
                        </MDTypography>
                        <MDTypography variant="body2" color="text" mb={1}>
                          <strong>Valid From:</strong> {key.validFrom}
                        </MDTypography>
                        <MDTypography variant="body2" color="text" mb={2}>
                          <strong>Valid Until:</strong> {key.validTo}
                        </MDTypography>
                        <MDBox display="flex" gap={1}>
                          {key.status === "Active" && (
                            <MDButton variant="outlined" color="error" size="small" fullWidth>
                              Revoke
                            </MDButton>
                          )}
                          {key.status === "Revoked" && (
                            <MDButton variant="gradient" color="success" size="small" fullWidth>
                              Reactivate
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

export default DigitalKeys;
