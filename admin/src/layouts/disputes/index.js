import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

const STATUS_STYLES = {
  OPEN: { color: "warning", label: "Open" },
  RESOLVED: { color: "success", label: "Resolved" },
  REJECTED: { color: "error", label: "Rejected" },
};

function Disputes() {
  const queryClient = useQueryClient();
  const [actionTarget, setActionTarget] = useState(null);
  const [resolution, setResolution] = useState("");

  const { data: disputes, isLoading, error } = useQuery({
    queryKey: ["hotelDisputes"],
    queryFn: hotelManagerAPI.getDisputes,
  });

  const resolveMut = useMutation({
    mutationFn: ({ id, resolution }) => hotelManagerAPI.resolveDispute(id, resolution),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["hotelDisputes"] }); setActionTarget(null); setResolution(""); },
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, resolution }) => hotelManagerAPI.rejectDispute(id, resolution),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["hotelDisputes"] }); setActionTarget(null); setResolution(""); },
  });

  const openFirst = (disputes || []).filter((d) => d.status === "OPEN");
  const closed = (disputes || []).filter((d) => d.status !== "OPEN");

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="warning" borderRadius="lg" coloredShadow="warning"
                display="flex" justifyContent="space-between" alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Disputes {openFirst.length > 0 && <Chip label={`${openFirst.length} open`} color="error" size="small" sx={{ ml: 1, color: "#fff" }} />}
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={2} pb={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load disputes: {error.message}</Alert>
                ) : !disputes || disputes.length === 0 ? (
                  <Alert severity="info">No disputes yet.</Alert>
                ) : (
                  <MDBox display="flex" flexDirection="column" gap={2}>
                    {[...openFirst, ...closed].map((d) => {
                      const st = STATUS_STYLES[d.status] || STATUS_STYLES.OPEN;
                      return (
                        <MDBox key={d.id} p={2} sx={{ border: 1, borderColor: "divider", borderRadius: 1, opacity: d.status === "OPEN" ? 1 : 0.65 }}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
                            <MDBox flex={1}>
                              <MDBox display="flex" alignItems="center" gap={1} mb={0.5}>
                                <MDTypography variant="button" fontWeight="bold">{d.stay?.user?.name || "Unknown"}</MDTypography>
                                <Chip label={st.label} color={st.color} size="small" sx={{ height: 20, fontSize: 10 }} />
                              </MDBox>
                              <MDTypography variant="caption" color="text" display="block">
                                Stay: #{d.stayId?.slice(-6)?.toUpperCase() || "—"}
                              </MDTypography>
                              <MDTypography variant="body2" mt={0.5}>
                                <strong>Reason:</strong> {d.reason}
                              </MDTypography>
                              {d.amountCents != null && (
                                <MDTypography variant="caption" color="text">
                                  Amount: ${(d.amountCents / 100).toFixed(2)}
                                </MDTypography>
                              )}
                              <MDTypography variant="caption" color="text" display="block" mt={0.5}>
                                {new Date(d.createdAt).toLocaleDateString()}
                              </MDTypography>
                              {d.resolution && (
                                <MDTypography variant="caption" color="text" mt={0.5} sx={{ fontStyle: "italic" }}>
                                  Resolution: {d.resolution}
                                </MDTypography>
                              )}
                            </MDBox>
                            {d.status === "OPEN" && (
                              <MDBox display="flex" gap={0.5} ml={2}>
                                <Tooltip title="Resolve">
                                  <IconButton size="small" color="success" onClick={() => { setActionTarget({ id: d.id, action: "resolve" }); setResolution(""); }}>
                                    <Icon>check_circle</Icon>
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reject">
                                  <IconButton size="small" color="error" onClick={() => { setActionTarget({ id: d.id, action: "reject" }); setResolution(""); }}>
                                    <Icon>cancel</Icon>
                                  </IconButton>
                                </Tooltip>
                              </MDBox>
                            )}
                          </MDBox>
                        </MDBox>
                      );
                    })}
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog open={!!actionTarget} onClose={() => setActionTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{actionTarget?.action === "resolve" ? "Resolve" : "Reject"} Dispute</DialogTitle>
        <DialogContent>
          <TextField label="Resolution notes" multiline rows={3} fullWidth size="small" value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Explain the resolution..." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionTarget(null)} color="inherit">Cancel</Button>
          <Button variant="contained" color={actionTarget?.action === "resolve" ? "success" : "error"}
            disabled={!resolution || resolveMut.isPending || rejectMut.isPending}
            onClick={() => {
              if (actionTarget.action === "resolve") resolveMut.mutate({ id: actionTarget.id, resolution });
              else rejectMut.mutate({ id: actionTarget.id, resolution });
            }}>
            {actionTarget?.action === "resolve" ? "Resolve" : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Disputes;
