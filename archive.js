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
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  return version;
}

// Function to compress specified files and folders into a zip file
function compressAssets() {
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
      throw err;
    });
  
    // Pipe archive data to the file
    archive.pipe(output);
  
    // Add files and folders to the archive
    archive.file('manifest.json', { name: 'manifest.json' });
  
    // Add the icons folder and dist folder recursively
    archive.directory('icons/', 'icons');
    archive.directory('dist/', 'dist');
  
    // Finalize the archive (i.e., finish writing the zip file)
    archive.finalize();
  }

  compressAssets();
