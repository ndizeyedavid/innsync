import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
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
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({ stayId: "", externalRoomId: "" });

  const { data: keys, isLoading, error } = useQuery({
    queryKey: ["hotelDigitalKeys"],
    queryFn: () => hotelManagerAPI.getDigitalKeys(),
  });

  const { data: stays } = useQuery({
    queryKey: ["hotelStays"],
    queryFn: () => hotelManagerAPI.getStays(),
  });

  const { data: rooms } = useQuery({
    queryKey: ["hotelRooms"],
    queryFn: () => hotelManagerAPI.getRooms(),
  });

  const checkedInStays = (stays || []).filter((s) => s.status === "CHECKED_IN");
  const roomOptions = (rooms || []).filter((r) => r.number);

  const issueKey = useMutation({
    mutationFn: () => {
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
      return hotelManagerAPI.issueDigitalKey({ ...issueForm, expiresAt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelDigitalKeys"] });
      setIssueOpen(false);
      setIssueForm({ stayId: "", externalRoomId: "" });
    },
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
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="info" display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">Digital Keys</MDTypography>
                <MDButton variant="contained" color="light" size="small" onClick={() => setIssueOpen(true)}>
                  <Icon fontSize="small" sx={{ mr: 0.5 }}>add</Icon>Issue New Key
                </MDButton>
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
                                  onClick={() => {
  if (window.confirm("Revoke this digital key? The guest will no longer be able to unlock their room.")) {
    revokeKey.mutate(key.id);
  }
}}
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

      <Dialog open={issueOpen} onClose={() => setIssueOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Digital Key</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField select label="Checked-in Guest" fullWidth value={issueForm.stayId}
              onChange={(e) => setIssueForm({ ...issueForm, stayId: e.target.value })}>
              {checkedInStays.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.user?.name || "Guest"} — Room {s.roomPreference || "?"} ({s.adults} adult{s.adults > 1 ? "s" : ""})
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Room Number" fullWidth value={issueForm.externalRoomId}
              onChange={(e) => setIssueForm({ ...issueForm, externalRoomId: e.target.value })}>
              {roomOptions.map((r) => (
                <MenuItem key={r.id} value={r.number}>Room {r.number}{r.floor ? ` - Floor ${r.floor}` : ""}{r.type ? ` (${r.type})` : ""}</MenuItem>
              ))}
            </TextField>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setIssueOpen(false)} color="dark" variant="text">Cancel</MDButton>
          <MDButton onClick={() => issueKey.mutate()} variant="contained" color="info"
            disabled={!issueForm.stayId || !issueForm.externalRoomId || issueKey.isPending}>
            {issueKey.isPending ? "Issuing..." : "Issue Key"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default DigitalKeys;
