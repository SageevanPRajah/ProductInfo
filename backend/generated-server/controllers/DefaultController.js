/**
 * The DefaultController file is a very simple one, which does not need to be changed manually,
 * unless there's a case where business logic routes the request to an entity which is not
 * the service.
 * The heavy lifting of the Controller item is done in Request.js - that is where request
 * parameters are extracted and sent to the service, and where response is handled.
 */

const Controller = require('./Controller');
const service = require('../services/DefaultService');
const apiV1TemplatesGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1TemplatesGET);
};

const apiV1TemplatesPOST = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1TemplatesPOST);
};

const apiV1TemplatesTemplateIdDELETE = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1TemplatesTemplateIdDELETE);
};

const apiV1TemplatesTemplateIdGET = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1TemplatesTemplateIdGET);
};

const apiV1TemplatesTemplateIdPATCH = async (request, response) => {
  await Controller.handleRequest(request, response, service.apiV1TemplatesTemplateIdPATCH);
};


module.exports = {
  apiV1TemplatesGET,
  apiV1TemplatesPOST,
  apiV1TemplatesTemplateIdDELETE,
  apiV1TemplatesTemplateIdGET,
  apiV1TemplatesTemplateIdPATCH,
};
