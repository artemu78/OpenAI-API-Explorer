const { spawn } = require("child_process");
const fs = require('fs');
const path = require('path');

const BUILD_FOLDER = 'dist';

function prepareFolder() {
  const buildPath = path.join(__dirname, BUILD_FOLDER);
  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
  }
  return buildPath;
}

function runEsbuild() {
  console.log("Run build");
  const buildPath = prepareFolder();

  runProcess("options.ts", path.join(buildPath, "options.js"));
  runProcess("content.ts", path.join(buildPath, "content.js"));
  runProcess("background.ts", path.join(buildPath, "out.js"));
  fs.copyFileSync("options.html", path.join(buildPath, "options.html"));
  spawn("node", ["archive"]);
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
