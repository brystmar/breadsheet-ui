function replace_text(text, replacement_list) {
    // Accepts a text string and a list of object replacements (old & new values)
    // Returns a modified string
    // console.log("Starting replace_text:", text, replacement_list);
    let count = 0;

    for (let i = 0; i <= replacement_list.length - 1; i++) {
        // console.log("Working on:", replacement_list[i]['old']);
        // Escape
        if (replacement_list[i]['old'].substr(0,1) === "?") {
            replacement_list[i]['old'] = '\u005C\u005C' + replacement_list[i]['old'].substr(1);
        }

        count = 0;
        while (text.search(replacement_list[i]['old']) !== -1 && count < 1000) {
            text = text.replace(replacement_list[i]['old'], replacement_list[i]['new']);
            count += 1;
        }
    }

    // console.log("Ending replace_text:", text);
    return text;
}

export default replace_text;
