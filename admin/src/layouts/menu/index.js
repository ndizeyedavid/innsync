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
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ImageUpload from "components/ImageUpload";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { hotelManagerAPI } from "services/hotelManager";

const CATEGORIES = [
  { value: "food", label: "Food", icon: "🍽️" },
  { value: "drinks", label: "Drinks", icon: "🍹" },
  { value: "room-service", label: "Room Service", icon: "🛎️" },
  { value: "activities", label: "Activities", icon: "🎯" },
  { value: "housekeeping", label: "Housekeeping", icon: "🧹" },
];

const emptyForm = { name: "", category: "food", description: "", priceCents: "", image: "", prepMinutes: "", tags: "" };

function Menu() {
  const queryClient = useQueryClient();
  const [cat, setCat] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saved, setSaved] = useState(false);

  const { data: items, isLoading, error } = useQuery({
    queryKey: ["adminMenu", cat],
    queryFn: () => hotelManagerAPI.getMenuItems(cat || undefined),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const dto = {
        name: data.name,
        category: data.category,
        description: data.description || undefined,
        priceCents: Math.round(parseFloat(data.priceCents) * 100),
        image: data.image || undefined,
        prepMinutes: data.prepMinutes ? parseInt(data.prepMinutes, 10) : undefined,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      };
      return data.id ? hotelManagerAPI.updateMenuItem(data.id, dto) : hotelManagerAPI.createMenuItem(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenu"] });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setSaved(true);
    },
    onError: () => setSaved(true),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => hotelManagerAPI.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenu"] });
      setDeleteTarget(null);
      setSaved(true);
    },
    onError: () => setSaved(true),
  });

  const openAdd = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      category: item.category || "food",
      description: item.description || "",
      priceCents: String(((item.priceCents ?? 0) / 100).toFixed(2)),
      image: item.image || "",
      prepMinutes: item.prepMinutes ? String(item.prepMinutes) : "",
      tags: (item.tags || []).join(", "),
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
              <MDBox mx={2} mt={-3} py={3} px={2} variant="gradient" bgColor="primary" borderRadius="lg" coloredShadow="primary"
                display="flex" justifyContent="space-between" alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Menu Items <span style={{ fontSize: 14, opacity: 0.7 }}>({items?.length || 0})</span>
                </MDTypography>
                <MDBox display="flex" gap={2} alignItems="center">
                  <TextField select value={cat} onChange={(e) => setCat(e.target.value)}
                    sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { height: 36 }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" } }}
                    SelectProps={{ displayEmpty: true, renderValue: (v) => v ? CATEGORIES.find((c) => c.value === v)?.label : "All Categories" }}>
                    <MenuItem value="">All Categories</MenuItem>
                    {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.icon} {c.label}</MenuItem>)}
                  </TextField>
                  <MDButton variant="contained" color="white" size="small" onClick={openAdd}>
                    + Add Item
                  </MDButton>
                </MDBox>
              </MDBox>
              <MDBox pt={3} px={3} pb={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error" sx={{ mt: 2 }}>Failed to load menu: {error.message}</Alert>
                ) : !items || items.length === 0 ? (
                  <Alert severity="info" sx={{ mt: 2 }}>No menu items yet. Click &apos;+ Add Item&apos; to create one.</Alert>
                ) : (
                  <Grid container spacing={2}>
                    {items.map((item) => {
                      const catInfo = CATEGORIES.find((c) => c.value === item.category) || CATEGORIES[0];
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                          <Card sx={{
                            p: 2, position: "relative", transition: "all 0.2s",
                            "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                          }}>
                            {item.image && (
                              <MDBox
                                component="img"
                                src={item.image}
                                alt={item.name}
                                sx={{ width: "100%", height: 140, borderRadius: 1, objectFit: "cover", mb: 1.5 }}
                              />
                            )}
                            <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
                              <MDTypography variant="h6" fontWeight="bold" lineHeight={1.2}>
                                {item.name}
                              </MDTypography>
                              <MDTypography variant="body1" fontWeight="bold" color="info" sx={{ whiteSpace: "nowrap" }}>
                                ${(item.priceCents / 100).toFixed(2)}
                              </MDTypography>
                            </MDBox>
                            {item.description && (
                              <MDTypography variant="caption" color="text" sx={{ display: "block", mt: 0.5, lineHeight: 1.3 }}>
                                {item.description}
                              </MDTypography>
                            )}
                            <MDBox display="flex" alignItems="center" gap={1} mt={1}>
                              <Chip label={catInfo.label} size="small" sx={{ height: 20, fontSize: 10 }} />
                              {item.prepMinutes > 0 && (
                                <Chip label={`${item.prepMinutes}min`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                              )}
                            </MDBox>
                            {item.tags && item.tags.length > 0 && (
                              <MDBox mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                                {item.tags.map((t, i) => (
                                  <Chip key={i} label={t} size="small" variant="outlined" sx={{ height: 18, fontSize: 9 }} />
                                ))}
                              </MDBox>
                            )}
                            <MDBox mt={2} display="flex" gap={1}>
                              <MDButton aria-label="Edit menu item" variant="outlined" color="info" size="small" sx={{ flex: 1 }}
                                onClick={() => openEdit(item)}>
                                Edit
                              </MDButton>
                              <MDButton aria-label="Delete menu item" variant="outlined" color="error" size="small"
                                onClick={() => setDeleteTarget(item)}>
                                <Icon>delete</Icon>
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
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" gap={2.5} mt={1}>
            <TextField label="Name" fullWidth value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Coconut crusted prawns" />
            <TextField label="Category" select fullWidth value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.icon} {c.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Description" fullWidth multiline rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the item" />
            <TextField label="Price ($)" type="number" fullWidth value={form.priceCents}
              onChange={(e) => setForm((f) => ({ ...f, priceCents: e.target.value }))}
              placeholder="e.g. 28.00"
              inputProps={{ step: 0.01, min: 0 }} />
            <TextField label="Prep Time (minutes)" type="number" fullWidth value={form.prepMinutes}
              onChange={(e) => setForm((f) => ({ ...f, prepMinutes: e.target.value }))}
              placeholder="e.g. 25"
              inputProps={{ min: 0 }} />
            <TextField label="Tags (comma-separated)" fullWidth value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="e.g. Signature, Gluten-free, Bestseller" />
            <ImageUpload label="Item Photo" value={form.image}
              onChange={(url) => setForm((f) => ({ ...f, image: url }))} />
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton onClick={() => setDialogOpen(false)} color="secondary" variant="outlined">Cancel</MDButton>
          <MDButton variant="gradient" color="primary" onClick={() => saveMutation.mutate(editing ? { ...form, id: editing.id } : form)}
            disabled={!form.name || !form.priceCents || parseFloat(form.priceCents) <= 0 || saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : editing ? "Update Item" : "Create Item"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {deleteTarget?.name}?</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" color="text">This action cannot be undone.</MDTypography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <MDButton onClick={() => setDeleteTarget(null)} color="secondary" variant="outlined">Cancel</MDButton>
          <MDButton variant="gradient" color="error" onClick={() => deleteMutation.mutate(deleteTarget.id)}
            disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} message="Menu item saved" />
    </DashboardLayout>
  );
}

export default Menu;
