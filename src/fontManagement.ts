import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import {
  BeanHelper,
  Files,
  Strings,
} from "koishi-plugin-rzgtboeyndxsklmq-commons";

import FontKit from "fontkit";

import type { Config } from "./config";
import ConsoleEx from "./consoleEx";

export namespace FontManagement {
  export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  export type FontFormat = "ttf" | "otf" | "woff" | "woff2";
  export type ColrVer = 0 | 1;
  export interface FontFile {
    filePath: string;
    format: FontFormat;
    data: Buffer;
  }
  export interface Font {
    family: string;
    name: string;
    weight: FontWeight;
    italic: boolean;
    variable: boolean;
    colrVer?: FontManagement.ColrVer;
    characterCount: number;
    ligatureCount: number;
    filePath: string;
    format: FontFormat;
    data: Buffer;
    dataSize: number;
    hash: string;
  }
  export interface Family {
    family: string;
    totalDataSize: number;
    members: Font[];
  }
}
export class FontManagement extends BeanHelper.BeanType<Config> {
  readonly FontExt: FontManagement.FontFormat[] = [
    "ttf",
    "otf",
    "woff",
    "woff2",
  ];

  readonly defaultFontDir = path.resolve(__dirname, "../assets/font");
  defaultFonts: FontManagement.Font[];
  readonly defaultEmojiFontFile = path.resolve(
    __dirname,
    "../assets/TwemojiCOLRv0.ttf",
  );
  defaultEmojiFont: FontManagement.Font;

  fontPool: Record<string, FontManagement.Font> = {};

  private consoleEx: ConsoleEx = this.beanHelper.instance(ConsoleEx);

  async start() {
    await this._loadFontDir([this.defaultFontDir], true);
    this.defaultEmojiFont = this.parseFont(
      await this.parseFontFile(this.defaultEmojiFontFile),
    );

    await this.loadConfig();
  }

  async loadConfig() {
    const config = this.config.font;
    if (Strings.isNotBlank(config?.dir)) {
      await this.loadFontDir([
        path.isAbsolute(config.dir)
          ? config.dir
          : path.resolve(this.ctx.baseDir, config.dir),
      ]);
    }
  }

  ext(filePath: string) {
    return path.extname(filePath)?.toLowerCase().replace(/^\./g, "");
  }

  private async parseFontFile(
    filePath: string,
  ): Promise<FontManagement.FontFile> {
    const ext = this.ext(filePath);
    if (!this.FontExt.includes(ext as any)) {
      return null;
    }

    return {
      filePath,
      format: ext as any,
      data: await fs.readFile(filePath),
    };
  }

  parseFont(fontFile: FontManagement.FontFile): FontManagement.Font {
    const font = FontKit.create(fontFile.data);
    if (font.type !== "TTF" && font.type !== "WOFF" && font.type !== "WOFF2") {
      return null;
    }
    let ligatureCount = 0;
    const lookupList = font["GSUB"]?.lookupList?.toArray() || [];
    lookupList.forEach((lookup: any) => {
      lookup?.subTables?.forEach((subtable: any) => {
        if (subtable.coverage && subtable.ligatureSets) {
          ligatureCount += subtable.ligatureSets
            .toArray()
            .reduce((acc: number, set: any) => acc + set.length, 0);
        }
      });
    });
    return {
      family:
        font.getName("preferredFamily", "") || font.getName("fontFamily", ""),
      name: font.fullName,
      weight: (font["OS/2"]?.usWeightClass || 400) as any,
      italic: font["OS/2"]?.fsSelection?.italic || font.italicAngle !== 0,
      variable:
        font.variationAxes && Object.keys(font.variationAxes).length > 0,
      ...("COLR" in font ? { colrVer: font["COLR"]?.["version"] || 0 } : {}),
      characterCount: font.characterSet.length,
      ligatureCount,
      filePath: fontFile.filePath,
      format: fontFile.format,
      data: fontFile.data,
      dataSize: fontFile.data.length,
      hash: crypto.createHash("sha256").update(fontFile.data).digest("hex"),
    };
  }

  fontSort(a: FontManagement.Font, b: FontManagement.Font) {
    if (a.family !== b.family) {
      return a.family.localeCompare(b.family);
    }
    if (a.variable !== b.variable) {
      return (b.variable ? 1 : 0) - (a.variable ? 1 : 0);
    }
    if (a.weight !== b.weight) {
      return a.weight - b.weight;
    }
    if (a.italic !== b.italic) {
      return (a.italic ? 1 : 0) - (b.italic ? 1 : 0);
    }
  }

  async loadFontDir(dirPaths: string[]) {
    return this._loadFontDir(dirPaths, false);
  }
  private async _loadFontDir(dirPaths: string[], isDefault: boolean) {
    const filePaths = [];
    for (const dirPath of dirPaths) {
      try {
        const files = await Files.readDirFiles(dirPath);
        filePaths.push(...files);
      } catch (e) {
        this.ctx.logger.error(e);
      }
    }
    return this._loadFontFiles(filePaths, isDefault);
  }

  async loadFontFiles(filePaths: string[]) {
    return this._loadFontFiles(filePaths, false);
  }
  private async _loadFontFiles(filePaths: string[], isDefault: boolean) {
    const fontFiles: FontManagement.FontFile[] = [];
    for (const filePath of filePaths) {
      const fontFile = await this.parseFontFile(filePath);
      if (fontFile) {
        fontFiles.push(fontFile);
      }
    }
    return this._loadFont(fontFiles, isDefault);
  }

