import axios from 'axios';
import { blake2b } from 'blakejs';
import { Buffer } from 'buffer';
import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';
import { unzip } from 'unzipit';
import { sha256 } from 'js-sha256';

const host = 'https://jio7-prombot.hf.space';
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

    let res = await generateImage(token, prompt, model, 'generate', params);
    return res;
}

export let datasets = {};
export async function downloadDatasets(onProgress, onFinish) {
    let progress = 0;

    const numfiles = 11;
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
    /* CENSOR.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/censor.dat').then((res) => {
        res = res.split('\n');
        datasets.censor = res;

        downloaded++;
    });
    /* MEME.DAT */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/meme.dat').then((res) => {
        res = res.split('\n');
        datasets.censor = res;

        downloaded++;
    });
    
    /* WHITELIST.CSV */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/whitelist.csv').then((res) => {
        res = res.split('\n');
        for (let i = 0; i < res.length; i++) {
            res[i] = res[i].split(',');
        }
        datasets.whitelist = res;

        downloaded++;
    });

    /* Characters/Characters.json */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/characters/characters.json').then((res) => {
        res = JSON.parse(res);
        datasets.characters_characters = res;

        downloaded++;
    });
    /* Characters/Copyright.json */
    downloadFile('https://huggingface.co/Jio7/NAI-Prompt-Randomizer/resolve/main/characters/copyright.json').then((res) => {
        res = JSON.parse(res);
        datasets.characters_copyright = res;

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

async function downloadFile(url) {
    let res = await axios.get(url, {
        responseType: 'text'
    });
    return res.data;
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

async function processPrompt(config, onProgress) {
    let prompt_beg = config.prompt_beg.replaceAll('\n', ',');
    let prompt_end = config.prompt_end.replaceAll('\n', ',');
    let negative = config.negative.replaceAll('\n', ',');

    let prompt_search = processPromptSearch(config);

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


    /* CONFY FEATURES */
    let prompt = [];
    
    // Duplicate Remover
    randomPrompt = removeArray(randomPrompt, prompt_beg);
    randomPrompt = removeArray(randomPrompt, prompt_end);

    // Strong Uncensorship
    if (prompt_beg.includes('uncensored') || prompt_end.includes('uncensored')) {
        randomPrompt = removeArray(randomPrompt, datasets.censor);
    }

    // Combine prompts
    prompt = prompt.concat(prompt_beg, randomPrompt, prompt_end);

    return prompt.join(', ');
}

function removeArray(arr, remove) {
    return arr.filter((el) => {
        return !remove.includes(el);
    });
}

let previousSearchTags = null;
let positions = null;
async function getRandomPrompt(including, excluding, onProgress) {
    if (including.length == 0 && excluding.length != 0) {
        throw new Error('Cannot only exclude tags from Search Tags');
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

    console.log(positions.length);
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