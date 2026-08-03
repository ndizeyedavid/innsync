import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { hotelManagerAPI } from "services/hotelManager";

const ACTION_COLORS = {
  CHARGE_ADDED: "success",
  LOGIN: "info",
  SIGNOUT: "secondary",
  STAFF_INVITED: "warning",
  STAFF_REMOVED: "error",
  ROOM_CREATED: "info",
  ROOM_UPDATED: "info",
  ROOM_DELETED: "error",
  CHECK_IN: "success",
  CHECK_OUT: "secondary",
  STAY_CANCELLED: "error",
};

function AuditLogs() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["hotelAuditLogs"],
    queryFn: () => hotelManagerAPI.getAuditLogs(200),
  });

  const columns = [
    { Header: "Time", accessor: "time", width: "15%" },
    { Header: "Action", accessor: "action", width: "15%" },
    { Header: "Actor", accessor: "actor", width: "15%" },
    { Header: "Resource", accessor: "resource", width: "20%" },
    { Header: "Details", accessor: "details", width: "35%" },
  ];

  const rows = (logs || []).map((log) => ({
    time: new Date(log.occurredAt).toLocaleString(),
    action: (
      <Chip label={log.action} color={ACTION_COLORS[log.action] || "default"} size="small" sx={{ height: 20, fontSize: 10 }} />
    ),
    actor: log.actor?.name || log.actor?.email || log.actorUserId || "System",
    resource: `${log.resourceType}${log.resourceId ? ` #${log.resourceId.slice(-6)}` : ""}`,
    details: log.payload ? JSON.stringify(log.payload).slice(0, 80) : "—",
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="info" borderRadius="lg" coloredShadow="info"
                display="flex" justifyContent="space-between" alignItems="center"
              >
                <MDTypography variant="h6" color="white">Audit Logs</MDTypography>
                <MDTypography variant="caption" color="white" opacity={0.7}>
                  {logs?.length || 0} entries
                </MDTypography>
              </MDBox>
              <MDBox pt={3} px={3} pb={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load audit logs: {error.message}</Alert>
                ) : !logs || logs.length === 0 ? (
                  <Alert severity="info">No audit logs yet. Actions will appear here once staff perform them.</Alert>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={true}
                    entriesPerPage={{ defaultValue: 25, entries: ["10", "25", "50", "100"] }}
                    showTotalEntries={true}
                    canSearch={true}
                    noEndBorder
                  />
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

export default AuditLogs;
