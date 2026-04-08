const mealkits = [
    {
        title: "Chicken Adobo Classic",
        includes: "with Garlic Fried Rice & Boiled Eggs",
        description: "A Filipino staple: chicken simmered in soy sauce, vinegar, and plenty of garlic.",
        category: "Classic Meals",
        price: 18.99,
        cookingTime: 45,
        servings: 2,
        imageUrl: "/images/chicken-adobo.jpg",
        featuredMealKit: true
    },
    {
        title: "Pork Sinigang",
        includes: "with Steamed Jasmine Rice & Fish Sauce Dip",
        description: "A sour tamarind-based soup with tender pork and garden vegetables.",
        category: "Classic Meals",
        price: 20.50,
        cookingTime: 50,
        servings: 2,
        imageUrl: "/images/pork-sinigang.jpg",
        featuredMealKit: true
    },
    {
        title: "Beef Pares",
        includes: "with Garlic Rice & Clear Beef Broth",
        description: "Braised beef brisket in a sweet and salty soy-based sauce.",
        category: "Classic Meals",
        price: 22.99,
        cookingTime: 60,
        servings: 2,
        imageUrl: "/images/beef-pares.webp",
        featuredMealKit: false
    },
    {
        title: "Lechon Kawali",
        includes: "with Achara (Pickled Papaya) & Liver Sauce",
        description: "Crispy deep-fried pork belly that's crunchy on the outside and juicy inside.",
        category: "Classic Meals",
        price: 24.00,
        cookingTime: 40,
        servings: 2,
        imageUrl: "/images/lechon-kawali.jpg",
        featuredMealKit: false
    },
    {
        title: "Mushroom Bicol Express",
        includes: "with Brown Rice & Coconut Cream Sauce",
        description: "A spicy vegan twist on the classic, using mushrooms and coconut milk.",
        category: "Vegan Meals",
        price: 17.50,
        cookingTime: 30,
        servings: 2,
        imageUrl: "/images/vegan-bicol.jpg",
        featuredMealKit: true
    },
    {
        title: "Tofu Sisig",
        includes: "with Citrus Calamansi & Grilled Onions",
        description: "A sizzling, savory dish made with crispy tofu and spicy peppers.",
        category: "Vegan Meals",
        price: 16.99,
        cookingTime: 25,
        servings: 2,
        imageUrl: "/images/tofu-sisig.jpg",
        featuredMealKit: false
    }
];

module.exports.getAllMealKits = function(){
    return mealkits;
}

module.exports.getFeaturedMealKits = function(mealkitsArray) {
    let featured = [];
    mealkitsArray.forEach(element => {
        if (element.featuredMealKit) {
            featured.push(element);
        }
    });
    return featured;
}

module.exports.getMealKitsByCategory = function(mealkitsArray) {
    let resultByGroup = [];
    mealkitsArray.forEach(meal => {
        let found = false;

        resultByGroup.forEach(group => {
            if (group.categoryName === meal.category) {
                group.mealKits.push(meal);
                found = true;
            }
        });

        if (!found) {
            resultByGroup.push({
                categoryName: meal.category,
                mealKits: [meal]
            })
        }
    });
    return resultByGroup;
}