/** 
  All of the routes for the InnSync Hotel Dashboard are added here,
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Orders from "layouts/orders";
import Rooms from "layouts/rooms";
import Guests from "layouts/guests";
import Housekeeping from "layouts/housekeeping";
import Billing from "layouts/billing";
import Amenities from "layouts/amenities";
import DigitalKeys from "layouts/digital-keys";
import HotelSettings from "layouts/hotel-settings";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import ResetPassword from "layouts/authentication/reset-password/cover";

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
    component: <Guests />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Rooms",
    key: "rooms",
    icon: <Icon fontSize="small">hotel</Icon>,
    route: "/rooms",
    component: <Rooms />,
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
    component: <Housekeeping />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Amenities",
    key: "amenities",
    icon: <Icon fontSize="small">spa</Icon>,
    route: "/amenities",
    component: <Amenities />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Digital Keys",
    key: "digital-keys",
    icon: <Icon fontSize="small">vpn_key</Icon>,
    route: "/digital-keys",
    component: <DigitalKeys />,
    protected: true,
  },
  {
    type: "collapse",
    name: "Hotel Settings",
    key: "hotel-settings",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/hotel-settings",
    component: <HotelSettings />,
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
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">person_add</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
  },
];

export default routes;
