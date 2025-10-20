document.addEventListener('DOMContentLoaded', () => {
    const unicodeInput = document.getElementById('unicode-input');
    const bijoyOutput = document.getElementById('bijoy-output');
    const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');

    // Character mapping from Unicode to Bijoy
    const charMap = {
        '\u0995': 'K', '\u0996': 'L', '\u0997': 'M', '\u0998': 'N', '\u0999': 'O',
        '\u099A': 'P', '\u099B': 'Q', '\u099C': 'R', '\u099D': 'S', '\u099E': 'T',
        '\u099F': 'U', '\u09A0': 'V', '\u09A1': 'W', '\u09A2': 'X', '\u09A3': 'Y',
        '\u09A4': 'Z', '\u09A5': '_', '\u09A6': '`', '\u09A7': 'a', '\u09A8': 'b',
        '\u09AA': 'c', '\u09AB': 'd', '\u09AC': 'e', '\u09AD': 'f', '\u09AE': 'g',
        '\u09AF': 'h', '\u09B0': 'i', '\u09B2': 'j', '\u09B6': 'k', '\u09B7': 'l',
        '\u09B8': 'm', '\u09B9': 'n', '\u09DC': 'o', '\u09DD': 'p', '\u09DF': 'q',
        '\u09CE': 't', '\u0982': '\u00C2', '\u0983': '\u00C3', '\u0981': '\u00C1',
        '\u09BE': 'v', '\u09BF': 'w', '\u09C0': 'x', '\u09C1': 'y', '\u09C2': 'z',
        '\u09C3': 'A', '\u09C4': 'B', '\u09C7': '\u2021', '\u09C8': '\u00C8',
        '\u09CB': '\u2020', '\u09CC': '\u00D4', '\u09CD': '\u00F7',
        '\u09E6': '0', '\u09E7': '1', '\u09E8': '2', '\u09E9': '3', '\u09EA': '4',
        '\u09EB': '5', '\u09EC': '6', '\u09ED': '7', '\u09EE': '8', '\u09EF': '9',
        '\u0985': 'm', '\u0986': 'Av', '\u0987': 'B', '\u0988': 'C', '\u0989': 'D',
        '\u098A': 'E', '\u098B': 'F', '\u098F': 'G', '\u0990': 'H', '\u0993': 'I',
        '\u0994': 'J', ' ': ' ', '-': '-', '.': '.', ',': ',', ';': ';',
        '/': '/', '?': '?', '!': '!', '"': '"', "'": "'", '(': '(', ')': ')',
        '{': '{', '}': '}', '[': '[', ']': ']', '|': '|', '\\': '\\',
        '~': '~', '`': '`', '<': '<', '>': '>', '=': '=', '+': '+', '_': '_',
        '*': '*', '&': '&', '^': '^', '%': '%', '$': '$', '#': '#', '@': '@'
    };

    function convertUnicodeToBijoy(text) {
        let output = '';
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            // Handling conjuncts (juktakkhor) and special cases
            if (char === '\u0995' && nextChar === '\u09CD' && text[i + 2] === '\u09B7') { // kkhio
                output += '\u00A7';
                i += 2;
            } else if (char === '\u099C' && nextChar === '\u09CD' && text[i + 2] === '\u099E') { // gyo
                output += 'T';
                i += 2;
            } else if (char === '\u09B0' && nextChar === '\u09CD') { // reph
                // Find the next consonant
                let consonantIndex = -1;
                for (let j = i + 2; j < text.length; j++) {
                    if (charMap[text[j]] && text[j] !== '\u09CD') {
                        consonantIndex = j;
                        break;
                    }
                }
                if (consonantIndex !== -1) {
                    output += '\u2026' + charMap[text[consonantIndex]];
                    i = consonantIndex;
                } else {
                    output += charMap[char];
                }
            } else if (nextChar === '\u09CD') {
                output += charMap[char] + '\u00F7';
                i++;
            } else {
                output += charMap[char] || char;
            }
        }
        return output;
    }

    convertBtn.addEventListener('click', () => {
        const unicodeText = unicodeInput.value;
        bijoyOutput.value = convertUnicodeToBijoy(unicodeText);
    });

    copyBtn.addEventListener('click', () => {
        bijoyOutput.select();
        document.execCommand('copy');
    });

    clearBtn.addEventListener('click', () => {
        unicodeInput.value = '';
        bijoyOutput.value = '';
    });
});
