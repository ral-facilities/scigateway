var fs = require("fs");
const path = require('path');
var exec = require('child_process').exec;

const settingsFilePath = path.join(__dirname, '/dev-plugin-settings.json');

function checkForSettingsFile() {
  if (!fs.existsSync(settingsFilePath)) {
    const noSettingsFileMessage =
      '\n======================================\n' +
      'NO SETTINGS FILE FOUND at\n' +
      `${settingsFilePath}\n` +
      '======================================\n' +
      'There must be a settings file with the location of plugins to \n' +
      'load into the app (which may simply be an empty array).\n\n' +
      'dev-plugin-settings.example.json next to this script can be used as a template\n' +
      'and renamed as dev-plugin-settings.json in the same folder.\n\n';
    console.log(noSettingsFileMessage);
    process.exit(1);
  }
}

function loadPluginsFromSettings() {
  const content = fs.readFileSync(settingsFilePath);
  const settings = JSON.parse(content);

  const plugins = settings.plugins;
  return plugins;
}

function servePluginWithOutput(plugin, index) {
  if (!fs.existsSync(plugin.location)) {
    console.log(`ERROR: Expected plugin not found at ${plugin.location}`);
    return;
  }
  console.log(`Serving plugin ${plugin.location} on port ${plugin.port}`);
  const child = exec(`serve -l ${plugin.port} ${plugin.location}`);
  child.stdout.on('data', function(data) {
    process.stdout.write(`stdout (${index}): ` + data);
  });
  child.stderr.on('data', function(data) {
    process.stdout.write(`stderr (${index}): ` + data);
  });
  child.on('close', function(code) {
    process.stdout.write('closing code: ' + code);
  });
}

checkForSettingsFile();
const plugins = loadPluginsFromSettings();

plugins.forEach((plugin, index) => {
  servePluginWithOutput(plugin, index);
});
