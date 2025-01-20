import { configureStore, createSlice } from '@reduxjs/toolkit'

const dataSlice = createSlice({
    name: 'data',
    initialState: {
        token: null,
        login_popup: false,
        generate_button_text: "",
        datasets_loaded: false,
        anlas: 0,
        current_image: "",
        generating: false,
        delay: -1,
    },
    reducers: {
        setValue: (state, action) => {
            state[action.payload.key] = action.payload.value;
        }
    },
});

export const { setValue } = dataSlice.actions;
export const reducer = dataSlice.reducer;