#!/bin/bash

# Running tailwind first for css class compilation
npm run tailbuild

# Copying the first config file
cp ./tmp/vite.config-1.js ./vite.config.js

# Running the first step
npm run build

# Moving files to temporary directory
mv ./dist/assets/web_ui.js ./tmp/web_ui.js

# # Copying the second config file
# cp ./tmp/vite.config-2.js ./vite.config.js

# # Running the second step
# npm run build

# # Moving files to temporary directory
# mv ./dist/assets/tab_verifier_cs.js ./tmp/tab_verifier_cs.js

# Copying the third config file
cp ./tmp/vite.config-3.js ./vite.config.js

# Running the second step
npm run build

# Moving back files from temporary directory to assets folder
# mv ./tmp/tab_verifier_cs.js ./dist/assets/tab_verifier_cs.js

mv ./tmp/web_ui.js ./dist/assets/web_ui.js

cp ./manifest-example.json ./dist/manifest.json
