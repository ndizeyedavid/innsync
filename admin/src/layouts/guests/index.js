import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Icon from "@mui/material/Icon";
import Alert from "@mui/material/Alert";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { hotelManagerAPI } from "services/hotelManager";

const STATUS_COLORS = {
  PENDING: "warning", CONFIRMED: "info", CHECKED_IN: "success", CHECKED_OUT: "secondary", CANCELLED: "error",
};

const STAY_STATUSES = ["", "PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"];

function Guests() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");

  const { data: stays, isLoading, error } = useQuery({
    queryKey: ["hotelStays", statusFilter],
    queryFn: () => hotelManagerAPI.getStays(statusFilter || undefined),
  });

  const checkInMut = useMutation({
    mutationFn: (stayId) => hotelManagerAPI.checkIn(stayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelStays"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDashboard"] });
    },
    onError: () => {},
  });

  const checkOutMut = useMutation({
    mutationFn: (stayId) => hotelManagerAPI.checkOut(stayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelStays"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDashboard"] });
    },
    onError: () => {},
  });

  const cancelMut = useMutation({
    mutationFn: (stayId) => hotelManagerAPI.cancelStay(stayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelStays"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDashboard"] });
    },
    onError: () => {},
  });

  const columns = [
    { Header: "Guest Name", accessor: "guestName", width: "25%" },
    { Header: "Check-in", accessor: "checkIn", width: "15%" },
    { Header: "Check-out", accessor: "checkOut", width: "15%" },
    { Header: "Status", accessor: "status", width: "12%" },
    { Header: "Adults/Kids", accessor: "guests", width: "15%" },
    { Header: "Actions", accessor: "actions", width: "18%" },
  ];

  const rows = (stays || []).map((stay) => ({
    guestName: (
      <MDTypography variant="body2" fontWeight="medium" sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
        onClick={() => navigate(`/guests/${stay.id}`)}
      >
        {stay.user?.name || "Unknown Guest"}
      </MDTypography>
    ),
    checkIn: new Date(stay.checkIn).toLocaleDateString(),
    checkOut: new Date(stay.checkOut).toLocaleDateString(),
    status: <Chip label={stay.status} color={STATUS_COLORS[stay.status] || "default"} size="small" />,
    guests: `${stay.adults} adult${stay.adults > 1 ? "s" : ""}${stay.children > 0 ? `, ${stay.children} kid${stay.children > 1 ? "s" : ""}` : ""}`,
    actions: (
      <MDBox display="flex" gap={0.5}>
        {(stay.status === "PENDING" || stay.status === "CONFIRMED") && (
          <Tooltip title="Check in">
            <IconButton aria-label="Check in guest" size="small" color="success" onClick={() => checkInMut.mutate(stay.id)}>
              <span style={{ fontSize: 18 }}>⇥</span>
            </IconButton>
          </Tooltip>
        )}
        {stay.status === "CHECKED_IN" && (
          <Tooltip title="Check out">
            <IconButton aria-label="Check out guest" size="small" color="warning" onClick={() => checkOutMut.mutate(stay.id)}>
              <span style={{ fontSize: 18 }}>⇤</span>
            </IconButton>
          </Tooltip>
        )}
        {(stay.status === "CONFIRMED" || stay.status === "CHECKED_IN") && (
          <Tooltip title="Cancel stay">
            <IconButton aria-label="Cancel stay" size="small" color="error" onClick={() => { if (window.confirm("Cancel this stay?")) cancelMut.mutate(stay.id); }}>
              <Icon fontSize="small">cancel</Icon>
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="View details">
          <IconButton aria-label="View guest details" size="small" color="info" onClick={() => navigate(`/guests/${stay.id}`)}>
            <span style={{ fontSize: 18 }}>→</span>
          </IconButton>
        </Tooltip>
      </MDBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="success" borderRadius="lg" coloredShadow="success">
                <MDTypography variant="h6" color="white">Guests & Stays</MDTypography>
              </MDBox>
              <MDBox pt={2} px={3} display="flex" gap={1} flexWrap="wrap">
                {STAY_STATUSES.map((s) => (
                  <MDButton
                    key={s}
                    color="success"
                    variant={statusFilter === s ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setStatusFilter(s)}
                  >
                    {s || "All"}
                  </MDButton>
                ))}
              </MDBox>
              <MDBox pt={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <MDBox px={3} pb={3}><Alert severity="error">Failed to load stays: {error.message}</Alert></MDBox>
                ) : (
                  <DataTable table={{ columns, rows }} isSorted={true} entriesPerPage={{ defaultValue: 10, entries: ["5", "10", "15", "20", "25"] }} showTotalEntries={true} canSearch={true} noEndBorder />
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

export default Guests;
