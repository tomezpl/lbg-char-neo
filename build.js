const esbuild = require('esbuild');

const production = process.argv.findIndex(argItem => argItem === '--mode=production') >= 0;

const onRebuild = (context) => {
  return async (err, res) => {
    if (err) {
      return console.error(`[${context}]: Rebuild failed`, err);
    }

    console.log(`[${context}]: Rebuild succeeded, warnings:`, res.warnings);
  }
}

const server = {
  platform: 'node',
  target: ['node16'],
  format: 'cjs',
};

const client = {
  platform: 'browser',
  target: ['chrome93'],
  format: 'iife',
};

async function build() {
  for (const context of [ 'client', 'server' ]) {
    const options = {
      bundle: true,
      entryPoints: [`${context}/${context}.ts`],
      outfile: `dist/${context}.js`,
      // watch: production ? false : {
      //   onRebuild: onRebuild(context),
      // },
      ...(context === 'client' ? client : server),
    }
    const ctx = await esbuild.context(options);

    try {
      if(production) {
        await ctx.rebuild();
        console.log(`[${context}]: Built successfully!`);
      }
      else {
        ctx.watch();
        console.log(`[${context}]: watching`);
      }
    } catch {
      process.exit(1);
      return;
    }
  }

  if(production) {
    process.exit(0);
  }
}

build();