const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/firet/.gemini/antigravity/brain/2b13232b-dfee-4314-8871-f08523636881/.system_generated/logs/transcript.jsonl')
});
rl.on('line', (line) => {
  if (line.includes('"name":"write_file"') && line.includes('styles.css')) {
    try {
      const data = JSON.parse(line);
      console.log(`Step ${data.step_index}`);
      for (const tc of data.tool_calls || []) {
        if (tc.name === 'write_file' && tc.args.Path && tc.args.Path.includes('styles.css')) {
          const lines = tc.args.Content.split('\n').slice(0, 35);
          console.log(lines.join('\n'));
        }
      }
    } catch (e) {}
  }
});
