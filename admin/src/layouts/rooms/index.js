import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";
import ImageUpload from "components/ImageUpload";

const ROOM_TYPES = [
  { value: "Standard", label: "Standard", icon: "🛏️" },
  { value: "Double", label: "Double", icon: "🛌" },
  { value: "Suite", label: "Suite", icon: "✨" },
  { value: "Deluxe", label: "Deluxe", icon: "🌟" },
  { value: "Penthouse", label: "Penthouse", icon: "👑" },
  { value: "Family", label: "Family", icon: "👨‍👩‍👧‍👦" },
];

const FLOORS = Array.from({ length: 20 }, (_, i) => ({ value: String(i + 1), label: `Floor ${i + 1}` }));

const emptyForm = { number: "", type: "Standard", price: "", floor: "1", imageUrl: "" };
const selectSx = { "& .MuiSelect-select": { minHeight: "48px", display: "flex", alignItems: "center" } };

function Rooms() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["hotelRooms"],
    queryFn: () => hotelManagerAPI.getRooms(),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const dto = {
        number: data.number,
        type: data.type,
        priceCents: Math.round(parseFloat(data.price) * 100),
        floor: data.floor,
        imageUrl: data.imageUrl || undefined,
      };
      return data.id ? hotelManagerAPI.updateRoom(data.id, dto) : hotelManagerAPI.createRoom(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelRooms"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setSaved(true);
    },
  });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (room) => {
    setEditing(room);
    setForm({
      number: room.number || "",
      type: room.type || "Standard",
      price: String(((room.priceCents ?? 0) / 100).toFixed(2)),
      floor: String(room.floor || 1),
      imageUrl: room.imageUrl || "",
    });
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="secondary" borderRadius="lg" coloredShadow="secondary"
                display="flex" justifyContent="space-between" alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Rooms <span style={{ fontSize: 14, opacity: 0.7 }}>({rooms?.length || 0})</span>
                </MDTypography>
                <MDButton variant="contained" color="white" size="small" onClick={openAdd}>
                  + Add Room
                </MDButton>
              </MDBox>
              <MDBox pt={3} px={3} pb={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : !rooms || rooms.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>No rooms yet. Click &apos;+ Add Room&apos; to create one.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {rooms.map((room) => {
                      const num = room.number || "?";
                      const typ = room.type || "Standard";
                      const price = room.priceCents ?? 0;
                      const flr = room.floor || "—";
                      const typeInfo = ROOM_TYPES.find((t) => t.value === typ) || ROOM_TYPES[0];
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                          <Card sx={{
                            p: 2, position: "relative", transition: "all 0.2s",
                            "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                          }}>
                            <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
                              <MDBox>
                                <MDTypography variant="h5" fontWeight="bold" lineHeight={1}>
                                  {num}
                                </MDTypography>
                                <MDTypography variant="caption" color="text" sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                  <span>{typeInfo.icon}</span> {typ}
                                </MDTypography>
                              </MDBox>
                              {room.imageUrl && (
                                <Box
                                  component="img"
                                  src={room.imageUrl}
                                  alt={num}
                                  sx={{ width: 60, height: 40, borderRadius: 1, objectFit: "cover", ml: 1 }}
                                />
                              )}
                            </MDBox>
                            <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                              <MDTypography variant="body2" color="text" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                🏢 Floor {flr}
                              </MDTypography>
                              <MDTypography variant="body1" fontWeight="bold" color="info">
                                ${(price / 100).toFixed(2)}
                                <span style={{ fontSize: 11, fontWeight: 400, color: "#888" }}>/night</span>
                              </MDTypography>
                            </MDBox>
                            <MDBox mt={2} display="flex" gap={1}>
                              <MDButton variant="outlined" color="info" size="small" sx={{ flex: 1 }}
                                onClick={() => openEdit(room)}>
                                Edit
                              </MDButton>
                            </MDBox>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? "✎ Edit Room" : "➕ Add Room"}</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2.5} mt={1}>
            <TextField label="Room Number" fullWidth value={form.number}
              onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
              placeholder="e.g. 301" />
            <TextField label="Room Type" select fullWidth value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              sx={selectSx}>
              {ROOM_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value} sx={{ minHeight: 48 }}>{t.icon} {t.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Price per Night ($)" type="number" fullWidth value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="e.g. 199.00"
              inputProps={{ step: 0.01, min: 0 }} />
            <TextField label="Floor" select fullWidth value={form.floor}
              onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
              sx={selectSx}>
              {FLOORS.map((f) => (
                <MenuItem key={f.value} value={f.value} sx={{ minHeight: 48 }}>{f.label}</MenuItem>
              ))}
            </TextField>
            <ImageUpload label="Room Photo" value={form.imageUrl}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton onClick={() => setDialogOpen(false)} color="secondary" variant="outlined">Cancel</MDButton>
          <MDButton variant="gradient" color="secondary" onClick={() => saveMutation.mutate(editing ? { ...form, id: editing.id } : form)}
            disabled={!form.number || !form.price || saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : editing ? "Update Room" : "Create Room"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} message="Room saved successfully" />
    </DashboardLayout>
  );
}

export default Rooms;
