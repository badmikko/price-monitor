const yaml = require('js-yaml');
const fs   = require('fs');
const Handlebars = require('handlebars');

function parseConfigWithTemplate(configPath, templatePath) {


  try {
    const configText = fs.readFileSync(configPath, 'utf8');
    const tempalteText = fs.readFileSync(templatePath, 'utf8');
    const configTemplate = Handlebars.compile(configText);

    const templateDoc = yaml.safeLoad(tempalteText);
    const configTextWithContent = configTemplate(templateDoc);

    const configDoc = yaml.safeLoad(configTextWithContent);
    return configDoc;
  } catch (e) {
    return {};
  }
}

module.exports = {
  parseConfigWithTemplate
};