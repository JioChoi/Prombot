import axios from 'axios';
import { blake2b } from 'blakejs';
import { Buffer } from 'buffer';
import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';
import { unzip } from 'unzipit';
import { sha256 } from 'js-sha256';
import { downloadFile } from '@/lib/utils';

export const host = 'https://jio7-prombot.hf.space';
const model = 'nai-diffusion-3';

/* MAIN GENERATION LOGIC */
export async function generate(token, config, onProgress, onGenerate) {
    onProgress('Processing prompt...');
    let prompt = await processPrompt(config, onProgress);
    console.log(prompt);

    onGenerate();
    // await new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         resolve();
    //     }, 10000);
    // });

    // return;

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
        prefer_brownian: true
    }

    if (config.DEV_MODEL == 'nai-diffusion-4-curated-preview') {
        params.v4_negative_prompt = {
            caption: {
                base_caption: config.negative,
                char_captions: []
            }
        };
        params.v4_prompt = {
            caption: {
                base_caption: prompt,
                char_captions: []
            }
        }
    }

    let res = await generateImage(token, prompt, config.DEV_MODEL, 'generate', params);
    return res;
}

export const config = {
    // Prompt Randomizer
    prompt_beg: "1girl, {{kirisame marisa}}, [fu-ta], {{gsusart}}",
    prompt_search: "1girl, ~speech bubble, ~blood, ~gun, ~guro, ~bdsm, ~shibari, ~butt plug, ~object insertion, ~pregnant",
    prompt_end: "{{{volumetric lighting, depth of field, best quality, amazing quality, very aesthetic, highres, incredibly absurdres}}}",
    negative: "{{{worst quality, bad quality}}}, text, error, extra digit, fewer digits, jpeg artifacts, signature, watermark, username, reference, unfinished, unclear fingertips, twist, Squiggly, Grumpy, incomplete, {{Imperfect Fingers}}, Cheesy, very displeasing}}, {{mess}}, {{Approximate}}, {{Sloppiness}}, Glazed eyes, watermark, username, text, signature, fat, sagged breasts",
    remove_artist: true,
    remove_character: true,
    remove_characteristic: true,
    remove_attire: false,
    remove_nsfw: true,
    remove_copyright: true,
    remove_ornament: true,

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

    DEV_MODEL: "nai-diffusion-3",
    DEV_CHARACTER_STRENGTH: 0.4,
    DEV_START_WITH_PLACEHOLDER: false,
}

/**
DATASETS (15)
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
 */
