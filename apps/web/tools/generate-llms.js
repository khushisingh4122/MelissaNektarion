// Minimal no-op generator so the web build script can run in environments
// where the llms artifact is not required or has not been added yet.
console.log('LLM metadata generation skipped; no additional files required.');
process.exit(0);
