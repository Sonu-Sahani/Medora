import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  doctors: [],
  selectedDoctor: null,
  loading: false,
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    setDoctors: (state, action) => {
      state.doctors = action.payload;
    },
    setSelectedDoctor: (state, action) => {
      state.selectedDoctor = action.payload;
    },
  },
});

export const { setDoctors, setSelectedDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;