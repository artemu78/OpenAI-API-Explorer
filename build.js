const { spawn } = require("child_process");

function runEsbuild() {
  console.log("Run build");
  runProcess("options.ts", "options.js");
  runProcess("background.ts", "out.js");
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
