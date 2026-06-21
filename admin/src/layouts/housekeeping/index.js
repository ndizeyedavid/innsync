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

const STATUS_MAP = {
  clean: { label: "Clean", color: "success" },
  dirty: { label: "Dirty", color: "error" },
  in_progress: { label: "In Progress", color: "info" },
  maintenance: { label: "Maintenance", color: "secondary" },
};

function Housekeeping() {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["hotelHousekeeping"],
    queryFn: () => hotelManagerAPI.getHousekeeping(),
  });

  const markClean = useMutation({
    mutationFn: (id) => hotelManagerAPI.updateHousekeepingStatus(id, "clean"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotelHousekeeping"] }),
  });

  const rooms = tasks?.length > 0
    ? tasks.map((t) => {
        const s = t.snapshot || {};
        return {
          id: t.externalId,
          number: s.roomNumber || t.externalId.slice(-4),
          type: s.roomType || "Standard",
          status: s.status || "dirty",
          lastCleaned: s.lastCleaned || "N/A",
        };
      })
    : [];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="warning" borderRadius="lg" coloredShadow="warning">
                <MDTypography variant="h6" color="white">Housekeeping</MDTypography>
              </MDBox>
              <MDBox pt={4} px={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load housekeeping data</Alert>
                ) : rooms.length === 0 ? (
                  <MDTypography variant="body2" color="text" textAlign="center" py={4}>No housekeeping tasks found</MDTypography>
                ) : (
                  <Grid container spacing={3}>
                    {rooms.map((room) => {
                      const statusInfo = STATUS_MAP[room.status] || { label: room.status, color: "default" };
                      return (
                        <Grid item xs={12} sm={6} md={4} key={room.id}>
                          <Card sx={{ p: 2 }}>
                            <MDBox display="flex" justifyContent="space-between" alignItems="center">
                              <MDTypography variant="h6" fontWeight="medium">Room {room.number}</MDTypography>
                              <Chip label={statusInfo.label} color={statusInfo.color} size="small" />
                            </MDBox>
                            <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>{room.type}</MDTypography>
                            <MDTypography variant="caption" color="text" sx={{ display: "block", mt: 1 }}>
                              Last cleaned: {room.lastCleaned}
                            </MDTypography>
                            <MDBox mt={2} display="flex" gap={1}>
                              {room.status !== "clean" && room.status !== "maintenance" && (
                                <MDButton
                                  variant="gradient" color="success" size="small" fullWidth
                                  onClick={() => markClean.mutate(room.id)}
                                  disabled={markClean.isPending}
                                >
                                  {markClean.isPending ? "..." : "Mark as Clean"}
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

export default Housekeeping;
