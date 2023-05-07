let highlightedWord = '';

document.addEventListener('mouseup', function (event) {
    if (event.altKey) {
        const selectedText = window.getSelection().toString();
        if (selectedText.length > 0) {
            highlightedWord = selectedText;
            getPokemonWeakness(highlightedWord);
        }
    }
});

async function getPokemonWeakness(pokemonName) {
    pokemonName = pokemonName.toLowerCase(); // convert to lowercase
    let weaknesses = [];
    let isLoading = false;
    let error = null;

    const fetchWeaknesses = async () => {
        isLoading = true;
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            const data = await response.json();

            const types = data.types.map((type) => type.type.name);

            const multipliers = {};
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

            const sortedMultipliers = Object.entries(multipliers)
                .filter(([type, multiplier]) => multiplier > 1)
                .sort((a, b) => b[1] - a[1]);

            weaknesses = sortedMultipliers.map(([type, _]) => type);

            // Print the weaknesses to the HTML
            const weaknessesContainer = document.getElementById("weaknesses-container");
            // weaknessesContainer.innerHTML = weaknesses.join(", ");
            // console.log(weaknesses.join(", "));

            var selection = weaknesses.join(", ");
            var existingSpeechBubble = document.querySelector('.popup');
            if (existingSpeechBubble) {
                existingSpeechBubble.remove();
            }
            var speechBubble = document.createElement('div');
            speechBubble.setAttribute('class', 'popup');
            // speechBubble.setAttribute('class', 'show');
            speechBubble.innerHTML = selection.toString();
            window.getSelection().getRangeAt(0).insertNode(speechBubble);

            // Add a click event listener to the document to remove the speech bubble
            document.addEventListener('click', function () {
                if (speechBubble.parentNode) {
                    speechBubble.parentNode.removeChild(speechBubble);
                }
            }, { once: true });
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