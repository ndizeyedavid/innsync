import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

const STATUS_MAP = {
  clean: { label: "Clean", color: "success", icon: "✅" },
  dirty: { label: "Dirty", color: "error", icon: "🛑" },
  in_progress: { label: "In Progress", color: "info", icon: "🔄" },
  maintenance: { label: "Maintenance", color: "secondary", icon: "🔧" },
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "dirty", label: "Dirty" },
  { value: "in_progress", label: "In Progress" },
  { value: "clean", label: "Clean" },
  { value: "maintenance", label: "Maintenance" },
];

function Housekeeping() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskRoom, setTaskRoom] = useState(null);
  const [taskNotes, setTaskNotes] = useState("");
  const [taskStaff, setTaskStaff] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ["hotelHousekeeping", tab],
    queryFn: () => hotelManagerAPI.getHousekeeping(tab === "all" ? undefined : tab),
  });

  const markClean = useMutation({
    mutationFn: (id) => hotelManagerAPI.updateHousekeepingStatus(id, "clean"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotelHousekeeping"] }),
  });

  const assignTask = useMutation({
    mutationFn: ({ id, notes, assignedTo }) =>
      hotelManagerAPI.updateHousekeepingStatus(id, "in_progress", notes, assignedTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelHousekeeping"] });
      setTaskOpen(false);
      setTaskNotes("");
      setTaskStaff("");
      setSaved(true);
    },
  });

  const rooms = (tasks || []).map((t) => {
    const s = t.snapshot || {};
    return {
      id: t.externalId,
      number: s.roomNumber || t.externalId?.slice(-4) || "?",
      type: s.roomType || "Standard",
      status: s.status || "dirty",
      notes: s.notes || "",
      assignedTo: s.assignedTo || "",
      lastCleaned: s.lastCleaned || "N/A",
    };
  });

  const counts = {};
  rooms.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="warning" borderRadius="lg" coloredShadow="warning">
                <MDTypography variant="h6" color="white">
                  Housekeeping
                  <span style={{ fontSize: 14, opacity: 0.7, marginLeft: 8 }}>
                    ({rooms.length} rooms · {counts.dirty || 0} dirty · {counts.in_progress || 0} in progress)
                  </span>
                </MDTypography>
              </MDBox>
              <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                  {STATUS_TABS.map((t) => (
                    <Tab key={t.value} value={t.value} label={t.label}
                      sx={{ textTransform: "none", fontWeight: 600, fontSize: 13 }} />
                  ))}
                </Tabs>
              </Box>
              <MDBox pt={3} px={3} pb={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load housekeeping data</Alert>
                ) : rooms.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>No {tab !== "all" ? tab : ""} housekeeping tasks found</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {rooms.map((room) => {
                      const statusInfo = STATUS_MAP[room.status] || { label: room.status, color: "default", icon: "❓" };
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                          <Card sx={{
                            p: 2, transition: "all 0.2s",
                            "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                          }}>
                            <MDBox display="flex" justifyContent="space-between" alignItems="center">
                              <MDTypography variant="h5" fontWeight="bold">
                                {statusInfo.icon} Room {room.number}
                              </MDTypography>
                              <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ fontWeight: 600 }} />
                            </MDBox>
                            <MDTypography variant="caption" color="text" sx={{ display: "block", mt: 0.5 }}>
                              {room.type}
                            </MDTypography>
                            {room.assignedTo && (
                              <MDBox display="flex" alignItems="center" gap={0.5} mt={1}>
                                <span style={{ fontSize: 14 }}>👤</span>
                                <MDTypography variant="body2" color="text" fontWeight="medium">
                                  {room.assignedTo}
                                </MDTypography>
                              </MDBox>
                            )}
                            {room.notes && (
                              <MDTypography variant="caption" color="text" sx={{ display: "block", mt: 0.5, opacity: 0.6, fontStyle: "italic" }}>
                                {`\u201C${room.notes}\u201D`}
                              </MDTypography>
                            )}
                            <MDTypography variant="caption" color="text" sx={{ display: "block", mt: 1, opacity: 0.5 }}>
                              Last cleaned: {room.lastCleaned}
                            </MDTypography>
                            <MDBox mt={1.5} display="flex" gap={1}>
                              {room.status !== "clean" && room.status !== "maintenance" && (
                                <MDButton variant="gradient" color="success" size="small" sx={{ flex: 1 }}
                                  onClick={() => markClean.mutate(room.id)} disabled={markClean.isPending}>
                                  {markClean.isPending ? "..." : "✓ Clean"}
                                </MDButton>
                              )}
                              {room.status === "clean" && (
                                <MDButton variant="outlined" color="info" size="small" sx={{ flex: 1 }}
                                  onClick={() => { setTaskRoom(room); setTaskNotes(""); setTaskStaff(""); setTaskOpen(true); }}>
                                  Assign
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

      <Dialog open={taskOpen} onClose={() => setTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Task — Room {taskRoom?.number}</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2.5} mt={1}>
            <TextField label="Assign to (Staff Name)" fullWidth value={taskStaff}
              onChange={(e) => setTaskStaff(e.target.value)}
              placeholder="e.g. Maria Santos"
              helperText="Enter the housekeeper or staff member name" />
            <TextField label="Notes" fullWidth multiline rows={3} value={taskNotes}
              onChange={(e) => setTaskNotes(e.target.value)}
              placeholder="e.g. Deep clean, restock minibar, broken lamp" />
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton onClick={() => setTaskOpen(false)} color="secondary" variant="outlined">Cancel</MDButton>
          <MDButton variant="gradient" color="info"
            onClick={() => assignTask.mutate({ id: taskRoom.id, notes: taskNotes, assignedTo: taskStaff })}
            disabled={assignTask.isPending}>
            {assignTask.isPending ? "Assigning..." : "Assign Task"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} message="Task assigned successfully" />
    </DashboardLayout>
  );
}

export default Housekeeping;
