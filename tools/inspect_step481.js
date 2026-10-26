const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/firet/.gemini/antigravity/brain/2b13232b-dfee-4314-8871-f08523636881/.system_generated/logs/transcript.jsonl')
});
rl.on('line', (line) => {
  if (line.includes('"step_index":481')) {
    try {
      const data = JSON.parse(line);
      for (const tc of data.tool_calls || []) {
        if (tc.name === 'write_file' && tc.args.Path && tc.args.Path.includes('styles.css')) {
          const content = tc.args.Content;
          // Look for .btn-hero-primary or brand accent
          const btnMatch = content.match(/\.btn-hero-primary\s*\{[\s\S]*?\}/);
          if (btnMatch) console.log('btn-hero-primary:', btnMatch[0]);
          const brandMatch = content.match(/\.brand-name\s*span\s*\{[\s\S]*?\}/);
          if (brandMatch) console.log('brand-name span:', brandMatch[0]);
          const ctaNavMatch = content.match(/\.btn-cta-nav\s*\{[\s\S]*?\}/);
          if (ctaNavMatch) console.log('btn-cta-nav:', ctaNavMatch[0]);
        }
      }
    } catch (e) {}
  }
});
