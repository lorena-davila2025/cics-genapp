import { configureStore } from '@reduxjs/toolkit';
import { genappApi } from './genappApi';

export const store = configureStore({
  reducer: {
    [genappApi.reducerPath]: genappApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(genappApi.middleware),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
