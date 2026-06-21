/** 
  All of the routes for the InnSync Hotel Dashboard are added here,
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Orders from "layouts/orders";
import SignIn from "layouts/authentication/sign-in";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Guests",
    key: "guests",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/guests",
    component: <div>Guests Page (Coming Soon)</div>,
    protected: true,
  },
  {
    type: "collapse",
    name: "Rooms",
    key: "rooms",
    icon: <Icon fontSize="small">hotel</Icon>,
    route: "/rooms",
    component: <div>Rooms Page (Coming Soon)</div>,
    protected: true,
  },
  {
    type: "collapse",
    name: "Orders",
    key: "orders",
    icon: <Icon fontSize="small">restaurant_menu</Icon>,
    route: "/orders",
    component: <Orders />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Housekeeping",
    key: "housekeeping",
    icon: <Icon fontSize="small">cleaning_services</Icon>,
    route: "/housekeeping",
    component: <div>Housekeeping Page (Coming Soon)</div>,
    protected: true,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