  loadFont(fontFiles: FontManagement.FontFile[]) {
    return this._loadFont(fontFiles, false);
  }
  private _loadFont(fontFiles: FontManagement.FontFile[], isDefault: boolean) {
    const fonts: FontManagement.Font[] = [];
    for (const fontFile of fontFiles) {
      const font = this.parseFont(fontFile);
      if (font) {
        fonts.push(font);
      }
    }

    fonts.sort(this.fontSort);

    if (isDefault) {
      this.defaultFonts = fonts;
    } else {
      for (const font of fonts) {
        this.fontPool[font.hash] = font;
      }
      this.consoleEx.broadcastFamilyRefresh();
      this.fontChangeLog(fonts, "load");
    }

    return fonts;
  }

  removeFont(fonts: FontManagement.Font[]) {
    for (const font of fonts) {
      delete this.fontPool[font.hash];
    }
    this.fontChangeLog(fonts, "remove");
  }

  private fontChangeLog(fonts: FontManagement.Font[], msg: string) {
    if (this.config?.font?.logInfo) {
      const familyNames: string[] = [];
      fonts.forEach((font) => {
        if (!familyNames.includes(font.family)) {
          familyNames.push(font.family);
        }
      });
      this.ctx.logger.info(`${msg} font: ${familyNames.join(", ")}`);
      this.ctx.logger.info(
        `current fonts: ${this.getFamilyNames().join(", ")}`,
      );
    }
  }

  getFamilyNames() {
    const familyNames: string[] = [];
    for (const hash in this.fontPool) {
      const font = this.fontPool[hash];
      if (!familyNames.includes(font.family)) {
        familyNames.push(font.family);
      }
    }
    return familyNames;
  }

  getAllFamily(simple: boolean = false) {
    const fonts: FontManagement.Font[] = [];
    for (const hash in this.fontPool) {
      fonts.push(this.fontPool[hash]);
    }
    fonts.sort(this.fontSort);

    const familiesMap: Record<string, FontManagement.Family> = {};
    const families: FontManagement.Family[] = [];
    for (const font of fonts) {
      if (!familiesMap[font.family]) {
        const family: FontManagement.Family = {
          family: font.family,
          totalDataSize: 0,
          members: [],
        };
        familiesMap[font.family] = family;
        families.push(family);
      }
      const family = familiesMap[font.family];
      family.totalDataSize += font.dataSize;
      if (simple) {
        const f = { ...font };
        delete f.data;
        family.members.push(f);
      } else {
        family.members.push(font);
      }
    }
    return families;
  }

  private emojiRegex = new RegExp(
    "" +
      "\\p{Emoji_Presentation}|\\p{Extended_Pictographic}|[^\x00-\x7F](?<=\\p{Emoji_Component})",
    "u",
  );
  isEmoji(t: string) {
    return this.emojiRegex.test(t);
  }

  getFonts({
    formats,
    needVariable,
    needColr,
    needDefaultEmojiFont,
    preferredFamilyNames,
    fallbackSort = "familySize",
    fallbackSizeMax = 1,
  }: {
    formats: FontManagement.FontFormat[];
    needVariable?: true;
    needColr?: true | FontManagement.ColrVer[];
    needDefaultEmojiFont?: true;
    preferredFamilyNames?: string[];
    fallbackSort?: "familySize";
    fallbackSizeMax?: number;
  }) {
    const fonts: FontManagement.Font[] = [];
    for (const hash in this.fontPool) {
      const font = this.fontPool[hash];
      if (
        formats.includes(font.format) &&
        (!font.variable || needVariable) &&
        (!("colrVer" in font) ||
          needColr === true ||
          needColr.includes(font.colrVer))
      ) {
        fonts.push(font);
      }
    }

    const resFonts: FontManagement.Font[] = [];
    const pickFamilyFont = (familyNames: String[]) => {
      familyNames?.forEach((familyName) => {
        fonts.forEach((font) => {
          if (font.family === familyName) {
            resFonts.push(font);
          }
        });
      });
    };

    const res = (res = resFonts) => {
      if (!needDefaultEmojiFont || !needColr) {
        return res;
      }
      if (
        res.some(
          (font) =>
            font.family.toLowerCase().includes("emoji") ||
            font.name.toLowerCase().includes("emoji"),
        )
      ) {
        return res;
      }
      return [...res, this.defaultEmojiFont];
    };

    pickFamilyFont(preferredFamilyNames);

    if (resFonts.length < 0) {
      pickFamilyFont(this.config?.font?.defaultFamily);
    }

    if (resFonts.length > 0) {
      return res();
    }

    const familyNames: string[] = [];
    fonts.forEach((font) => {
      if (!familyNames.includes(font.family)) {
        familyNames.push(font.family);
      }
    });

    if (fallbackSort === "familySize" && fonts.length > 1) {
      const familySize: Record<string, number> = {};
      for (const font of fonts) {
        familySize[font.family] ||= 0;
        familySize[font.family] += font.dataSize;
      }
      familyNames.sort((a, b) => familySize[b] - familySize[a]);
    }

    if (familyNames.length > fallbackSizeMax) {
      familyNames.length = fallbackSizeMax;
    }
    pickFamilyFont(familyNames);

    if (resFonts.length < 1) {
      return res(this.defaultFonts);
    }
    return res();
  }
}
