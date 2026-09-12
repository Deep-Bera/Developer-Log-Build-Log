const reducer = (state, action) => {
  switch (action.type) {
    case "Login": {
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload,
        role: action.payload.role,
      };
    }
    case "Reload": {
      return {
        ...state,
        isLoggedIn: true,
        user: action.payload,
        role: action.payload?.role || state.role,
      };
    }
    case "Logout": {
      return { ...state, isLoggedIn: false, user: null, role: "user" };
    }

    default: {
      throw new Error("invalid action type");
    }
  }
};
export default reducer;
