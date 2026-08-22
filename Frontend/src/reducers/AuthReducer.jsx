const reducer = (state, action) => {
  switch (action.type) {
    case "Login": {
      return { ...state, isLoggedIn: true, user: action.payload };
    }
    case "Reload": {
      return { ...state, isLoggedIn: true, user: action.payload };
    }
    case "Logout": {
      return { ...state, isLoggedIn: false, user: null };
    }

    default: {
      throw new Error("invalid action type");
    }
  }
};
export default reducer;
