import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

function FeatureFlags() {
  const queryClient = useQueryClient();
  const { data: flags, isLoading, error } = useQuery({
    queryKey: ["featureFlags"],
    queryFn: hotelManagerAPI.getFeatureFlags,
  });

  const toggleMut = useMutation({
    mutationFn: ({ key, enabled }) => hotelManagerAPI.updateFeatureFlag(key, { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["featureFlags"] }),
    onError: () => {},
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="dark" borderRadius="lg" coloredShadow="dark"
                display="flex" justifyContent="space-between" alignItems="center"
              >
                <MDTypography variant="h6" color="white">Feature Flags</MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load feature flags: {error.message}</Alert>
                ) : !flags || flags.length === 0 ? (
                  <Alert severity="info">No feature flags configured.</Alert>
                ) : (
                  <MDBox display="flex" flexDirection="column" gap={1}>
                    {flags.map((flag) => (
                      <MDBox key={flag.key} display="flex" justifyContent="space-between" alignItems="center"
                        p={2} sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <MDBox>
                          <MDTypography variant="button" fontWeight="medium">{flag.key}</MDTypography>
                          {flag.scope && (
                            <MDTypography variant="caption" display="block" color="text">Scope: {flag.scope}</MDTypography>
                          )}
                        </MDBox>
                        <MDBox display="flex" alignItems="center" gap={1}>
                          {flag.rolloutPercent != null && flag.rolloutPercent < 100 && (
                            <MDTypography variant="caption" color="text">{flag.rolloutPercent}%</MDTypography>
                          )}
                          <Tooltip title={flag.enabled ? "Enabled" : "Disabled"}>
                            <Switch checked={flag.enabled}
                              onChange={() => {
  if (window.confirm("Toggle this feature flag? This may affect production behavior.")) {
    toggleMut.mutate({ key: flag.key, enabled: !flag.enabled });
  }
}}
                              disabled={toggleMut.isPending} />
                          </Tooltip>
                        </MDBox>
                      </MDBox>
                    ))}
                  </MDBox>
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

export default FeatureFlags;
