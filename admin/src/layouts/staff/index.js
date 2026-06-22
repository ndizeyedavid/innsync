import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { hotelManagerAPI } from "services/hotelManager";

const ROLES = ["STAFF", "CONCIERGE", "ADMIN"];

function Staff() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", password: "" });
  const [inviteError, setInviteError] = useState("");
  const [roleTarget, setRoleTarget] = useState(null);

  const { data: staffList, isLoading, error } = useQuery({
    queryKey: ["hotelStaff"],
    queryFn: hotelManagerAPI.getStaff,
  });

  const inviteMut = useMutation({
    mutationFn: (dto) => hotelManagerAPI.inviteStaff(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelStaff"] });
      setInviteOpen(false);
      setInviteForm({ name: "", email: "", password: "" });
      setInviteError("");
    },
    onError: (err) => setInviteError(err.response?.data?.message || err.message),
  });

  const roleMut = useMutation({
    mutationFn: ({ id, role }) => hotelManagerAPI.updateStaffRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelStaff"] });
      setRoleTarget(null);
    },
  });

  const removeMut = useMutation({
    mutationFn: (id) => hotelManagerAPI.removeStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotelStaff"] }),
  });

  const handleInvite = (e) => {
    e.preventDefault();
    setInviteError("");
    inviteMut.mutate(inviteForm);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="info" display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" color="white">Staff</MDTypography>
                <MDButton variant="gradient" color="light" size="small" onClick={() => setInviteOpen(true)}>
                  <Icon fontSize="small" sx={{ mr: 0.5 }}>person_add</Icon> Invite
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <MDBox px={3} pb={3}><Alert severity="error">Failed to load staff: {error.message}</Alert></MDBox>
                ) : !staffList || staffList.length === 0 ? (
                  <MDBox px={3} pb={3}><MDTypography variant="body2" color="text">No staff members yet.</MDTypography></MDBox>
                ) : (
                  <>
                    <TableContainer sx={{ minWidth: 600 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Joined</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {staffList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((s) => (
                            <TableRow key={s.id}>
                              <TableCell><MDTypography variant="button" fontWeight="medium">{s.name}</MDTypography></TableCell>
                              <TableCell><MDTypography variant="caption">{s.email}</MDTypography></TableCell>
                              <TableCell>
                                <FormControl size="small" sx={{ minWidth: 130 }}>
                                  <Select
                                    value={s.role}
                                    onChange={(e) => roleMut.mutate({ id: s.id, role: e.target.value })}
                                    disabled={roleMut.isPending}
                                  >
                                    {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell><MDTypography variant="caption">{new Date(s.createdAt).toLocaleDateString()}</MDTypography></TableCell>
                              <TableCell align="right">
                                <Tooltip title="Remove staff">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    disabled={removeMut.isPending}
                                    onClick={() => { if (window.confirm("Remove this staff member?")) removeMut.mutate(s.id); }}
                                  >
                                    <Icon fontSize="small">delete</Icon>
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      component="div"
                      count={staffList.length}
                      page={page}
                      onPageChange={(_, p) => setPage(p)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    />
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleInvite}>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogContent>
            <MDBox display="flex" flexDirection="column" gap={2} pt={1}>
              <TextField label="Name" size="small" required fullWidth
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              />
              <TextField label="Email" type="email" size="small" required fullWidth
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
              <TextField label="Temporary password" type="password" size="small" required fullWidth
                value={inviteForm.password}
                onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
              />
              {inviteError && <Alert severity="error" sx={{ py: 0 }}>{inviteError}</Alert>}
            </MDBox>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={inviteMut.isPending}>
              {inviteMut.isPending ? "Sending..." : "Invite"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Staff;
