/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Amenities() {
  const [amenities, setAmenities] = useState([
    { id: 1, name: "Free WiFi", available: true, price: 0 },
    { id: 2, name: "Swimming Pool", available: true, price: 25 },
    { id: 3, name: "Gym", available: true, price: 15 },
    { id: 4, name: "Spa", available: false, price: 50 },
    { id: 5, name: "Restaurant", available: true, price: 0 },
    { id: 6, name: "Room Service", available: true, price: 0 },
  ]);

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
                bgColor="secondary"
                borderRadius="lg"
                coloredShadow="secondary"
              >
                <MDTypography variant="h6" color="white">
                  Hotel Amenities
                </MDTypography>
              </MDBox>
              <MDBox pt={4} px={3}>
                <Grid container spacing={3}>
                  {amenities.map((amenity) => (
                    <Grid item xs={12} sm={6} md={4} key={amenity.id}>
                      <Card sx={{ p: 2 }}>
                        <MDBox
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <MDTypography variant="h6" fontWeight="medium">
                            {amenity.name}
                          </MDTypography>
                          <Switch
                            checked={amenity.available}
                            onChange={() => {
                              setAmenities(
                                amenities.map((a) =>
                                  a.id === amenity.id ? { ...a, available: !a.available } : a
                                )
                              );
                            }}
                          />
                        </MDBox>
                        {amenity.price > 0 && (
                          <MDTypography variant="body2" color="text" mb={2}>
                            ${amenity.price.toFixed(2)}/day
                          </MDTypography>
                        )}
                        <MDButton variant="outlined" color="secondary" size="small" fullWidth>
                          Edit
                        </MDButton>
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

export default Amenities;
