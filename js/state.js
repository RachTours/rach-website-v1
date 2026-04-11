// Global State
export const state = {
  selectedTours: [],
  transportSelections: {}, // { tourId: boolean }
};

export const resetState = () => {
  state.selectedTours = [];
  for (const key in state.transportSelections) {
    delete state.transportSelections[key];
  }
  saveToLocalStorage();
};

export const saveToLocalStorage = () => {
  try {
    localStorage.setItem("selectedTours", JSON.stringify(state.selectedTours));
    localStorage.setItem(
      "transportSelections",
      JSON.stringify(state.transportSelections),
    );
  } catch (e) {
    console.error("Could not save to localStorage", e);
  }
};

export const loadFromLocalStorage = () => {
  try {
    const storedTours = localStorage.getItem("selectedTours");
    const storedTransport = localStorage.getItem("transportSelections");

    if (storedTours) {
      const parsed = JSON.parse(storedTours);
      // Filter out stale tour IDs that no longer exist in current data
      const currentTours =
        typeof window !== "undefined" && window.TOURS ? window.TOURS : {};
      state.selectedTours = parsed.filter((id) => id in currentTours);
      // If we filtered some out, update localStorage
      if (state.selectedTours.length !== parsed.length) {
        localStorage.setItem(
          "selectedTours",
          JSON.stringify(state.selectedTours),
        );
      }
    }
    if (storedTransport) {
      const parsedTransport = JSON.parse(storedTransport);
      // Merge into existing object to keep reference if needed, or just replace
      Object.assign(state.transportSelections, parsedTransport);
    }
  } catch (e) {
    console.error("Could not load from localStorage", e);
  }
};
