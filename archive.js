const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const ARCHIVE_FOLDER = 'archives';

function prepareFolder() {
  const archivePath = path.join(__dirname, ARCHIVE_FOLDER);
  if (!fs.existsSync(archivePath)) {
    fs.mkdirSync(archivePath);
  }
  return archivePath;
}

function getVersion() {
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.version) {
      throw new Error('version field not found in package.json');
    }
    return packageJson.version;
  } catch (error) {
    console.error('Error reading version:', error.message);
    throw error;
  }
}

// Function to compress specified files and folders into a zip file
function compressAssets() {
  try {
    const archivePath = prepareFolder();
    const version = getVersion();
  
    // Output file name includes the version from package.json
    const outputFileName = path.join(archivePath, `dist_v${version}.zip`);
    const output = fs.createWriteStream(outputFileName);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Compression level
    });
  
    output.on('close', function() {
      console.log(`Archive ${outputFileName} has been created successfully. Total bytes: ${archive.pointer()}`);
    });
  
    archive.on('error', function(err) {
      console.error('Archive error:', err);
      throw err;
    });

    output.on('error', function(err) {
      console.error('Output stream error:', err);
      throw err;
    });
  
    // Pipe archive data to the file
    archive.pipe(output);
  
    // Validate required files/folders exist
    const requiredPaths = [
      { path: 'manifest.json', type: 'file' },
      { path: 'icons', type: 'directory' },
      { path: 'dist', type: 'directory' }
    ];

    for (const item of requiredPaths) {
      if (!fs.existsSync(item.path)) {
        throw new Error(`Required ${item.type} not found: ${item.path}`);
      }
    }

    // Add files and folders to the archive
    archive.file('manifest.json', { name: 'manifest.json' });
  
    // Add the icons folder and dist folder recursively
    archive.directory('icons/', 'icons');
    archive.directory('dist/', 'dist');
  
    // Finalize the archive (i.e., finish writing the zip file)
    archive.finalize();
  } catch (error) {
    console.error('Failed to compress assets:', error.message);
    process.exit(1);
  }
}

compressAssets();
