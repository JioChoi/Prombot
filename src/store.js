import { configureStore, createSlice } from '@reduxjs/toolkit'

import * as configSlice from './slices/configSlice';
import * as dataSlice from './slices/dataSlice';

export const store = configureStore({
    reducer: {
        data: dataSlice.reducer,
        config: configSlice.reducer,
    },
});