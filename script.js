// #region Drink Creation

// #region JSON 

let available_ingredients;
let current_frame = "drinks"

async function fetchAndStoreIngredients() {
    try {
        available_ingredients = await fetchIngredients();
        console.log(available_ingredients)
    } catch (error) {
        console.error(error);
    }
}

json_url = 'https://raw.githubusercontent.com/Bumes/Drinks/main/available-ingredients.json?v='

if (window.location.href.search("stauti") != -1) {
    json_url = 'https://raw.githubusercontent.com/Bumes/Drinks/main/stauti-available-ingredients.json?v='
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

drinks_added_flavor_profiles = []
mocktails_added_flavor_profiles = []
shots_added_flavor_profiles = []
coffee_added_flavor_profiles = []

drinks_added_base_spirits = []

function Drink(category, name, ingredients=[], garnishes=[], base_spirit="Other", flavor_profile=[]) {
    if (name.search(document.getElementById(`${current_frame}-search-filter`).value) == -1) {
        return
    }
    if (current_frame == "drinks") {
        base_spirit_filter = get_base_spirits_filter()

        let is_selected_base_spirit = false
        let is_any_selected_base_spirit = false

        for (const item of base_spirit_filter) {
            if (item.name === base_spirit) {
                if (item.value === true) {
                    is_selected_base_spirit = true;
                }
            }
            if (item.value === true) {       
                is_any_selected_base_spirit = true
            }
        }
        
        if (is_selected_base_spirit !== is_any_selected_base_spirit) {
            return
        }
    }

    flavor_filter = get_flavor_filter()

    let is_one_selected_flavor = false
    let is_any_selected_flavor = false

    for (const item of flavor_filter) {
        for (let f=0; f < flavor_profile.length; f++) {
            if (item.name == flavor_profile[f]) {
                if (item.value === true) {
                    is_one_selected_flavor = true;
                }
            }
        }
        if (item.value === true) {       
            is_any_selected_flavor = true
        }
    }

    if ((!is_one_selected_flavor) && is_any_selected_flavor) {
        return
    }

    every_ingredient = true;

    if (ingredients.length > 0){
        for (let g = 0; g < garnishes.length; g++) {
            garnishes[g] = garnishes[g].split("//")[0]
        }
        for (let i = 0; i < ingredients.length; i++) {
            doreturn = true;
            let ingredient = ingredients[i];
            current_ingredients = ingredient.split(" -> ")
            let j
            for (j=0; j < current_ingredients.length; j++) {
                formatted_ingredient = current_ingredients[j].toLowerCase().split(" // ")[0].split("// ")[0].split(" //")[0].split("//")[0].replace("double ", "").replace("steamed", "").replace(/[\d½|\d¼]+(ml|g)? /, '').replace(/ /g, '_').replace(/[()]/g, '')
                while (formatted_ingredient[0] == "_"){
                    formatted_ingredient = formatted_ingredient.substring(1, formatted_ingredient.length)
                }
                while (formatted_ingredient.slice(-1) == "_"){
                    formatted_ingredient = formatted_ingredient.substring(0, formatted_ingredient.length-1)
                } 
                if (available_ingredients[formatted_ingredient]) {
                    doreturn = false
                    break
                } else if (formatted_ingredient == ""){
                    j = j-1
                    doreturn = false
                    ingredients[i] = "Missing: " + ingredient
                    break
                }
            }

                    
            if (doreturn){
                every_ingredient = false
                if (missing[formatted_ingredient] == undefined) {
                    missing[formatted_ingredient] = [String(available_ingredients[formatted_ingredient]).replace("unavailable", "not defined in available-ingredients.json").replace("false", "not at home"), "in 1 recipe"]
                } else {
                    missing[formatted_ingredient][1] = missing[formatted_ingredient][1].replace(/\d+/, match => (parseInt(match) + 1).toString())
                }
            } else {
                ingredients[i] = ingredients[i].split("//")[0].replace("  ", " ").split(" -> ")[j]
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

            for (let f = 0; f < flavor_profile.length; f++) {
                if (category == 0) {
                    if (!(drinks_added_flavor_profiles.includes(flavor_profile[f]))) {
                        drinks_added_flavor_profiles.push(flavor_profile[f]);
                    }
                } else if (category == 1) {
                    if (!(mocktails_added_flavor_profiles.includes(flavor_profile[f]))) {
                        mocktails_added_flavor_profiles.push(flavor_profile[f]);
                    }
                } else if (category == 2) {
                    if (!(shots_added_flavor_profiles.includes(flavor_profile[f]))) {
                        shots_added_flavor_profiles.push(flavor_profile[f]);
                    }
                } else if (category == 3) {
                    if (!(coffee_added_flavor_profiles.includes(flavor_profile[f]))) {
                        coffee_added_flavor_profiles.push(flavor_profile[f]);
                    }
                }
            }
            if (!(drinks_added_base_spirits.includes(base_spirit)) & base_spirit !== null) {
                drinks_added_base_spirits.push(base_spirit);
            }
        }
    }
       
    if (every_ingredient){
        if (!document.getElementById(`${current_frame}-availability-dropdown`).checked) {
            return
        }
    } else {
        if (!document.getElementById(`${current_frame}-not-availability-dropdown`).checked) {
            return
        }
    }

    ingredients = sortIngredients(ingredients);

    for (let g=0; g < garnishes.length; g++){
        formatted_garnish = garnishes[g].toLowerCase().split(" // ")[0].split("// ")[0].split(" //")[0].split("//")[0].replace("double ", "").replace("steamed", "").replace(/[\d½|\d¼]+(ml|g)? /, '').replace(/ /g, '_').replace(/[()]/g, '')
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

    const drinks_menu = document.getElementById("drinks_menu");
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

        <h1 class="image-header">${name}</h2>

        <div class="image-area${horizontal}">

            <div class="image-container">
                <img src="pictures/${name.toLowerCase().replace(/ *\([^)]*\)/g, "").trim().replace(/\s+$/g, "").split(' ').join('-').split("'").join('') + ".png"}" alt="${name + " Picture"}">
            </div>

            ${flavor_profile.length > 0 || ingredients.length > 0 ? `
            <div class="flavors_and_ingredients${horizontal}">
                ${flavor_profile.length != 0 ? `
                <div class="flavors${horizontal}">
                    <p1>Flavors:</p1>
                    <ul>
                    ${flavor_profile.map(flavor => `<li>${flavor.trim()}</li>`).join('')}
                    </ul>

                </div>` : ''}

                ${ingredients.length > 0 ? `
                <div class="ingredients${horizontal}">
                    <p1>Ingredients:</p1>
                    <ul>
                    ${ingredients.map(ingredient => `<li>${ingredient.trim()}</li>`).join('')}
                    </ul>

                </div>` : ''}

                ${garnishes.length > 0 ? `
                <div class="garnishes${horizontal}">
                    <p1>Garnish:</p1>
                    <ul>
                    ${garnishes.map(garnish => `<li>${garnish.trim()}</li>`).join('')}
                    </ul>

                </div>` : ''}
            </div>` : ''}
    `;

    // Add the drink to the correct menu 
    if (horizontal == "-horizontal"){
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

            if (category == 0){
                drinks_menu.appendChild(wrapperDiv);
            }
            else if (category == 1){
                mocktail_menu.appendChild(wrapperDiv);
            }
            else if (category == 2){
                shots_menu.appendChild(wrapperDiv);
            }
            else if (category == 3){
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
        if (category == 0){
            drinks_menu.appendChild(wrapperDiv);
        }
        else if (category == 1){
            mocktail_menu.appendChild(wrapperDiv);
        }
        else if (category == 2){
            shots_menu.appendChild(wrapperDiv);
        }
        else if (category == 3){
            coffee_menu.appendChild(wrapperDiv);
        }
    }
}

function Cocktail(name, ingredients, garnishes, base_spirit, flavor_profile) {
    Drink(0, name, ingredients, garnishes, base_spirit, flavor_profile)
}

function Mocktail(name, ingredients, garnishes, flavor_profile) {
    Drink(1, name, ingredients, garnishes, null, flavor_profile)
}

function Shot(name, ingredients, garnishes, flavor_profile) {
    Drink(2, name, ingredients, garnishes, null, flavor_profile)
}

function Coffee(name, ingredients, garnishes, flavor_profile) {
    Drink(3, name, ingredients, garnishes, null, flavor_profile)
}

function add_odd_element(category){

    // Check if saved_html is not empty after all iterations
    if (saved_html !== "") {

        const drinks_menu = document.getElementById("drinks_menu");
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
    
        if (category == 0){
            drinks_menu.appendChild(wrapperDiv);
        }
        else if (category == 1){
            mocktail_menu.appendChild(wrapperDiv);
        }
        else if (category == 2){
            shots_menu.appendChild(wrapperDiv);
        }
        else if (category == 3){
            coffee_menu.appendChild(wrapperDiv);
        }
        saved_html = ""
    }
}

function add_all_base_spirits(){
    
    drinks_added_base_spirits.sort()
    const index = drinks_added_base_spirits.indexOf("Other");
    if (index !== -1) {
        drinks_added_base_spirits.push(drinks_added_base_spirits.splice(index, 1)[0]);
    }

    for(let b=0; b < drinks_added_base_spirits.length; b++) {
        var newOption = document.createElement('label');
        newOption.innerHTML = `<input type="checkbox" name="${drinks_added_base_spirits[b]}" onchange="create_all()"> ${drinks_added_base_spirits[b]}`;
        // newOption.addEventListener('change', (event) => {create_all()})
        document.getElementById('drinks-base-spirit-dropdown-content').appendChild(newOption);
    }
}

function get_base_spirits_filter() {
    const checkboxSet = new Set();
    const checkboxes = document.querySelectorAll(`#${current_frame}-base-spirit-dropdown-content input[type="checkbox"]`);
    
    checkboxes.forEach(checkbox => {
        checkboxSet.add({ name: checkbox.name, value: checkbox.checked });
    });
    
    return checkboxSet;
}

function add_all_categories(category){
    let my_element_id = null
    if (category == 0) {
        drinks_added_flavor_profiles.sort()
        flavor_profile = drinks_added_flavor_profiles
        dropdownContent = document.getElementById("dropdown-content")
        my_element_id = 'drinks-category-dropdown-content'
    } else if (category == 1) {
        mocktails_added_flavor_profiles.sort()
        flavor_profile = mocktails_added_flavor_profiles
        area = document.getElementById("mocktails_category_area")
        my_element_id = 'mocktails-category-dropdown-content'
    } else if (category == 2) {
        shots_added_flavor_profiles.sort()
        flavor_profile = shots_added_flavor_profiles
        area = document.getElementById("shots_category_area")
        my_element_id = 'shots-category-dropdown-content'
    } else if (category == 3) {
        coffee_added_flavor_profiles.sort()
        flavor_profile = coffee_added_flavor_profiles
        area = document.getElementById("coffee_category_area")
        my_element_id = 'coffee-category-dropdown-content'
    }

    if (my_element_id !== null) {
        for(let f=0; f < flavor_profile.length; f++) { 
            var newOption = document.createElement('label');
            newOption.innerHTML = `<input type="checkbox" name="${flavor_profile[f]}" onchange="create_all()"> ${flavor_profile[f]}`;
            document.getElementById(my_element_id).appendChild(newOption);
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
    header_elements.forEach(function(element) {
        element.remove();
    });
    var drink_area_elements = document.querySelectorAll('.drink');
    drink_area_elements.forEach(function(element) {
        element.remove();
    });
    var vertical_elements = document.querySelectorAll('.image-area');
    vertical_elements.forEach(function(element) {
        element.remove();
    });
    var horizontal_elements = document.querySelectorAll('.image-area-horizontal');
    horizontal_elements.forEach(function(element) {
        element.remove();
    });
}


async function create_all() {
    await fetchAndStoreIngredients();

    delete_all()

    Cocktail("Edelstoff", [], [], "Beer", [])
    Cocktail("Secco", [], [], "Wine", [])
    Cocktail("Red Wine", [], [], "Wine", [])
    Cocktail("White Wine", [], [], "Wine", [])
    Cocktail("Mimosa", ["Secco", "Orange Juice"], [], "Wine", [])
    Cocktail("Mojito", ["60ml White Rum", "15g Brown Sugar", "½ Lime -> 15ml Lime Juice", "Mint -> ", "Sparkling Water"], ["Mint"], "Rum", ["Fresh", "Citrus"]);
    Cocktail("Cuba Libre", ["60ml Brown Rum -> 60ml White Rum", "½ Lime -> 15ml Lime Juice", "Coca Cola -> Soda Stream Cola"], ["Lime"], "Rum", ["Sweet", "Citrus"]);
    Cocktail("Aperol Spritz", ["60ml Secco", "30ml Aperol", "Sparkling Water"], ["Orange"], "Aperol", ["Fresh", "Bitter", "Fruity"])
    Cocktail("Hugo", ["60ml Secco", "¼ Lime -> 10ml Lime Juice", "15ml Elderflower sirup", "Sparkling Water"], ["Mint"], "Wine", ["Sweet", "Fresh"])
    Cocktail("Martini",["60ml Gin", "15ml Dry Vermouth -> 15ml Sweet Vermouth -> 15ml Lillet"], ["Lemon Twist or Olive"], "Gin", ["Strong"]);
    Cocktail("Vodka Martini", ["60ml Vodka", "15ml Dry Vermouth -> 15ml Sweet Vermouth -> 15ml Lillet"], ["Lemon Twist or Olive"], "Vodka", ["Strong"]);
    Cocktail("Espresso Martini", ["Double Espresso", "30ml Coffee Liqueur", "15ml Vodka"], ["Coffee Beans"], "Vodka", ["Strong", "Coffee"])
    
    Cocktail("Negroni", ["30ml Gin", "30ml Sweet Vermouth", "30ml Campari -> 30ml Aperol"], ["Orange"], "Gin", ["Strong", "Bitter"])
    Cocktail("Margarita (not made)", ["50ml Silver Tequila", "30ml Triple Sec", "30ml Lime Juice"], ["Orange"], "Tequila", ["Strong", "Sour"])
    Cocktail("Daiquiri", ["60ml White Rum -> 60ml Brown Rum", "30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar"], ["Lime"], "Rum", ["Strong", "Citrus"])
    Cocktail("Penicillin", ["60ml Whiskey // (Scotch)", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Honey Sirup -> 30ml Agave Sirup -> 15ml Honey -> 30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar", "Ginger"], ["Candied Ginger"], "Whiskey", ["Sweet", "Ginger"])
    Cocktail("Moscow Mule", ["60ml Vodka", "90ml Ginger Beer -> 90ml Ginger Ale", "½ Lime -> 15ml Lime Juice"], ["Lime"], "Vodka", ["Ginger", "Citrus"])
    Cocktail("Pisco Sour (not made)", ["60ml Pisco", "30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "(1 Egg White)"], ["(Angostura Bitters)"], ["Citrus", "Creamy (if wanted)"])
    Cocktail("Paloma (not made)", ["60ml Blanco Tequila", "30ml Lime Juice", "Grapefruit Soda", "Salt"], ["Lime"], "Tequila", ["Strong", "Sour"])
    Cocktail("French 75", ["30ml Gin", "½ Lemon -> ½ Lime -> 15ml Lemon Juice -> 15ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "90ml Secco"], ["Lemon"], "Gin", ["Citrus", "Bubbly"])
    Cocktail("Last Word (not made)", ["30ml Gin", "30ml Chartreuse", "30ml Lime Juice"])
    Cocktail("Mai Tai", ["60ml Blended Rum -> 60ml Brown Rum -> 60ml White Rum", "30ml Lime Juice", "30ml Orgeat Sirup", "15ml Orange Liqueur", "Mint -> "], ["Mint"], "Rum", ["Strong", "Fruity"])
    Cocktail("Gimlet (not made)", ["60ml London Dry Gin -> 60ml Gin", "30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup"], ["Lime"], "Gin", ["Strong", "Citrus"])
    Cocktail("Clover Club", ["50ml Gin", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Raspberry Sirup", "1 Egg White"], [], "Gin" ["Fruity", "Creamy"])
    Cocktail("Amaretto Sour (not made)", ["50ml Amaretto", "30ml Lemon Juice -> 30ml Lime Juice", "15ml Simple Sirup -> 10g White Sugar -> 10g Brown Sugar -> 15ml Agave Sirup", "1 Egg White"], ["Cocktail Cherry", "Angostura Bitters"], ["Nutty", "Citrus", "Creamy"])
    Cocktail("Jungle Bird", ["50ml Brown Rum -> 50ml White Rum", "20ml Campari -> 20ml Aperol", "15ml Lime Juice", "15ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "50ml Pineapple Juice"], [], "Rum", ["Fruity", "Sweet"])
    Cocktail("Gin Fizz", ["50ml Gin", "60ml Lemon Juice", "30ml Simple Sirup -> 20g White Sugar -> 30g Brown Sugar -> 30ml Agave Sirup", "Sparkling Water"], ["Lemon"], "Gin", ["Strong", "Bubbly"])
    Cocktail("Piña Colada", ["60ml White Rum", "60ml Coconut Cream", "60ml Pineapple Juice"], ["Pineapple Leave"], "Rum", ["Fruity", "Creamy", "Summer"])
    Cocktail("Corpse Reviver (not made)", ["30ml Gin", "30ml Triple Sec", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Lillet -> 30ml Sweet Vermouth", "Absinthe"], ["Lemon"], "Gin", ["Strong", "Citrus"])
    Cocktail("Zombie (not made)", ["30ml White Rum", "30ml Brown Rum", "30ml Apricot Brandy", "15ml Falernum Liqueur", "30ml Lime Juice", "30ml Pineapple Juice", "10ml Grenadine"], ["Pineapple", "Cocktail Cherry"], "Rum", ["Strong", "Fruity"])
    Cocktail("Bee's Knees", ["60ml Gin", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Honey Sirup -> 15ml Honey -> 30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup"], ["Lemon"], "Gin", ["Strong", "Honey"])
    Cocktail("Gin Basil Smash", ["60ml Gin", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "Basil"], ["Basil"], "Gin", ["Strong", "Herbs"])
    Cocktail("Vesper (not made)", ["60ml Gin", "30ml Vodka", "15ml Lillet -> 15ml Sweet Vermouth -> 15ml Dry Vermouth"], ["Lemon", "Orange"], "Gin", ["Strong"])
    Cocktail("Cosmopolitan (not made)", ["50ml Vodka Citron -> 50ml Vodka // (with citron)", "30ml Cointreau", "30ml Lime Juice", "60ml Cranberry Juice"], ["Lemon"], "Vodka", ["Strong", "Citrus", "Fruity"])
    Cocktail("Bramble (not made)", ["60ml Gin", "30ml Lemon Juice", "15ml Simple Sirup -> 10g White Sugar -> 10g Brown Sugar -> 15ml Agave Sirup", "15ml Crème de mûre"], ["Lemon", "Blackberries"], "Gin", ["Strong", "Fruity"])
    Cocktail("Old Cuban (not made)", ["50ml Brown Rum -> 50ml Blended Rum -> 50ml White Rum", "30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "60ml Secco", "Mint", "2 Dashes Angostura Bitters"], ["Mint"], "Rum", ["Fresh", "Bubbly"])
    Cocktail("Caipirinha (not made)", ["60ml Pitu", "1 Lime", "10g White Sugar -> 20ml Simple Sirup -> 10g Brown Sugar -> 20ml Agave Sirup"])
    Cocktail("Southside (not made)", ["60ml Gin", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "30ml Lime Juice", "Mint"], ["Mint"], "Gin", ["Strong", "Fresh"])
    Cocktail("French Kiss (not made)", ["60ml Gin", "Berries // muddled", "Secco", "Sparkling Water"], ["Raspberry", "Lemon Twist"], "Gin", ["Fruity", "Bubbly"])
    Cocktail("Passion fruit skinny bitch (not made)", ["60ml Vodka", "30ml Lime Juice", "Passion Fruit", "Sparkling Water"], ["Passion Fruit"], "Vodka", ["Fruity", "Bubbly"])
    Cocktail("Cranberry gin fizz (not made)", ["60ml Strawberry Gin -> 60ml Gin", "Strawberry", "Sparkling Water"], ["Rosemary"], "Gin", ["Fruity", "Bubbly", "Herbs"])
    Cocktail("Sex on the beach (not made)", ["40ml Vodka", "20ml Peach Liqueur", "15ml Cranberry Sirup", "15ml Grenadine", "½ Lime -> 15ml Lime Juice", "80ml Orange Juice"], ["Cocktail Cherry"], "Vodka", ["Fruity", "Sweet"])
    Cocktail("Fence Hopper (not made)", ["30ml Whiskey // (Bourbon)", "30ml Apple Cider", "15ml Maple Sirup -> 15ml Honey Sirup -> 15ml Agave Sirup -> 10g Brown Sugar -> 10g White Sugar", "10ml Lemon Juice -> ½ Lemon -> ½ Lime -> 15ml Lime Juice",  "Angostura Bitters", "100ml IPA -> 100ml Beer"], ["Cinnamon Stick"], "Whiskey", ["Fruity", "Cinnamon"])
    Cocktail("Italien Mule", ["50ml Amaretto", "20ml Lime Juice -> ½ Lime -> ½ Lemon -> 15ml Lemon Juice", "Ginger Beer"], ["Lemon Twist"], "", ["Nutty", "Citrus", "Ginger"])    
    Cocktail("Italien Mule (Aperol Version) (not made)", ["50ml Aperol", "20ml Lime Juice -> ½ Lime -> ½ Lemon -> 15ml Lemon Juice", "Red Wine", "Ginger Beer"], ["Mint"], "Aperol", ["Citrus", "Ginger", "Mint"])
    Cocktail("Kigoi Koi (not made)", ["60ml Gin", "½ Lemon -> 15ml Lemon Juice -> ½ Lime -> 15ml Lime Juice", "15ml Honey Sirup -> 15ml Agave Sirup -> 10ml Honey -> 15ml Simple Sirup -> 10g White Sugar -> 10g Brown Sugar", "Secco"], [], "Gin", ["Citrus", "Honey", "Bubbly"])
    Cocktail("Kojito (not made)", ["60ml White Rum", "½ Lime -> 15ml Lime Juice Lime -> ½ Lemon -> 15ml Lemon Juice", "30ml Orange Juice", "Ginger Ale -> Ginger Beer"], ["Mint"], "Rum", ["Fruity", "Ginger", "Mint"])
    Cocktail("Japan Mule (not made)", ["60ml Shochu", "½ Lime -> 15ml Lime Juice Lime -> ½ Lemon -> 15ml Lemon Juice", "Ginger Beer", "Yuzu"], ["Dried Citrus"], "Other", ["Strong", "Ginger", "Citrus", "Woody"])
    Cocktail("Original", ["50ml Gin -> 50ml Vodka", "50ml Elderflower Sirup", "50ml Lime Juice -> 50ml Lemon Juice", "Sparkling Water"], ["Lime"], "Vodka", ["Fresh", "Bubbly"])
    Cocktail("43 Milk", ["50ml Licor 43", "50ml Milk"], ["(Chocolate Powder)"], ["Creamy"])
    add_odd_element(0)
    if (get_base_spirits_filter().size == 0) {
        add_all_categories(0)
    }

    Mocktail("Brazilian Lemonade (not made)", ["1 Lime -> 30ml Lime Juice", "15g Brown Sugar -> 15g White Sugar", "100ml Condensed Milk"], ["Lime"], ["Citrus", "Creamy"])
    Mocktail("Basil Lemonade (not made)", ["Lime", "Basil", "Mint"], ["Lime"], ["Herbs", "Citrus", "Fresh"])
    Mocktail("Matcha Tonic", ["30ml Matcha", "Tonic Water", "(White Sugar)"], [], ["Herbs", "Bitter", "Fresh"])
    add_odd_element(1)
    if (get_flavor_filter().size == 0) {
        add_all_categories(1)
    }

    Shot("Liquid Cocain (not made)", ["Licor 43", "Coldbrew"])
    Shot("Brain (not made)", ["10ml Vodka", "10ml Lime Juice -> 10ml Lemon Juice", "10ml Baileys"])
    Shot("Green Tea Shot", ["10ml Whiskey", "10ml Peach Schnapps -> 10ml Peach Liqueur", "10ml Lime Juice -> 10ml Lemon Juice", "10ml Simple Sirup -> 5g White Sugar -> 10ml Agave Sirup"])
    add_odd_element(2)
    if (get_flavor_filter().size == 0) {
        add_all_categories(2)
    }

    Coffee("Espresso", ["Double Espresso", "(Brown Sugar)"], ["Amaretti"], ["Coffee", "Strong"])
    Coffee("Espresso Macchiato", ["Double Espresso", "Steamed Milk", "(Brown Sugar)"], ["Amaretti"], ["Coffee", "Strong", "Creamy"])
    Coffee("Americano", ["Espresso", "Water"], ["Coffee"])
    Coffee("Aeracano", ["Espresso", "Water"], ["Coffee", "Creamy"])
    Coffee("Cappuccino", ["Double Espresso", "Milk // (Hot)", "Steamed Milk", "(Brown Sugar)"], ["Coffee", "Creamy"])
    Coffee("Latte Macchiato", ["Double Espresso", "Steamed Milk", "(Brown Sugar)"], ["Coffee", "Creamy", "Milky"])
    Coffee("Adultuccino", ["Coffee", "Chocolate Powder", "Steamed Milk"], ["Coffee", "Chocolate", "Creamy"])
    Coffee("Chococino", ["Double Espresso", "Chocolate Powder", "Steamed Milk"], ["Coffee", "Chocolate", "Creamy"])
    Coffee("Hot Chocolate", ["Chocolate Powder", "(Steamed) Milk"], ["Chocolate Powder"], ["Chocolate", "Creamy"])
    Coffee("Dalgona Coffee", ["Double Espresso", "Brown Sugar", "Milk"], ["Coffee", "Sweet", "Creamy"])
    Coffee("Creme Brule Coldbrew", ["Coldbrew", "Cream", "Milk", "Brown Sugar"], ["Coffee", "Sweet", "Creamy"])
    add_odd_element(3)
    
    if (get_flavor_filter().size == 0) {
        add_all_categories(3)
    }

    if (get_flavor_filter().size == 0) {
        add_all_base_spirits()
    }

    console.log(missing)
}

create_all()


/*if (!available_ingredients[formatted_ingredient]){
                doreturn = true
                if (formatted_ingredient == "lime" && available_ingredients["lime_juice"]) { 
                    ingredients[i] = ingredient.replace("½", ".5").replace("¼", ".25").replace("Lime", "")*30+"ml Lime Juice"; 
                    doreturn = false
                }
                else if (formatted_ingredient == "lemon") {
                    if (available_ingredients["Lemon Juice"]){
                        ingredients[i] = ingredient.replace("½", ".5").replace("¼", ".25").replace("Lemon", "")*30+"ml Lemon Juice"; 
                        doreturn = false
                    } else if (available_ingredients["lime"]){
                        ingredients[i] = ingredient.replace("Lemon", "Lime")
                        doreturn = false
                    } else if (available_ingredients["lime_juice"]) { 
                        ingredients[i] = ingredient.replace("½", ".5").replace("¼", ".25").replace("Lime", "")*30+"ml Lime Juice"; 
                        doreturn = false
                    }
                }
                else if ((formatted_ingredient == "simple_sirup" || formatted_ingredient == "brown_sugar") && available_ingredients["white_sugar"]) {
                    ingredients[i] = ingredient.replace("ml", "g").replace("Simple Sirup", "White Sugar").replace("Brown", "White");
                    doreturn = false;
                }
                else if (formatted_ingredient == "scotch" && available_ingredients["whiskey"]) {
                    ingredients[i] = ingredient.replace("Scotch", "Whiskey")
                    doreturn = false;
                }
                else if (formatted_ingredient == "honey_sirup") {
                    if (available_ingredients["honey"]) {
                        ingredients[i] = ingredient.split("ml")[0]/2 + "ml Honey";
                        doreturn = false;
                    } else if (available_ingredients["simple_sirup"]) {
                        ingredients[i] = ingredient.replace("Honey Sirup", "Simple Sirup");
                        doreturn = false;
                    } else if (available_ingredients["white_sugar"]) {
                        ingredients[i] = ingredient.replace("ml", "g").replace("Honey Sirup", "White Sugar");
                        doreturn = false;
                    }
                }
                else if (formatted_ingredient == "blanco_tequila" && available_ingredients["silver_tequila"]){
                    ingredients[i] = ingredient.replace("Blanco Tequila", "Silver Tequila");
                    doreturn = false;
                }
                else if ((formatted_ingredient == "sweet_vermouth" || formatted_ingredient == "dry_vermouth") && available_ingredients["lillet"]) {
                    ingredient = ingredient.split(" ")[0] + " Lillet"
                    doreturn = false;
                }
                else if (formatted_ingredient == "mint"){
                    ingredients[i] = "NO MINT LEAVES"
                    doreturn = false
                }
                else if (formatted_ingredient == "coca_cola" && available_ingredients["soda_stream_cola"]){
                    ingredients[i] = ingredient.replace("Coca Cola", "Cola (SodaStream)")
                    doreturn = false
                }*/

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

document.getElementById("toggle_lukas_mode").addEventListener("click", function() {
    if (!lukas_mode_allowed){
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
    document.getElementById(currently_lukas_mode ? "lukas_mode" : "drinks_menu").style.display = "block";

    /*const bcrypt = require('bcrypt');
    const saltRounds = 10;
    
    bcrypt.hash(plaintextPassword, saltRounds, function(err, hash) {
        console.log(hash)
    });*/
    
});

lukas_mode_tab = document.getElementById("lukas_mode")

async function create_lukas_mode_tab(){
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