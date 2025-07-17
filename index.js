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

// missings fields in yarn mappings for some reason
// so had to use raw field names
function createClickEvent(ev = {}) {
    if (ClickEvent.ChangePage != undefined) {
        if (typeof ev == "string") {
            if (ev.startsWith("/"))
                return new ClickEvent.RunCommand(ev.slice(1));
            if (ev.startsWith("http://") || ev.startsWith("https://"))
                return new ClickEvent.OpenUrl(new URI(ev));
        }

        if (ev.page) return new ClickEvent.ChangePage(ev.page);
        if (ev.copy) return new ClickEvent.CopyToClipboard(ev.copy);
        if (ev.file) return new ClickEvent.OpenFile(ev.file);
        if (ev.url)
            return new ClickEvent.OpenUrl(
                typeof ev.url == "string" ? new URI(ev.url) : ev.url,
            );
        if (ev.run) return new ClickEvent.RunCommand(ev.run);
        if (ev.suggest) return new ClickEvent.SuggestCommand(ev.suggest);
    } else if (
        ClickEvent.Action != undefined &&
        ClickEvent.Action.field_11748 != undefined
    ) {
        if (typeof ev == "string") {
            if (ev.startsWith("/"))
                return new ClickEvent(ClickEvent.Action.field_11750, ev);
            if (ev.startsWith("http://") || ev.startsWith("https://"))
                return new ClickEvent(ClickEvent.Action.field_11749, ev);
        }

        if (ev.page)
            return new ClickEvent(ClickEvent.Action.field_11748, ev.page);
        if (ev.copy)
            return new ClickEvent(ClickEvent.Action.field_21462, ev.copy);
        if (ev.file)
            return new ClickEvent(ClickEvent.Action.field_11746, ev.file);
        if (ev.url)
            return new ClickEvent(
                ClickEvent.Action.field_11749,
                new URI(ev.url),
            );
        if (ev.run)
            return new ClickEvent(ClickEvent.Action.field_11750, `/${ev.run}`);
        if (ev.suggest)
            return new ClickEvent(ClickEvent.Action.field_11745, ev.suggest);
    }
}

function createHoverEvent(ev = {}) {
    if (HoverEvent.ShowText != undefined) {
        if (typeof ev == "string") {
            return new HoverEvent.ShowText(Text.literal(ev));
        }
        if (ev.content || Array.isArray(ev)) {
            return new HoverEvent.ShowText(createText(ev));
        }

        if (ev.entity) return new HoverEvent.ShowEntity(ev.entity);
        if (ev.item) return new HoverEvent.ShowItem(ev.item);
        if (ev.text) {
            if (typeof ev.text == "string") {
                return new HoverEvent.ShowText(Text.literal(ev.text));
            }
            if (ev.text.content || Array.isArray(ev)) {
                return new HoverEvent.ShowText(createText(ev.text));
            }

            return new HoverEvent.ShowText(ev.text);
        }
    } else if (
        HoverEvent.Action != undefined &&
        HoverEvent.Action.field_24342 != undefined
    ) {
        if (typeof ev == "string") {
            return new HoverEvent(
                HoverEvent.Action.field_24342,
                Text.literal(ev),
            );
        }
        if (ev.content) {
            return new HoverEvent(
                HoverEvent.Action.field_24342,
                createText(ev),
            );
        }

        if (ev.entity)
            return new HoverEvent(HoverEvent.Action.field_24344, ev.entity);
        if (ev.item)
            return new HoverEvent(HoverEvent.Action.field_24343, ev.item);
        if (ev.text) {
            if (typeof ev.text == "string") {
                return new HoverEvent(
                    HoverEvent.Action.field_24342,
                    Text.literal(ev.text),
                );
            }
            if (ev.text.content) {
                return new HoverEvent(
                    HoverEvent.Action.field_24342,
                    createText(ev.text),
                );
            }

            return new HoverEvent(HoverEvent.Action.field_24342, ev.text);
        }
    }
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

    if (chunk.click) {
        let click = createClickEvent(chunk.click);
        if (click) style = style.withClickEvent(click);
    }
    if (chunk.hover) {
        let hover = createHoverEvent(chunk.hover);
        if (hover) style = style.withHoverEvent(hover);
    }

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

function getString(textObj) {
    return textObj.getString().replaceAll(/§./g, "");
}

module.exports = {
    createText,
    createStyle,
    createClickEvent,
    createHoverEvent,
    sendText,
    getString,
};
