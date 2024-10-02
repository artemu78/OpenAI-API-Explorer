const { spawn } = require("child_process");
const fs = require('fs');

function runEsbuild() {
  console.log("Run build");
  runProcess("options.ts", "dist/options.js");
  runProcess("content.ts", "dist/content.js");
  runProcess("background.ts", "dist/out.js");
  fs.copyFileSync("options.html", "dist/options.html");
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
