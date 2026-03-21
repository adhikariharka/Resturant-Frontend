import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api';

import { combineReducers } from '@reduxjs/toolkit';

const appReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
});

const rootReducer = (state: any, action: any) => {
    if (action.type === 'auth/logout') {
        // clear partial state
        state = undefined;
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
