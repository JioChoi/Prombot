import axios from 'axios';
import { blake2b } from 'blakejs';
import { Buffer } from 'buffer';
import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';
import { unzip } from 'unzipit';
import { sha256 } from 'js-sha256';
import { downloadFile, extractList } from '@/lib/utils';
import { addExif } from '@/lib/utils';
import { processPrompt } from '@/lib/ProcessPrompt';

export const host = 'https://jio7-prombot.hf.space';
const model = 'nai-diffusion-3';

/* MAIN GENERATION LOGIC */
export async function generate(token, config, onProgress, onGenerate, onGenerateFinish) {
    gtag('event', 'BETA_Generate', {});
    onProgress('Processing prompt...');
    let prompt = await processPrompt(config, onProgress);
    onGenerate();

    onProgress('Generating image...');
    let seed = config.seed;
    if (seed === -1) {
        seed = Math.floor(Math.random() * 9999999999);
    }

    let skip_cfg_above_sigma = null;
    if (config.variety)
        skip_cfg_above_sigma = 19;

    let params = {
        params_version: 3,
        width: config.width,
        height: config.height,
        scale: config.prompt_guidance,
        sampler: config.sampler,
        steps: config.steps,
        n_samples: 1,
        ucPreset: 3,
        qualityToggle: false,
        sm: config.SMEA,
        sm_dyn: config.DYN,
        dynamic_thresholding: config.decrisp,
        controlnet_strength: 1,
        legacy: false,
        add_original_image: true,
        cfg_rescale: config.prompt_guidance_rescale,
        noise_schedule: "karras",
        legacy_v3_extend: false,
        skip_cfg_above_sigma: skip_cfg_above_sigma,
        seed: seed,
        characterPrompts: [],
        negative_prompt:  config.negative,
        reference_image_multiple: [],
        reference_information_extracted_multiple: [],
        reference_strength_multiple: [],
        deliberate_euler_ancestral_bug: false,
        prefer_brownian: true,
        use_coords: config.use_coords,
    }

    if (config.DEV_MODEL == 'nai-diffusion-4-curated-preview' || config.DEV_MODEL == 'nai-diffusion-4-full') {
        params.characterPrompts = config.character_prompts;

        params.v4_negative_prompt = {
            caption: {
                base_caption: config.negative,
                char_captions: config.character_prompts.map((el) => {
                    return {
                        char_caption: el.uc,
                        centers: [{x: el.center.x, y: el.center.y}],
                    }
                })
            }
        };
        params.v4_prompt = {
            caption: {
                base_caption: prompt,
                char_captions: config.character_prompts.map((el) => {
                    return {
                        char_caption: el.prompt,
                        centers: [{x: el.center.x, y: el.center.y}],
                    }
                })
            },
            use_coords: config.use_coords,
            use_order: true,
        }
    }

    let res = await generateImage(token, prompt, config.DEV_MODEL, 'generate', params);
    res = await addExif(res, res, config);
    
    onGenerateFinish(res);
}

export const config = {
    // Prompt Randomizer
    prompt_beg: "1girl, {{kirisame marisa}}, [fu-ta], {{gsusart}}",
    prompt_search: "1girl, ~speech bubble",
    prompt_end: "{{{volumetric lighting, depth of field, best quality, amazing quality, very aesthetic, highres, incredibly absurdres}}}",
    negative: "{{{worst quality, bad quality}}}, text, error, extra digit, fewer digits, jpeg artifacts, signature, watermark, username, reference, unfinished, unclear fingertips, twist, Squiggly, Grumpy, incomplete, {{Imperfect Fingers}}, Cheesy, very displeasing}}, {{mess}}, {{Approximate}}, {{Sloppiness}}, Glazed eyes, watermark, username, text, signature, fat, sagged breasts",
    remove_artist: true,
    remove_character: true,
    remove_characteristic: true,
    remove_attire: false,
    remove_nsfw: true,
    remove_copyright: true,
    remove_ornament: true,
    remove_emotion: false,
    character_prompts: [],
    use_coords: false,

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

    // Extras
    reorder: true,
    naistandard: true,
    strengthen_characteristic: true,
    auto_copyright: true,
    strengthen_attire: false,
    strengthen_ornament: false,

    // Post Processing
    brightness: 0,
    exposure: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    tint: 0,
    shadows: 0,
    highlights: 0,
    sharpness: 0,

    DEV_MODEL: "nai-diffusion-3",
    DEV_CHARACTER_STRENGTH: 0.4,
    DEV_START_WITH_PLACEHOLDER: false,
}

