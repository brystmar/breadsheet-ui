// Helper functions related to the text conversion component

function convert_text_using_provided_list(text, replacement_list) {
    // Accepts a text string and a list of object replacements (old & new values)
    // Returns a modified string

    if (!replacement_list) {
        return text;
    }

    for (let i = 0; i <= replacement_list.length - 1; i++) {
        // console.log("Working on:", replacement_list[i]['old']);
        text = text.split(replacement_list[i]['old']).join(replacement_list[i]['new']);
    }

    // console.log("Ending convert_text_using_provided_list:", text);
    return text;
}

function format_text_replacement_list_items(inputArray) {
    // To make whitespace replacements easier to identify, this function replaces:
    //   spaces with ·
    //   newlines with ¶
    //   tabs with ⇥

    if (inputArray === []) {

        return {}
    }

    // For visibility, replace all spaces with · and newlines with ¶
    let output = [];
    let updated_old = "";
    let updated_new = "";
    // ⟶ LONG RIGHTWARDS ARROW, Unicode: U+27F6, UTF-8: E2 9F B6

    // For each item in the array...
    for (let i = 0; i < inputArray.length; i++) {
        updated_old = "";
        updated_new = "";

        // Replace these characters in the 'find' column
        for (let j = 0; j < inputArray[i]['old'].length; j++) {
            if (inputArray[i]['old'][j] === " ") {
                updated_old += String.fromCharCode(183);
            } else if (inputArray[i]['old'][j] === "\n") {
                updated_old += String.fromCharCode(182);
            } else if (inputArray[i]['old'][j] === "\t") {
                updated_old += String.fromCharCode(8677);
            } else {
                updated_old += inputArray[i]['old'][j];
            }
        }

        // Ditto for the 'replace' column
        for (let k = 0; k < inputArray[i]['new'].length; k++) {
            if (inputArray[i]['new'][k] === " ") {
                updated_new += String.fromCharCode(183);
            } else if (inputArray[i]['new'][k] === "\n") {
                updated_new += String.fromCharCode(182);
            } else if (inputArray[i]['new'][k] === "\t") {
                updated_new += String.fromCharCode(8677);
            } else {
                updated_new += inputArray[i]['new'][k];
            }
        }

        // Append to the array
        output.push({old: updated_old, new: updated_new});
    }
    return output;
}

export {convert_text_using_provided_list, format_text_replacement_list_items};
