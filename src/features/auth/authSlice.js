import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      const { user } = action.payload;
      state.user = user;
      state.role = user?.role || null;
    },
    logout(state) {
      state.user = null;
      state.role = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