export let datasets = {};
export async function downloadDatasets(onProgress, onFinish) {
    let progress = 0;

    const numfiles = 15;
    let downloaded = 0;

    /* KEY.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/key.dat').then((res) => {
        res = res.split('\n');
        datasets.key = {};
        // convert to dictionary
        for (let i = 0; i < res.length; i++) {
            res[i] = res[i].split('|');
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

async function getCharacterTags(name) {
    let data = datasets.character_data_index[name];

    if (data == undefined) {
        return [];
    }

    let res = await axios.get('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/character_data.json', {
        headers: {
            Range: `bytes=${data.start}-${data.start+data.size-2}`
        }
    });

    res = res.data;

    return res;
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

function processDynamicPrompt(prompt) {
    let bcount = 0;
    let buffer = "";
    let data = [];

    let start = 0;

    for (let i = 0; i < prompt.length; i++) {
        if (prompt[i] == '<') {
            bcount++;
            if (bcount == 1) {
                start = i;
                buffer = "";
                continue;
            }
        }
        else if (prompt[i] == '>') {
            bcount--;
            if (bcount == 0) {
                data.push(buffer);
                buffer = "";

                let selected = data[Math.floor(Math.random() * data.length)];
                prompt = prompt.substring(0, start) + selected + prompt.substring(i+1);
                i = start - 1;
                data = [];
                continue;
            }
        }
        else if (prompt[i] == '|') {
            if (bcount == 1) {
                data.push(buffer);
                buffer = "";
                continue;
            }
        }
        
        buffer += prompt[i];
    }

    return prompt;
}

async function processPrompt(config, onProgress) {
    let prompt_beg = config.prompt_beg.replaceAll('\n', ',');
    let prompt_end = config.prompt_end.replaceAll('\n', ',');
    let negative = config.negative.replaceAll('\n', ',');

    // Process dynamic prompt
    prompt_beg = processDynamicPrompt(prompt_beg);
    prompt_end = processDynamicPrompt(prompt_end);

    let prompt_search = processPromptSearch(config);
    prompt_search = processDynamicPrompt(prompt_search);

    // Prompt to array
    prompt_beg = toArray(prompt_beg);
    prompt_search = toArray(prompt_search);
    prompt_end = toArray(prompt_end);
    negative = toArray(negative);

    // Process including and excluding
    let including = [];
    let excluding = [];

    for (let tags of prompt_search) {
        tags = tags.replaceAll('{', '').replaceAll('}', '');

        if(tags[0] == '~') {
            excluding.push(tags.substring(1));
        }
        else {
            including.push(tags);
        }
    }

    // Remove duplicates of including and excluding
    including = Array.from(new Set(including));
    excluding = Array.from(new Set(excluding));

    // Process random prompt
    let randomPrompt = await getRandomPrompt(including, excluding, onProgress);
    randomPrompt = randomPrompt.split(',');
    randomPrompt = randomPrompt.filter((el) => {
        return datasets.whitelist.find((v) => v[0] == el) != undefined;
    });

    // Remove artist
    if (config.remove_artist) {
        randomPrompt = removeArray(randomPrompt, datasets.artist);
    }

    // Remove character
    if (config.remove_character) {
        randomPrompt = removeArray(randomPrompt, datasets.character);
    }

    // Remove characteristic
    if (config.remove_characteristic) {
        randomPrompt = removeArray(randomPrompt, datasets.characteristic);
    }

    // Remove attire
    if (config.remove_attire) {
        randomPrompt = removeArray(randomPrompt, datasets.clothes);
    }
    
    // Remove copyright
    if (config.remove_copyright) {
        randomPrompt = removeArray(randomPrompt, datasets.copyright);
    }

    // Remove ornament
    if (config.remove_ornament) {
        randomPrompt = removeArray(randomPrompt, datasets.ornament);
    }

    // Remove bad tags
    randomPrompt = removeArray(randomPrompt, datasets.bad);

    /* CONFY FEATURES */
    let prompt = [];
    
    // Duplicate Remover
    randomPrompt = removeArray(randomPrompt, prompt_beg);
    randomPrompt = removeArray(randomPrompt, prompt_end);

    // Strong Uncensorship
    if (prompt_beg.includes('uncensored') || prompt_end.includes('uncensored')) {
        randomPrompt = removeArray(randomPrompt, datasets.censor);
    }

    // Favorite
    if (prompt_beg.includes('__FAVORITE__') || prompt_end.includes('__FAVORITE__')) {
        let favorite = localStorage.getItem('favorite');
        if (favorite == undefined || favorite == null) {
            favorite = [''];
        }
        else {
            favorite = favorite.split(',');
        }

        let chosen = favorite[Math.floor(Math.random() * favorite.length)];
        let index = prompt_beg.indexOf('__FAVORITE__');
        if (index != -1) {
            prompt_beg[index] = chosen;
        }
        else {
            index = prompt_end.indexOf('__FAVORITE__');
            if (index != -1) {
                prompt_end[index] = chosen;
            }
        }
    }


    randomPrompt = removeArray(randomPrompt, ["rating:g", "rating:q", "rating:e", "rating:s"]);

    // Character Data
    let characterData = await processCharacterData(prompt_beg, randomPrompt, prompt_end);

    // Add copyright
    if (config.auto_copyright) {
        let copyrights = [];
        for (let data of characterData) {
            for (let copyright of data.copyright) {
                if (datasets.copyright.includes(copyright[0])) {
                    copyrights.push(copyright[0]);
                }
            }
        }

        prompt_beg = prompt_beg.concat(copyrights);
    }

    let characterStrength = ((1 - config.DEV_CHARACTER_STRENGTH) * 0.8 + 0.2).toFixed(2);
    console.log("CHARACTER STRENGTH: " + characterStrength);

    // Strengthen Characteristics
    if (config.strengthen_characteristic) {
        let characteristics = [];
        for (let data of characterData) {
            for (let tag of data.tags) {
                if (datasets.characteristic.includes(tag[0])) {
                    if (tag[1] >= characterStrength)
                        characteristics.push(tag[0]);
                }
            }
        }

        prompt_beg = prompt_beg.concat(characteristics);
    }

    // Strengthen Attire
    if (config.strengthen_attire) {
        let characteristics = [];
        for (let data of characterData) {
            for (let tag of data.tags) {
                if (datasets.clothes.includes(tag[0])) {
                    if (tag[1] >= characterStrength)
                        characteristics.push(tag[0]);
                }
            }
        }

        characteristics = characteristics.filter((el) => {
            if (el.includes("panties") || el.includes("bra") || el.includes("panty") || el.includes("underwear")) {
                return false;
            }
            return true;
        });

        prompt_beg = prompt_beg.concat(characteristics);
    }

    // Strengthen Ornament
    if (config.strengthen_ornament) {
        let characteristics = [];
        for (let data of characterData) {
            for (let tag of data.tags) {
                if (datasets.ornament.includes(tag[0])) {
                    if (tag[1] >= characterStrength)
                        characteristics.push(tag[0]);
                }
            }
        }

        prompt_beg = prompt_beg.concat(characteristics);
    }

    // Remove clothes actions of clothes that's not wearing
    randomPrompt = await removeClothesActions(randomPrompt, characterData, prompt_beg, prompt_end);

    // Combine prompts
    prompt = prompt.concat(prompt_beg, randomPrompt, prompt_end);

    prompt = prompt.filter((el) => {
        if (el == "") {
            return false;
        }
        return true;
    });

    prompt = prompt.join(', ');
    prompt = prompt.replaceAll('_', ' '); 

    if (config.reorder) {
        prompt = await reorderPrompt(prompt);
    }
    if (config.naistandard) {
        prompt = await naistandard(prompt);
    }

    return prompt;
}

