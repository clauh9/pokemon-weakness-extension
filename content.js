let highlightedWord = '';

//alt+left click to start the event 
document.addEventListener('mouseup', function (event) {
    if (event.altKey) {
        const selectedText = window.getSelection().toString();
        if (selectedText.length > 0) {
            highlightedWord = selectedText;
            getPokemonWeakness(highlightedWord);
        }
    }
});

/**
 * 
 * @param {*} pokemonName 
 * @returns weakness of that pokemon
 */
async function getPokemonWeakness(pokemonName) {
    pokemonName = pokemonName.toLowerCase(); // convert to lowercase
    let weaknesses = [];

    const fetchWeaknesses = async () => {
        isLoading = true;
        try {
            //first get that pokemon types
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            const data = await response.json();

            const types = data.types.map((type) => type.type.name);

            const multipliers = {};
            //then with that pokemon type then search for that specific type weakness
            for (const type of types) {
                const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
                const typeData = await typeResponse.json();

                for (const damageRelation of typeData.damage_relations.double_damage_from) {
                    multipliers[damageRelation.name] = (multipliers[damageRelation.name] || 1) * 2;
                }
                for (const damageRelation of typeData.damage_relations.half_damage_from) {
                    multipliers[damageRelation.name] = (multipliers[damageRelation.name] || 1) * 0.5;
                }
                for (const damageRelation of typeData.damage_relations.no_damage_from) {
                    multipliers[damageRelation.name] = 0;
                }
            }

            //sorting our weakness by most effective to least
            const sortedMultipliers = Object.entries(multipliers) //converts the multipliers object into an array of key-value pairs, where each key-value pair is represented as an array with two elements: ex{ground: 4}
                .filter(([type, multiplier]) => multiplier > 1) //applies a filter to the array created in the previous step, keeping only the key-value pairs where the value is greater than 1.
                .sort((a, b) => b[1] - a[1]); //sorts the filtered array in descending order of the values of the key-value pairs

            //modify weaknesses dictionary to include both type and multiplier
            weaknesses = sortedMultipliers.map(([type, multiplier]) => ({ type, multiplier }));
            //ex: balbasaur => flying x2 | fire x2 | ice x2 | psychic x2
            let selection = weaknesses.map(({ type, multiplier }) => `${type} x${multiplier}`).join(" | ");

            //------------------ Bubble ---------- 
            let existingSpeechBubble = document.querySelector('.popup');
            if (existingSpeechBubble) {
                existingSpeechBubble.remove();
            }
            let speechBubble = document.createElement('div');
            speechBubble.setAttribute('class', 'popup');
            speechBubble.innerHTML = selection.toString();

            // Create an array of weakness type/multiplier pairs
            const weaknessPairs = Object.entries(multipliers)
                .filter(([type, multiplier]) => multiplier > 1)
                .sort((a, b) => b[1] - a[1]);

            // Create an array of span elements based on the weakness pairs
            const weaknessSpans = weaknessPairs.map(([type, multiplier]) =>
                createWeaknessesSpan(type, multiplier)
            );

            // Join the span elements into a string with a separator of '|'
            const weaknessesString = weaknessSpans.join(' | ');

            // Create a containing span element with the class 'weaknesses'
            const weaknessesSpan = document.createElement('span');
            weaknessesSpan.classList.add('weaknesses');

            // Add the weakness span elements to the containing span element
            weaknessSpans.forEach(span => weaknessesSpan.appendChild(span));

            // Insert the containing span element into the DOM
            window.getSelection().getRangeAt(0).insertNode(weaknessesSpan);




            // window.getSelection().getRangeAt(0).insertNode(speechBubble); //inserts a new DOM node called speechBubble at the beginning of the selected range


            // Add a click event listener to the document to remove the speech bubble
            document.addEventListener('click', function () {
                if (weaknessesSpan.parentNode) {
                    weaknessesSpan.parentNode.removeChild(weaknessesSpan);
                }
            }, { once: true }); //runs only once, it will automatically be removed after it has been executed once
        } catch (error) {
            error = error;
        }
        isLoading = false;
    };

    if (pokemonName) {
        fetchWeaknesses();
    }

    return { weaknesses };
}


function createWeaknessesSpan(type, multiplier) {
    const span = document.createElement('span');
    span.classList.add('weakness-type', type);
    span.innerText = `${type} ${multiplier}x`;
    return span;
}
