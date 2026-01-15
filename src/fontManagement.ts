import crypto from "node:crypto";

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type FontStyle = "normal" | "italic";
export type FontFormat = "ttf" | "otf" | "woff";
export interface Font {
  data: Buffer;
  name: string;
  weight?: FontWeight;
  style?: FontStyle;
  lang?: string;
  format: FontFormat;
  filePath: string;
}

const fontPool: Record<string, Font> = {};
function toHash(font: Font) {
  let data = font.data;
  if (data instanceof ArrayBuffer) {
    data = Buffer.from(data);
  }
  return crypto.createHash("sha256").update(data).digest("hex");
}
export default {
  addFont(fonts: Font[]) {
    (async () => {
      for (const font of fonts) {
        fontPool[toHash(font)] = font;
      }
    })();
  },
  removeFont(fonts: Font[]) {
    (async () => {
      for (const font of fonts) {
        delete fontPool[toHash(font)];
      }
    })();
  },
  getFonts(formats: FontFormat[]) {
    const fonts: Font[] = [];
    for (const hash in fontPool) {
      const font = fontPool[hash];
      if (formats.includes(font.format)) {
        fonts.push(font);
      }
    }
    return fonts;
  },
};
