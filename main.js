const express = require('express');
const open = require('open');
const request = require('request');
const cheerio = require('cheerio');
const async = require('async');

const domain = 'http://digital-results.com/';

(function iife() {
  const server = express();

  server.get('/', () => {
    const queue = [];
    const visited = [];
    const output = [];

    queue.push(domain);

    function getAssets() {
      // NOTE: check passed url has not already been visited and is not already in the queue
      function validateUrl(url) {
        if (visited.indexOf(url) === -1 && queue.indexOf(url) === -1) { return true; }
        return false;
      }

      async.eachSeries(queue, (current, next) => {
        const url = queue.shift();
        visited.push(url);

        request(url, (error, response, html) => {
          const $ = cheerio.load(html);
          const assets = [];

          if (error) { return next(error); }

          // NOTE: get all page urls under domain and add them to queue if they are valid -- see validateUrl();
          $('[href]').each((i, elem) => {
            if (elem.attribs.href.startsWith(url)) {
              if (validateUrl(elem.attribs.href)) { queue.push(elem.attribs.href); }
            }

            if (elem.attribs.href.startsWith('/')) {
              const page = `${domain}${elem.attribs.href.substr(1)}`;
              if (validateUrl(page)) { queue.push(page); }
            }
          });
          // NOTE: get image src urls
          $('img').each((i, elem) => {
            if (elem.attribs.src) { assets.push(elem.attribs.src); }
          });
          // NOTE: get script src urls
          $('script').each((i, elem) => {
            if (elem.attribs.src) { assets.push(elem.attribs.src); }
          });
          // NOTE: get stylesheet src urls
          $('link').each((i, elem) => {
            if (elem.attribs.rel === 'stylesheet') { assets.push(elem.attribs.href); }
          });

          output.push({ url, assets });
          return next();
        });
      }, (error) => {
        if (error) {
          /* TODO: do some error handling */
        } else if (!queue.length) {
          console.log(JSON.stringify(output, null, 2));
        } else {
          getAssets();
        }
      });
    }

    getAssets();
  });

  server.listen('8080');
  open('http://localhost:8080/');

  exports = module.exports = server;
}());
