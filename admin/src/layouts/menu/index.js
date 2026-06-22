import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { hotelManagerAPI } from "services/hotelManager";

const CATEGORIES = ["", "food", "drinks", "room-service", "activities", "housekeeping"];

function Menu() {
  const [cat, setCat] = useState("");
  const { data: items, isLoading, error } = useQuery({
    queryKey: ["adminMenu", cat],
    queryFn: () => hotelManagerAPI.getMenuItems(cat || undefined),
  });

  const columns = [
    { Header: "Name", accessor: "name", width: "25%" },
    { Header: "Category", accessor: "category", width: "15%" },
    { Header: "Price", accessor: "price", width: "15%" },
    { Header: "Description", accessor: "description", width: "45%" },
  ];

  const rows = (items || []).map((item) => ({
    name: item.name,
    category: <Chip label={item.category} size="small" sx={{ height: 20, fontSize: 10 }} />,
    price: `$${(item.priceCents / 100).toFixed(2)}`,
    description: item.description || "—",
  }));

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
                <MDTypography variant="h6" color="white">Menu Items</MDTypography>
                <MDBox display="flex" gap={1} alignItems="center">
                  <MDTypography variant="body2" color="white" sx={{ mr: 1 }}>Filter:</MDTypography>
                  <select value={cat} onChange={(e) => setCat(e.target.value)}
                    style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.15)", color: "white" }}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} style={{ color: "black" }}>{c || "All"}</option>
                    ))}
                  </select>
                </MDBox>
              </MDBox>
              <MDBox pt={3} px={3} pb={3}>
                {isLoading ? (
                  <MDBox display="flex" justifyContent="center" py={6}><CircularProgress /></MDBox>
                ) : error ? (
                  <Alert severity="error">Failed to load menu: {error.message}</Alert>
                ) : !items || items.length === 0 ? (
                  <Alert severity="info">No menu items found.</Alert>
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
    </DashboardLayout>
  );
}

export default Menu;
