/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// React Query
import { useQuery } from "@tanstack/react-query";

// API
import { hotelManagerAPI } from "services/hotelManager";

function Rooms() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["hotelRooms"],
    queryFn: hotelManagerAPI.getRooms,
  });

  const columns = [
    { Header: "Room Number", accessor: "roomNumber", width: "20%" },
    { Header: "Type", accessor: "type", width: "30%" },
    { Header: "Price", accessor: "price", width: "20%" },
  ];

  const rows =
    rooms?.map((room) => ({
      roomNumber: room.snapshot?.number || "N/A",
      type: room.snapshot?.type || "N/A",
      price: room.snapshot?.price ? `$${(room.snapshot.price / 100).toFixed(2)}/night` : "N/A",
    })) || [];

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
                bgColor="secondary"
                borderRadius="lg"
                coloredShadow="secondary"
              >
                <MDTypography variant="h6" color="white">
                  Rooms
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

export default Rooms;
