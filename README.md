Exported methods:

- createText(Text)
- sendText(Text)
- createText([Text])
- sendText([Text])
- createStyle(Text)
- createClickEvent(ClickEvent)
- createHoverEvent(HoverEvent)

For a message to have multiple styles, you will need to pass an array of Text into createText/sendText.

## Type definitions

### Text

All fields optional

> A **Style** is a **Text** without content.

```js
Text: {
  content: String,
  bold: boolean,
  italic: boolean,
  obfuscated: boolean,
  strikethrough: boolean,
  underlined: boolean,
color: Color,
  shadow: Integer, // strength of shadow, can be negative
  font: String or net.minecraft.util.Identifier,

  click: ClickEvent,
  hover: HoverEvent
}
```

### Color

Either one of

- Integer (RGB/HEX colour)
- Hex in format: `"#abcdef"`
- Formatting
- TextColor
- null

### ClickEvent

Either one of

- `{ page: Integer }` (ChangePage)
- `{ copy: String }` (CopyToClipboard)
- `{ file: String }` (OpenFile)
- `{ url: String }` (OpenUrl)
- `{ run: String }` (RunCommand, no `/` in front)
- `{ suggest: String }` (SuggestCommand)

Or shorthand

- `"/your command here"` (RunCommand)
- `"http://example.com"` or `"https://example.com"` (OpenUrl)

### HoverEvent

Either one of

- `{ entity: HoverEvent.EntityContent }` (ShowEntity)
- `{ item: net.minecraft.item.ItemStack }` (ShowItem)
- `{ text: net.minecraft.text.Text }`

Or shorthand

- `"any string"`
- `[Text]` (as defined above)
