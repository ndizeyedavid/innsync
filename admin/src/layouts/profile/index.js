import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import Header from "layouts/profile/components/Header";
import PlatformSettings from "layouts/profile/components/PlatformSettings";

import { authService } from "services/auth";

function Overview() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authService.getMe,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [snack, setSnack] = useState("");

  const editMut = useMutation({
    mutationFn: (data) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      setEditOpen(false);
      setSnack("Profile updated");
    },
    onError: (err) => setSnack(err.response?.data?.message || err.message),
  });

  const pwMut = useMutation({
    mutationFn: ({ current, newPw }) => authService.changePassword(current, newPw),
    onSuccess: () => {
      setPwOpen(false);
      setPwForm({ current: "", newPw: "", confirm: "" });
      setPwError("");
      setSnack("Password updated");
    },
    onError: (err) => setPwError(err.response?.data?.message || err.message),
  });

  const openEdit = () => {
    setEditForm({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
    setEditOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}><Alert severity="error">Failed to load profile: {error.message}</Alert></MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header userName={user?.name} userRole={user?.role}>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6} xl={4}>
              <PlatformSettings />
            </Grid>
            <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
              <ProfileInfoCard
                title="profile information"
                description="Staff member at InnSync hotel management."
                info={{
                  fullName: user.name || "—",
                  email: user.email || "—",
                  phone: user.phone || "—",
                  role: user.role || "—",
                  memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—",
                }}
                social={[]}
                action={{ route: "#", tooltip: "Edit Profile" }}
                shadow={false}
              />
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>
            <Grid item xs={12} xl={4}>
              <Card sx={{ height: "100%", boxShadow: "none", p: 2 }}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>Account Actions</MDTypography>
                <MDBox display="flex" flexDirection="column" gap={1.5}>
                  <Button variant="outlined" color="info" startIcon={<Icon>edit</Icon>} onClick={openEdit}>Edit Profile</Button>
                  <Button variant="outlined" color="warning" startIcon={<Icon>lock</Icon>} onClick={() => { setPwError(""); setPwOpen(true); }}>Change Password</Button>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </Header>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <TextField label="Email" value={editForm.email} disabled helperText="Email cannot be changed" />
            <TextField label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" color="info" onClick={() => editMut.mutate({ name: editForm.name, phone: editForm.phone })}
            disabled={editMut.isPending}>
            {editMut.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pwOpen} onClose={() => setPwOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2} pt={1}>
            {pwError && <Alert severity="error">{pwError}</Alert>}
            <TextField label="Current Password" type="password" value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} />
            <TextField label="New Password" type="password" value={pwForm.newPw}
              onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} />
            <TextField label="Confirm New Password" type="password" value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={() => {
            if (pwForm.newPw !== pwForm.confirm) { setPwError("Passwords do not match"); return; }
            if (pwForm.newPw.length < 8) { setPwError("Password must be at least 8 characters"); return; }
            pwMut.mutate({ current: pwForm.current, newPw: pwForm.newPw });
          }} disabled={pwMut.isPending}>
            {pwMut.isPending ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")} message={snack} />

      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
