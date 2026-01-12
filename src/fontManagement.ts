export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type FontStyle = "normal" | "italic";
export type FontFormat = "ttf" | "otf" | "woff";
export interface Font {
  data: Buffer | ArrayBuffer;
  name: string;
  weight?: FontWeight;
  style?: FontStyle;
  lang?: string;
  format: FontFormat;
  filePath: string;
}

const fontPool: Font[] = [];
export default {
  addFont(fonts: Font[]) {
    fontPool.push(...fonts);
  },
  removeFont(fonts: Font[]) {
    fonts.forEach((font) => {
      const index = fontPool.indexOf(font);
      if (index === -1) {
        return;
      }
      fontPool.splice(index, 1);
    });
  },
  getFonts(formats: FontFormat[]) {
    return fontPool.filter((font) => formats.includes(font.format));
  },
};
