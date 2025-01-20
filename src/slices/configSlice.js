import { configureStore, createSlice } from '@reduxjs/toolkit'

function _savePreset(data) {
    localStorage.setItem('data', JSON.stringify(data));
}

const configSlice = createSlice({
    name: 'config',
    initialState: {
        // Prompt Randomizer
        prompt_beg: "1girl, {{kirisame marisa}}, [fu-ta], {{gsusart}}",
        prompt_search: "1girl, ~speech bubble, ~blood, ~gun, ~guro, ~bdsm, ~shibari, ~butt plug, ~object insertion, ~pregnant",
        prompt_end: "{{{volumetric lighting, depth of field, best quality, amazing quality, very aesthetic, highres, incredibly absurdres}}}",
        negative: "{{{worst quality, bad quality}}}, text, error, extra digit, fewer digits, jpeg artifacts, signature, watermark, username, reference, unfinished, unclear fingertips, twist, Squiggly, Grumpy, incomplete, {{Imperfect Fingers}}, Cheesy, very displeasing}}, {{mess}}, {{Approximate}}, {{Sloppiness}}, Glazed eyes, watermark, username, text, signature, fat, sagged breasts",
        remove_artist: true,
        remove_character: true,
        remove_characteristic: false,
        remove_attire: false,
        remove_nsfw: true,
        remove_copyright: true,

        // Options
        width: 832,
        height: 1216,
        steps: 28,
        prompt_guidance: 5,
        prompt_guidance_rescale: 0,
        seed: -1,
        sampler: "k_euler_ancestral",
        SMEA: true,
        DYN: false,
        variety: false,
        decrisp: false,

        // Automation
        delay: 3,
        enable_automation: false,
        automatically_download: false,
    },
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

export const { setValue, setToggle, loadPreset, savePreset } = configSlice.actions;
export const reducer = configSlice.reducer;