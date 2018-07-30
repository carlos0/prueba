
var express = require('express');
var router = express.Router();
var cls = require('continuation-local-storage');
var createNamespace = cls.createNamespace;
var ns = createNamespace('logger');
var uuid = require("uuid");
var fs = require ("fs");
var bodyParser = require ("body-parser");

var app = express();


app.use(bodyParser.json());

app.use(function(req, res, next){
  ns.bindEmitter(req);
  ns.bindEmitter(res);
  ns.run(function () {
      next();
    });
});

app.use(function(req, res, next){
  ns.set('logId', uuid());
  next();
});

var logger = require('./logger');
var bl = require("./bl");

app.use(function(req, res, next){
  logger.log("info",
              `[${__filename}][**REQUEST**]`,
              {
                request: {
                  headers: req.headers,
                  method: req.method,
                  url: req.Url,
                  params: req.body,
                  query: req.query
                }
              }
            );
  next();
});

app.use(function (req, res, next) {
  var oldWrite = res.write,
      oldEnd = res.end;

  var chunks = [];

  // save chunks
  res.write = function (chunk) {
    chunks.push(new Buffer(chunk));
    oldWrite.apply(res, arguments);
  };

  // save last chunk, then parse body
  res.end = function (chunk) {
    if (chunk)
      chunks.push(new Buffer(chunk));

    var body = Buffer.concat(chunks).toString('utf8');

    // what if there is no response, or is not JSON >_<
    try {
        body = JSON.parse(body);
    } catch(ex){
    }

    logger.log("info",
                `[${__filename}][**RESPONSE**]`,
                {
                  response: {
                    body: body,
                    headers: res._headers,
                    statusCode: res.statusCode
                  }
                }
              );
    oldEnd.apply(res, arguments);
  };
  next();
}
);

router.get('/prueba', function(req, res){
  bl.prueba();
  setTimeout(function(){
    logger.log("info", `[${__filename}] una cadena siempre`, {"dato": "valor"});
    res.json({"status": "it works!!!!!"});
  }, 1000);
});

router.post('/prueba', function(req, res){
  res.setHeader("x-data", "some sample header")
  bl.prueba();
  logger.log("info", `[${__filename}] una cadena siempre`, {"dato": "valor"});
  res.json({"status": "it works!!!!!"});

});




app.use(router);

app.listen(3000, function(){
  console.log("Escuchando en el puerto 3000");
});
