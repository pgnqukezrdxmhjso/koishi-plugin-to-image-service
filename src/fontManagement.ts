import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  BeanHelper,
  Files,
  Strings,
} from "koishi-plugin-rzgtboeyndxsklmq-commons";
import FontKit from "fontkit";
import ToImageService from "./index";
export namespace FontManagement {
  export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  export type FontFormat = "ttf" | "otf" | "woff" | "woff2";
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
    filePath: string;
    format: FontFormat;
    data: Buffer;
    hash: string;
  }
}
export class FontManagement extends BeanHelper.BeanType<ToImageService.Config> {
  readonly FontExt: FontManagement.FontFormat[] = [
    "ttf",
    "otf",
    "woff",
    "woff2",
  ];
  readonly defaultFontDir = path.resolve(__dirname, "../assets/font");
  defaultFonts: FontManagement.Font[];
  fontPool: Record<string, FontManagement.Font> = {};

  async start() {
    await this._loadFontDir([this.defaultFontDir], true);
    await this.loadConfig();
  }

  async loadConfig() {
    const config = this.config.font;
    if (Strings.isNotBlank(config.dir)) {
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

  parseFont(fontFile: FontManagement.FontFile) {
    const font = FontKit.create(fontFile.data);
    if (font.type !== "TTF" && font.type !== "WOFF" && font.type !== "WOFF2") {
      return null;
    }
    return {
      family:
        font.getName("preferredFamily", "") || font.getName("fontFamily", ""),
      name: font.fullName,
      weight: (font["OS/2"]?.usWeightClass || 400) as any,
      italic: font["OS/2"]?.fsSelection?.italic || font.italicAngle !== 0,
      variable:
        font.variationAxes && Object.keys(font.variationAxes).length > 0,
      filePath: fontFile.filePath,
      format: fontFile.format,
      data: fontFile.data,
      hash: crypto.createHash("sha256").update(fontFile.data).digest("hex"),
    } as FontManagement.Font;
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
      const ext = this.ext(filePath);
      if (!this.FontExt.includes(ext as any)) {
        continue;
      }
      fontFiles.push({
        filePath,
        format: ext as any,
        data: await fs.readFile(filePath),
      });
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

    fonts.sort((a, b) => {
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
    });

    if (isDefault) {
      this.defaultFonts = fonts;
    } else {
      for (const font of fonts) {
        this.fontPool[font.hash] = font;
      }
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
    if (this.config.font.logInfo) {
      const familyNames: string[] = [];
      fonts.forEach((font) => {
        if (!familyNames.includes(font.family)) {
          familyNames.push(font.family);
        }
      });
      this.ctx.logger.info(`${msg} font: ${familyNames.join(", ")}`);
      this.ctx.logger.info(`current fonts: ${this.getFamily().join(", ")}`);
    }
  }

  getFamily() {
    const familyNames: string[] = [];
    for (const hash in this.fontPool) {
      const font = this.fontPool[hash];
      if (!familyNames.includes(font.family)) {
        familyNames.push(font.family);
      }
    }
    return familyNames;
  }

  getFonts({
    formats,
    needVariable = false,
    sort = "familySize",
    sizeMax = 1,
  }: {
    formats: FontManagement.FontFormat[];
    needVariable?: boolean;
    sort?: "familySize";
    sizeMax?: number;
  }) {
    const fonts: FontManagement.Font[] = [];
    for (const hash in this.fontPool) {
      const font = this.fontPool[hash];
      if (formats.includes(font.format) && (!font.variable || needVariable)) {
        fonts.push(font);
      }
    }

    const familyNames: string[] = [];
    fonts.forEach((font) => {
      if (!familyNames.includes(font.family)) {
        familyNames.push(font.family);
      }
    });

    if (sort === "familySize" && fonts.length > 1) {
      const familySize: Record<string, number> = {};
      for (const font of fonts) {
        familySize[font.family] ||= 0;
        familySize[font.family] += font.data.length;
      }
      familyNames.sort((a, b) => familySize[b] - familySize[a]);
    }

    const resFonts: FontManagement.Font[] = [];
    for (let i = 0; i < familyNames.length && i < sizeMax; i++) {
      const familyName = familyNames[i];
      fonts.forEach((font) => {
        if (font.family === familyName) {
          resFonts.push(font);
        }
      });
    }

    if (resFonts.length < 1) {
      return this.defaultFonts;
    }
    return resFonts;
  }
}
