import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

const STATUS_COLORS = {
  PENDING: "warning", CONFIRMED: "info", CHECKED_IN: "success", CHECKED_OUT: "secondary", CANCELLED: "error",
};

function GuestDetail() {
  const { stayId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: stay, isLoading, error } = useQuery({
    queryKey: ["hotelStay", stayId],
    queryFn: () => hotelManagerAPI.getStay(stayId),
  });

  const checkInMut = useMutation({
    mutationFn: () => hotelManagerAPI.checkIn(stayId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotelStay", stayId] }),
  });

  const checkOutMut = useMutation({
    mutationFn: () => hotelManagerAPI.checkOut(stayId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotelStay", stayId] }),
  });

  if (isLoading) return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} display="flex" justifyContent="center"><CircularProgress /></MDBox>
      <Footer />
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}><Alert severity="error">Failed to load guest details</Alert></MDBox>
      <Footer />
    </DashboardLayout>
  );

  const user = stay?.user || {};
  const canCheckIn = stay?.status === "CONFIRMED";
  const canCheckOut = stay?.status === "CHECKED_IN";

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Button onClick={() => navigate("/guests")} sx={{ mb: 1 }}>&larr; Back to Guests</Button>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="success" borderRadius="lg" coloredShadow="success"
                display="flex" justifyContent="space-between" alignItems="center"
              >
                <MDBox>
                  <MDTypography variant="h6" color="white">{user.name || "Unknown Guest"}</MDTypography>
                  <MDTypography variant="body2" color="white" opacity={0.8}>{user.email}</MDTypography>
                </MDBox>
                <Chip label={stay?.status} color={STATUS_COLORS[stay?.status] || "default"} size="medium" sx={{ fontWeight: "bold" }} />
              </MDBox>
              <MDBox p={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="body2" color="text"><strong>Check-in:</strong> {stay?.checkIn ? new Date(stay.checkIn).toLocaleDateString() : "N/A"}</MDTypography>
                    <MDTypography variant="body2" color="text" mt={1}><strong>Check-out:</strong> {stay?.checkOut ? new Date(stay.checkOut).toLocaleDateString() : "N/A"}</MDTypography>
                    <MDTypography variant="body2" color="text" mt={1}><strong>Nights:</strong> {stay?.nights || "N/A"}</MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="body2" color="text"><strong>Adults:</strong> {stay?.adults || 0}</MDTypography>
                    <MDTypography variant="body2" color="text" mt={1}><strong>Children:</strong> {stay?.children || 0}</MDTypography>
                    <MDTypography variant="body2" color="text" mt={1}><strong>Room:</strong> {stay?.selectedRoomId || "Not assigned"}</MDTypography>
                  </Grid>
                </Grid>
                <MDBox mt={3} display="flex" gap={2}>
                  {canCheckIn && (
                    <MDButton variant="gradient" color="success" onClick={() => checkInMut.mutate()} disabled={checkInMut.isPending}>
                      {checkInMut.isPending ? "..." : "Check In"}
                    </MDButton>
                  )}
                  {canCheckOut && (
                    <MDButton variant="gradient" color="warning" onClick={() => checkOutMut.mutate()} disabled={checkOutMut.isPending}>
                      {checkOutMut.isPending ? "..." : "Check Out"}
                    </MDButton>
                  )}
                  {stay?.status === "CHECKED_IN" && (
                    <MDButton variant="outlined" color="info" onClick={() => navigate(`/billing?stayId=${stay.id}`)}>
                      View Folio
                    </MDButton>
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {stay?.orders?.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <MDBox mx={2} mt={-3} py={2} px={2} variant="gradient" bgColor="dark" borderRadius="lg" coloredShadow="dark">
                  <MDTypography variant="h6" color="white">Orders ({stay.orders.length})</MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Items</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Placed</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stay.orders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell>{o.items?.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ") || "—"}</TableCell>
                          <TableCell><Chip label={o.status} size="small" color={o.status === "DELIVERED" ? "success" : "info"} /></TableCell>
                          <TableCell>${(o.totalCents / 100).toFixed(2)}</TableCell>
                          <TableCell>{new Date(o.placedAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </MDBox>
              </Card>
            </Grid>
          )}

          {stay?.itineraryItems?.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <MDBox mx={2} mt={-3} py={2} px={2} variant="gradient" bgColor="dark" borderRadius="lg" coloredShadow="dark">
                  <MDTypography variant="h6" color="white">Itinerary ({stay.itineraryItems.length})</MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Day</TableCell>
                        <TableCell>Activity</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stay.itineraryItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>Day {item.day}</TableCell>
                          <TableCell>{item.title}</TableCell>
                          <TableCell>{item.startTime}{item.endTime ? ` - ${item.endTime}` : ""}</TableCell>
                          <TableCell><Chip label={item.status} size="small" color={item.status === "booked" ? "success" : "default"} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </MDBox>
              </Card>
            </Grid>
          )}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default GuestDetail;
