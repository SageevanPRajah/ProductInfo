/* eslint-disable no-unused-vars */
const Service = require('./Service');

/**
* List all templates
*
* offset Integer  (optional)
* limit Integer  (optional)
* returns List
* */
const apiV1TemplatesGET = ({ offset, limit }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        offset,
        limit,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Create a new template
*
* templateCreate TemplateCreate 
* returns Template
* */
const apiV1TemplatesPOST = ({ templateCreate }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        templateCreate,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Delete a template
*
* templateId String 
* no response value expected for this operation
* */
const apiV1TemplatesTemplateIdDELETE = ({ templateId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        templateId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Get a single template by ID
*
* templateId String 
* returns Template
* */
const apiV1TemplatesTemplateIdGET = ({ templateId }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        templateId,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);
/**
* Update a template
*
* templateId String 
* templateUpdate TemplateUpdate  (optional)
* returns Template
* */
const apiV1TemplatesTemplateIdPATCH = ({ templateId, templateUpdate }) => new Promise(
  async (resolve, reject) => {
    try {
      resolve(Service.successResponse({
        templateId,
        templateUpdate,
      }));
    } catch (e) {
      reject(Service.rejectResponse(
        e.message || 'Invalid input',
        e.status || 405,
      ));
    }
  },
);

module.exports = {
  apiV1TemplatesGET,
  apiV1TemplatesPOST,
  apiV1TemplatesTemplateIdDELETE,
  apiV1TemplatesTemplateIdGET,
  apiV1TemplatesTemplateIdPATCH,
};
