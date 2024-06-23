// src/store/store.ts

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import userReducer from "./slices/userSlice";
import uiReducer from "./slices/uiSlice"; // Import the uiReducer
import clickedWordsReducer from "./slices/clickedWordsSlice";

const rootReducer = combineReducers({
  user: userReducer,
  ui: uiReducer,
  clickedWords: clickedWordsReducer,
});

const persistConfig = {
  key: "root",
  storage: AsyncStorage, // Use AsyncStorage for React Native
  whitelist: ["user"], // Specify which reducers should be persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
