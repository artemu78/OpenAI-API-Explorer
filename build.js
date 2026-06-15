const { spawn } = require("child_process");
const fs = require('fs');
const path = require('path');

const BUILD_FOLDER = 'dist';
const ARCHIVE_FOLDER = 'archives';

function prepareFolder(folder) {
  const buildPath = path.join(__dirname, folder);
  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
  }
  return buildPath;
}

async function runEsbuild() {
  console.log("Run build");
  const buildPath = prepareFolder(BUILD_FOLDER);
  const archivePath = prepareFolder(ARCHIVE_FOLDER);

  try {
    // Wait for all esbuild processes to complete
    await Promise.all([
      runProcess("options.ts", path.join(buildPath, "options.js")),
      runProcess("content.ts", path.join(buildPath, "content.js")),
      runProcess("background.ts", path.join(buildPath, "out.js"))
    ]);

    // Copy HTML files after build completes
    fs.copyFileSync("options.html", path.join(buildPath, "options.html"));
    fs.copyFileSync("options.html", path.join(archivePath, "options.html"));

    console.log("Build completed successfully");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

function runProcess(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const esbuildProcess = spawn("npx", [
      "esbuild",
      inputFile,
      "--bundle",
      `--outfile=${outputFile}`,
    ]);

    esbuildProcess.stdout.on("data", (data) => {
      console.log(`esbuild stdout: ${data}`);
    });

    esbuildProcess.stderr.on("data", (data) => {
      console.error(`esbuild stderr: ${data}`);
    });

    esbuildProcess.on("close", (code) => {
      console.log(`esbuild process exited with code ${code}`);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`esbuild failed with exit code ${code}`));
      }
    });

    esbuildProcess.on("error", (error) => {
      reject(error);
    });
  });
}

runEsbuild();

module.exports = {
  runEsbuild,
};
