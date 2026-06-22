import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

function DigitalKeys() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: keys, isLoading, error } = useQuery({
    queryKey: ["hotelDigitalKeys"],
    queryFn: () => hotelManagerAPI.getDigitalKeys(),
  });

  const revokeKey = useMutation({
    mutationFn: (id) => hotelManagerAPI.revokeDigitalKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotelDigitalKeys"] }),
  });

  const isActive = (key) => !key.revokedAt && new Date(key.expiresAt) > new Date();
  const expiringSoon = (key) => {
    if (!isActive(key)) return false;
    const hoursLeft = (new Date(key.expiresAt) - new Date()) / (1000 * 60 * 60);
    return hoursLeft < 24;
  };

  const filtered = (keys || []).filter((k) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return k.externalRoomId?.toLowerCase().includes(q) ||
      k.stay?.user?.name?.toLowerCase().includes(q);
  });

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
              <MDBox pt={3} px={3}>
                <TextField fullWidth size="small" placeholder="Search by guest name or room number..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Icon fontSize="small">search</Icon></InputAdornment>,
                  }}
                  sx={{ mb: 2 }} />
              </MDBox>
              <MDBox px={3} pb={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load digital keys</Alert>
                ) : filtered.length === 0 ? (
                  <MDTypography variant="body2" color="text" textAlign="center" py={4}>
                    {search ? "No keys match your search" : "No digital keys issued"}
                  </MDTypography>
                ) : (
                  <Grid container spacing={3}>
                    {filtered.map((key) => {
                      const active = isActive(key);
                      const expiring = expiringSoon(key);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={key.id}>
                          <Card sx={{ p: 2, border: expiring ? 2 : 0, borderColor: "warning.main" }}>
                            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <MDTypography variant="h6" fontWeight="medium">Room {key.externalRoomId}</MDTypography>
                              <MDBox display="flex" gap={0.5}>
                                {expiring && <Chip label="Expiring soon" color="warning" size="small" />}
                                <Chip label={active ? "Active" : "Revoked"} color={active ? "success" : "error"} size="small" />
                              </MDBox>
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
