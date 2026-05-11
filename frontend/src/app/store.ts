import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/themeSlice";

// workspaceSlice removed — workspace state is now in WorkspaceContext
export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});

// Infer RootState and AppDispatch from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
