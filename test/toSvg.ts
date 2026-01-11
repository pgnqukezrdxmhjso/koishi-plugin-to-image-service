import fs from "fs/promises";
import ToImageService from "../src/index";

const code =
  "<div\n" +
  "  style={{\n" +
  "    display: 'flex',\n" +
  "    justifyContent: 'space-between',\n" +
  "    alignItems: 'flex-start',\n" +
  "    fontSize: 24,\n" +
  "    fontWeight: 600,\n" +
  "    textAlign: 'left',\n" +
  "    padding: 70,\n" +
  "    color: 'red',\n" +
  "    backgroundImage: 'linear-gradient(to right, #334d50, #cbcaa5)',\n" +
  "    height: '100%',\n" +
  "    width: '100%'\n" +
  "  }}\n" +
  ">\n" +
  "\n" +
  "  <div style={{ display: 'flex', flexDirection: 'column' }}>\n" +
  "    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: '#fff' }}>\n" +
  "      #fff\n" +
  "      <div style={{ fontWeight: 100 }}>hexadecimal</div>\n" +
  "    </div>\n" +
  "    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: '#ffffff70' }}>\n" +
  "      #ffffff70\n" +
  "      <div style={{ fontWeight: 100 }}>hexadecimal + transparency</div>\n" +
  "    </div>\n" +
  "    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'rgb(45, 45, 45)' }}>\n" +
  "      rgb(45, 45, 45)\n" +
  "      <div style={{ fontWeight: 100 }}>rgb</div>\n" +
  "    </div>\n" +
  "    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'rgb(45, 45, 45, 0.3)' }}>\n" +
  "      rgb(45, 45, 45, 0.3)\n" +
  "      <div style={{ fontWeight: 100 }}>rgba</div>\n" +
  "    </div>\n" +
  "  </div>\n" +
  "\n" +
  "  <div style={{ display: 'flex', flexDirection: 'column' }}>\n" +
  "    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'hsl(186, 22%, 26%)' }}>\n" +
  "      hsl(186, 22%, 26%)\n" +
  "      <div style={{ fontWeight: 100 }}>hsl</div>\n" +
  "    </div>\n" +
  "    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'hsla(186, 22%, 26%, 40%)' }}>\n" +
  "      hsla(186, 22%, 26%, 40%)\n" +
  "      <div style={{ fontWeight: 100 }}>hsla</div>\n" +
  "    </div>\n" +
  "    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'white' }}>\n" +
  '      "white"\n' +
  "      <div style={{ fontWeight: 100 }}>predefined color names</div>\n" +
  "    </div>\n" +
  "    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', color: 'currentcolor' }}>\n" +
  "      should be red\n" +
  '      <div style={{ fontWeight: 100 }}>"currentcolor"</div>\n' +
  "    </div>\n" +
  "  </div>\n" +
  "</div>";

(async () => {
  const toImageService = new ToImageService({} as any, {});
  await toImageService.start();
  const reactElement =
    await toImageService.toReactElement.jsxToReactElement(code);
  const svg = await toImageService.reactElementToSvg.satori(reactElement);
  await fs.writeFile("./test.svg", svg);
})();
