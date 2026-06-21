/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";

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

function Guests() {
  const { data: stays, isLoading } = useQuery({
    queryKey: ["hotelStays"],
    queryFn: hotelManagerAPI.getStays,
  });

  const columns = [
    { Header: "Guest Name", accessor: "guestName", width: "25%" },
    { Header: "Check-in", accessor: "checkIn", width: "20%" },
    { Header: "Check-out", accessor: "checkOut", width: "20%" },
    { Header: "Status", accessor: "status", width: "15%" },
    { Header: "Adults/Kids", accessor: "guests", width: "20%" },
  ];

  const rows =
    stays?.map((stay) => {
      const getStatusColor = (status) => {
        switch (status) {
          case "PENDING":
            return "warning";
          case "CONFIRMED":
            return "info";
          case "CHECKED_IN":
            return "success";
          case "CHECKED_OUT":
            return "secondary";
          default:
            return "default";
        }
      };

      return {
        guestName: stay.user?.name || "Unknown Guest",
        checkIn: new Date(stay.checkIn).toLocaleDateString(),
        checkOut: new Date(stay.checkOut).toLocaleDateString(),
        status: <Chip label={stay.status} color={getStatusColor(stay.status)} size="small" />,
        guests: `${stay.adults} adult${stay.adults > 1 ? "s" : ""}${
          stay.children > 0 ? `, ${stay.children} kid${stay.children > 1 ? "s" : ""}` : ""
        }`,
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
                bgColor="success"
                borderRadius="lg"
                coloredShadow="success"
              >
                <MDTypography variant="h6" color="white">
                  Guests & Stays
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

export default Guests;
