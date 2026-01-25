import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";
import module from "node:module";

import { Context } from "koishi";

export async function installPackage(ctx: Context, packageName: string) {
  if (await ctx.node.has(packageName)) {
    return;
  }

  const packageJson = JSON.parse(
    await fs.readFile(path.resolve(__dirname, "../package.json"), "utf8"),
  );
  await ctx.node.install(
    packageName,
    (packageJson?.devDependencies?.[packageName] as string)?.replace(
      /[^\d.]/,
      "",
    ),
  );
}

export async function importPackage(ctx: Context, packageName: string) {
  await installPackage(ctx, packageName);

  const packageDir = ctx.node.getPackageDir(packageName);
  const require = module.createRequire(url.pathToFileURL(packageDir).href);
  const entryPath = require.resolve(packageName);
  return await import(url.pathToFileURL(entryPath).href);
}