async function processCharacterData(prompt_beg, randomPrompt, prompt_end) {
    let characters = (await extractList(prompt_beg.concat(randomPrompt, prompt_end), datasets.character, true))[0];
    let result = [];

    for (let character of characters) {
        let tags = await getCharacterTags(character);
        if (tags.length != 0) {
            result.push(tags);
        }
    }

    return result;
}

async function removeClothesActions(randomPrompt, characterData, prompt_beg, prompt_end) {
    let clothes = [];

    // girl must have panties and bra
    if (prompt_beg.includes('1girl') || randomPrompt.includes('1girl') || prompt_end.includes('1girl')) {
        clothes.push('panties');
        clothes.push('bra');
    }

    // character tags to prompt
    let characterTags = [];
    for (let data of characterData) {
        for (let tag of data.tags) {
            characterTags.push(tag[0]);
        }
    }

    // find clothes (keys)
    for (let tag of Array.from(new Set(prompt_beg.concat((await extractList(randomPrompt, datasets.clothes.concat(datasets.ornament), true))[0], prompt_end, characterTags)))) {
        for(let spl of tag.split(' ')) {
            if (datasets.clothes_actions_json.hasOwnProperty(spl)) {
                clothes = clothes.concat(spl);
            }
        }
    }

    // get disallowed clothes
    let disallowedClothes = [];
    for (let key of Object.keys(datasets.clothes_actions_json)) {
        if (!clothes.includes(key)) {
            disallowedClothes = disallowedClothes.concat(datasets.clothes_actions_json[key]);
        }
    }

    randomPrompt = removeArray(randomPrompt, disallowedClothes);

    return randomPrompt;
}

