import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { hotelManagerAPI } from "services/hotelManager";

function Notifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["adminNotifications"],
    queryFn: () => hotelManagerAPI.getNotifications(50),
    refetchInterval: 30000,
  });

  const markReadMut = useMutation({
    mutationFn: (id) => hotelManagerAPI.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminNotifications"] }),
  });

  const unreadCount = (notifications || []).filter((n) => !n.readAt).length;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="info">
                <MDTypography variant="h6" color="white">
                  Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <MDBox px={3} pb={3}><Alert severity="error">Failed to load notifications: {error.message}</Alert></MDBox>
                ) : !notifications || notifications.length === 0 ? (
                  <MDBox px={3} pb={3}>
                    <MDTypography variant="body2" color="text">No notifications yet.</MDTypography>
                  </MDBox>
                ) : (
                  <MDBox pb={2}>
                    {notifications.map((n) => (
                      <MDBox
                        key={n.id}
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        px={3}
                        py={2}
                        sx={{ borderBottom: "1px solid #eee", opacity: n.readAt ? 0.6 : 1 }}
                      >
                        <MDBox flex={1}>
                          <MDTypography variant="body2" fontWeight={n.readAt ? "regular" : "medium"}>
                            {n.title}
                          </MDTypography>
                          {n.body && (
                            <MDTypography variant="caption" color="text">{n.body}</MDTypography>
                          )}
                          <MDBox mt={0.5}>
                            <MDTypography variant="caption" color="text">
                              {new Date(n.sentAt).toLocaleString()}
                            </MDTypography>
                            <Chip label={n.kind} size="small" sx={{ ml: 1, height: 18, fontSize: 10 }} />
                          </MDBox>
                        </MDBox>
                        <MDBox display="flex" alignItems="center" gap={1} ml={2}>
                          {!n.readAt && (
                            <Tooltip title="Mark as read">
                              <IconButton size="small" color="info" onClick={() => markReadMut.mutate(n.id)}>
                                <Icon fontSize="small">mark_email_read</Icon>
                              </IconButton>
                            </Tooltip>
                          )}
                          <Chip
                            label={n.channel || "in_app"}
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: 10 }}
                          />
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

export default Notifications;
