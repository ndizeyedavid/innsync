import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

function Amenities() {
  const queryClient = useQueryClient();

  const { data: amenities, isLoading, error } = useQuery({
    queryKey: ["hotelAmenities"],
    queryFn: () => hotelManagerAPI.getAmenities(),
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, isAvailable }) => hotelManagerAPI.updateAmenity(id, { isAvailable }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotelAmenities"] }),
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="secondary" borderRadius="lg" coloredShadow="secondary">
                <MDTypography variant="h6" color="white">Hotel Amenities</MDTypography>
              </MDBox>
              <MDBox pt={4} px={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load amenities</Alert>
                ) : !amenities || amenities.length === 0 ? (
                  <MDTypography variant="body2" color="text" textAlign="center" py={4}>No amenities configured</MDTypography>
                ) : (
                  <Grid container spacing={3}>
                    {amenities.map((amenity) => (
                      <Grid item xs={12} sm={6} md={4} key={amenity.id}>
                        <Card sx={{ p: 2 }}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <MDTypography variant="h6" fontWeight="medium">{amenity.name}</MDTypography>
                            <Switch
                              checked={amenity.isAvailable}
                              onChange={() => toggleAvailability.mutate({ id: amenity.id, isAvailable: !amenity.isAvailable })}
                              disabled={toggleAvailability.isPending}
                            />
                          </MDBox>
                          {amenity.description && (
                            <MDTypography variant="body2" color="text" mb={1}>{amenity.description}</MDTypography>
                          )}
                          {amenity.priceCents > 0 && (
                            <MDTypography variant="body2" color="text" mb={2}>
                              ${(amenity.priceCents / 100).toFixed(2)}/day
                            </MDTypography>
                          )}
                          <MDButton variant="outlined" color="secondary" size="small" fullWidth>Edit</MDButton>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
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
