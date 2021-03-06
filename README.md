# Ok Google, Talk to Mental Temperature Converter

![version](https://img.shields.io/github/release/hchiam/mental-temperature-converter)

An app for the Google Assistant to help you practice mentally converting temperature from degrees Celsius to Fahrenheit, or from Fahrenheit to Celsius.

Listed in the <a href="https://assistant.google.com/services/a/uid/0000004e69d8570e" target="_blank">Google Assistant web directory</a>.

<a href="https://assistant.google.com/services/invoke/uid/0000004e69d8570e">🅖 Talk to Mental Temperature Converter</a>

Original version built in 1 month to be submitted for the contest August 31st 2017. For that first iteration, I built the Google Assistant app using API.ai (now called Dialogflow), Actions on Google, Node.js, and Express.js, and hosted the original webhook server on [Glitch.com](https://glitch.com/edit/#!/mental-temp-converter) 

## Try it Out (In Your Browser, Without Voice Reply):

<a href="https://codepen.io/hchiam/full/NEzXja" target="_blank">https://codepen.io/hchiam/full/NEzXja</a>

<a href="https://bot.api.ai/mental-temperature-converter" target="_blank">https://bot.api.ai/mental-temperature-converter</a>

## YouTube Demo:

<a href="https://www.youtube.com/watch?v=7eiwrohLoGk" target="_blank">https://www.youtube.com/watch?v=7eiwrohLoGk</a>

## Making your own Google Assistant app:

### API V2:

API V1 will be deprecated as of October 23rd, 2019.

To get caught up faster, try building a mini app from scratch, following the instructions here: <a href="https://github.com/hchiam/dialogflow-webhook-boilerplate-nodejs" target="_blank">https://github.com/hchiam/dialogflow-webhook-boilerplate-nodejs</a>

The key files are:

* [index.js](https://github.com/hchiam/mental-temperature-converter/blob/master/index.js) for the fulfillment code in Dialogflow.
* [package.json](https://github.com/hchiam/mental-temperature-converter/blob/master/package.json) for the fulfillment code setup in Dialogflow.
* [ment-temp-conv-v2.zip](https://github.com/hchiam/mental-temperature-converter/blob/master/ment-temp-conv-v2.zip) to restore/import from zip in Dialogflow.

### API V1 (Now Deprecated) - Remix/Fork Info:

An older version of this project was remixed from <a href="https://glitch.com/~actions-on-google-api-ai-boilerplate">https://glitch.com/~actions-on-google-api-ai-boilerplate</a>

server.js: <a href="https://glitch.com/edit/#!/mental-temp-converter?path=server.js:1:0">https://glitch.com/edit/#!/mental-temp-converter?path=server.js:1:0</a>

Only **server.js** and this **README.md** have been changed.

## You Might Also Like:

<a href="https://github.com/hchiam/code-tutor" target="_blank">https://github.com/hchiam/code-tutor</a>
