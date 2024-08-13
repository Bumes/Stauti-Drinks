// #region Drink Creation

// #region JSON 
let available_ingredients;
let drinks;
let current_frame = "cocktails"

let cocktails_availability_true = false
let cocktails_availability_false = false

let mocktails_availability_true = false
let mocktails_availability_false = false

let shots_availability_true = false
let shots_availability_false = false

let coffee_availability_true = false
let coffee_availability_false = false


json_url = 'https://raw.githubusercontent.com/Bumes/Drinks/main/available-ingredients.json?v='
drinks_url = 'https://raw.githubusercontent.com/Bumes/Drinks/main/drinks.json?v='
picture_folder = 'pictures/'

if (window.location.href.search("stauti") != -1) {
    json_url = 'https://raw.githubusercontent.com/Bumes/Drinks/main/stauti-available-ingredients.json?v='
    picture_folder = 'https://raw.githubusercontent.com/Bumes/Drinks/main/pictures/'
}

async function fetchAndStoreIngredients() {
    try {
        available_ingredients = await fetchIngredients();
    } catch (error) {
        console.error(error);
    }
}

function fetchIngredients() {
    return fetch(json_url + new Date().getTime())
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

async function fetchAndStoreDrinks() {
    try {
        drinks = await fetchDrinks()
        console.log(available_ingredients)
    } catch (error) {
        console.error(error);
    }
}

function fetchDrinks() {
    return fetch(drinks_url + new Date().getTime())
        .then(response => response.json())
}


// #endregion



let missing = new Set()
let saved_html = ""


function sortIngredients(arr) {
    if (arr.length <= 1) {
        return arr;
    }

    const pivot = arr[0];
    const left = [];
    const right = [];

    for (let i = 1; i < arr.length; i++) {
        if (parseInt(arr[i][1]) > parseInt(pivot[1])) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }

    return [
        ...sortIngredients(left),
        pivot,
        ...sortIngredients(right),
    ];
}

function format(text) {
    return text.toLowerCase().split(" // ")[0].split("// ")[0].split(" //")[0].split("//")[0].replace("double ", "").replace("steamed ", "").replace("dashes ", "").replace("dash ", "").replace(/[\d½|\d¼]+(ml|g)? /, '').replace(/ /g, '_').replace(/[()]/g, '')
}


cocktails_added_flavor_profiles = []
mocktails_added_flavor_profiles = []
shots_added_flavor_profiles = []
coffee_added_flavor_profiles = []

cocktails_added_ingredients = []
mocktails_added_ingredients = []
shots_added_ingredients = []
coffee_added_ingredients = []

function Drink({ category = "Cocktails", name = "No Name given", ingredients = [], options = [], garnishes = [], flavor_profile = [] }) {
    if (name.toLowerCase().search(document.getElementById(`${current_frame}-search-filter`).value.toLowerCase()) == -1 || name == "No Name given") {
        return false
    }

    flavor_filter = get_flavor_filter()

    const flavor_filter_names = [...flavor_filter]
        .filter(item => item.value === true)
        .map(item => format(item.name.split(" ").join(" ")));

    if (!flavor_filter_names.every(element => flavor_profile.includes(element))) {
        return false
    }

    every_ingredient = true;
    let language_name = ""

    chosen_ingredients = []

    if (ingredients.length > 0) {
        for (let g = 0; g < garnishes.length; g++) {
            garnishes[g] = garnishes[g].split("//")[0]
        }
        for (let i = 0; i < ingredients.length; i++) {

            doreturn = true;
            let ingredient = ingredients[i];
            let chosen_ingredient = ingredient
            current_ingredients = ingredient.split(" -> ")
            let j

            for (j = 0; j < current_ingredients.length; j++) {
                formatted_ingredient = format(current_ingredients[j])
                chosen_ingredient = current_ingredients[j]
                while (formatted_ingredient[0] == "_") {
                    formatted_ingredient = formatted_ingredient.substring(1, formatted_ingredient.length)
                }
                while (formatted_ingredient.slice(-1) == "_") {
                    formatted_ingredient = formatted_ingredient.substring(0, formatted_ingredient.length - 1)
                }
                if (available_ingredients[formatted_ingredient]) {
                    doreturn = false
                    break
                } else if (formatted_ingredient == "") {
                    j = j - 1
                    doreturn = false
                    ingredients[i] = "Missing: " + ingredient.split(" -> ")[0]
                    chosen_ingredient = "Missing: " + ingredient.split(" -> ")[0]
                    break
                }
            }

            chosen_ingredients[i] = chosen_ingredient;


            if (doreturn) {
                every_ingredient = false
                if (missing[formatted_ingredient] == undefined) {
                    missing[formatted_ingredient] = [String(available_ingredients[formatted_ingredient]).replace("unavailable", "not defined in available-ingredients.json").replace("false", "not at home"), "in 1 recipe"]
                } else {
                    missing[formatted_ingredient][1] = missing[formatted_ingredient][1].replace(/\d+/, match => (parseInt(match) + 1).toString())
                }
                ingredients[i] = current_ingredients[0]
            } else {
                if (chosen_ingredient.search("Missing: ") != -1) {
                    temp = chosen_ingredient.replace("Missing: ", "").replace(/[\d½|\d¼]+(ml|g)? /, '')
                } else {
                    temp = chosen_ingredient.replace(/[\d½|\d¼]+(ml|g)? /, '')
                }
                language_ingredient = temp
                formatted_temp = format(temp)
                try {
                    if (language["ingredients"].hasOwnProperty(formatted_temp)) {
                        language_ingredient = language["ingredients"][formatted_temp]
                    } else if (formatted_temp != "") {
                        console.log("Language is missing " + formatted_temp + " as an ingredient.")
                    }
                } catch {
                }
                ingredients[i] = chosen_ingredient.replace(temp, language_ingredient)
            }
        }


        // categories: sweet, sour, tart, fruity, fresh, boozy
        // Missing with what

        /* 
        blended rum -> white rum <-> brown rum
        *** Gin -> Gin
        egg white -> egg
        lemon/lime juice -> lemon/lime
        Pineapple leave -> pineapple
        vodka citron -> vodka + lemon
        x Dashes -> 
        x tsp ->
        */
    } else {
        every_ingredient = available_ingredients[format(name)]
        formatted_option = format(name)
        temp = name.replace(/[\d½|\d¼]+(ml|g)? /, '')
        language_name = temp
        if (language["ingredients"].hasOwnProperty(formatted_option)) {
            language_name = language["ingredients"][formatted_option]
        } else {
            console.log("Language is missing " + formatted_option + " as a name.")
        }
        language_name = name.replace(temp, language_name)
    }

    formatted_chosen_ingredients = []

    for (let i = 0; i < chosen_ingredients.length; i++) {
        formatted_chosen_ingredients[i] = format(chosen_ingredients[i])
    }

    ingredient_filter = get_ingredients_filter()

    const filteredNames = [...ingredient_filter]
        .filter(item => item.value === true)
        .map(item => format(item.name.split(" ").join(" ")));

    if (!filteredNames.every(element => formatted_chosen_ingredients.includes(element))) {
        return false
    }

    for (let f = 0; f < flavor_profile.length; f++) {
        if (category == "Cocktails") {
            if (!(cocktails_added_flavor_profiles.includes(flavor_profile[f]))) {
                cocktails_added_flavor_profiles.push(flavor_profile[f]);
            }
        } else if (category == "Mocktails") {
            if (!(mocktails_added_flavor_profiles.includes(flavor_profile[f]))) {
                mocktails_added_flavor_profiles.push(flavor_profile[f]);
            }
        } else if (category == "Shots") {
            if (!(shots_added_flavor_profiles.includes(flavor_profile[f]))) {
                shots_added_flavor_profiles.push(flavor_profile[f]);
            }
        } else if (category == "Coffee") {
            if (!(coffee_added_flavor_profiles.includes(flavor_profile[f]))) {
                coffee_added_flavor_profiles.push(flavor_profile[f]);
            }
        }
    }
    if (options.length > 0) {
        for (let o = 0; o < options.length; o++) {
            formatted_option = format(options[o])
            if (!available_ingredients[formatted_option]) {
                options.splice(o, 1)
                o--
            } else {
                temp = options[o].replace(/[\d½|\d¼]+(ml|g)? /, '')
                language_option = temp
                if (language["ingredients"].hasOwnProperty(formatted_option)) {
                    language_option = language["ingredients"][formatted_option]
                } else {
                    console.log("Language is missing " + formatted_option + " as an option")
                }
                options[o] = options[o].replace(temp, language_option)
            }
        }
        if (every_ingredient === false && ingredients.length == 0) {
            every_ingredient = options.length > 0
        }
    }

    if (every_ingredient) {
        if (!document.getElementById(`${current_frame}-availability-dropdown`).checked) {
            return false
        }
    } else {
        if (!document.getElementById(`${current_frame}-not-availability-dropdown`).checked) {
            return false
        }
    }

    for (i in chosen_ingredients) {
        let filter_ingredient = chosen_ingredients[i].split(" // ")[0].split("// ")[0].split(" //")[0].split("//")[0].replace("Double ", "").replace("Steamed ", "").replace("Dashes", "").replace("Dash", "").replace(/[\d½|\d¼]+(ml|g)? /, '').replace(/[()]/g, '').replace(/^\s+|\s+$/g, '')

        if (category == "Cocktails") {
            if (!(cocktails_added_ingredients.includes(filter_ingredient)) & filter_ingredient !== null & filter_ingredient.search("Missing") == -1) {
                cocktails_added_ingredients.push(filter_ingredient);
            }
        } else if (category == "Mocktails") {
            if (!(mocktails_added_ingredients.includes(filter_ingredient)) & filter_ingredient !== null & filter_ingredient.search("Missing") == -1) {
                mocktails_added_ingredients.push(filter_ingredient);
            }
        } else if (category == "Shots") {
            if (!(shots_added_ingredients.includes(filter_ingredient)) & filter_ingredient !== null & filter_ingredient.search("Missing") == -1) {
                shots_added_ingredients.push(filter_ingredient);
            }
        } else if (category == "Coffee") {
            if (!(coffee_added_ingredients.includes(filter_ingredient)) & filter_ingredient !== null & filter_ingredient.search("Missing") == -1) {
                coffee_added_ingredients.push(filter_ingredient);
            }
        }
    }

    ingredients = sortIngredients(ingredients);

    for (let g = 0; g < garnishes.length; g++) {
        formatted_garnish = format(garnishes[g])
        /*if (formatted_garnish.search("_or_") != -1) {
            formatted_garnishes = formatted_garnish.split("_or_")
            for (let f = 0; f < formatted_garnishes.length; f++) {
                if (available_ingredients.hasOwnProperty(formatted_garnishes[f])) {
                    if (!available_ingredients[formatted_garnishes[f]]) {
                        //if (!available_ingredients[garnishes[g].toLowerCase().replace(/[\d½|\d¼]+(ml|g)? /, '').replace(/ /g, '_')] && (garnishes[g].split(' ').length<2)){
                        console.log(garnishes[g] + " is missing for Garnish")
                    }
                }
                garnishes.splice(g, 0, garnishes[g].split(" or ")[f])
            }
        }
        else{*/
        if (available_ingredients.hasOwnProperty(formatted_garnish)) {
            if (!available_ingredients[formatted_garnish]) {
                //if (!available_ingredients[garnishes[g].toLowerCase().replace(/[\d½|\d¼]+(ml|g)? /, '').replace(/ /g, '_')] && (garnishes[g].split(' ').length<2)){
                // console.log(garnishes[g] + " is missing for Garnish")
                garnishes.splice(g, 1)
                g--
            }
        }
        //}
    }

    const cocktails_menu = document.getElementById("cocktails_menu");
    const mocktail_menu = document.getElementById("mocktails_menu");
    const shots_menu = document.getElementById("shots_menu");
    const coffee_menu = document.getElementById("coffee_menu");

    // Create a drink container
    const drinkDiv = document.createElement("div");
    drinkDiv.classList.add("drink");

    const horizontal = window.innerHeight < window.innerWidth ? "-horizontal" : "-portrait";

    // Populate the drink container
    drinkDiv.innerHTML = `
        <style>
            h2 {
                color: white;
                padding-left: 20px;
            }
            ul {
                color: white;
                font-size: 20px;
            }
            p1 {
                color: white;
                padding-left: 10px;
                font-weight: bold;
                font-size: 24px;
            }
            p2 {
                color: white;
                font-size: 24px;
            }

            img {
                border: 2px solid #659165;
            }

            .image-container {
                padding-bottom: 20px;
            }

            .image-area-horizontal {
                display: grid;
                align-items: center; 
                grid-template-columns: 1fr 1fr;
                column-gap: 5px;
            }
        </style>

        <h1 class="image-header${!every_ingredient ? '-missing' : ''}">${language_name == "" ? name : language_name}</h2>

        <div class="image-area${horizontal}">

            <div class="image-container">
                <img src="${picture_folder}${name.toLowerCase().replace(/ *\([^)]*\)/g, "").trim().replace(/\s+$/g, "").replace("ñ", "n").replace("é", "e").replace("’", "").split(' ').join('-').split("'").join('') + ".png"}" alt="${name + " Picture"}">
            </div>

            ${flavor_profile.length > 0 || ingredients.length > 0 || options.length > 0 ? `
            <div class="flavors_and_ingredients${horizontal}">
                ${flavor_profile.length != 0 ? `
                <div class="flavors${horizontal}">
                    <p1 id="flavors_text"></p1>
                    <ul>
                        ${flavor_profile.map(flavor => {
        let formatted_flavor = format(flavor);
        let temp = flavor.replace(/[\d½|\d¼]+(ml|cl|g)? /, '');
        let language_flavor = temp;
        if (language["flavor_profile"].hasOwnProperty(formatted_flavor)) {
            language_flavor = language["flavor_profile"][formatted_flavor];
        } else {
            console.log("Language is missing " + formatted_flavor + " as a flavor profile.")
        }
        reflavor = flavor.replace(temp, language_flavor);
        return `<li>${reflavor.trim()}</li>`;
    }).join('')}
                    </ul>
                </div>` : ''}

                ${ingredients.length > 0 ? `
                <div class="ingredients${horizontal}">
                    <p1 id=ingredients_text></p1>
                    <ul>
                        ${ingredients.map(ingredient => `
                            <li class="${missing.hasOwnProperty(format(ingredient)) ? 'missing-ingredient' : ''}">
                                ${ingredient.trim()}
                            </li>`).join('')}
                    </ul>
                </div>`
                : ''}

                ${options.length > 0 ? `
                <div class="options${horizontal}">
                    <p1 id=options_text></p1>
                    <ul>
                    ${options.map(ingredient => `<li>${ingredient.trim()}</li>`).join('')}
                    </ul>

                </div>` : ''}

                ${garnishes.length > 0 ? `
                <div class="garnishes${horizontal}">
                    <p1 id=garnishes_text></p1>
                    <ul>
                    ${garnishes.map(garnish => `<li>${garnish.trim()}</li>`).join('')}
                    </ul>

                </div>` : ''}
            </div>` : ''}
            ${every_ingredient ? `<button class="order-button" id="order_button" onclick='sendData("${format(name)}")'>Order</button>` : `<button class="order-button" id="pre_order_button" onclick='sendData("${format(name)}>Pre-Order</button>`}
    `;

    // Add the drink to the correct menu 
    if (horizontal == "-horizontal") {
        if (saved_html == "") {
            saved_html = drinkDiv
        } else {
            // Create a wrapper div to hold both saved_html and drinkDiv
            const wrapperDiv = document.createElement('div');
            wrapperDiv.style.display = 'flex'; // Use flex layout to display them side by side

            // Set flex property on saved_html to take up more space (adjust as needed)
            saved_html.style.flex = '2';
            drinkDiv.style.flex = '2';

            // Append both saved_html and drinkDiv to the wrapper
            wrapperDiv.appendChild(saved_html);
            wrapperDiv.appendChild(drinkDiv);

            if (category == "Cocktails") {
                cocktails_menu.appendChild(wrapperDiv);
            }
            else if (category == "Mocktails") {
                mocktail_menu.appendChild(wrapperDiv);
            }
            else if (category == "Shots") {
                shots_menu.appendChild(wrapperDiv);
            }
            else if (category == "Coffee") {
                coffee_menu.appendChild(wrapperDiv);
            }

            // Clear saved_html
            saved_html = "";
        }
    } else {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.display = 'flex'; // Use flex layout to display them side by side

        drinkDiv.style.flex = '1';

        // Append both saved_html and drinkDiv to the wrapper
        wrapperDiv.appendChild(drinkDiv);
        if (category == "Cocktails") {
            cocktails_menu.appendChild(wrapperDiv);
        }
        else if (category == "Mocktails") {
            mocktail_menu.appendChild(wrapperDiv);
        }
        else if (category == "Shots") {
            shots_menu.appendChild(wrapperDiv);
        }
        else if (category == "Coffee") {
            coffee_menu.appendChild(wrapperDiv);
        }
    }
    return true
}

function add_odd_element(category) {

    // Check if saved_html is not empty after all iterations
    if (saved_html !== "") {

        const cocktails_menu = document.getElementById("cocktails_menu");
        const mocktail_menu = document.getElementById("mocktails_menu");
        const shots_menu = document.getElementById("shots_menu");
        const coffee_menu = document.getElementById("coffee_menu");

        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.display = 'flex'; // Use flex layout to display them side by side
        wrapperDiv.style.width = '50%'; // Use flex layout to display them side by side

        // Set flex property on saved_html to take up more space (adjust as needed)
        saved_html.style.flex = '1';

        // Append both saved_html and drinkDiv to the wrapper
        wrapperDiv.appendChild(saved_html);

        if (category == "Cocktails") {
            cocktails_menu.appendChild(wrapperDiv);
        }
        else if (category == "Mocktails") {
            mocktail_menu.appendChild(wrapperDiv);
        }
        else if (category == "Shots") {
            shots_menu.appendChild(wrapperDiv);
        }
        else if (category == "Coffee") {
            coffee_menu.appendChild(wrapperDiv);
        }
        saved_html = ""
    }
}

function add_all_ingredients(category) {

    if (category == "cocktails") {
        ingredients = cocktails_added_ingredients.sort()
    } else if (category == "mocktails") {
        ingredients = mocktails_added_ingredients.sort()
    } else if (category == "shots") {
        ingredients = shots_added_ingredients.sort()
    } else if (category == "coffee") {
        ingredients = coffee_added_ingredients.sort()
    }


    delete_all_ingredients(category)

    for (let b = 0; b < ingredients.length; b++) {
        var newOption = document.createElement('label');
        newOption.innerHTML = `<input type="checkbox" name="${ingredients[b]}" onchange="create_all()"> ${ingredients[b]}`;
        // newOption.addEventListener('change', (event) => {create_all()})
        document.getElementById(`${category}-ingredients-dropdown-content`).appendChild(newOption);
        document.getElementById(`${category}-ingredients-dropdown-content`).appendChild(document.createElement('br'));
    }
}

function delete_all_ingredients(category) {
    const element = document.getElementById(`${category}-ingredients-dropdown-content`);

    while (element.firstChild !== null) {
        element.removeChild(element.firstChild);
    }
}


function get_ingredients_filter() {
    const checkboxSet = new Set();
    const checkboxes = document.querySelectorAll(`#${current_frame}-ingredients-dropdown-content input[type="checkbox"]`);

    checkboxes.forEach(checkbox => {
        checkboxSet.add({ name: checkbox.name, value: checkbox.checked });
    });

    return checkboxSet;
}

function add_all_categories(category) {
    let my_element_id = null
    if (category == "Cocktails") {
        cocktails_added_flavor_profiles.sort()
        flavor_profile = cocktails_added_flavor_profiles
        dropdownContent = document.getElementById("dropdown-content")
        my_element_id = 'cocktails-category-dropdown-content'
    } else if (category == "Mocktails") {
        mocktails_added_flavor_profiles.sort()
        flavor_profile = mocktails_added_flavor_profiles
        area = document.getElementById("mocktails_category_area")
        my_element_id = 'mocktails-category-dropdown-content'
    } else if (category == "Shots") {
        shots_added_flavor_profiles.sort()
        flavor_profile = shots_added_flavor_profiles
        area = document.getElementById("shots_category_area")
        my_element_id = 'shots-category-dropdown-content'
    } else if (category == "Coffee") {
        coffee_added_flavor_profiles.sort()
        flavor_profile = coffee_added_flavor_profiles
        area = document.getElementById("coffee_category_area")
        my_element_id = 'coffee-category-dropdown-content'
    }

    if (my_element_id !== null) {
        let element = document.getElementById(my_element_id);
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        for (let f = 0; f < flavor_profile.length; f++) {
            var newOption = document.createElement('label');

            let name = flavor_profile[f]
            formatted_flavor = format(name)
            temp = name.replace(/[\d½|\d¼]+(ml|g)? /, '')
            language_flavor = temp
            if (language["flavor_profile"].hasOwnProperty(formatted_flavor)) {
                language_flavor = language["flavor_profile"][formatted_flavor]
            } else {
                console.log("Language is missing " + formatted_option + " as an flavor option.")
            }
            name = name.replace(temp, language_flavor)

            newOption.innerHTML = `<input type="checkbox" name="${flavor_profile[f]}" onchange="create_all()"> ${name}`;
            document.getElementById(my_element_id).appendChild(newOption);
            document.getElementById(my_element_id).appendChild(document.createElement('br'));
        }
    }
}


function get_flavor_filter() {
    const checkboxSet = new Set();
    const checkboxes = document.querySelectorAll(`#${current_frame}-category-dropdown-content input[type="checkbox"]`);

    checkboxes.forEach(checkbox => {
        checkboxSet.add({ name: checkbox.name, value: checkbox.checked });
    });

    return checkboxSet;
}


function delete_all() {
    var header_elements = document.querySelectorAll('.image-header');
    header_elements.forEach(function (element) {
        element.remove();
    });
    var header_elements = document.querySelectorAll('#order_button');
    header_elements.forEach(function (element) {
        element.remove();
    });
    var drink_area_elements = document.querySelectorAll('.drink');
    drink_area_elements.forEach(function (element) {
        element.remove();
    });
    var vertical_elements = document.querySelectorAll('.image-area');
    vertical_elements.forEach(function (element) {
        element.remove();
    });
    var horizontal_elements = document.querySelectorAll('.image-area-horizontal');
    horizontal_elements.forEach(function (element) {
        element.remove();
    });
    var drink_types = ['cocktails', 'mocktails', 'shots', 'coffee'];
    drink_types.forEach(function (type) {
        var elements = document.querySelectorAll('.' + type + '-other-drinks-header');
        elements.forEach(function (element) {
            element.remove();
        });
        var elements = document.querySelectorAll('.' + type + '-recommended-header');
        elements.forEach(function (element) {
            element.remove();
        });
    });
}



function Cocktail({ name, ingredients, garnishes, flavor_profile }) {
    Drink(0, name, ingredients, garnishes, flavor_profile)
}

function Mocktail({ name, ingredients, garnishes, flavor_profile }) {
    Drink(1, name, ingredients, garnishes, null, flavor_profile)
}

function Shot({ name, ingredients, garnishes, flavor_profile }) {
    Drink(2, name, ingredients, garnishes, null, flavor_profile)
}

function Coffee({ name, ingredients, garnishes, flavor_profile }) {
    Drink(3, name, ingredients, garnishes, null, flavor_profile)
}
/*
async function create_all() {
    await fetchAndStoreIngredients();
    await fetchAndStoreDrinks();

    delete_all()

    let idx = 0

    for (const category in drinks) {
        drinks[category].forEach(drink => {
            drink["category"] = category
            Drink(drink)
        });

        add_odd_element(category)
        if (get_flavor_filter().size == 0) {
            if (idx == 0) {
                add_all_ingredients()
            }
            add_all_categories(category)
        }

        idx++
    }

    update_language()

    console.log(missing)
}*/

async function create_all() {
    await fetchAndStoreIngredients();
    await fetchAndStoreDrinks();

    cocktails_added_ingredients = [];
    delete_all()

    let idx = 0;
    let processedDrinks = new Set();


    // First process recommended drinks under "luck"
    for (const category in drinks) {

        added_recommended_drinks = []

        if (drinks[category][0].recommended) {
            if (window.location.href.search("stauti") != -1) {
                recommended_drinks = drinks[category][0].recommended.stauti
            } else {
                recommended_drinks = drinks[category][0].recommended.luck
            }
            if (recommended_drinks == [] || recommended_drinks == "" || !recommended_drinks) {
                break;
            }
            if (recommended_drinks) {

                recommendedDiv = document.createElement("div");
                recommendedDiv.classList.add("drink");
                recommendedDiv.classList.add(`${category.toLowerCase()}-recommended-header-div`);

                // Populate the drink container
                if (window.location.href.search("stauti") != -1) {
                    recommendedDiv.innerHTML = `<h1 id="stauti_recommended_text" class="${category.toLowerCase()}-recommended-header">Recommended`
                } else {
                    recommendedDiv.innerHTML = `<h1 id="recommended_text" class="${category.toLowerCase()}-recommended-header">Recommended`
                }

                recommendedDiv.style.display = 'flex'; // Use flex layout to display them side by side
                recommendedDiv.style.width = '98%'; // Use flex layout to display them side by side

                // Set flex property on saved_html to take up more space (adjust as needed)
                recommendedDiv.style.flex = '1';

                if (category == "Cocktails") {
                    cocktails_menu.appendChild(recommendedDiv);
                }
                else if (category == "Mocktails") {
                    mocktail_menu.appendChild(recommendedDiv);
                }
                else if (category == "Shots") {
                    shots_menu.appendChild(recommendedDiv);
                }
                else if (category == "Coffee") {
                    coffee_menu.appendChild(recommendedDiv);
                }

                recommended_drinks.forEach(drink_name => {
                    drinks[category].forEach(search_drink => {
                        if (search_drink.name == drink_name) {
                            recommended_drink = search_drink;
                        }
                    })
                    if (recommended_drink) {
                        if (!processedDrinks.has(recommended_drink)) {
                            processedDrinks.add(recommended_drink);
                            recommended_drink["category"] = category;
                            showing = Drink(recommended_drink);
                            if (showing === true) {
                                added_recommended_drinks.push(recommended_drink)
                            }
                        }
                    }
                });

                add_odd_element(category);

                if (added_recommended_drinks.length == 0) {
                    var recommended_elements = document.querySelectorAll(`.${category.toLowerCase()}-recommended-header-div`);
                    recommended_elements.forEach(function (element) {
                        element.remove();
                    });
                } else {

                    other_drinks_div = document.createElement("div");
                    other_drinks_div.classList.add("drink");
                    other_drinks_div.classList.add(`${category.toLowerCase()}-other-drinks-header-div`);

                    // Populate the drink container
                    other_drinks_div.innerHTML = `<h1 id="other_drinks_text" class="${category.toLowerCase()}-other-drinks-header">Other Drinks`

                    other_drinks_div.style.display = 'flex'; // Use flex layout to display them side by side
                    other_drinks_div.style.width = '98%'; // Use flex layout to display them side by side

                    // Set flex property on saved_html to take up more space (adjust as needed)
                    other_drinks_div.style.flex = '1';

                    if (category == "Cocktails") {
                        cocktails_menu.appendChild(other_drinks_div);
                    }
                    else if (category == "Mocktails") {
                        mocktail_menu.appendChild(other_drinks_div);
                    }
                    else if (category == "Shots") {
                        shots_menu.appendChild(other_drinks_div);
                    }
                    else if (category == "Coffee") {
                        coffee_menu.appendChild(other_drinks_div);
                    }
                    break;
                }
            }
        }
    }

    // Now process the rest, skipping already processed drinks
    for (const category in drinks) {

        added_other_drinks = []

        drinks[category].forEach(drink => {
            if (!processedDrinks.has(drink)) {
                processedDrinks.add(drink);  // Mark as processed
                drink["category"] = category;
                showing = Drink(drink);
                if (showing === true) {
                    added_other_drinks.push(drink)
                } else {
                    console.log()
                }
            }
        });

        if (added_other_drinks.length == 0 & added_recommended_drinks.length > 0) {
            var recommended_elements = document.querySelectorAll(`${category.toLowerCase()}-other-drinks-header-div`);
            recommended_elements.forEach(function (element) {
                element.remove();
            });
        }

        add_odd_element(category);
        if (get_flavor_filter().size == 0) {
            add_all_categories(category);
        }

        lower_category = category.toLowerCase()

        if (lower_category == "cocktails") {
            availability_true = cocktails_availability_true
            availability_false = cocktails_availability_false
            cocktails_availability_true = document.getElementById(`${lower_category}-availability-dropdown`).checked
            cocktails_availability_false = document.getElementById(`${lower_category}-not-availability-dropdown`).checked
        } else if (lower_category == "mocktails") {
            availability_true = mocktails_availability_true
            availability_false = mocktails_availability_false
            mocktails_availability_true = document.getElementById(`${lower_category}-availability-dropdown`).checked
            mocktails_availability_false = document.getElementById(`${lower_category}-not-availability-dropdown`).checked
        } else if (lower_category == "shots") {
            availability_true = shots_availability_true
            availability_false = shots_availability_false
            shots_availability_true = document.getElementById(`${lower_category}-availability-dropdown`).checked
            shots_availability_false = document.getElementById(`${lower_category}-not-availability-dropdown`).checked
        } else if (lower_category == "coffee") {
            availability_true = coffee_availability_true
            availability_false = coffee_availability_false
            coffee_availability_true = document.getElementById(`${lower_category}-availability-dropdown`).checked
            coffee_availability_false = document.getElementById(`${lower_category}-not-availability-dropdown`).checked
        }

        if (document.getElementById(`${lower_category}-availability-dropdown`).checked != availability_true | document.getElementById(`${lower_category}-not-availability-dropdown`).checked != availability_false) {
            add_all_ingredients(lower_category);
        }

        idx++;
    }

    update_language();

    console.log(missing);
}


create_all()

// #endregion

// #region lukas mode

function upload_new_data(event) {

    let githubToken = 'ghp_5ewV5uVGFNCmqmoME'
    githubToken = githubToken + '9Mt2rygyABqN430Tajr'
    const repoOwner = 'Bumes';
    const repoName = 'Drinks';
    const filePath = 'available-ingredients.json';

    const existingKey = event.currentTarget.my_ingredient; // Replace with your existing key
    const newValue = event.target.checked; // Replace with the new value

    // Load the existing content from GitHub
    fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
        method: 'GET',
        headers: {
            Authorization: `token ${githubToken}`,
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(data => {
            // Decode the base64 content from GitHub
            const currentContent = atob(data.content);

            // Parse the content into an object
            const currentData = JSON.parse(currentContent);

            // Modify the value of an existing key in the object
            currentData.existingKey = newValue; // Change 'existingKey' to the key you want to modify

            // Encode the updated content as JSON with indentation
            const updatedContent = JSON.stringify(currentData, null, 2);

            // Encode the updated content as base64
            const updatedContentBase64 = btoa(updatedContent);

            // Update the file on GitHub with the modified and formatted content
            fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${githubToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update file via API',
                    content: updatedContentBase64,
                    sha: data.sha,
                }),
            })
                .then(response => response.json())
                .then(result => {
                    console.log('File updated on GitHub:', result);
                })
                .catch(error => {
                    console.error('Error updating the file:', error);
                });
        })
        .catch(error => {
            console.error('Error fetching file content:', error);
        });
}

