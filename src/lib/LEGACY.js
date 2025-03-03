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

    // Remove emotion
    if (config.remove_emotion) {
        randomPrompt = removeArray(randomPrompt, datasets.emotions);
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