/**
 * Copyright 2023 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: true
});


// // Commented out but feel free to comment back if you want GZIP compression turned on
//
// // This code enables gzip compression
// fastify.register(
//   import('@fastify/compress'),
//   { encodings: ['gzip'] }
// )


// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});


/**
Begin Code to redirect http to https
**/

fastify.decorateRequest('secure', false)
fastify.addHook('onRequest', (request, reply, done) => {
  // Do not use `request.protocol` (will always return `http`)
  // Fastify does not parse multi-value `x-forwarded-proto` correctly
  const protocols = request.headers['x-forwarded-proto'].split(',')
  request.secure = protocols[0] === 'https'

  done()
})

fastify.addHook('onRequest', ({secure, hostname, url}, reply, done) => {
  if (!secure) {
    return reply.redirect(308, `https://${hostname}${url}`)
  }

  done()
})
/**
End Code to redirect http to https
**/

// Run the server and report out to the logs
fastify.listen({ port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);
  }
);
