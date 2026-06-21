import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

function DigitalKeys() {
  const queryClient = useQueryClient();

  const { data: keys, isLoading, error } = useQuery({
    queryKey: ["hotelDigitalKeys"],
    queryFn: () => hotelManagerAPI.getDigitalKeys(),
  });

  const revokeKey = useMutation({
    mutationFn: (id) => hotelManagerAPI.revokeDigitalKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotelDigitalKeys"] }),
  });

  const isActive = (key) => !key.revokedAt && new Date(key.expiresAt) > new Date();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="info">
                <MDTypography variant="h6" color="white">Digital Keys</MDTypography>
              </MDBox>
              <MDBox pt={4} px={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load digital keys</Alert>
                ) : !keys || keys.length === 0 ? (
                  <MDTypography variant="body2" color="text" textAlign="center" py={4}>No digital keys issued</MDTypography>
                ) : (
                  <Grid container spacing={3}>
                    {keys.map((key) => {
                      const active = isActive(key);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={key.id}>
                          <Card sx={{ p: 2 }}>
                            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <MDTypography variant="h6" fontWeight="medium">Room {key.externalRoomId}</MDTypography>
                              <Chip label={active ? "Active" : "Revoked"} color={active ? "success" : "error"} size="small" />
                            </MDBox>
                            <MDTypography variant="body2" color="text" mb={1}>
                              <strong>Guest:</strong> {key.stay?.user?.name || "Unknown"}
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mb={1}>
                              <strong>Issued:</strong> {new Date(key.issuedAt).toLocaleDateString()}
                            </MDTypography>
                            <MDTypography variant="body2" color="text" mb={2}>
                              <strong>Expires:</strong> {new Date(key.expiresAt).toLocaleDateString()}
                            </MDTypography>
                            <MDBox display="flex" gap={1}>
                              {active && (
                                <MDButton
                                  variant="outlined" color="error" size="small" fullWidth
                                  onClick={() => revokeKey.mutate(key.id)}
                                  disabled={revokeKey.isPending}
                                >
                                  {revokeKey.isPending ? "..." : "Revoke"}
                                </MDButton>
                              )}
                            </MDBox>
                          </Card>
                        </Grid>
                      );
                    })}
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

export default DigitalKeys;
