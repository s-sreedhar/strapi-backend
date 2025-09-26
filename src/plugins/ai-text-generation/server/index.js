// Path: ./src/plugins/ai-text-generation/server/index.js

"use strict";

const services = require("./src/services");
const controllers = require("./src/controllers");
const routes = require("./src/routes");
const adminRoutes = require("./src/routes/admin");
const register = require("./register");
const config = require("./src/config");

module.exports = {
  services,
  controllers,
  config,
  routes: {
    'content-api': {
      type: 'content-api',
      routes: routes
    },
    'admin': {
      type: 'admin',
      routes: adminRoutes
    }
  },
  register,
  bootstrap({ strapi }) {
    // Initialize the text generation service
    const textGenerationService = strapi
      .plugin("ai-text-generation")
      .service("textGenerationService");
    
    textGenerationService.init();

    strapi.log.info("AI Text Generation plugin bootstrapped successfully");
  },
};