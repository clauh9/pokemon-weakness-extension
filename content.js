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
            //first get that pkemon types
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
            //contains only the types of the weaknesses, which were sorted by their multipliers in descending order
            weaknesses = sortedMultipliers.map(([type, _]) => type); //is the function being applied to each element. It uses destructuring to extract the first element (type) of each key-value pair, discarding the second element (multiplier).

            //------------------ Bubble ---------- 
            var selection = weaknesses.join(" | ");
            var existingSpeechBubble = document.querySelector('.popup');
            if (existingSpeechBubble) {
                existingSpeechBubble.remove();
            }
            var speechBubble = document.createElement('div');
            speechBubble.setAttribute('class', 'popup');
            speechBubble.innerHTML = selection.toString();
            window.getSelection().getRangeAt(0).insertNode(speechBubble); //inserts a new DOM node called speechBubble at the beginning of the selected range

            // Add a click event listener to the document to remove the speech bubble
            document.addEventListener('click', function () {
                if (speechBubble.parentNode) {
                    speechBubble.parentNode.removeChild(speechBubble);
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