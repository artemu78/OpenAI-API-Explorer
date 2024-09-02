const archiver = require('archiver');
const fs = require('fs');

// Function to compress specified files and folders into a zip file
function compressAssets() {
    // Read package.json to get the version
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.version;
  
    // Output file name includes the version from package.json
    const outputFileName = `dist_v${version}.zip`;
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
    archive.file('options.html', { name: 'options.html' });
    archive.file('content.js', { name: 'content.js' });
  
    // Add the icons folder and dist folder recursively
    archive.directory('icons/', 'icons');
    archive.directory('dist/', 'dist');
  
    // Finalize the archive (i.e., finish writing the zip file)
    archive.finalize();
  }

  compressAssets();