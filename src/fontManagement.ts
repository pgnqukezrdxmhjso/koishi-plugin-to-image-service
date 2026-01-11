export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
export type FontStyle = "normal" | "italic";
export type FontSupport = "satori";
export interface Font {
  data: Buffer | ArrayBuffer;
  name: string;
  weight?: FontWeight;
  style?: FontStyle;
  lang?: string;
  supports: FontSupport[];
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
  getFonts(support: FontSupport) {
    return fontPool.filter((font) => font.supports.includes(support));
  },
};
