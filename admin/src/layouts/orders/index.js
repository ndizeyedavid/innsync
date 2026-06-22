/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelManagerAPI } from "services/hotelManager";

const ORDER_STATUSES = ["", "PENDING_REMOTE", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"];

function Orders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["hotelOrders", statusFilter],
    queryFn: () => hotelManagerAPI.getOrders(statusFilter || undefined),
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
        orderId: (
          <MDBox display="flex" alignItems="center" gap={0.5}>
            <MDTypography variant="caption" fontWeight="medium" sx={{ cursor: "pointer", textDecoration: "underline", color: "info.main" }}
              onClick={() => setDetailOrder(order)}>
              {order.id.slice(0, 8)}
            </MDTypography>
            <Tooltip title="View details">
              <IconButton size="small" onClick={() => setDetailOrder(order)} sx={{ p: 0.3 }}>
                <Icon fontSize="small" color="info">info</Icon>
              </IconButton>
            </Tooltip>
          </MDBox>
        ),
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
              <MDBox pt={2} px={3} display="flex" gap={1} flexWrap="wrap">
                {ORDER_STATUSES.map((s) => (
                  <MDButton
                    key={s}
                    color="primary"
                    variant={statusFilter === s ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setStatusFilter(s)}
                  >
                    {s ? s.replace(/_/g, " ") : "All"}
                  </MDButton>
                ))}
              </MDBox>
              <MDBox pt={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                  </MDBox>
                ) : error ? (
                  <MDBox px={3} pb={3}><Alert severity="error">Failed to load orders: {error.message}</Alert></MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={true}
                    entriesPerPage={{ defaultValue: 10, entries: ["5", "10", "15", "20", "25"] }}
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

      <Dialog open={!!detailOrder} onClose={() => setDetailOrder(null)} maxWidth="sm" fullWidth>
        {detailOrder && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
              <Icon color="primary">receipt_long</Icon> Order #{detailOrder.id.slice(0, 8)}
              <Chip label={detailOrder.status} color={
                detailOrder.status === "DELIVERED" ? "success" :
                detailOrder.status === "CANCELLED" ? "error" :
                detailOrder.status === "PREPARING" ? "info" :
                detailOrder.status === "ON_THE_WAY" ? "primary" : "warning"
              } size="small" sx={{ ml: "auto" }} />
            </DialogTitle>
            <DialogContent dividers>
              <MDBox display="flex" flexDirection="column" gap={2}>
                <MDBox display="flex" justifyContent="space-between">
                  <MDTypography variant="body2" color="text">Guest</MDTypography>
                  <MDTypography variant="body2" fontWeight="medium">{detailOrder.stay?.user?.name || "Unknown"}</MDTypography>
                </MDBox>
                {detailOrder.placedAt && (
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="body2" color="text">Placed at</MDTypography>
                    <MDTypography variant="body2" fontWeight="medium">{new Date(detailOrder.placedAt).toLocaleString()}</MDTypography>
                  </MDBox>
                )}
                <MDBox display="flex" justifyContent="space-between">
                  <MDTypography variant="body2" color="text">Room</MDTypography>
                  <MDTypography variant="body2" fontWeight="medium">{detailOrder.stay?.selectedRoomId || "—"}</MDTypography>
                </MDBox>
                <MDBox display="flex" justifyContent="space-between">
                  <MDTypography variant="body2" color="text">Category</MDTypography>
                  <MDTypography variant="body2" fontWeight="medium">{detailOrder.category || "—"}</MDTypography>
                </MDBox>
                  {detailOrder.externalTicketId && (
                    <MDBox display="flex" justifyContent="space-between">
                      <MDTypography variant="body2" color="text">External Ticket ID</MDTypography>
                      <MDTypography variant="body2" fontWeight="medium">{detailOrder.externalTicketId}</MDTypography>
                    </MDBox>
                  )}
                  <MDBox>
                    <MDTypography variant="body2" color="text" mb={1}>Items</MDTypography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="center">Qty</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Prep (min)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailOrder.items?.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.nameSnapshot || item.name || "—"}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">${((item.unitPriceCents || 0) / 100).toFixed(2)}</TableCell>
                            <TableCell align="right">{item.prepMinutes ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3}><MDTypography variant="button" fontWeight="bold">Total</MDTypography></TableCell>
                          <TableCell align="right"><MDTypography variant="button" fontWeight="bold">${(detailOrder.totalCents / 100).toFixed(2)}</MDTypography></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </MDBox>
                {detailOrder.note && (
                  <MDBox display="flex" justifyContent="space-between">
                    <MDTypography variant="body2" color="text">Note</MDTypography>
                    <MDTypography variant="body2" fontWeight="medium">{detailOrder.note}</MDTypography>
                  </MDBox>
                )}
              </MDBox>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOrder(null)} color="inherit">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardLayout>
  );
}

export default Orders;