lukas_mode_allowed = false
currently_lukas_mode = false

/*document.getElementById("toggle_lukas_mode").addEventListener("click", function () {
    if (!lukas_mode_allowed) {
        var password = prompt("Please enter the password:");
        if (password === "ilm") {
            lukas_mode_allowed = true
        }
    }

    currently_lukas_mode = !currently_lukas_mode

    var tabs = document.getElementsByClassName("menu");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }
    document.getElementById(currently_lukas_mode ? "lukas_mode" : "cocktails_menu").style.display = "block";

    /*const bcrypt = require('bcrypt');
    const saltRounds = 10;
    
    bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
        console.log(hash)
    });

});*/

lukas_mode_tab = document.getElementById("lukas_mode")

async function create_lukas_mode_tab() {
    await fetchAndStoreIngredients();
    for (ingredient in available_ingredients) {
        try {
            const ingDiv = document.createElement("div");
            ingDiv.innerHTML = `
            <p1>${ingredient}</p1>
            `
            const checkbox = document.createElement("input")
            checkbox.type = "checkbox";
            checkbox.checked = available_ingredients[ingredient]
            checkbox.addEventListener('change', upload_new_data, false)
            checkbox.my_ingredient = ingredient

            const wrapperDiv = document.createElement('div');
            wrapperDiv.style.display = 'flex';

            ingDiv.style.flex = '2';
            checkbox.style.flex = '2';

            // Append both saved_html and drinkDiv to the wrapper
            wrapperDiv.appendChild(ingDiv);
            wrapperDiv.appendChild(checkbox);

            lukas_mode_tab.appendChild(wrapperDiv);
        } catch {
            return
        }
    }
}

