// Input: a raw number of seconds (int)
// Output: a zero-padded number of hours (str), and a zero-padded number of minutes (str).

function seconds_to_hhmm(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - (hours * 3600)) / 60);

    return [pad(hours, 2), pad(minutes, 2)];
}

function pad(input, desiredLength= 2) {
    input = input.toString();
    while (input.length < desiredLength) {
        input = "0" + input;
    }

    return input;
}

export default seconds_to_hhmm;
export {pad};