/**
DATASETS (16)
- key: Dictionary of tags and their positions
- artist: List of artists
- character: List of characters
- characteristic: List of characteristics
- clothes: List of clothes
- censor: List of censored tags
- meme: List of meme tags
- whitelist: List of tags and their weights
- bad: List of bad tags
- count: List of tags and their counts
- quality: List of quality tags
- character_data_index: index of JSON of character data
- ornament: List of ornaments
- clothes_actions_json: json categorization of clothes actions
- emotions: List of emotions
 */
export let datasets = {};
export async function downloadDatasets(onProgress, onFinish) {
    let progress = 0;

    const numfiles = 16;
    let downloaded = 0;

    /* KEY.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/key.dat').then((res) => {
        res = res.split('\n');
        datasets.key = {};
        // convert to dictionary
        for (let i = 0; i < res.length; i++) {
            res[i] = [res[i].substring(0, res[i].lastIndexOf('|')), res[i].substring(res[i].lastIndexOf('|')+1)];
        }

        for (let i = 0; i < res.length - 1; i++) {
            datasets.key[res[i][0]] = {start: parseInt(res[i][1]), end: parseInt(res[i+1][1])};
        }

        downloaded++;
    });
    /* ARTIST.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/artist.dat').then((res) => {
        res = res.split('\n');
        datasets.artist = res;

        downloaded++;
    });
    /* CHARACTER.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/character.dat').then((res) => {
        res = res.split('\n');
        datasets.character = res;

        downloaded++;
    });
    /* CHARACTERISTIC.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/characteristic.dat').then((res) => {
        res = res.split('\n');
        datasets.characteristic = res;

        downloaded++;
    });
    /* COPYRIGHT.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/copyright.dat').then((res) => {
        res = res.split('\n');
        datasets.copyright = res;

        downloaded++;
    });
    /* CLOTHES.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/clothes.dat').then((res) => {
        res = res.split('\n');
        datasets.clothes = res;

        downloaded++;
    });
    /* ORNAMENT.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/ornament.dat').then((res) => {
        res = res.split('\n');
        datasets.ornament = res;

        downloaded++;
    });
    /* CENSOR.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/censor.dat').then((res) => {
        res = res.split('\n');
        datasets.censor = res;

        downloaded++;
    });
    /* MEME.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/meme.dat').then((res) => {
        res = res.split('\n');
        datasets.meme = res;

        downloaded++;
    });
    
    /* WHITELIST.CSV */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/whitelist.csv').then((res) => {
        res = res.split('\n');
        for (let i = 0; i < res.length; i++) {
            res[i] = res[i].split(',');
        }
        datasets.whitelist = res;
        datasets.whitelist.push(['__FAVORITE__', 0]);

        downloaded++;
    });
    /* Bad list */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/bad.dat').then((res) => {
        res = res.split('\n');
        datasets.bad = res;

        downloaded++;
    });
    /* Count list */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/count.dat').then((res) => {
        res = res.split('\n');
        datasets.count = res;

        downloaded++;
    });
    /* Quality list */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/quality_list.txt').then((res) => {
        res = res.split('\n');
        datasets.quality = res;

        downloaded++;
    });

    /* Character data index */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/character_data_index.dat').then((res) => {
        res = res.split('\n');
        
        datasets.character_data_index = {};

        for (let i = 0; i < res.length; i++) {
            let temp = res[i].split('|');
            
            datasets.character_data_index[temp[0]] = {
                start: parseInt(temp[1]),
                size: parseInt(temp[2])
            };
        }

        downloaded++;
    });

    /* Clothes Actions JSON */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/clothes_actions.json').then((res) => {
        res = JSON.parse(res);
        datasets.clothes_actions_json = res;

        downloaded++;
    });

    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/emotions.dat').then((res) => {
        res = res.split('\n');
        datasets.emotions = res;

        downloaded++;
    });

    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            progress = Math.floor((downloaded / numfiles) * 100);
            onProgress(progress);

            if (downloaded == numfiles) {
                onFinish();
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}



