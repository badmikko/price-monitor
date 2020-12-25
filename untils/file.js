const fs = require('fs');
const path = require("path");
const filenamify = require('filenamify');
const unicodeSubstring = require('unicode-substring');
const log = require('debug')('file-utils');

async function createProductFolder(base, storeId, productId, productName) {
  const SEPARATOR = "--";

  const segment = [];
  segment.push(storeId);
  segment.push(productId);
  const folderNamePrefix = filenamify([...segment, ""].join(SEPARATOR)); // Example: "StoreID--ProductID--"
  const storeFolderPath = path.join(base, filenamify(storeId)); // Example: "./Data/StoreID/"
  
  // If store data folder exists, go ahead check on product folder inside.
  // Otherwise, product folder must not be exists currently, go create folders.
  if (fs.existsSync(storeFolderPath)) {
    const folders = (await fs.promises.readdir(storeFolderPath, { withFileTypes: true }))
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith(folderNamePrefix))
      .map(dirent => dirent.name); // ["StoreID--ProductID--Name"]

    if (folders.length > 0) {
      const existingFolderPath = path.join(storeFolderPath, folders[0])
      log(`Folder exists. path=${existingFolderPath}`);
      return existingFolderPath;
    }
  }

  segment.push(unicodeSubstring(productName?.trim(), 0, 40));
  const folderName = filenamify(segment.join(SEPARATOR)); // Example: "StoreID--ProductID--Name"
  const newFolderPath = path.join(storeFolderPath, folderName); // Example: "./Data/StoreID/StoreID--ProductID--Name"
  log(`Creating folder. path=${newFolderPath}`);
  fs.mkdirSync(newFolderPath, {
    recursive: true
  });
  return newFolderPath;
}

async function writeFile(filePath, content, options) {
  await fs.promises.writeFile(filePath, content, options);
}

function join(...array) {
  return path.join.apply(path, array);
}

function getWorkingDirectory() {
  return process.cwd();
}

module.exports = {
  createProductFolder,
  writeFile,
  join,
  getWorkingDirectory,
  pathResolve: path.resolve
};