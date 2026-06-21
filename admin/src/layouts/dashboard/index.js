/**
=========================================================
* InnSync Hotel Dashboard
=========================================================
*/

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Hotel Dashboard
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Overview of your hotel operations
          </MDTypography>
        </MDBox>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="door_back"
                title="Check-ins Today"
                count={12}
                percentage={{
                  color: "success",
                  amount: "+15%",
                  label: "than yesterday",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="check_circle"
                title="Check-outs Today"
                count={8}
                percentage={{
                  color: "info",
                  amount: "-5%",
                  label: "than yesterday",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="attach_money"
                title="Today's Revenue"
                count="$4,520"
                percentage={{
                  color: "success",
                  amount: "+22%",
                  label: "than yesterday",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="restaurant"
                title="Active Orders"
                count={6}
                percentage={{
                  color: "success",
                  amount: "+2",
                  label: "new orders",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>

        <MDBox mt={6}>
          <MDTypography variant="h5" fontWeight="medium" mb={2}>
            Today's Occupancy
          </MDTypography>
          <MDBox
            p={3}
            bgColor="grey-100"
            borderRadius="lg"
            textAlign="center"
          >
            <MDTypography variant="h3" fontWeight="bold" color="primary">
              78%
            </MDTypography>
            <MDTypography variant="body2" color="text">
              39 out of 50 rooms occupied
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