export function countRandomPrompt(config) {
    let prompt_search = processPromptSearch(config);
    prompt_search = toArray(prompt_search);

    let count = 0;

    for (let tags of prompt_search) {
        tags = tags.replaceAll('{', '').replaceAll('}', '');
        let mult = 1;

        if (tags[0] == '~') {
            tags = tags.substring(1);
            mult = -1;
        }

        let temp = datasets.whitelist.find((el) => {
            return el[0] == tags;
        });
        if (temp == undefined) {
            return -1;
        }
        else {
            count += parseInt(temp[1]) * mult;
        }
    }

    return count;
}

function processPromptSearch(config) {
    let prompt_search = config.prompt_search.replaceAll('\n', ',');

    // Process remove_nsfw option
    if (config.remove_nsfw && prompt_search != "") {
        prompt_search += ', rating:g';
    }

    // Process ratings
    prompt_search = prompt_search.replaceAll('rating:general', 'rating:g');
    prompt_search = prompt_search.replaceAll('rating:questionable', 'rating:q');
    prompt_search = prompt_search.replaceAll('rating:explicit', 'rating:e');
    prompt_search = prompt_search.replaceAll('rating:sensitive', 'rating:s');
    prompt_search = prompt_search.replaceAll('rating: general', 'rating:g');
    prompt_search = prompt_search.replaceAll('rating: questionable', 'rating:q');
    prompt_search = prompt_search.replaceAll('rating: explicit', 'rating:e');
    prompt_search = prompt_search.replaceAll('rating: sensitive', 'rating:s');

    return prompt_search;
}

export async function loadAnlas(token) {
    let res = await axios.get(`${host}/api/user/data`, {
        headers: {
            Authorization: token
        }
    });

    return res.data.subscription.trainingStepsLeft.fixedTrainingStepsLeft + res.data.subscription.trainingStepsLeft.purchasedTrainingSteps;
}

export async function loadPresets(uid) {
    let res = await axios.post(`${host}/getPresets`, {
        uid: uid
    });

    return res.data;
}

function toArray(tags) {
    tags = tags.split(',');

    for(let i = 0; i < tags.length; i++) {
        tags[i] = tags[i].trim();
        if(tags[i] == "") {
            tags.splice(i, 1);
            i--;
        }
    }

    return tags;
}

async function generateImage(token, prompt, model, action, params) {
    try {
        // Request
        let res = await axios.post(`${host}/generate-image`, 
            {
                input: prompt,
                model: model,
                action: action,
                parameters: params
            },
            {
            headers: {
                Authorization: token
            },
            responseType: 'blob'
        });

        // Unzip
        const { entries } = await unzip(res.data);
        const name = Object.keys(entries)[0];
        const blob = await entries[name].blob('image/png');
        const url = URL.createObjectURL(blob);

        return url;
    } catch(e) {
        console.log(e);
        throw new Error('Failed to generate image');
    }
}

export async function login(id, pw) {
    if (id == null || pw == null || id.length < 3 || pw.length < 3) {
        return null;
    }

    try {
        let token = await getAccessToken(id, pw);
        await testAccessToken(token);
        localStorage.setItem('token', token);
        localStorage.setItem('uid', await sha256(id));

        return token;
    } catch (e) {
        return null;
    }
}   

export async function testAccessToken(token) {
    let res = await axios.get(`${host}/api/user/information`, {
        headers: {
            Authorization: token
        }
    });

    return res.data;
}

async function getAccessToken(id, pw) {
    let key = await getAccessKey(id, pw);
    let token = await axios.post(`${host}/api/user/login`, {
        key: key
    }).then((res) => {
        return 'Bearer ' + res.data.accessToken;
    });

    return token;
}

async function getAccessKey(id, pw) {
    let key = await argon_hash(id, pw, 64, 'novelai_data_access_key');
    return key.substring(0, 64);
}

async function argon_hash(email, password, size, domain) {
	var pre_salt = password.slice(0, 6) + email + domain;
	var salt = blake2b(pre_salt, null, 16);

	var raw = await argon2.hash({
		pass: password,
		salt: salt,
		time: 2,
		mem: Math.floor(2000000 / 1024),
		hashLen: size,
		type: 2,
	});

	var b64 = Buffer.from(raw.hash).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

	return b64;
}