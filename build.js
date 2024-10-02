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

function runEsbuild() {
  console.log("Run build");
  const buildPath = prepareFolder(BUILD_FOLDER);
  const archivePath = prepareFolder(ARCHIVE_FOLDER);


  runProcess("options.ts", path.join(buildPath, "options.js"));
  runProcess("content.ts", path.join(buildPath, "content.js"));
  runProcess("background.ts", path.join(buildPath, "out.js"));
  fs.copyFileSync("options.html", path.join(buildPath, "options.html"));
  fs.copyFileSync("options.html", path.join(archivePath, "options.html"));
  spawn("node", ["archive"], {
    stdio: ['inherit', 'inherit', 'inherit'] // Inherit stdio from parent process
  });
}

function runProcess(inputFile, outputFile) {
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
  });
}

runEsbuild();

module.exports = {
  runEsbuild,
};
