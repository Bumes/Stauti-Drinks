// #region Drink Creation

// #region JSON 
let available_ingredients;
let drinks;
let current_frame = "drinks"


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
        console.log(available_ingredients)
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

drinks_added_flavor_profiles = []
mocktails_added_flavor_profiles = []
shots_added_flavor_profiles = []
coffee_added_flavor_profiles = []

drinks_added_base_spirits = []

function Drink({category="Cocktails", name="No Name given", ingredients=[], garnishes=[], base_spirit="Other", flavor_profile=[]}) {
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
                if (category == "Cocktails") {
                    if (!(drinks_added_flavor_profiles.includes(flavor_profile[f]))) {
                        drinks_added_flavor_profiles.push(flavor_profile[f]);
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
            if (!(drinks_added_base_spirits.includes(base_spirit)) & base_spirit !== null) {
                drinks_added_base_spirits.push(base_spirit);
            }
        }
    } else {
        every_ingredient = available_ingredients[name.toLowerCase().split(" // ")[0].split("// ")[0].split(" //")[0].split("//")[0].replace("double ", "").replace("steamed", "").replace(/[\d½|\d¼]+(ml|g)? /, '').replace(/ /g, '_').replace(/[()]/g, '')]
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
                <img src="${picture_folder}${name.toLowerCase().replace(/ *\([^)]*\)/g, "").trim().replace(/\s+$/g, "").split(' ').join('-').split("'").join('') + ".png"}" alt="${name + " Picture"}">
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

            if (category == "Cocktails"){
                drinks_menu.appendChild(wrapperDiv);
            }
            else if (category == "Mocktails"){
                mocktail_menu.appendChild(wrapperDiv);
            }
            else if (category == "Shots"){
                shots_menu.appendChild(wrapperDiv);
            }
            else if (category == "Coffee"){
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
        if (category == "Cocktails"){
            drinks_menu.appendChild(wrapperDiv);
        }
        else if (category == "Mocktails"){
            mocktail_menu.appendChild(wrapperDiv);
        }
        else if (category == "Shots"){
            shots_menu.appendChild(wrapperDiv);
        }
        else if (category == "Coffee"){
            coffee_menu.appendChild(wrapperDiv);
        }
    }
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
    
        if (category == "Cocktails"){
            drinks_menu.appendChild(wrapperDiv);
        }
        else if (category == "Mocktails"){
            mocktail_menu.appendChild(wrapperDiv);
        }
        else if (category == "Shots"){
            shots_menu.appendChild(wrapperDiv);
        }
        else if (category == "Coffee"){
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
    if (category == "Cocktails") {
        drinks_added_flavor_profiles.sort()
        flavor_profile = drinks_added_flavor_profiles
        dropdownContent = document.getElementById("dropdown-content")
        my_element_id = 'drinks-category-dropdown-content'
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



function Cocktail({name, ingredients, garnishes, base_spirit, flavor_profile}) {
    Drink(0, name, ingredients, garnishes, base_spirit, flavor_profile)
}

function Mocktail({name, ingredients, garnishes, flavor_profile}) {
    Drink(1, name, ingredients, garnishes, null, flavor_profile)
}

function Shot({name, ingredients, garnishes, flavor_profile}) {
    Drink(2, name, ingredients, garnishes, null, flavor_profile)
}

function Coffee({name, ingredients, garnishes, flavor_profile}) {
    Drink(3, name, ingredients, garnishes, null, flavor_profile)
}

async function create_all() {
    await fetchAndStoreIngredients();
    await fetchAndStoreDrinks();

    delete_all()

    for (const category in drinks) {
        drinks[category].forEach(drink => {
            drink["category"] = category
            Drink(drink)
        });
        
        add_odd_element(idx)
        if (get_flavor_filter().size == 0) {
            add_all_categories(idx)
        }
    }

    /*Cocktail({name: "Edelstoff"})
    Cocktail({name: "Secco", base_spirit: "Wine"})
    Cocktail({name: "Red Wine", base_spirit: "Wine"})
    Cocktail({name: "White Wine", base_spirit: "Wine"})
    Cocktail({name: "Mimosa", ingredients: ["Secco", "Orange Juice"], base_spirit: "Wine"})
    Cocktail({name: "Mojito", ingredients: ["60ml White Rum", "15g Brown Sugar", "½ Lime -> 15ml Lime Juice", "Mint -> ", "Sparkling Water"], garnishes: ["Mint"], base_spirit: "Rum", flavor_profile: ["Fresh", "Citrus"]});
    Cocktail({name: "Cuba Libre", ingredients: ["60ml Brown Rum -> 60ml White Rum", "½ Lime -> 15ml Lime Juice", "Coca Cola -> Soda Stream Cola"], garnishes: ["Lime"], base_spirit: "Rum", flavor_profile: ["Sweet", "Citrus"]});
    Cocktail({name: "Aperol Spritz", ingredients: ["60ml Secco", "30ml Aperol", "Sparkling Water"], garnishes: ["Orange"], base_spirit: "Aperol", flavor_profile: ["Fresh", "Bitter", "Fruity"]})
    Cocktail({name: "Hugo", ingredients: ["60ml Secco", "¼ Lime -> 10ml Lime Juice", "15ml Elderflower sirup", "Sparkling Water"], garnishes: ["Mint"], base_spirit: "Wine", flavor_profile: ["Sweet", "Fresh"]})
    Cocktail({name: "Martini", ingredients:["60ml Gin", "15ml Dry Vermouth -> 15ml Sweet Vermouth -> 15ml Lillet"], garnishes: ["Lemon Twist or Olive"], base_spirit: "Gin", flavor_profile: ["Strong"]});
    Cocktail({name: "Vodka Martini", ingredients: ["60ml Vodka", "15ml Dry Vermouth -> 15ml Sweet Vermouth -> 15ml Lillet"], garnishes: ["Lemon Twist or Olive"], base_spirit: "Vodka", flavor_profile: ["Strong"]});
    Cocktail({name: "Espresso Martini", ingredients: ["Double Espresso", "30ml Coffee Liqueur", "15ml Vodka"], garnishes: ["Coffee Beans"], base_spirit: "Vodka", flavor_profile: ["Strong", "Coffee"]})

    Cocktail({name: "Negroni", ingredients: ["30ml Gin", "30ml Sweet Vermouth", "30ml Campari -> 30ml Aperol"], garnishes: ["Orange"], base_spirit: "Gin", flavor_profile: ["Strong", "Bitter"]})
    Cocktail({name: "Margarita (not made)", ingredients: ["50ml Silver Tequila", "30ml Triple Sec", "30ml Lime Juice"], garnishes: ["Orange"], base_spirit: "Tequila", flavor_profile: ["Strong", "Sour"]})
    Cocktail({name: "Daiquiri", ingredients: ["60ml White Rum -> 60ml Brown Rum", "30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar"], garnishes: ["Lime"], base_spirit: "Rum", flavor_profile: ["Strong", "Citrus"]})
    Cocktail({name: "Penicillin", ingredients: ["60ml Whiskey // (Scotch)", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Honey Sirup -> 30ml Agave Sirup -> 15ml Honey -> 30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar", "Ginger"], garnishes: ["Candied Ginger"], base_spirit: "Whiskey", flavor_profile: ["Sweet", "Ginger"]})
    Cocktail({name: "Moscow Mule", ingredients: ["60ml Vodka", "90ml Ginger Beer -> 90ml Ginger Ale", "½ Lime -> 15ml Lime Juice"], garnishes: ["Lime"], base_spirit: "Vodka", flavor_profile: ["Ginger", "Citrus"]})
    Cocktail({name: "Pisco Sour (not made)", ingredients: ["60ml Pisco", "30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "(1 Egg White)"], garnishes: ["(Angostura Bitters)"], flavor_profile: ["Citrus", "Creamy (if wanted)"]})
    Cocktail({name: "Paloma (not made)", ingredients: ["60ml Blanco Tequila", "30ml Lime Juice", "Grapefruit Soda", "Salt"], garnishes: ["Lime"], base_spirit: "Tequila", flavor_profile: ["Strong", "Sour"]})
    Cocktail({name: "French 75", ingredients: ["30ml Gin", "½ Lemon -> ½ Lime -> 15ml Lemon Juice -> 15ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "90ml Secco"], garnishes: ["Lemon"], base_spirit: "Gin", flavor_profile: ["Citrus", "Bubbly"]})
    Cocktail({name: "Last Word (not made)", ingredients: ["30ml Gin", "30ml Chartreuse", "30ml Lime Juice"]})
    Cocktail({name: "Mai Tai", ingredients: ["60ml Blended Rum -> 60ml Brown Rum -> 60ml White Rum", "30ml Lime Juice", "30ml Orgeat Sirup", "15ml Orange Liqueur", "Mint -> "], garnishes: ["Mint"], base_spirit: "Rum", flavor_profile: ["Strong", "Fruity"]})
    Cocktail({name: "Gimlet (not made)", ingredients: ["60ml London Dry Gin -> 60ml Gin", "30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup"], garnishes: ["Lime"], base_spirit: "Gin", flavor_profile: ["Strong", "Citrus"]})
    Cocktail({name: "Clover Club", ingredients: ["50ml Gin", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Raspberry Sirup", "1 Egg White"], garnishes: [], base_spirit: "Gin", flavor_profile: ["Fruity", "Creamy"]})

    Cocktail({name: "Amaretto Sour (not made)", ingredients: ["50ml Amaretto", "30ml Lemon Juice -> 30ml Lime Juice", "15ml Simple Sirup -> 10g White Sugar -> 10g Brown Sugar -> 15ml Agave Sirup", "1 Egg White"], garnishes: ["Cocktail Cherry", "Angostura Bitters"], base_spirit: "Not specified", flavor_profile: ["Nutty", "Citrus", "Creamy"]})
    Cocktail({name: "Jungle Bird", ingredients: ["50ml Brown Rum -> 50ml White Rum", "20ml Campari -> 20ml Aperol", "15ml Lime Juice", "15ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "50ml Pineapple Juice"], garnishes: [], base_spirit: "Rum", flavor_profile: ["Fruity", "Sweet"]})
    Cocktail({name: "Gin Fizz", ingredients: ["50ml Gin", "60ml Lemon Juice", "30ml Simple Sirup -> 20g White Sugar -> 30g Brown Sugar -> 30ml Agave Sirup", "Sparkling Water"], garnishes: ["Lemon"], base_spirit: "Gin", flavor_profile: ["Strong", "Bubbly"]})
    Cocktail({name: "Piña Colada", ingredients: ["60ml White Rum", "60ml Coconut Cream", "60ml Pineapple Juice"], garnishes: ["Pineapple Leave"], base_spirit: "Rum", flavor_profile: ["Fruity", "Creamy", "Summer"]})
    Cocktail({name: "Corpse Reviver (not made)", ingredients: ["30ml Gin", "30ml Triple Sec", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Lillet -> 30ml Sweet Vermouth", "Absinthe"], garnishes: ["Lemon"], base_spirit: "Gin", flavor_profile: ["Strong", "Citrus"]})
    Cocktail({name: "Zombie (not made)", ingredients: ["30ml White Rum", "30ml Brown Rum", "30ml Apricot Brandy", "15ml Falernum Liqueur", "30ml Lime Juice", "30ml Pineapple Juice", "10ml Grenadine"], garnishes: ["Pineapple", "Cocktail Cherry"], base_spirit: "Rum", flavor_profile: ["Strong", "Fruity"]})
    Cocktail({name: "Bee's Knees", ingredients: ["60ml Gin", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Honey Sirup -> 15ml Honey -> 30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup"], garnishes: ["Lemon"], base_spirit: "Gin", flavor_profile: ["Strong", "Honey"]})
    Cocktail({name: "Gin Basil Smash", ingredients: ["60ml Gin", "30ml Lemon Juice -> 30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "Basil"], garnishes: ["Basil"], base_spirit: "Gin", flavor_profile: ["Strong", "Herbs"]})
    Cocktail({name: "Vesper (not made)", ingredients: ["60ml Gin", "30ml Vodka", "15ml Lillet -> 15ml Sweet Vermouth -> 15ml Dry Vermouth"], garnishes: ["Lemon", "Orange"], base_spirit: "Gin", flavor_profile: ["Strong"]})
    Cocktail({name: "Cosmopolitan (not made)", ingredients: ["50ml Vodka Citron -> 50ml Vodka // (with citron)", "30ml Cointreau", "30ml Lime Juice", "60ml Cranberry Juice"], garnishes: ["Lemon"], base_spirit: "Vodka", flavor_profile: ["Strong", "Citrus", "Fruity"]})
    Cocktail({name: "Bramble (not made)", ingredients: ["60ml Gin", "30ml Lemon Juice", "15ml Simple Sirup -> 10g White Sugar -> 10g Brown Sugar -> 15ml Agave Sirup", "15ml Crème de mûre"], garnishes: ["Lemon", "Blackberries"], base_spirit: "Gin", flavor_profile: ["Strong", "Fruity"]})
    Cocktail({name: "Old Cuban (not made)", ingredients: ["50ml Brown Rum -> 50ml Blended Rum -> 50ml White Rum", "30ml Lime Juice", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "60ml Secco", "Mint", "2 Dashes Angostura Bitters"], garnishes: ["Mint"], base_spirit: "Rum", flavor_profile: ["Fresh", "Bubbly"]})
    Cocktail({name: "Caipirinha (not made)", ingredients: ["60ml Pitu", "1 Lime", "10g White Sugar -> 20ml Simple Sirup -> 10g Brown Sugar -> 20ml Agave Sirup"], garnishes: [], base_spirit: "Not specified", flavor_profile: []})
    Cocktail({name: "Southside (not made)", ingredients: ["60ml Gin", "30ml Simple Sirup -> 20g White Sugar -> 20g Brown Sugar -> 30ml Agave Sirup", "30ml Lime Juice", "Mint"], garnishes: ["Mint"], base_spirit: "Gin", flavor_profile: ["Strong", "Fresh"]})
    Cocktail({name: "French Kiss (not made)", ingredients: ["60ml Gin", "Berries // muddled", "Secco", "Sparkling Water"], garnishes: ["Raspberry", "Lemon Twist"], base_spirit: "Gin", flavor_profile: ["Fruity", "Bubbly"]})
    Cocktail({name: "Passion fruit skinny bitch (not made)", ingredients: ["60ml Vodka", "30ml Lime Juice", "Passion Fruit", "Sparkling Water"], garnishes: ["Passion Fruit"], base_spirit: "Vodka", flavor_profile: ["Fruity", "Bubbly"]})
    Cocktail({name: "Cranberry gin fizz (not made)", ingredients: ["60ml Strawberry Gin -> 60ml Gin", "Strawberry", "Sparkling Water"], garnishes: ["Rosemary"], base_spirit: "Gin", flavor_profile: ["Fruity", "Bubbly", "Herbs"]})
    Cocktail({name: "Sex on the beach (not made)", ingredients: ["40ml Vodka", "20ml Peach Liqueur", "15ml Cranberry Sirup", "15ml Grenadine", "½ Lime -> 15ml Lime Juice", "80ml Orange Juice"], garnishes: ["Cocktail Cherry"], base_spirit: "Vodka", flavor_profile: ["Fruity", "Sweet"]})
    Cocktail({name: "Fence Hopper (not made)", ingredients: ["30ml Whiskey // (Bourbon)", "30ml Apple Cider", "15ml Maple Sirup -> 15ml Honey Sirup -> 15ml Agave Sirup -> 10g Brown Sugar -> 10g White Sugar", "10ml Lemon Juice -> ½ Lemon -> ½ Lime -> 15ml Lime Juice",  "Angostura Bitters", "100ml IPA -> 100ml Beer"], garnishes: ["Cinnamon Stick"], base_spirit: "Whiskey", flavor_profile: ["Fruity", "Cinnamon"]})
    Cocktail({name: "Italien Mule", ingredients: ["50ml Amaretto", "20ml Lime Juice -> ½ Lime -> ½ Lemon -> 15ml Lemon Juice", "Ginger Beer"], garnishes: ["Lemon Twist"], base_spirit: "", flavor_profile: ["Nutty", "Citrus", "Ginger"]})
    Cocktail({name: "Italien Mule (Aperol Version) (not made)", ingredients: ["50ml Aperol", "20ml Lime Juice -> ½ Lime -> ½ Lemon -> 15ml Lemon Juice", "Red Wine", "Ginger Beer"], garnishes: ["Mint"], base_spirit: "Aperol", flavor_profile: ["Citrus", "Ginger", "Mint"]})
    Cocktail({name: "Kigoi Koi (not made)", ingredients: ["60ml Gin", "½ Lemon -> 15ml Lemon Juice -> ½ Lime -> 15ml Lime Juice", "15ml Honey Sirup -> 15ml Agave Sirup -> 10ml Honey -> 15ml Simple Sirup -> 10g White Sugar -> 10g Brown Sugar", "Secco"], garnishes: [], base_spirit: "Gin", flavor_profile: ["Citrus", "Honey", "Bubbly"]})
    Cocktail({name: "Kojito (not made)", ingredients: ["60ml White Rum", "½ Lime -> 15ml Lime Juice Lime -> ½ Lemon -> 15ml Lemon Juice", "30ml Orange Juice", "Ginger Ale -> Ginger Beer"], garnishes: ["Mint"], base_spirit: "Rum", flavor_profile: ["Fruity", "Ginger", "Mint"]})
    Cocktail({name: "Japan Mule (not made)", ingredients: ["60ml Shochu", "½ Lime -> 15ml Lime Juice Lime -> ½ Lemon -> 15ml Lemon Juice", "Ginger Beer", "Yuzu"], garnishes: ["Dried Citrus"], base_spirit: "Other", flavor_profile: ["Strong", "Ginger", "Citrus", "Woody"]})
    Cocktail({name: "Original", ingredients: ["50ml Gin -> 50ml Vodka", "50ml Elderflower Sirup", "50ml Lime Juice -> 50ml Lemon Juice", "Sparkling Water"], garnishes: ["Lime"], base_spirit: "Vodka", flavor_profile: ["Fresh", "Bubbly"]})
    Cocktail({name: "43 Milk", ingredients: ["50ml Licor 43", "50ml Milk"], garnishes: ["(Chocolate Powder)"], base_spirit: "", flavor_profile: ["Creamy"]})
    add_odd_element(0)
    if (get_base_spirits_filter().size == 0) {
        add_all_categories(0)
    }

    /*Mocktail({name: "Brazilian Lemonade (not made)", ingredients:["1 Lime -> 30ml Lime Juice", "15g Brown Sugar -> 15g White Sugar", "100ml Condensed Milk"], garnishes:["Lime"], base_spirit:[], flavor_profile:["Citrus", "Creamy"]})
    Mocktail({name: "Basil Lemonade (not made)", ingredients:["Lime", "Basil", "Mint"], garnishes:["Lime"], base_spirit:[], flavor_profile:["Herbs", "Citrus", "Fresh"]})
    Mocktail({name: "Matcha Tonic", ingredients:["30ml Matcha", "Tonic Water", "(White Sugar)"], garnishes:[], base_spirit:[], flavor_profile:["Herbs", "Bitter", "Fresh"]})
    
    add_odd_element(1)
    if (get_flavor_filter().size == 0) {
        add_all_categories(1)
    }
    Shot({name: "Liquid Cocain (not made)", ingredients:["Licor 43", "Coldbrew"]})
    Shot({name: "Brain (not made)", ingredients:["10ml Vodka", "10ml Lime Juice -> 10ml Lemon Juice", "10ml Baileys"]})
    Shot({name: "Green Tea Shot", ingredients:["10ml Whiskey", "10ml Peach Schnapps -> 10ml Peach Liqueur", "10ml Lime Juice -> 10ml Lemon Juice", "10ml Simple Sirup -> 5g White Sugar -> 10ml Agave Sirup"]})
    
    add_odd_element(2)
    if (get_flavor_filter().size == 0) {
        add_all_categories(2)
    }

    Coffee({name: "Espresso", ingredients: ["Double Espresso", "(Brown Sugar)"], garnishes: ["Amaretti"], base_spirit: ["Coffee"], flavor_profile: ["Strong"]})
    Coffee({name: "Espresso Macchiato", ingredients: ["Double Espresso", "Steamed Milk", "(Brown Sugar)"], garnishes: ["Amaretti"], base_spirit: ["Coffee"], flavor_profile: ["Strong", "Creamy"]})
    Coffee({name: "Americano", ingredients: ["Espresso", "Water"], garnishes: ["Coffee"], base_spirit: [], flavor_profile: []})
    Coffee({name: "Aeracano", ingredients: ["Espresso", "Water"], garnishes: ["Coffee", "Creamy"], base_spirit: [], flavor_profile: []})
    Coffee({name: "Cappuccino", ingredients: ["Double Espresso", "Milk // (Hot)", "Steamed Milk", "(Brown Sugar)"], garnishes: ["Coffee", "Creamy"], base_spirit: [], flavor_profile: []})
    Coffee({name: "Latte Macchiato", ingredients: ["Double Espresso", "Steamed Milk", "(Brown Sugar)"], garnishes: ["Coffee", "Creamy", "Milky"], base_spirit: [], flavor_profile: []})
    Coffee({name: "Adultuccino", ingredients: ["Double Espresso", "Chocolate Powder", "Steamed Milk"], garnishes: ["Coffee", "Chocolate", "Creamy"], base_spirit: [], flavor_profile: []})
    Coffee({name: "Chococino", ingredients: ["Double Espresso", "Chocolate Powder", "Steamed Milk"], garnishes: ["Coffee", "Chocolate", "Creamy"], base_spirit: [], flavor_profile: []})
    Coffee({name: "Hot Chocolate", ingredients: ["Chocolate Powder", "(Steamed) Milk"], garnishes: ["Chocolate Powder"], base_spirit: ["Chocolate"], flavor_profile: ["Creamy"]})
    Coffee({name: "Dalgona Coffee", ingredients: ["Double Espresso", "Brown Sugar", "Milk"], garnishes: ["Coffee", "Sweet", "Creamy"], base_spirit: [], flavor_profile: []})
    Coffee({name: "Creme Brule Coldbrew", ingredients: ["Coldbrew", "Cream", "Milk", "Brown Sugar"], garnishes: ["Coffee", "Sweet", "Creamy"], base_spirit: [], flavor_profile: []})
    
    add_odd_element(3)
    
    if (get_flavor_filter().size == 0) {
        add_all_categories(3)
    }*/

    if (get_flavor_filter().size == 0) {
        add_all_base_spirits()
    }

    console.log(missing)
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