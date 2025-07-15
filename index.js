// [
//   "Hello",
//   {
//     content: "Text",
//     bold: true,
//     italic: true,
//     obfuscated: true,
//     strikethrough: true,
//     underlined: true,
//     color: _,
//     shadow: true,
//     font: _,
//     click: _,
//     hover: _,
//   }
// ]

let { URI } = Packages.java.net;
let { Text, Style, ClickEvent, HoverEvent } = Yarn.net.minecraft.text;
let { Identifier } = Yarn.net.minecraft.util;

let client = Yarn.net.minecraft.client.MinecraftClient.getInstance();

function createClickEvent(ev = {}) {
    if (typeof ev == "string") {
        if (ev.startsWith("/")) return new ClickEvent.RunCommand(ev.slice(1));
        if (ev.startsWith("http://") || ev.startsWith("https://"))
            return new ClickEvent.OpenUrl(ev);
    }

    if (ev.page) return new ClickEvent.ChangePage(ev.page);
    if (ev.copy) return new ClickEvent.CopyToClipboard(ev.copy);
    if (ev.file) return new ClickEvent.OpenFile(ev.file);
    if (ev.url) return new ClickEvent.OpenUrl(new URI(ev.url));
    if (ev.run) return new ClickEvent.RunCommand(ev.run);
    if (ev.suggest) return new ClickEvent.SuggestCommand(ev.suggest);
}

function createHoverEvent(ev = {}) {
    if (typeof ev == "string") {
        return new HoverEvent.ShowText(Text.literal(ev));
    }
    if (ev.content) {
        return new HoverEvent.ShowText(createText(ev));
    }

    if (ev.entity) return new HoverEvent.ShowEntity(ev.entity);
    if (ev.item) return new HoverEvent.ShowItem(ev.item);
    if (ev.text) return new HoverEvent.ShowText(ev.text);
}

function createStyle(chunk = {}) {
    let style = Style.EMPTY;

    if (chunk.bold) style = style.withBold(true);
    if (chunk.italic) style = style.withItalic(true);
    if (chunk.obfuscated) style = style.withObfuscated(true);
    if (chunk.strikethrough) style = style.withObfuscated(true);
    if (chunk.underlined) style = style.withUnderline(true);
    if (chunk.color) {
        let color = chunk.color;
        if (typeof color == "string" && color.startsWith("#")) {
            color = parseInt(color.slice(1), 16);
        }
        style = style.withColor(color);
    }

    if (style.withShadowColor && chunk.shadow) {
        let color = chunk.shadow;
        if (typeof color == "string" && color.startsWith("#")) {
            color = parseInt(color, 16);
        }
        style = style.withShadowColor(color);
    }

    if (chunk.font) {
        let ident = chunk.font;
        if (typeof ident == "string") {
            ident = Identifier.tryParse(ident);
        }
        style = style.withFont(ident);
    }

    if (chunk.click)
        style = style.withClickEvent(createClickEvent(chunk.click) ?? null);
    if (chunk.hover)
        style = style.withHoverEvent(createHoverEvent(chunk.hover) ?? null);

    return style;
}

function createText(text = []) {
    if (!Array.isArray(text)) {
        text = [text];
    }

    let builder = Text.empty();

    for (let chunk of text) {
        switch (typeof chunk) {
            case "string":
            case "number":
            case "bigint":
            case "boolean":
            case "symbol":
            case "undefined":
                chunk = {
                    content: `${chunk}`,
                };
                break;
            case "object":
                if (chunk.getClass != undefined) {
                    builder.append(chunk);
                    continue;
                }
                break;
            case "function":
                throw new Error("A function does not represent a text.");
        }

        if (chunk.content == undefined) {
            continue;
        }

        let current = Text.literal(chunk.content).setStyle(createStyle(chunk));
        builder = builder.append(current);
    }

    return builder;
}

function sendText(text = []) {
    let created = createText(text);
    if (client.player != null) {
        client.inGameHud.getChatHud().addMessage(created);
    }
}

module.exports = {
    createText,
    createStyle,
    createClickEvent,
    createHoverEvent,
    sendText,
};
