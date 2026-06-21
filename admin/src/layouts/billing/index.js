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
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
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
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
                    <DataTable table={{ columns, rows }} isSorted={false} entriesPerPage={false} showTotalEntries={false} noEndBorder />
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
