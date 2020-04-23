// Helper functions related to the text conversion component

function convert_text_using_provided_list(text, replacement_list) {
    // Accepts a text string and a list of object replacements (old & new values)
    // Returns a modified string

    for (let i = 0; i <= replacement_list.length - 1; i++) {
        // console.log("Working on:", replacement_list[i]['old']);
        text = text.split(replacement_list[i]['old']).join(replacement_list[i]['new']);
    }

    // console.log("Ending convert_text_using_provided_list:", text);
    return text;
}

function format_text_replacement_list_items(text) {
    let output = text;
    output.toString();
    return output;
}

export default convert_text_using_provided_list;
export {format_text_replacement_list_items};
