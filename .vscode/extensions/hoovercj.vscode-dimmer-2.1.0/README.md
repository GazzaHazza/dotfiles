# vscode-dimmer 

## Features

Dims text outside of selections by reducing the opacity of the text. Supports multiple selections.

Set a keybinding for `dimmer.ToggleDimmer`, search `Toggle Dimmer` in the command palette, or use the `dimmer.enabled` setting.

By default the extension will dim all lines that don't have an extension. Use the `dimmer.context` setting to leave N lines before and after un-dimmed. Setting it a negative number will dim everything but the selection.

`dimmer.when` controls when to dim the editors. The default value is `always`, but setting it to `selection` will only dim an editor when it has a non-empty selection.

![Context](https://github.com/hoovercj/vscode-dimmer/raw/master/images/context.gif)  

## Configuration

```
"dimmer.enabled": {
    "default": false,
    "description": "When set to true, the extension will dim non-selected text."
},
"dimmer.toggleDimmerCommandScope": {
    "defualt": "user",
    "description": "Decides whether the `ToggleDimmer` command will affect the user (global) or workspace (local) settings."
},
"dimmer.opacity": {
    "default": 50,
    "description": "An integer between 0 and 100 used for the opacity percentage for the dimmed (non-selected) text."
},
"dimmer.context": {
    "default": 0,
    "description": "Number of lines before and after the current line that are not dimmed. 0 will dim everything but lines with a selection and a negative number will dim everything except the curent selection. Defaults to 0."
},
"dimmer.when": {
    "default": "always",
    "description": "Decides whether the extension should always dim editors or if it should dim an editor only when there is a non-empty selection." 
},
"dimmer.delay": {
    "default": 0,
    "description": "Delay in milliseconds for dimming the non-selected text to reduce number of API calls in the event of rapid selection changes. Defaults to 0, but set higher if it feels like it is causing problems."
}
```
### 2.1.0
- Feature: `dimmer.when` setting allows dimming only when editors have non-empty selections

### 2.0.0
- Bux fix: Dim on editor change (e.g. ctrl+tab). Thanks @roblourens
- Feature: Highlight context (n lines before/after). Thanks @rebornix
- Breaking: `dimmer.dimSelectedLines` has been replaced by `dimmer.context`. 

### 1.0.0

Initial release