create_lukas_mode_tab()

// #endregion



function toggleDropdown(dropdown_name) {
    var dropdown = document.getElementById(dropdown_name);
    if (dropdown !== null) {
        dropdown.classList.toggle('open');
        var content = dropdown.querySelector('.dropdown-content');
        if (content) {
            console.log("Content found for:", dropdown_name);
            content.style.display = content.style.display === 'block' ? 'none' : 'block'; // Force display change
        } else {
            console.log("No content found for:", dropdown_name);
        }
    }
}



function closeDropdown(dropdown_name) {
    var dropdown = document.getElementById(dropdown_name);
    if (dropdown !== null) {
        if (!dropdown.contains(document.activeElement)) {
            dropdown.classList.remove('open');
        }
    }
}

function showTab(tabId) {
    var tabs = document.getElementsByClassName("menu");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }
    document.getElementById(tabId).style.display = "block";
    create_all()
    current_frame = tabId.split("_")[0]
}


function fetchLanguages() {
    return fetch("https://raw.githubusercontent.com/Bumes/Drinks/main/language.json?v=" + new Date().getTime())
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

async function fetchAndStoreLanguages() {
    try {
        return await fetchLanguages()
    } catch (error) {
        console.error(error);
    }
}

let language;

function sendData(inputData) {
    var xhr = new XMLHttpRequest();
    // 'https://drinks-master.lukas-bumes.de:3000/master'
    xhr.open('POST', "http://localhost:3000/master", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log('Data sent successfully');
        }
    };
    xhr.onerror = function () {
        console.error('Error while sending data. Status:', xhr.status, 'Status Text:', xhr.statusText);
        return;
    };
    var data = JSON.stringify({ formatted_name: inputData });
    console.log("Sending data: " + data);
    xhr.send(data);
}

