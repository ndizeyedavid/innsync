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

const LOYALTY_COLORS = { BRONZE: "warning", SILVER: "secondary", GOLD: "warning", PLATINUM: "info", DIAMOND: "primary" };

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelStay", stayId] });
      queryClient.invalidateQueries({ queryKey: ["hotelStays"] });
    },
    onError: () => {},
  });

  const checkOutMut = useMutation({
    mutationFn: () => hotelManagerAPI.checkOut(stayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelStay", stayId] });
      queryClient.invalidateQueries({ queryKey: ["hotelStays"] });
    },
    onError: () => {},
  });

  const cancelMut = useMutation({
    mutationFn: () => hotelManagerAPI.cancelStay(stayId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelStay", stayId] });
      queryClient.invalidateQueries({ queryKey: ["hotelStays"] });
    },
    onError: () => {},
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
  const profile = user.guestProfile || {};
  const canCheckIn = stay?.status === "CONFIRMED";
  const canCheckOut = stay?.status === "CHECKED_IN";
  const canCancel = stay?.status === "CONFIRMED" || stay?.status === "CHECKED_IN";

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
                    <MDTypography variant="body2" color="text" mt={1}><strong>Room:</strong> {stay?.selectedRoomId ? "Assigned" : "Not assigned"}</MDTypography>
                  </Grid>
                </Grid>
                <MDBox mt={3} display="flex" gap={2} flexWrap="wrap">
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
                  {canCancel && (
                    <MDButton variant="outlined" color="error" onClick={() => { if (window.confirm("Cancel this stay?")) cancelMut.mutate(); }} disabled={cancelMut.isPending}>
                      {cancelMut.isPending ? "..." : "Cancel Stay"}
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

          {/* Guest Preferences & Loyalty */}
          <Grid item xs={12} md={6}>
            <Card style={{ height: "100%" }}>
              <MDBox mx={2} mt={-3} py={2} px={2} variant="gradient" bgColor="dark" borderRadius="lg" coloredShadow="dark">
                <MDTypography variant="h6" color="white">Guest Profile</MDTypography>
              </MDBox>
              <MDBox p={3}>
                <MDBox display="flex" justifyContent="space-between" mb={1.5}>
                  <MDTypography variant="body2" color="text">Loyalty Tier</MDTypography>
                  <Chip label={profile.loyaltyTier || "BRONZE"} color={LOYALTY_COLORS[profile.loyaltyTier] || "default"} size="small" />
                </MDBox>
                <MDBox display="flex" justifyContent="space-between" mb={1.5}>
                  <MDTypography variant="body2" color="text">Loyalty Points</MDTypography>
                  <MDTypography variant="body2" fontWeight="medium">{profile.loyaltyPoints ?? 0}</MDTypography>
                </MDBox>
                {profile.dietaryRestrictions?.length > 0 && (
                  <MDBox mb={1.5}>
                    <MDTypography variant="body2" color="text" mb={0.5}>Dietary Restrictions</MDTypography>
                    <MDBox display="flex" gap={0.5} flexWrap="wrap">
                      {profile.dietaryRestrictions.map((d, i) => (
                        <Chip key={i} label={d} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                      ))}
                    </MDBox>
                  </MDBox>
                )}
                {profile.preferredVibes?.length > 0 && (
                  <MDBox mb={1.5}>
                    <MDTypography variant="body2" color="text" mb={0.5}>Preferred Vibes</MDTypography>
                    <MDBox display="flex" gap={0.5} flexWrap="wrap">
                      {profile.preferredVibes.map((v, i) => (
                        <Chip key={i} label={v} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                      ))}
                    </MDBox>
                  </MDBox>
                )}
                <MDBox mt={2} pt={2} sx={{ borderTop: 1, borderColor: "divider" }}>
                  <MDTypography variant="body2" color="text" mb={1} fontWeight="medium">Onboarding Status</MDTypography>
                  <MDBox display="flex" flexWrap="wrap" gap={0.5}>
                    <Chip label={`Onboarding ${stay?.onboardingCompleted ? "✓" : "—"}`} size="small"
                      color={stay?.onboardingCompleted ? "success" : "default"} variant={stay?.onboardingCompleted ? "filled" : "outlined"} sx={{ height: 20, fontSize: 10 }} />
                    <Chip label={`ID ${stay?.idUploaded ? "✓" : "—"}`} size="small"
                      color={stay?.idUploaded ? "success" : "default"} variant={stay?.idUploaded ? "filled" : "outlined"} sx={{ height: 20, fontSize: 10 }} />
                    <Chip label={`Payment ${stay?.paymentAuthorized ? "✓" : "—"}`} size="small"
                      color={stay?.paymentAuthorized ? "success" : "default"} variant={stay?.paymentAuthorized ? "filled" : "outlined"} sx={{ height: 20, fontSize: 10 }} />
                    <Chip label={`Carbon Offset ${stay?.carbonOffset ? "✓" : "—"}`} size="small"
                      color={stay?.carbonOffset ? "success" : "default"} variant={stay?.carbonOffset ? "filled" : "outlined"} sx={{ height: 20, fontSize: 10 }} />
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Disputes */}
          {stay?.disputes?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card style={{ height: "100%" }}>
                <MDBox mx={2} mt={-3} py={2} px={2} variant="gradient" bgColor="warning" borderRadius="lg" coloredShadow="warning">
                  <MDTypography variant="h6" color="white">Disputes ({stay.disputes.length})</MDTypography>
                </MDBox>
                <MDBox p={2}>
                  {stay.disputes.map((d) => (
                    <MDBox key={d.id} p={1.5} mb={1} sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center">
                        <MDTypography variant="caption" fontWeight="medium">{d.reason}</MDTypography>
                        <Chip label={d.status} color={d.status === "OPEN" ? "warning" : d.status === "RESOLVED" ? "success" : "error"} size="small" sx={{ height: 18, fontSize: 9 }} />
                      </MDBox>
                      {d.amountCents != null && <MDTypography variant="caption" color="text">${(d.amountCents / 100).toFixed(2)}</MDTypography>}
                      {d.resolution && <MDTypography variant="caption" color="text" display="block">Resolution: {d.resolution}</MDTypography>}
                    </MDBox>
                  ))}
                </MDBox>
              </Card>
            </Grid>
          )}

          {/* Orders */}
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

          {/* Itinerary */}
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
