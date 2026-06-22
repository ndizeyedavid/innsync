import colors from "assets/theme/base/colors";

const { transparent } = colors;

const select = {
  styleOverrides: {
    select: {
      display: "grid",
      alignItems: "center",
      padding: "8px 12px !important",
      minHeight: "40px",

      "& .Mui-selected": {
        backgroundColor: transparent.main,
      },
    },

    selectMenu: {
      background: "none",
    },

    icon: {
      display: "none",
    },
  },
};

export default select;
