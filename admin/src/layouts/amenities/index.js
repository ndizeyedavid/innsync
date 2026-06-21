import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
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
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

const CATEGORIES = [
  { value: "Room Service", label: "Room Service", icon: "🍽️", color: "#e91e63" },
  { value: "Spa & Wellness", label: "Spa & Wellness", icon: "💆", color: "#9c27b0" },
  { value: "Dining & Drinks", label: "Dining & Drinks", icon: "🍷", color: "#ff9800" },
  { value: "Activities", label: "Activities", icon: "🎯", color: "#4caf50" },
  { value: "Transportation", label: "Transportation", icon: "🚗", color: "#2196f3" },
  { value: "Other", label: "Other", icon: "📦", color: "#607d8b" },
];

const emptyForm = { name: "", description: "", price: "", category: "Other", imageUrl: "" };
const selectSx = { "& .MuiSelect-select": { minHeight: "48px", display: "flex", alignItems: "center" } };

function Amenities() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  const { data: amenities, isLoading, error } = useQuery({
    queryKey: ["hotelAmenities"],
    queryFn: () => hotelManagerAPI.getAmenities(),
  });

  const toggleAvailability = useMutation({
    mutationFn: ({ id, isAvailable }) => hotelManagerAPI.updateAmenity(id, { isAvailable }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hotelAmenities"] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const dto = {
        name: data.name,
        description: data.description,
        priceCents: Math.round(parseFloat(data.price || "0") * 100),
        category: data.category,
        imageUrl: data.imageUrl || undefined,
      };
      return data.id ? hotelManagerAPI.updateAmenity(data.id, dto) : hotelManagerAPI.createAmenity(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotelAmenities"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setSaved(true);
    },
  });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      name: a.name,
      description: a.description || "",
      price: String(((a.priceCents ?? 0) / 100).toFixed(2)),
      category: a.category || "Other",
      imageUrl: a.imageUrl || "",
    });
    setDialogOpen(true);
  };

  const getCategory = (cat) => CATEGORIES.find((c) => c.value === (cat || "Other")) || CATEGORIES[5];

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
                  Amenities <span style={{ fontSize: 14, opacity: 0.7 }}>({amenities?.length || 0})</span>
                </MDTypography>
                <MDButton variant="contained" color="white" size="small" onClick={openAdd}>
                  + Add Amenity
                </MDButton>
              </MDBox>
              <MDBox pt={3} px={3} pb={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load amenities</Alert>
                ) : !amenities || amenities.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>No amenities yet. Click &apos;+ Add Amenity&apos; to create one.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {amenities.map((amenity) => {
                      const cat = getCategory(amenity.category);
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={amenity.id}>
                          <Card sx={{
                            p: 2, position: "relative", transition: "all 0.2s",
                            "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                          }}>
                            <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
                              <MDBox display="flex" alignItems="center" gap={1}>
                                <span style={{ fontSize: 28 }}>{cat.icon}</span>
                                <MDBox>
                                  <MDTypography variant="body1" fontWeight="bold" lineHeight={1.2}>
                                    {amenity.name}
                                  </MDTypography>
                                  <Chip label={cat.label} size="small" sx={{
                                    mt: 0.5, height: 20, fontSize: 10,
                                    bgcolor: cat.color + "20", color: cat.color, fontWeight: 600,
                                  }} />
                                </MDBox>
                              </MDBox>
                              <Switch size="small" checked={amenity.isAvailable}
                                onChange={() => toggleAvailability.mutate({ id: amenity.id, isAvailable: !amenity.isAvailable })}
                                disabled={toggleAvailability.isPending} />
                            </MDBox>
                            {amenity.imageUrl && (
                              <Box
                                component="img"
                                src={amenity.imageUrl}
                                alt={amenity.name}
                                sx={{ width: "100%", height: 100, borderRadius: 1, objectFit: "cover", mt: 1 }}
                              />
                            )}
                            {amenity.description && (
                              <MDTypography variant="body2" color="text" sx={{ mt: 1, opacity: 0.7, fontSize: 12 }}>
                                {amenity.description}
                              </MDTypography>
                            )}
                            <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={1.5}>
                              <MDTypography variant="body2" fontWeight="bold" color="success">
                                {amenity.priceCents > 0 ? `$${(amenity.priceCents / 100).toFixed(2)}/day` : "Free"}
                              </MDTypography>
                              <Tooltip title="Edit amenity">
                                <IconButton size="small" color="info" onClick={() => openEdit(amenity)}>
                                  <span style={{ fontSize: 16 }}>✎</span>
                                </IconButton>
                              </Tooltip>
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
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? "✎ Edit Amenity" : "➕ Add Amenity"}</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2.5} mt={1}>
            <TextField label="Name" fullWidth value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Pool Access" />
            <TextField label="Description" fullWidth multiline rows={2} value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the amenity" />
            <TextField label="Price per Day ($)" type="number" fullWidth value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="0.00 = free"
              inputProps={{ step: 0.01, min: 0 }} />
            <TextField label="Category" select fullWidth value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              sx={selectSx}>
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value} sx={{ minHeight: 48 }}>{c.icon} {c.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Image URL" fullWidth value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://example.com/amenity-photo.jpg"
              helperText="Optional — paste an image URL to show on the amenity card" />
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton onClick={() => setDialogOpen(false)} color="secondary" variant="outlined">Cancel</MDButton>
          <MDButton variant="gradient" color="secondary"
            onClick={() => saveMutation.mutate(editing ? { ...form, id: editing.id } : form)}
            disabled={!form.name || saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : editing ? "Update Amenity" : "Create Amenity"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}
        message={editing ? "Amenity updated" : "Amenity created"} />
    </DashboardLayout>
  );
}

export default Amenities;
