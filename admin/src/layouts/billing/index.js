import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Transaction from "layouts/billing/components/Transaction";
import Invoice from "layouts/billing/components/Invoice";
import { hotelManagerAPI } from "services/hotelManager";

function Billing() {
  const queryClient = useQueryClient();
  const [selectedStay, setSelectedStay] = useState(null);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeDesc, setChargeDesc] = useState("");
  const [saved, setSaved] = useState(false);

  const { data: stays } = useQuery({
    queryKey: ["hotelStays"],
    queryFn: () => hotelManagerAPI.getStays("CHECKED_IN"),
  });

  const { data: folio, isLoading } = useQuery({
    queryKey: ["hotelFolio", selectedStay],
    queryFn: () => hotelManagerAPI.getFolio(selectedStay),
    enabled: !!selectedStay,
  });

  const { data: hotel } = useQuery({
    queryKey: ["hotelSettings"],
    queryFn: hotelManagerAPI.getHotelSettings,
  });

  const { data: invoices } = useQuery({
    queryKey: ["hotelInvoices"],
    queryFn: hotelManagerAPI.getInvoices,
  });

  const chargeMutation = useMutation({
    mutationFn: () => hotelManagerAPI.addCharge(selectedStay, {
      amountCents: Math.round(parseFloat(chargeAmount) * 100),
      description: chargeDesc,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelFolio", selectedStay] });
      setChargeOpen(false);
      setChargeAmount("");
      setChargeDesc("");
      setSaved(true);
    },
  });

  const folioLines = folio?.lines || [];
  const totalCents = folio?.totalCents || 0;

  const columns = [
    { Header: "Description", accessor: "description", width: "40%" },
    { Header: "Amount", accessor: "amount", width: "20%" },
    { Header: "Category", accessor: "category", width: "20%" },
    { Header: "Date", accessor: "date", width: "20%" },
  ];

  const rows = folioLines.map((line, i) => ({
    description: line.description || line.name || `Item ${i + 1}`,
    amount: `$${((line.amountCents || line.amount || 0) / 100).toFixed(2)}`,
    category: line.category || "N/A",
    date: line.date ? new Date(line.date).toLocaleDateString() : "N/A",
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Guest selector + folio */}
          <Grid item xs={12} lg={8}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="success" borderRadius="lg" coloredShadow="success"
                display="flex" justifyContent="space-between" alignItems="center"
              >
                <MDTypography variant="h6" color="white">Billing & Folio</MDTypography>
                <MDBox display="flex" gap={1} alignItems="center">
                  <MDTypography variant="body2" color="white" sx={{ mr: 1 }}>Guest:</MDTypography>
                  <TextField select size="small" value={selectedStay || ""}
                    onChange={(e) => setSelectedStay(e.target.value)}
                    sx={{ bgcolor: "rgba(255,255,255,0.15)", borderRadius: 1, minWidth: 180 }}
                    SelectProps={{ native: true }} inputProps={{ style: { color: "white" } }}
                  >
                    <option value="">Select guest...</option>
                    {(stays || []).map((s) => (
                      <option key={s.id} value={s.id} style={{ color: "black" }}>
                        {s.user?.name || "Unknown"} - Room {s.selectedRoomId || "?"}
                      </option>
                    ))}
                  </TextField>
                </MDBox>
              </MDBox>
              <MDBox pt={3} px={2}>
                {!selectedStay ? (
                  <Alert severity="info">Select a checked-in guest to view their folio</Alert>
                ) : isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : rows.length === 0 ? (
                  <Alert severity="info">No folio entries for this stay</Alert>
                ) : (
                  <>
                    <DataTable table={{ columns, rows }} isSorted={true} entriesPerPage={{ defaultValue: 10, entries: ["5", "10", "15", "20", "25"] }} showTotalEntries={true} canSearch={true} noEndBorder />
                    <MDBox display="flex" justifyContent="flex-end" mt={3} px={2}>
                      <MDTypography variant="h6">Total: ${(totalCents / 100).toFixed(2)}</MDTypography>
                    </MDBox>
                  </>
                )}
                <MDBox display="flex" justifyContent="flex-end" mt={2} px={2} pb={2}>
                  <MDButton variant="gradient" color="success" disabled={!selectedStay} onClick={() => setChargeOpen(true)}>
                    Add Charge
                  </MDButton>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Transactions sidebar */}
          <Grid item xs={12} lg={4}>
            {selectedStay && folioLines.length > 0 ? (
              <Card sx={{ height: "100%" }}>
                <MDBox pt={3} px={2}>
                  <MDTypography variant="h6" fontWeight="medium">Transactions</MDTypography>
                </MDBox>
                <MDBox pt={1} pb={2} px={2}>
                  <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0} sx={{ listStyle: "none" }}>
                    {folioLines.slice(0, 6).map((line, i) => (
                      <Transaction key={i}
                        color={line.amountCents > 0 ? "success" : "error"}
                        icon={line.amountCents > 0 ? "add" : "remove"}
                        name={line.description || line.category || "Charge"}
                        description={line.date ? new Date(line.date).toLocaleDateString() : ""}
                        value={`$${((line.amountCents || 0) / 100).toFixed(2)}`}
                      />
                    ))}
                  </MDBox>
                </MDBox>
              </Card>
            ) : !selectedStay ? (
              <Card sx={{ height: "100%" }}>
                <MDBox pt={3} px={2}>
                  <MDTypography variant="h6" fontWeight="medium">Transactions</MDTypography>
                </MDBox>
                <MDBox p={2}>
                  <MDTypography variant="body2" color="text">Select a guest to view transactions</MDTypography>
                </MDBox>
              </Card>
            ) : null}
          </Grid>

          {/* Invoices */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ height: "100%" }}>
              <MDBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" fontWeight="medium">Invoices</MDTypography>
              </MDBox>
              <MDBox p={2}>
                <MDBox component="ul" display="flex" flexDirection="column" p={0} m={0}>
                  {!invoices || invoices.length === 0 ? (
                    <MDTypography variant="body2" color="text">No invoices yet</MDTypography>
                  ) : (
                    invoices.slice(0, 5).map((inv) => (
                      <Invoice key={inv.id}
                        date={inv.checkOut ? new Date(inv.checkOut).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" }) : "N/A"}
                        id={`#${inv.id.slice(-6).toUpperCase()}`}
                        price={`$${(inv.totalCents / 100).toFixed(2)}`}
                      />
                    ))
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          {/* Payment Method */}
          <Grid item xs={12} lg={6}>
            <Card id="delete-account">
              <MDBox pt={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
                <MDTypography variant="h6" fontWeight="medium">Payment Method</MDTypography>
              </MDBox>
              <MDBox p={2}>
                {hotel ? (
                  <MDBox display="flex" flexDirection="column" gap={1.5}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2}
                      sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
                      <Icon sx={{ mr: 1, color: "success.main" }}>account_balance</Icon>
                      <MDBox flex={1}>
                        <MDTypography variant="button" fontWeight="medium">Hotel Account</MDTypography>
                        <MDTypography variant="caption" display="block" color="text">{hotel.name}</MDTypography>
                      </MDBox>
                      <MDTypography variant="button" color="success">Active</MDTypography>
                    </MDBox>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2}
                      sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
                      <Icon sx={{ mr: 1, color: "info.main" }}>payments</Icon>
                      <MDBox flex={1}>
                        <MDTypography variant="button" fontWeight="medium">Bank Transfer</MDTypography>
                        <MDTypography variant="caption" display="block" color="text">{hotel.email || "—"}</MDTypography>
                      </MDBox>
                      <MDTypography variant="button" color="info">Default</MDTypography>
                    </MDBox>
                  </MDBox>
                ) : (
                  <MDTypography variant="body2" color="text">Loading...</MDTypography>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog open={chargeOpen} onClose={() => setChargeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Manual Charge</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Description" fullWidth value={chargeDesc} onChange={(e) => setChargeDesc(e.target.value)} />
            <TextField label="Amount ($)" type="number" fullWidth value={chargeAmount}
              onChange={(e) => setChargeAmount(e.target.value)}
              helperText="e.g. 25.50 = $25.50" />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setChargeOpen(false)} color="secondary">Cancel</MDButton>
          <MDButton variant="gradient" color="success" onClick={() => chargeMutation.mutate()}
            disabled={!chargeAmount || !chargeDesc || chargeMutation.isPending}>
            {chargeMutation.isPending ? "Adding..." : "Add Charge"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} message="Charge added" />
    </DashboardLayout>
  );
}

export default Billing;
