import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appointments: [],
  loading: false,
};

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
  },
});

export const { setAppointments } = appointmentSlice.actions;
export default appointmentSlice.reducer;