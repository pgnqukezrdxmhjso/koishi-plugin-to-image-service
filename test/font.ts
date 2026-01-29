import { loadService } from "./testBase";

(async () => {
  const toImageService = await loadService();

  const fonts = toImageService.fontManagement.getFonts({
    formats: toImageService.fontManagement.FontExt,
    fallbackSizeMax: 9999999,
  });
  console.log(fonts);
})();
