# koishi-plugin-to-image-service

[![npm](https://img.shields.io/npm/v/koishi-plugin-to-image-service?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-to-image-service)

Generate images using a non-puppeteer solution

---

[example](https://github.com/pgnqukezrdxmhjso/koishi-plugin-to-image-service/blob/master/test/base/toPng.ts)

---

Performance list obtained by running the example toPng.ts file.

| index | name              | serial | count | macroTask | testTime | total | average            | highest | lowest |
| :---- | :---------------- | :----- | :---- | :-------- | :------- | :---- | :----------------- | :------ | :----- |
| 0     | 'default'         |        | 1     | 0         | 50       |       |                    |         |        |
| 1     | 'default'         | true   | 30    | 8         | 954      | 954   | 31.8               | 34      | 29     |
| 2     | 'default'         | false  | 30    | 2         | 281      | 3858  | 128.6              | 235     | 42     |
| 3     | 'satori'          |        | 1     | 1         | 191      |       |                    |         |        |
| 4     | 'satori'          | true   | 30    | 0         | 709      | 709   | 23.633333333333333 | 32      | 21     |
| 5     | 'satori'          | false  | 30    | 0         | 729      | 728   | 24.266666666666666 | 49      | 21     |
| 6     | 'resvg'           |        | 1     | 0         | 54       |       |                    |         |        |
| 7     | 'resvg'           | true   | 30    | 11        | 1377     | 1377  | 45.9               | 49      | 44     |
| 8     | 'resvg'           | false  | 30    | 2         | 1089     | 16571 | 552.3666666666667  | 779     | 348    |
| 9     | 'sharp'           |        | 1     | 0         | 78       |       |                    |         |        |
| 10    | 'sharp'           | true   | 30    | 12        | 1407     | 1407  | 46.9               | 71      | 44     |
| 11    | 'sharp'           | false  | 30    | 1         | 761      | 11378 | 379.26666666666665 | 740     | 46     |
| 12    | 'skiaCanvas'      |        | 1     | 0         | 94       |       |                    |         |        |
| 13    | 'skiaCanvas'      | true   | 30    | 12        | 1467     | 1466  | 48.86666666666667  | 58      | 46     |
| 14    | 'skiaCanvas'      | false  | 30    | 1         | 1019     | 15530 | 517.6666666666666  | 1007    | 50     |
| 15    | 'skiaCanvasCanvg' |        | 1     | 1         | 142      |       |                    |         |        |
| 16    | 'skiaCanvasCanvg' | true   | 30    | 15        | 2354     | 2354  | 78.46666666666667  | 90      | 73     |
| 17    | 'skiaCanvasCanvg' | false  | 30    | 1         | 1833     | 28289 | 942.9666666666667  | 1819    | 76     |
| 18    | 'takumi'          |        | 1     | 0         | 28       |       |                    |         |        |
| 19    | 'takumi'          | true   | 30    | 8         | 882      | 882   | 29.4               | 32      | 28     |
| 20    | 'takumi'          | false  | 30    | 2         | 241      | 3478  | 115.93333333333334 | 211     | 29     |

---

### to ReactElement

html to ReactElement [html-react-parser](https://www.npmjs.com/package/html-react-parser)

jsx to ReactElement [sucrase](https://www.npmjs.com/package/sucrase)

---

### to svg

ReactElement to svg [vercel/satori](https://github.com/vercel/satori#overview)
[og-playground](https://og-playground.vercel.app/)

---

### to image

[@resvg/resvg-js](https://www.npmjs.com/package/@resvg/resvg-js)

[sharp](https://www.npmjs.com/package/sharp)

[@napi-rs/canvas](https://www.npmjs.com/package/@napi-rs/canvas)
[canvg](https://www.npmjs.com/package/canvg)
[jsdom](https://www.npmjs.com/package/jsdom)

ReactElement to image [takumi](https://takumi.kane.tw/docs/reference)
[playground](https://takumi.kane.tw/playground)

---

[<img alt="No AI Icon" height="64" src="https://no-ai-icon.com/wp-content/uploads/2023/02/no-ai-icon-07.svg" width="64"/>](https://no-ai-icon.com/statement/?url=koishi-plugin-to-image-service)
