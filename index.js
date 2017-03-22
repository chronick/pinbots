const Pinboard = require('node-pinboard');
const request = require('request');
const moment = require('moment');
const _ = require('lodash');
const url = require('url');

const {
  PINBOARD_API_TOKEN,
  NUMBER_RANDOM_PINS,
  MAILGUN_PASSWORD,
  MAILGUN_DOMAIN,
  MY_EMAIL
} = process.env;

const pinboard = new Pinboard(PINBOARD_API_TOKEN)

pinboard.all({}, (err, results) => {
  const pins = _.range(NUMBER_RANDOM_PINS)
    .map(() => _.random(0, results.length))
    .map((i) => results[i])

  const html = pins
    .map(({ description, href, time }) => `
      <h3 style="margin-bottom: 0">
        <a href=${href}>
          ${description}
        </a>
      </h3>
      <span style="color: #888; font-weight: bold">${moment(time).fromNow()}</span>
      &nbsp;
      <span style="color: #444">${url.parse(href).hostname.replace('www.', '')}</span>
      &nbsp;
      <a style="color: #d9534f" href="https://api.pinboard.in/v1/posts/delete?auth_token=${PINBOARD_API_TOKEN}&url=${href}">delete</a>
    `)
    .join('<br/><br/>\n')
    .replace('\t', '')

  request.post(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
    auth: { user: 'api', pass: MAILGUN_PASSWORD },
    formData: {
      from: `Pinbot <postmaster@${MAILGUN_DOMAIN}>`,
      to: `<${MY_EMAIL}>`,
      subject: 'Random Pins For You',
      text: html,
      html
    }}
  , (err, response) => {
    if (err) throw new Error(err)
    console.log("found the following pins:");
    console.log(pins.map(({ href }) => href).join('\n'))
  })
})
