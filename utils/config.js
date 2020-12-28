const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const objectMergeAdvanced = require("object-merge-advanced");

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


function parseConfigs(configDirPath) {
  const configPaths = fs.readdirSync(configDirPath)
    .filter(file => path.extname(file).toLowerCase() === ".yaml");
  const options = {
    hardArrayConcat: false,
    hardArrayConcatKeys: ["products"],
    cb: (inputArg1, inputArg2, resultAboutToBeReturned, infoObj) => {
      if(infoObj.key === "products") {
        return [...inputArg2, ...inputArg1]
          .filter((v, i, array) => array.filter(r => r.id == v.id && r.source == v.source)[0] === v)
          .sort((a, b) => a.id?.localeCompare(b.id) || a.source?.localeCompare(b.source));
      }
      //console.log(`${infoObj} = ${resultAboutToBeReturned}`)
      return resultAboutToBeReturned;
    },
  };

  let config = {}
  for(let configPath of configPaths) {
    try {
      const configText = fs.readFileSync(path.join(configDirPath, configPath), 'utf8');
      const partialConfig = yaml.safeLoad(configText);

      config = objectMergeAdvanced(config, partialConfig, options);
    } catch (e) {
      throw `Cannot load config file at ${configPath}`;
    }
  }

  return config;
}

module.exports = {
  parseConfigWithTemplate,
  parseConfigs
};