async function naistandard(prompt) {
    const replace = {
        'v': 'peace sign',
        'double v': 'double peace',
        '| |': 'bar eyes',
        '\| |/': 'open \m/',
        ':|': 'neutral face',
        ';|': 'neutral face',
        'eyepatch bikini': 'square bikini',
        'tachi-e': 'character image' 
    }
    prompt = prompt.split(', ');
    for (let i = 0; i < prompt.length; i++) {
        prompt[i] = prompt[i].trim();
        let data = prompt[i].replaceAll('{','').replaceAll('}','').replaceAll('[','').replaceAll(']','').trim();
        
        if (datasets.artist.includes(data)) {
            prompt[i] = prompt[i].replace(data, `artist:${data}`);
        }

        if (replace.hasOwnProperty(data)) {
            prompt[i] = prompt[i].replace(data, replace[data]);
        }
    }

    return prompt.join(', ');
}

async function reorderPrompt(prompt) {
    let data = [];
    let weight = 0;
    let buffer = '';
    for (let i = 0; i <= prompt.length; i++) {
        if (i == prompt.length || prompt[i] == '{' || prompt[i] == '[' || prompt[i] == '}' || prompt[i] == ']' || prompt[i] == ',') {
            buffer = buffer.trim();

            if (buffer != '') {
                data.push([weight, buffer]);
            }
            buffer = '';
        } else {
            buffer += prompt[i];
        }

        if (i < prompt.length) {
            if (prompt[i] == '{') {
                weight++;
            } else if (prompt[i] == '}') {
                weight--;
            } else if (prompt[i] == '[') {
                weight--;
            } else if (prompt[i] == ']') {
                weight++;
            }
        }
    }

    let result = [];

    // Count
    await extractList(data, datasets.count).then((res) => {
        result = result.concat(res[0]);
        data = res[1];
    });

    // Character
    await extractList(data, datasets.character).then((res) => {
        result = result.concat(res[0]);
        data = res[1];
    });
    
    // Copyright
    await extractList(data, datasets.copyright).then((res) => {
        result = result.concat(res[0]);
        data = res[1];
    });

    // Artist
    await extractList(data, datasets.artist).then((res) => {
        result = result.concat(res[0]);
        data = res[1];
    });

    // Quality
    await extractList(data, datasets.quality).then((res) => {
        result = result.concat(res[1], res[0]);
    });

    result.push([0, '']);

    let str = '';
    weight = 0;
    for (let i = 0; i < result.length; i++) {
        if (weight != result[i][0]) {
            str = str.substring(0, str.length - 2);

            if (weight < result[i][0]) {
                for (let j = weight; j < result[i][0]; j++) {
                    if (j < 0) {
                        str += ']';
                        if (j == result[i][0] - 1 && i != result.length - 1) str += ', ';
                    } else {
                        if (str.at(-1) != '{') str += ', ';
                        str += '{';
                    }
                }
            } else {
                for (let j = weight; j > result[i][0]; j--) {
                    if (j <= 0) {
                        if (str.at(-1) != '[') str += ', ';
                        str += '[';
                    } else {
                        str += '}';
                        if (j == result[i][0] + 1 && i != result.length - 1) str += ', ';
                    }
                }
            }

            weight = result[i][0];
        }

        str += result[i][1];
        if (i < result.length - 1) {
            str += ', ';
        }
    }

    if (str.substring(str.length - 2) == ', ') {
        str = str.substring(0, str.length - 2);
    }

    return str;
}

async function extractList(original, extractList, justcmp = false) {
    let extracted = [];
    let removed = [];
    for (let i = 0; i < original.length; i++) {
        if (justcmp && extractList.includes(original[i]) || extractList.includes(original[i][1])) {
            extracted.push(original[i]);
        }
        else {
            removed.push(original[i]);
        }
    }

    return [extracted, removed];
}

