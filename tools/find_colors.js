const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/firet/.gemini/antigravity/brain/2b13232b-dfee-4314-8871-f08523636881/.system_generated/logs/transcript.jsonl')
});
rl.on('line', (line) => {
  if (line.includes('"step_index":569') || line.includes('"step_index":537') || line.includes('"step_index":481')) {
    try {
      const data = JSON.parse(line);
      for (const tc of data.tool_calls || []) {
        if (tc.name === 'write_file' && tc.args.Path && tc.args.Path.includes('styles.css')) {
          const rootMatch = tc.args.Content.match(/:root\s*\{[\s\S]*?\}/);
          if (rootMatch) {
            console.log(`=== STEP ${data.step_index} :ROOT ===`);
            console.log(rootMatch[0]);
          }
        }
      }
    } catch (e) {}
  }
});
