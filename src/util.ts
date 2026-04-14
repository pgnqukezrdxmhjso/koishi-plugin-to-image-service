import fs from "node:fs/promises";
import path from "node:path";

import { Context, HTTP } from "koishi";

async function getPackageVersion(packageName: string) {
  const packageJson = JSON.parse(
    await fs.readFile(path.resolve(__dirname, "../package.json"), "utf8"),
  );
  return (packageJson?.devDependencies?.[packageName] as string)?.replace(
    /[^\d.]/,
    "",
  );
}

export async function installPackage(ctx: Context, packageName: string) {
  const version = await getPackageVersion(packageName);
  if (await ctx.node.has(packageName, version)) {
    return;
  }

  await ctx.node.install(packageName, version);
}

export async function importPackage<T>(ctx: Context, packageName: string) {
  const version = await getPackageVersion(packageName);
  return (await ctx.node.import(packageName, {
    version,
    allowInstall: true,
  })) as T;
}

export const CDNNodes = {
  "jsdelivr-gcore": "https://gcore.jsdelivr.net/",
  "jsdelivr-testingcf": "https://testingcf.jsdelivr.net/",
  "jsdelivr-quantil": "https://quantil.jsdelivr.net/",
  "jsdelivr-fastly": "https://fastly.jsdelivr.net/",
  "jsdelivr-originfastly": "https://originfastly.jsdelivr.net/",
  "jsdelivr-cdn": "https://cdn.jsdelivr.net/",
  jsdmirror: "https://cdn.jsdmirror.com/",
};

export type CDNNode = keyof typeof CDNNodes;

export function replaceCDN(url: string, node: CDNNode) {
  return url.replace(
    /^https:\/\/cdn.jsdelivr.net\//,
    CDNNodes[node] || CDNNodes["jsdelivr-gcore"],
  );
}
const testSvgPath = "gh/jdecked/twemoji@17.0.2/assets/svg/1f30b.svg";
export interface NodeSpeed {
  node: CDNNode;
  url: (typeof CDNNodes)[CDNNode];
  duration: number;
}
export async function CDNNodeSpeed(http: HTTP) {
  const res: NodeSpeed[] = [];
  for (let [node, url] of Object.entries(CDNNodes)) {
    let duration: number;
    try {
      const time = Date.now();
      await http("get", url + testSvgPath);
      duration = Date.now() - time;
    } catch (e) {}
    res.push({
      node,
      url,
      duration,
    } as NodeSpeed);
  }
  return res;
}
