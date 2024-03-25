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

    let idx = 0

    for (const category in drinks) {
        drinks[category].forEach(drink => {
            drink["category"] = category
            Drink(drink)
        });
        
        add_odd_element(idx)
        if (get_flavor_filter().size == 0) {
            add_all_categories(category)
        }

        idx++
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