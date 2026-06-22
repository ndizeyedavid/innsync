/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// React Query
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// API
import { hotelManagerAPI } from "services/hotelManager";

function Orders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["hotelOrders"],
    queryFn: () => hotelManagerAPI.getOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => hotelManagerAPI.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelOrders"] });
      queryClient.invalidateQueries({ queryKey: ["hotelDashboard"] });
    },
  });

  const columns = [
    { Header: "Order ID", accessor: "orderId", width: "20%" },
    { Header: "Guest", accessor: "guest", width: "20%" },
    { Header: "Status", accessor: "status", width: "15%" },
    { Header: "Items", accessor: "items", width: "25%" },
    { Header: "Total", accessor: "total", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "10%" },
  ];

  const rows =
    orders?.map((order) => {
      const getStatusColor = (status) => {
        switch (status) {
          case "PENDING_REMOTE":
            return "warning";
          case "PREPARING":
            return "info";
          case "ON_THE_WAY":
            return "primary";
          case "DELIVERED":
            return "success";
          case "CANCELLED":
            return "error";
          case "FAILED":
            return "error";
          default:
            return "default";
        }
      };

      return {
        orderId: order.id.slice(0, 8),
        guest: order.stay?.user?.name || "Unknown",
        status: <Chip label={order.status} color={getStatusColor(order.status)} size="small" />,
        items:
          order.items?.map((item) => `${item.quantity}x ${item.nameSnapshot}`).join(", ") || "",
        total: `$${(order.totalCents / 100).toFixed(2)}`,
        actions: (
          <MDBox display="flex" gap={1}>
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
              <FormControl size="small">
                <Select
                  value={order.status}
                  onChange={(e) => {
                    updateStatusMutation.mutate({
                      orderId: order.id,
                      status: e.target.value,
                    });
                  }}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="PREPARING">Preparing</MenuItem>
                  <MenuItem value="ON_THE_WAY">On the way</MenuItem>
                  <MenuItem value="DELIVERED">Delivered</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            )}
          </MDBox>
        ),
      };
    }) || [];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="primary"
                borderRadius="lg"
                coloredShadow="primary"
              >
                <MDTypography variant="h6" color="white">
                  Orders
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
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

export default Orders;