function removeArray(arr, remove) {
    return arr.filter((el) => {
        return !remove.includes(el);
    });
}

let previousSearchTags = null;
let positions = null;
async function getRandomPrompt(including, excluding, onProgress) {
    if (including.length == 0 && excluding.length == 0) {
        return "";
    }
    if (including.length == 0 && excluding.length != 0) {
        throw new Error('Cannot only exclude tags from Search Tags');
    }

    // Check including and excluding tags
    for(let i = 0; i < including.length; i++) {
        if (!datasets.key.hasOwnProperty(including[i])) {
            throw new Error(`Tag "${including[i]}" not found`);
        }
    }
    for(let i = 0; i < excluding.length; i++) {
        if (!datasets.key.hasOwnProperty(excluding[i])) {
            throw new Error(`Tag "${excluding[i]}" not found`);
        }
    }

    let str = including.join(',') + '|' + excluding.join(',');
    if (str != previousSearchTags) {
        previousSearchTags = str;
        positions = [];

        let processed = 0;
        let total = including.length + excluding.length;

        let includingPos = [];
        let excludingPos = [];

        onProgress(`Searching prompts... (0%)`);

        // Get positions of including tags
        for (let tag of including) {
            (async() => {
                let pos = await getPositionsOfTag(tag);
                if (pos == null) {
                    throw new Error(`Couldn't find tag: "${tag}"`);
                }

                includingPos.push(new Set(pos));

                onProgress(`Searching prompts... (${Math.floor((processed / total) * 100)}%)`);
                processed++;
            })();
        }

        // Remove positions of excluding tags
        for (let tag of excluding) {
            (async() => {
                let pos = await getPositionsOfTag(tag);
                if (pos == null) {
                    throw new Error(`Couldn't find tag: "${tag}"`);
                }

                excludingPos.push(new Set(pos));

                onProgress(`Searching prompts... (${Math.floor((processed / total) * 100)}%)`);
                processed++;
            })();
        }

        await new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                if (processed == total) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });

        // Including
        positions = includingPos[0];
        for (let i = 1; i < includingPos.length; i++) {
            positions = new Set([...positions].filter(x => includingPos[i].has(x)));
        }

        // Excluding
        for (let i = 0; i < excludingPos.length; i++) {
            positions = new Set([...positions].filter(x => !excludingPos[i].has(x)));
        }

        positions = Array.from(positions);
    }

    // Random prompt
    if (positions.length == 0) {
        throw new Error('No prompts found');
    }
    let position = positions[Math.floor(Math.random() * positions.length)];
    let prompt = await getPromptAt(position);

    return prompt;
}

async function getPromptAt(pos) {
    let res = await axios.get(`https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/tags.dat`, {
        headers: {
            Range: `bytes=${pos}-${pos + 10000}`
        },
        responseType: 'text'
    });

    let prompt = res.data.substring(0, res.data.indexOf('\n'));
    return prompt;
}

export async function loadPresets(uid) {
    let res = await axios.post(`${host}/getPresets`, {
        uid: uid
    });

    return res.data;
}

async function getPositionsOfTag(tag) {
    let range = datasets.key[tag];

    if (range == undefined) {
        return null;
    }

    let positions = [];
    let res = await axios.get(`https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/pos.dat`, {
        headers: {
            Range: `bytes=${range.start*4}-${range.end*4 - 1}`
        },
        responseType: 'arraybuffer'
    });

	let view = new DataView(res.data, 0);

	for (let i = 0; i < res.data.byteLength / 4; i++) {
		positions.push(view.getUint32(i * 4));
	}

    return positions;
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

async function getAccessToken(id, pw) {
    let key = await getAccessKey(id, pw);
    let token = await axios.post(`${host}/api/user/login`, {
        key: key
    }).then((res) => {
        return 'Bearer ' + res.data.accessToken;
    });

    return token;
}

export async function testAccessToken(token) {
    let res = await axios.get(`${host}/api/user/information`, {
        headers: {
            Authorization: token
        }
    });

    return res.data;
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