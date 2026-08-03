import { useState } from "react";

import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import {
  useMaterialUIController,
  setOpenConfigurator,
  setTransparentSidenav,
  setWhiteSidenav,
  setSidenavColor,
  setDarkMode,
  setFixedNavbar,
} from "context";

function Configurator() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    openConfigurator,
    transparentSidenav,
    whiteSidenav,
    fixedNavbar,
    darkMode,
    sidenavColor,
  } = controller;
  const [disabled, setDisabled] = useState(false);

  const sidenavColors = ["primary", "secondary", "info", "success", "warning", "error", "dark"];

  const handleOpenConfigurator = () => setOpenConfigurator(dispatch, false);
  const handleTransparentSidenav = () => {
    setTransparentSidenav(dispatch, true);
    setWhiteSidenav(dispatch, false);
  };
  const handleWhiteSidenav = () => {
    setWhiteSidenav(dispatch, true);
    setTransparentSidenav(dispatch, false);
  };
  const handleDarkMode = () => setDarkMode(dispatch, !darkMode);
  const handleFixedNavbar = () => setFixedNavbar(dispatch, !fixedNavbar);

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={openConfigurator}
      onClose={handleOpenConfigurator}
      ModalProps={{ keepMounted: true }}
      sx={{ "& .MuiDrawer-paper": { width: { xs: 360, sm: 420 } } }}
    >
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDTypography variant="h5">Configurator</MDTypography>
        <IconButton color="inherit" aria-label="Close settings" onClick={handleOpenConfigurator} sx={{ "&:hover": { color: "dark" } }}>
          <Icon fontSize="medium">close</Icon>
        </IconButton>
      </MDBox>
      <Divider />
      <MDBox pt={1} pb={3} px={3}>
        <MDBox mb={3}>
          <MDTypography variant="h6" fontWeight="medium">
            Sidenav Colors
          </MDTypography>
          <MDBox display="flex" mt={1}>
            {sidenavColors.map((color) => (
              <MDButton
                key={color}
                color={color}
                variant={sidenavColor === color ? "contained" : "outlined"}
                size="small"
                circular
                sx={{ minWidth: 0, width: 36, height: 36, p: 0, mr: 1 }}
                onClick={() => setSidenavColor(dispatch, color)}
              />
            ))}
          </MDBox>
        </MDBox>
        <MDBox mb={3}>
          <MDTypography variant="h6" fontWeight="medium">
            Sidenav Type
          </MDTypography>
          <MDTypography variant="button" color="text">
            Choose between different sidenav types.
          </MDTypography>
          <MDBox display="flex" mt={1} alignItems="center">
            <MDButton
              color="info"
              variant={transparentSidenav ? "contained" : "outlined"}
              size="small"
              onClick={handleTransparentSidenav}
              sx={{ mr: 1 }}
            >
              Transparent
            </MDButton>
            <MDButton
              color="info"
              variant={whiteSidenav ? "contained" : "outlined"}
              size="small"
              onClick={handleWhiteSidenav}
            >
              White
            </MDButton>
          </MDBox>
        </MDBox>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium">
              Dark Mode
            </MDTypography>
            <MDTypography variant="button" color="text">
              Enable dark mode for the dashboard.
            </MDTypography>
          </MDBox>
          <Switch checked={darkMode} onChange={handleDarkMode} />
        </MDBox>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox>
            <MDTypography variant="h6" fontWeight="medium">
              Fixed Navbar
            </MDTypography>
            <MDTypography variant="button" color="text">
              A fixed navbar stays visible when scrolling.
            </MDTypography>
          </MDBox>
          <Switch checked={fixedNavbar} onChange={handleFixedNavbar} />
        </MDBox>

      </MDBox>
    </Drawer>
  );
}

export default Configurator;
