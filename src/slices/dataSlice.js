import { configureStore, createSlice } from '@reduxjs/toolkit'

const dataSlice = createSlice({
    name: 'data',
    initialState: {
        token: null,
        login_popup: false,
        generate_button_text: "",
        datasets_loaded: false,
        anlas: 0,

        result_image: "",
        current_image: "",
        changing_parameter: "",
        width: 0,
        height: 0,

        generating: false,
        delay: -1,
        uid: "",
        presets: [],
        hide_sidebar: true,
        datasets: [],

        history: [],
    },
    reducers: {
        setValue: (state, action) => {
            state[action.payload.key] = action.payload.value;
        },
        addValue: (state, action) => {
            state[action.payload.key].unshift(action.payload.value);
        },
        setIndex: (state, action) => {
            if (action.payload.index < state[action.payload.key].length) {
                state[action.payload.key][action.payload.index] = action.payload.value;
            }
        }
    },
});

export const { setValue, addValue, setIndex } = dataSlice.actions;
export const reducer = dataSlice.reducer;