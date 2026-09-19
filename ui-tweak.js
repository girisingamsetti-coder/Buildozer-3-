const fs = require('fs');
const files = [
  'src/components/modules/v3-view.tsx',
  'src/components/modules/v3/tabs/overview-tab.tsx',
  'src/components/modules/v3/tabs/evm-tab.tsx',
  'src/components/modules/v3/tabs/ohs-tab.tsx',
  'src/components/modules/v3/tabs/road-safety-tab.tsx',
  'src/components/modules/v3/tabs/social-tab.tsx',
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    
    // Reduce excessive padding and gaps to bring items closer
    content = content.replace(/\bgap-5\b/g, 'gap-3');
    content = content.replace(/\bgap-6\b/g, 'gap-3');
    content = content.replace(/\bgap-8\b/g, 'gap-4');
    
    content = content.replace(/\bp-5\b/g, 'p-4');
    content = content.replace(/\bp-6\b/g, 'p-4');
    content = content.replace(/\bp-8\b/g, 'p-5');

    // Standardize all Card rounding to rounded-xl
    content = content.replace(/<Card className="([^"]*?)"/g, (match, p1) => {
       // Remove existing rounded classes
       let newClass = p1.replace(/\brounded-\w+\b/g, '').replace(/\s+/g, ' ').trim();
       return `<Card className="${newClass} rounded-2xl shadow-sm border-border/40"`;
    });
    
    content = content.replace(/<Card>/g, '<Card className="rounded-2xl shadow-sm border-border/40">');
    
    // Some tabs had `rounded-xs` inside badge or other elements.
    // Replace rounded-xs with rounded-md
    content = content.replace(/\brounded-xs\b/g, 'rounded-md');
    
    fs.writeFileSync(f, content);
    console.log('Processed', f);
  }
});
