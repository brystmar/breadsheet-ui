// Helper functions for the text conversion components

export function convert_text_using_provided_list(text, replacementList) {
    // Accepts a text string and a list of object replacements (old & new values)
    // Returns a modified string

    if (!replacementList) {
        return text;
    }

    for (let i = 0; i <= replacementList.length - 1; i++) {
        // console.log("Working on:", replacement_list[i]['old']);
        text = text.split(replacementList[i]['old']).join(replacementList[i]['new']);
    }

    return text;
}

export function format_text_replacement_list_items(inputArray) {
    // To make whitespace replacements easier to identify, this function replaces:
    //   spaces with ·
    //   newlines with ¶
    //   tabs with ⇥

    if (inputArray === []) {
        return []
    }

    // For visibility, replace all spaces with · and newlines with ¶
    let output = [], updatedFind, updatedReplace;

    // For each item in the array...
    for (let i = 0; i < inputArray.length; i++) {
        updatedFind = "";
        updatedReplace = "";

        // Replace these characters in the 'find' column
        for (let j = 0; j < inputArray[i]['old'].length; j++) {
            if (inputArray[i]['old'][j] === " ") {
                updatedFind += String.fromCharCode(183);
            } else if (inputArray[i]['old'][j] === "\n") {
                updatedFind += String.fromCharCode(182);
            } else if (inputArray[i]['old'][j] === "\t") {
                updatedFind += String.fromCharCode(8677);
            } else {
                updatedFind += inputArray[i]['old'][j];
            }
        }

        // Ditto for the 'replace' column
        for (let k = 0; k < inputArray[i]['new'].length; k++) {
            if (inputArray[i]['new'][k] === " ") {
                updatedReplace += String.fromCharCode(183);
            } else if (inputArray[i]['new'][k] === "\n") {
                updatedReplace += String.fromCharCode(182);
            } else if (inputArray[i]['new'][k] === "\t") {
                updatedReplace += String.fromCharCode(8677);
            } else {
                updatedReplace += inputArray[i]['new'][k];
            }
        }

        // Append to the array
        output.push({ old: updatedFind, new: updatedReplace });
    }

    return output;
}
