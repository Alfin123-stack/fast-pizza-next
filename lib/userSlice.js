import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

function getPosition() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject)
  );
}

// "lat,lng" -> a readable address (throws when the lookup fails).
export async function reverseGeocode(latitude, longitude) {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
  );
  if (!res.ok) throw new Error("We couldn't find your address. Type it in instead.");
  const a = await res.json();
  return {
    position: `${latitude},${longitude}`,
    address: [a.locality, a.city, a.postcode, a.countryName].filter(Boolean).join(", "),
  };
}

export const fetchAddress = createAsyncThunk("user/fetchAddress", async () => {
  const pos = await getPosition();
  return reverseGeocode(pos.coords.latitude, pos.coords.longitude);
});

const userSlice = createSlice({
  name: "user",
  initialState: { status: "idle", position: "", address: "", error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAddress.pending, (s) => {
      s.status = "loading";
      s.error = null;
    })
      .addCase(fetchAddress.fulfilled, (s, a) => {
        s.status = "idle";
        s.position = a.payload.position;
        s.address = a.payload.address;
      })
      .addCase(fetchAddress.rejected, (s, a) => {
        s.status = "failed";
        s.error = "We couldn't get your location. Type your address instead.";
      });
  },
});

export default userSlice.reducer;
