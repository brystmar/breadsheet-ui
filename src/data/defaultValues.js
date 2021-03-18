export const defaultRecipe = {
    name:       "",
    difficulty: "Beginner",
    author:     "",
    source:     "",
    url:        ""
}

export const defaultStep = {
    number:     1,
    text:       "",
    thenWaitHH: 0,
    thenWaitMM: 0,
    note:       ""
}

export const defaultTextConversionState = {
    ingredients: [],
    directions:  [],
    hasData:     false
}

export const defaultConvertTextState = {
    inputIngredients:  "",
    inputDirections:   "",
    outputIngredients: "",
    outputDirections:  "",
    textRows:          8,
    textCols:          8
}

export const convertTextPlaceholder = {
    inputIngredients:  "2.25 grams yeast\n1 1/2 teaspoons table salt...",
    outputIngredients: "2¼ g yeast\n1½ tsp table salt...",
    inputDirections:   "Preheat the oven to 350 degrees.\n\n" +
                           "Meanwhile, melt 3 tablespoons butter in a 12-inch skillet over medium heat...",
    outputDirections:  "Preheat the oven to 350°.\n\n" +
                           "Meanwhile, melt 3 tbsp butter in a 12\" skillet over **medium** heat...",
}

export const defaultConversionListContainerState = {
    searchString: "",
    scope:        "ingredients",
    isCollapsed:  true
}
