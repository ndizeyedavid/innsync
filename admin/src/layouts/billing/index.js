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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Transaction from "layouts/billing/components/Transaction";
import { hotelManagerAPI } from "services/hotelManager";

function Billing() {
  const queryClient = useQueryClient();
  const [selectedStay, setSelectedStay] = useState(null);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeDesc, setChargeDesc] = useState("");
  const [saved, setSaved] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [invMenu, setInvMenu] = useState(null);
  const [invTarget, setInvTarget] = useState(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [payNotes, setPayNotes] = useState("");

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
      setSnackMsg("Charge added");
      setSaved(true);
    },
    onError: (err) => setSnackMsg(err?.response?.data?.message || "Operation failed"),
  });

  const voidMut = useMutation({
    mutationFn: (chargeId) => hotelManagerAPI.voidCharge(selectedStay, chargeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelFolio", selectedStay] });
      setSnackMsg("Charge voided");
      setSaved(true);
    },
    onError: (err) => setSnackMsg(err?.response?.data?.message || "Operation failed"),
  });

  const generateInvMut = useMutation({
    mutationFn: () => hotelManagerAPI.generateInvoice(selectedStay),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelInvoices"] });
      setSnackMsg("Invoice generated");
      setSaved(true);
    },
    onError: (err) => setSnackMsg(err?.response?.data?.message || "Operation failed"),
  });

  const updateInvStatusMut = useMutation({
    mutationFn: ({ id, status }) => hotelManagerAPI.updateInvoiceStatus(id, status),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["hotelInvoices"] });
      setSnackMsg(`Invoice ${vars.status.toLowerCase()}`);
      setSaved(true);
    },
    onError: (err) => setSnackMsg(err?.response?.data?.message || "Operation failed"),
  });

  const recordPayMut = useMutation({
    mutationFn: () => hotelManagerAPI.recordPayment(selectedStay, {
      amountCents: Math.round(parseFloat(payAmount) * 100),
      method: payMethod,
      notes: payNotes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelFolio", selectedStay] });
      queryClient.invalidateQueries({ queryKey: ["hotelInvoices"] });
      setPayOpen(false);
      setPayAmount("");
      setPayNotes("");
      setSnackMsg("Payment recorded");
      setSaved(true);
    },
    onError: (err) => setSnackMsg(err?.response?.data?.message || "Operation failed"),
  });

  const folioLines = folio?.lines || [];
  const totalCents = folio?.totalCents || 0;

  const columns = [
    { Header: "Description", accessor: "description", width: "35%" },
    { Header: "Amount", accessor: "amount", width: "15%" },
    { Header: "Category", accessor: "category", width: "15%" },
    { Header: "Date", accessor: "date", width: "20%" },
    { Header: "", accessor: "actions", width: "15%" },
  ];

  const rows = folioLines.map((line, i) => ({
    description: line.description || line.name || `Item ${i + 1}`,
    amount: `$${((line.amountCents || line.amount || 0) / 100).toFixed(2)}`,
    category: line.category || "N/A",
    date: line.date ? new Date(line.date).toLocaleDateString() : "N/A",
    actions: line.id?.startsWith("manual-") ? (
      <MDButton variant="text" color="error" size="small"
        onClick={() => {
          if (window.confirm("Void this charge? This cannot be undone.")) {
            voidMut.mutate(line.id);
          }
        }}
        disabled={voidMut.isPending}
        title="Void charge"
      >
        <Icon fontSize="small">delete</Icon>
      </MDButton>
    ) : null,
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
                <MDBox display="flex" justifyContent="flex-end" gap={1} mt={2} px={2} pb={2}>
                  {selectedStay && folioLines.length > 0 && (
                    <MDButton variant="gradient" color="info"
                      onClick={() => generateInvMut.mutate()}
                      disabled={generateInvMut.isPending}>
                      {generateInvMut.isPending ? "Generating..." : "Generate Invoice"}
                    </MDButton>
                  )}
                  <MDButton variant="gradient" color="warning" disabled={!selectedStay}
                    onClick={() => setPayOpen(true)}>
                    Record Payment
                  </MDButton>
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
                    invoices.slice(0, 8).map((inv) => (
                      <MDBox key={inv.id} component="li" display="flex" justifyContent="space-between" alignItems="center" py={1} pr={1} mb={1}>
                        <MDBox lineHeight={1.125}>
                          <MDTypography display="block" variant="button" fontWeight="medium">
                            {inv.invoiceNumber || "—"}
                          </MDTypography>
                          <MDTypography variant="caption" fontWeight="regular" color="text">
                            {inv.guestName} — {inv.checkOut ? new Date(inv.checkOut).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" }) : "N/A"}
                          </MDTypography>
                        </MDBox>
                        <MDBox display="flex" alignItems="center" gap={1}>
                          <Chip size="small" label={inv.status}
                            color={inv.status === "PAID" ? "success" : inv.status === "ISSUED" ? "info" : inv.status === "DRAFT" ? "default" : inv.status === "VOID" ? "error" : inv.status === "UNINVOICED" ? "warning" : "default"}
                          />
                          <MDTypography variant="button" fontWeight="regular" color="text">
                            ${(inv.totalCents / 100).toFixed(2)}
                          </MDTypography>
                          {inv.status === "DRAFT" && (
                            <MDButton size="small" variant="text" color="info"
                              onClick={(e) => { setInvMenu(e.currentTarget); setInvTarget(inv); }}>
                              <Icon fontSize="small">more_vert</Icon>
                            </MDButton>
                          )}
                          {inv.status === "ISSUED" && (
                            <MDButton size="small" variant="text" color="success"
                              onClick={() => {
                                if (window.confirm("Mark this invoice as PAID?")) {
                                  updateInvStatusMut.mutate({ id: inv.id, status: "PAID" });
                                }
                              }}>
                              <Icon fontSize="small">check_circle</Icon>
                            </MDButton>
                          )}
                        </MDBox>
                      </MDBox>
                    ))
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          <Menu anchorEl={invMenu} open={!!invMenu} onClose={() => setInvMenu(null)}>
            <MenuItem onClick={() => { setInvMenu(null); updateInvStatusMut.mutate({ id: invTarget.id, status: "ISSUED" }); }}>
              <Icon fontSize="small" sx={{ mr: 1 }}>send</Icon> Issue
            </MenuItem>
            <MenuItem onClick={() => { setInvMenu(null); updateInvStatusMut.mutate({ id: invTarget.id, status: "PAID" }); }}>
              <Icon fontSize="small" sx={{ mr: 1 }}>check_circle</Icon> Mark Paid
            </MenuItem>
            <MenuItem onClick={() => {
              setInvMenu(null);
              if (window.confirm("Void this invoice? This cannot be undone.")) {
                updateInvStatusMut.mutate({ id: invTarget.id, status: "VOID" });
              }
            }}>
              <Icon fontSize="small" sx={{ mr: 1 }}>cancel</Icon> Void
            </MenuItem>
          </Menu>

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
            disabled={!chargeAmount || parseFloat(chargeAmount) <= 0 || !chargeDesc || chargeMutation.isPending}>
            {chargeMutation.isPending ? "Adding..." : "Add Charge"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={payOpen} onClose={() => setPayOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField label="Amount ($)" type="number" fullWidth value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              helperText="e.g. 250.00 = $250.00" />
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select native value={payMethod} label="Method"
                onChange={(e) => setPayMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card_swiped">Card (Swiped)</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>
            <TextField label="Notes (optional)" fullWidth multiline rows={2} value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)}
              placeholder="e.g. Collected at front desk by Maria" />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setPayOpen(false)} color="secondary">Cancel</MDButton>
          <MDButton variant="gradient" color="warning" onClick={() => recordPayMut.mutate()}
            disabled={!payAmount || parseFloat(payAmount) <= 0 || recordPayMut.isPending}>
            {recordPayMut.isPending ? "Recording..." : "Record Payment"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} message={snackMsg} />
    </DashboardLayout>
  );
}

export default Billing;
