import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Note: If you use library-specific PostCSS/Tailwind configuration then you should remove the `postcssConfig` build
// option from your application's configuration (i.e. project.json).
//
// See: https://nx.dev/guides/using-tailwind-css-in-react#step-4:-applying-configuration-to-libraries

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  plugins: {
    tailwindcss: {
      // Resolve the Tailwind config relative to this file in an ESM-safe way
      config: join(__dirname, 'tailwind.config.js'),
    },
    autoprefixer: {},
  },
};
