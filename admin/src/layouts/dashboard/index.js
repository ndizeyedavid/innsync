/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

// @mui material components
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// React Query
import { useQuery } from "@tanstack/react-query";

// API
import { hotelManagerAPI } from "services/hotelManager";

function Dashboard() {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["hotelDashboard"],
    queryFn: hotelManagerAPI.getDashboard,
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Hotel Dashboard
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Overview of your hotel operations
          </MDTypography>
        </MDBox>

        {isLoading ? (
          <MDBox display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </MDBox>
        ) : error ? (
          <MDBox px={3}><Alert severity="error">Failed to load dashboard: {error.message}</Alert></MDBox>
        ) : (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="dark"
                    icon="door_back"
                    title="Check-ins Today"
                    count={dashboardData?.checkInsToday || 0}
                    percentage={{
                      color: "success",
                      amount: "+15%",
                      label: "than yesterday",
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    icon="check_circle"
                    title="Check-outs Today"
                    count={dashboardData?.checkOutsToday || 0}
                    percentage={{
                      color: "info",
                      amount: "-5%",
                      label: "than yesterday",
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="success"
                    icon="attach_money"
                    title="Today's Revenue"
                    count={`$${((dashboardData?.todayRevenue || 0) / 100).toFixed(0)}`}
                    percentage={{
                      color: "success",
                      amount: "+22%",
                      label: "than yesterday",
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="primary"
                    icon="restaurant"
                    title="Active Orders"
                    count={dashboardData?.activeOrders || 0}
                    percentage={{
                      color: "success",
                      amount: "+2",
                      label: "new orders",
                    }}
                  />
                </MDBox>
              </Grid>
            </Grid>

            <MDBox mt={6}>
              <MDTypography variant="h5" fontWeight="medium" mb={2}>
                Today&apos;s Occupancy
              </MDTypography>
              <MDBox p={3} bgColor="grey-100" borderRadius="lg" textAlign="center">
                <MDTypography variant="h3" fontWeight="bold" color="primary">
                  {dashboardData?.occupancyRate || 0}%
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {dashboardData?.occupiedRooms || 0} out of {dashboardData?.totalRooms || 0} rooms
                  occupied
                </MDTypography>
              </MDBox>
            </MDBox>

            <MDBox mt={6}>
              <MDTypography variant="h5" fontWeight="medium" mb={2}>
                Recent Orders
              </MDTypography>
              <Card>
                <MDBox p={2}>
                  {(dashboardData?.recentOrders || []).length === 0 ? (
                    <MDTypography variant="body2" color="text">No recent orders.</MDTypography>
                  ) : (
                    <Grid container spacing={1}>
                      {dashboardData.recentOrders.slice(0, 5).map((order) => (
                        <Grid item xs={12} key={order.id}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: "1px solid #eee" }}>
                            <MDBox>
                              <MDTypography variant="body2" fontWeight="medium">
                                {order.stay?.user?.name || "Unknown"}
                              </MDTypography>
                              <MDTypography variant="caption" color="text">
                                {order.items?.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ") || "—"}
                              </MDTypography>
                            </MDBox>
                            <MDBox display="flex" alignItems="center" gap={1}>
                              <Chip label={order.status} size="small" color={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "error" : "info"} />
                              <MDTypography variant="body2" fontWeight="medium">
                                ${(order.totalCents / 100).toFixed(2)}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </MDBox>
              </Card>
            </MDBox>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
