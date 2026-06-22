import { useState } from "react";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import { useQuery } from "@tanstack/react-query";
import { hotelManagerAPI } from "services/hotelManager";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

function Dashboard() {
  const [days, setDays] = useState(7);
  const { data: d, isLoading, error } = useQuery({
    queryKey: ["hotelDashboard", days],
    queryFn: () => hotelManagerAPI.getDashboard(days),
  });

  const revChart = d?.revenue7d ? {
    labels: d.revenue7d.map((r) => r.label),
    datasets: [{
      label: "Revenue ($)",
      data: d.revenue7d.map((r) => (r.cents / 100).toFixed(2)),
      backgroundColor: "rgba(67, 160, 71, 0.6)",
      borderColor: "#43A047",
      borderWidth: 1,
      borderRadius: 4,
    }],
  } : null;

  const occChart = d?.occupancy7d ? {
    labels: d.occupancy7d.map((o) => o.label),
    datasets: [{
      label: "Occupancy %",
      data: d.occupancy7d.map((o) => o.rate),
      fill: true,
      backgroundColor: "rgba(33, 150, 243, 0.15)",
      borderColor: "#2196F3",
      pointBackgroundColor: "#2196F3",
      pointRadius: 4,
      tension: 0.3,
    }],
  } : null;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">Hotel Dashboard</MDTypography>
          <MDTypography variant="body2" color="text">Overview of your hotel operations</MDTypography>
        </MDBox>

        <MDBox display="flex" justifyContent="flex-end" mb={2}>
          <ToggleButtonGroup size="small" value={days} exclusive onChange={(_, v) => v && setDays(v)}>
            <ToggleButton value={7}>7d</ToggleButton>
            <ToggleButton value={14}>14d</ToggleButton>
            <ToggleButton value={30}>30d</ToggleButton>
          </ToggleButtonGroup>
        </MDBox>
        {isLoading ? (
          <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
        ) : error ? (
          <MDBox px={3}><Alert severity="error">Failed to load dashboard: {error.message}</Alert></MDBox>
        ) : (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <ComplexStatisticsCard color="dark" icon="door_back" title="Check-ins Today" count={d?.checkInsToday || 0}
                  percentage={{ color: d?.checkInsChange?.startsWith("-") ? "error" : "success", amount: d?.checkInsChange || "+0%", label: "than yesterday" }} />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <ComplexStatisticsCard icon="check_circle" title="Check-outs Today" count={d?.checkOutsToday || 0}
                  percentage={{ color: d?.checkOutsChange?.startsWith("-") ? "error" : "success", amount: d?.checkOutsChange || "+0%", label: "than yesterday" }} />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <ComplexStatisticsCard color="success" icon="attach_money" title="Today's Revenue" count={`$${((d?.todayRevenue || 0) / 100).toFixed(0)}`}
                  percentage={{ color: d?.revenueChange?.startsWith("-") ? "error" : "success", amount: d?.revenueChange || "+0%", label: "than yesterday" }} />
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <ComplexStatisticsCard color="primary" icon="restaurant" title="Active Orders" count={d?.activeOrders || 0}
                  percentage={{ color: d?.activeOrdersChange?.startsWith("-") ? "error" : "success", amount: d?.activeOrdersChange || "+0%", label: "new orders" }} />
              </Grid>
            </Grid>

            <Grid container spacing={3} mt={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>Revenue — Last {days} Days</MDTypography>
                  {revChart ? (
                    <Bar data={revChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { callback: (v) => `$${v}` } } } }} />
                  ) : (
                    <MDTypography variant="body2" color="text">No data</MDTypography>
                  )}
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3 }}>
                  <MDTypography variant="h6" fontWeight="medium" mb={2}>Occupancy — Last {days} Days</MDTypography>
                  {occChart ? (
                    <Line data={occChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` } } } }} />
                  ) : (
                    <MDTypography variant="body2" color="text">No data</MDTypography>
                  )}
                </Card>
              </Grid>
            </Grid>

            <MDBox mt={6}>
              <MDTypography variant="h5" fontWeight="medium" mb={2}>Today&apos;s Occupancy</MDTypography>
              <MDBox p={3} bgColor="grey-100" borderRadius="lg" textAlign="center">
                <MDTypography variant="h3" fontWeight="bold" color="primary">{d?.occupancyRate || 0}%</MDTypography>
                <MDTypography variant="body2" color="text">{d?.occupiedRooms || 0} out of {d?.totalRooms || 0} rooms occupied</MDTypography>
              </MDBox>
            </MDBox>

            <MDBox mt={6}>
              <MDTypography variant="h5" fontWeight="medium" mb={2}>Recent Orders</MDTypography>
              <Card>
                <MDBox p={2}>
                  {(d?.recentOrders || []).length === 0 ? (
                    <MDTypography variant="body2" color="text">No recent orders.</MDTypography>
                  ) : (
                    <Grid container spacing={1}>
                      {d.recentOrders.slice(0, 5).map((order) => (
                        <Grid item xs={12} key={order.id}>
                          <MDBox display="flex" justifyContent="space-between" alignItems="center" py={1} sx={{ borderBottom: "1px solid #eee" }}>
                            <MDBox>
                              <MDTypography variant="body2" fontWeight="medium">{order.stay?.user?.name || "Unknown"}</MDTypography>
                              <MDTypography variant="caption" color="text">{order.items?.map((i) => `${i.quantity}x ${i.nameSnapshot}`).join(", ") || "—"}</MDTypography>
                            </MDBox>
                            <MDBox display="flex" alignItems="center" gap={1}>
                              <Chip label={order.status} size="small" color={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" ? "error" : "info"} />
                              <MDTypography variant="body2" fontWeight="medium">${(order.totalCents / 100).toFixed(2)}</MDTypography>
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
