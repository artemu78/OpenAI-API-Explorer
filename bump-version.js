const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const manifestJsonPath = path.join(__dirname, 'manifest.json');

// Helper function to read a JSON file and parse it
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    throw error;
  }
}

// Helper function to write a JSON object to a file
function writeJsonFile(filePath, json) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error.message);
    throw error;
  }
}

// Function to bump the version
// versionType: 'major' | 'minor' | 'patch' (default)
function bumpVersion(versionType = 'patch') {
  try {
    const packageJson = readJsonFile(packageJsonPath);
    const manifestJson = readJsonFile(manifestJsonPath);

    // Validate version format
    const versionParts = packageJson.version.split('.');
    if (versionParts.length !== 3) {
      throw new Error(`Invalid version format: ${packageJson.version}`);
    }

    // Bump version based on type
    let major = parseInt(versionParts[0], 10);
    let minor = parseInt(versionParts[1], 10);
    let patch = parseInt(versionParts[2], 10);

    switch (versionType) {
      case 'major':
        major += 1;
        minor = 0;
        patch = 0;
        break;
      case 'minor':
        minor += 1;
        patch = 0;
        break;
      case 'patch':
      default:
        patch += 1;
        break;
    }

    const newVersion = `${major}.${minor}.${patch}`;

    // Update versions in both files
    packageJson.version = newVersion;
    manifestJson.version = newVersion;

    // Write updated JSON back to the files
    writeJsonFile(packageJsonPath, packageJson);
    writeJsonFile(manifestJsonPath, manifestJson);

    console.log(`Version bumped (${versionType}) to ${newVersion}`);
    return newVersion;
  } catch (error) {
    console.error('Failed to bump version:', error.message);
    process.exit(1);
  }
}

// Get version type from command line argument (defaults to 'patch')
const versionType = process.argv[2] || 'patch';
if (!['major', 'minor', 'patch'].includes(versionType)) {
  console.error(`Invalid version type: ${versionType}. Use 'major', 'minor', or 'patch'`);
  process.exit(1);
}

// Run the function
bumpVersion(versionType);
