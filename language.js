

function update_language() {
    let userLanguage = navigator.language || navigator.userLanguage;
    userLanguage = userLanguage.split("-")[0]
    console.log("Set Language to:")
    console.log(userLanguage)
    fetchAndStoreLanguages()
        .then(languages => {
            // languages will now contain the actual data after successful fetch
            if (!languages.hasOwnProperty(userLanguage)) {
                userLanguage = "en"
            }
            language = languages[userLanguage];
            console.log(language);
            for (const key in language) {
                if (typeof(language[key]) != "object") {
                    const elements = document.querySelectorAll(`#${key}`); // Use querySelectorAll to get all elements

                    if (elements.length > 0) {
                        for (const element of elements) {
                            element.textContent = language[key];
                        }
                    } else {
                        console.info(`Element with ID "${key}" not found.`);
                    }
                }
            }
        })
        .catch(error => console.error(error));  // Handle errors from fetchLanguages
}