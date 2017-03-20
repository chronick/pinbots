const Pinboard = require('node-pinboard');
const request = require('request');
const moment = require('moment');
const _ = require('lodash');

const {
  PINBOARD_API_TOKEN,
  NUMBER_RANDOM_PINS,
  MAILGUN_PASSWORD,
  MAILGUN_DOMAIN,
  MY_EMAIL
} = process.env;

const pinboard = new Pinboard(PINBOARD_API_TOKEN)

pinboard.all({}, (err, results) => {
  const html = _.range(NUMBER_RANDOM_PINS)
    .map(() => _.random(0, results.length))
    .map((i) => results[i])
    .map(({ description, href, time }) => `
      <h2>${description}</h2>
      <span style="color: #444; font-weight: bold">${moment(time).fromNow()}</span>
      <br/>
      <a href=${href}>${href}</a>
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
    console.log(JSON.stringify(response, null, 2))
  })
})
