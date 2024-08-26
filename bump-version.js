const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const manifestJsonPath = path.join(__dirname, 'manifest.json');

// Helper function to read a JSON file and parse it
function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Helper function to write a JSON object to a file
function writeJsonFile(filePath, json) {
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
}

// Function to bump the version
function bumpVersion() {
  const packageJson = readJsonFile(packageJsonPath);
  const manifestJson = readJsonFile(manifestJsonPath);

  // Assuming you want to bump the patch version,
  // but you can adjust the logic to bump major or minor as needed
  const versionParts = packageJson.version.split('.');
  versionParts[2] = parseInt(versionParts[2], 10) + 1; // Increment patch version
  const newVersion = versionParts.join('.');

  // Update versions in both files
  packageJson.version = newVersion;
  manifestJson.version = newVersion;

  // Write updated JSON back to the files
  writeJsonFile(packageJsonPath, packageJson);
  writeJsonFile(manifestJsonPath, manifestJson);

  console.log(`Version bumped to ${newVersion}`);
}

// Run the function
bumpVersion();