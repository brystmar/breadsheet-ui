# Breadsheet Coding Style Guide

## CSS
This project uses [SASS](https://sass-lang.com/) instead of vanilla CSS.  Organizing styles using a visual, indented hierarchy is key to writing clear, maintainable code in stylesheets.

### Sections
Separate sections of code with headers wrapped in a triple-asterisk comment syntax.  Add two blank lines before this comment, and one blank line after.

Yes:
```
/*** Fonts ***/

$font-stack-primary: "Noto Sans", "IBM Plex Sans", "Roboto", sans-serif
$font-stack-secondary: "Roboto Slab", serif
$font-stack-mono: "Roboto Mono", "Courier New", monospace


/*** Buttons ***/

.btn
  height: 2.5em
  width: 7em
  text-align: center
  margin: 0
  border-radius: 0.2em
```

No:
```
/*** Fonts ***/
$font-stack-primary: "Noto Sans", "IBM Plex Sans", "Roboto", sans-serif
$font-stack-secondary: "Roboto Slab", serif
$font-stack-mono: "Roboto Mono", "Courier New", monospace

/* Buttons */
.btn
  height: 2.5em
  width: 7em
  text-align: center
  margin: 0
  border-radius: 0.2em
```

### Variables
Define all variables at the top, organized in these sections:
* Fonts
* Color palette
* Layout defaults

Variable names should:
* Be descriptive
* Only use lowercase letters
* Separate multi-word names with hyphens
* Put the operative word first:

Yes:
```
$color-primary: #c7c1ab
$color-primary-lighter: #ecece8
$color-accent: #935614
$color-accent-lighter: #dbb37e
$color-accent-darker: #612c00
```

No:
```
$primary-color: #c7c1ab
$primary-color-lighter: #ecece8
```

Letters in hex codes should be lowercase.

### Multiple Classes
When applying the same styles to multiple classes/elements, list each on its own line.

Yes:
```
.btn,
.select,
.input
  border: 1px solid $color-border
```
No:
```
.btn, .select, .input
  border: 1px solid $color-border

```

### Hierarchy
When styling sections of code underneath a parent element (container, article, section, etc.), nest and indent children under their parent element.  No line breaks above or below child classes.

Example:
```
.add-recipe-container
  width: 100%
  background: $color-primary
  text-align: left
  padding: 1em
  margin-top: 0.5em
  border-radius: 3px
  display: flex
  flex-direction: column
  .add-recipe-form
    background: $color-accent
    padding: 1em
    display: flex
    flex-direction: column
    justify-content: center
    .button-group
      text-align: left
```

------

## React
### General Coding Style
* Separate functional blocks of code with line breaks
* Add comments above new functional blocks of code
* Separate business logic from the UI elements when possible 
* Prefer functional components over class-based components
* Use double quotes for strings wherever possible
* Use self-closing tags wherever possible

### JSX
Each JSX tag should be on its own line.

Props for JSX elements can be written inline when there are 2 (or fewer) props which don't exceed the max line length.
 
For JSX elements with 3+ props, give each prop its own line.  The first prop should always be inline with the opening HTML tag.

The closing `>` or `/>` for a JSX element should immediately follow the last prop on the same line.

Yes:
```
<select className="input picklist"
        name="difficulty"
        id="difficulty"
        value={recipe.difficulty}
        onChange={handleChange}
        required={true}>
```

No:
```
<select
    className="input picklist"
    name="difficulty"
    id="difficulty"
    value={recipe.difficulty}
    onChange={handleChange}
    required={true}
>
```

Entire tags (including their children) that fit on a single line without exceeding the max line length can be written on a single line.

Yes:
```
<option value="Beginner">Beginner</option>
<option value="Intermediate">Intermediate</option>
<option value="Advanced">Advanced</option>
<option value="Iron Chef">Iron Chef</option>
```

### JavaScript
* Use ES6 syntax, such as arrow functions, over legacy syntax.
* Use double quotes for strings.
* Concatenate strings using \`backticks\` where possible.

### File Naming Conventions
Component names should:
 * Be descriptive
 * Not use punctuation (no spaces, hyphens, underscores, etc.)
 * Have the first letter of each word capitalized

#### Prefixes
When creating a component which returns a user-facing HTML tag as the parent element, use the following name prefixes:

HTML Element|Prefix
|-----------|------|
`<header>`|Header
`<nav>`|Nav
`<footer>`|Footer
`<button>`|Btn
`<form>`|Form
`<label>`|Label
`<select>`|Picklist
`<textarea>`|Txt
`<input type="text">`|Txt
`<input type="number">`|Num

#### Word Order
When using a verb in the filename, the verb should be the first word (after any prefix).

Yes:
```
ConvertText.js
BtnAddStep.js
```

No:
```
TextConvert.js
AddStepBtn.js
```

### Folders
React components go in the `/src/components/` folder.

Whenever there are more than 2 components which are logically similar, create a folder for them.

Yes:
```
/src/components/buttons/BtnAdd.js
/src/components/buttons/BtnSubmit.js
/src/components/buttons/BtnSubtract.js
```

No:
```
/src/components/BtnAdd.js
/src/components/BtnSubmit.js
/src/components/BtnSubtract.js
```

Vanilla JS functions should be grouped into logically separated files and saved in the `/src/scripts/` folder.
