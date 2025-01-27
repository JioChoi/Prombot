import { configureStore, createSlice } from '@reduxjs/toolkit'
import * as NAI from "@/lib/NAI";

function _savePreset(data) {
    localStorage.setItem('data', JSON.stringify(data));
}

const configSlice = createSlice({
    name: 'config',
    initialState: NAI.config,
    reducers: {
        setValue: (state, action) => {
            state[action.payload.key] = action.payload.value;
            _savePreset(state);
        },
        setToggle: (state, action) => {
            for (let key of action.payload.key) {
                state[key] = action.payload.value.includes(key);
            }
            _savePreset(state);
        },
        loadFromString: (state, action) => {
            let string = action.payload;
            string = string.replaceAll("\"begprompt\"", "\"prompt_beg\"");
            string = string.replaceAll("\"including\"", "\"prompt_search\"");
            string = string.replaceAll("\"removeArtist\"", "\"remove_artist\"");
            string = string.replaceAll("\"removeCharacter\"", "\"remove_character\"");
            string = string.replaceAll("\"removeCharacteristic\"", "\"remove_characteristic\"");
            string = string.replaceAll("\"removeAttire\"", "\"remove_attire\"");
            string = string.replaceAll("\"removeNSFW\"", "\"remove_nsfw\"");
            string = string.replaceAll("\"removeCopyright\"", "\"remove_copyright\"");
            string = string.replaceAll("\"automation\"", "\"enable_automation\"");
            string = string.replaceAll("\"autodownload\"", "\"automatically_download\"");
            string = string.replaceAll("\"endprompt\"", "\"prompt_end\"");
            string = string.replaceAll("\"negativePrompt\"", "\"negative\"");

            string = string.replaceAll("\"Euler\"", "\"k_euler\"");
            string = string.replaceAll("\"Euler Ancestral\"", "\"k_euler_ancestral\"");
            string = string.replaceAll("\"DPM++ 2S Ancestral\"", "\"k_dpmpp_2s_ancestral\"");
            string = string.replaceAll("\"DPM++ SDE\"", "\"k_dpmpp_sde\"");

            string = string.replaceAll("\"promptGuidance\"", "\"prompt_guidance\"");
            string = string.replaceAll("\"promptGuidanceRescale\"", "\"prompt_guidance_rescale\"");
            string = string.replaceAll("\"step\"", "\"steps\"");

            let preset = JSON.parse(string);

            for (let key in NAI.config) {
                state[key] = NAI.config[key];
            }

            for (let key in preset) {
                state[key] = preset[key];
            }

            state["prompt_guidance"] = Number(state["prompt_guidance"]);
            state["prompt_guidance_rescale"] = Number(state["prompt_guidance_rescale"]);
            state["steps"] = Number(state["steps"]);
            if (state["seed"] == "") {
                state["seed"] = -1;
            }
            state["seed"] = Number(state["seed"]);
            state["width"] = Number(state["width"]);
            state["height"] = Number(state["height"]);
            state["delay"] = Number(state["delay"]);

            _savePreset(state);
        },
        loadPreset: state => {
            let preset = localStorage.getItem('data');
            if (preset == null) {
                preset = JSON.stringify(state);
            }

            preset = JSON.parse(preset);

            for (let key in preset) {
                state[key] = preset[key];
            }
        },
        savePreset: state => {
            _savePreset(state);
        }
    },
});

export const { setValue, setToggle, loadPreset, savePreset, loadFromString } = configSlice.actions;
export const reducer = configSlice.reducer;