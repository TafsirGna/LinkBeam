#!/bin/bash

# Running tailwind first for css class compilation
npm run tailbuild

# # Copying the first config file
# cp ./tmp/vite.config-1.js ./vite.config.js

# # Running the first step
# npm run build

# # Moving files to temporary directory
# mv ./dist/assets/web_ui.js ./tmp/web_ui.js

# # Copying the second config file
# cp ./tmp/vite.config-2.js ./vite.config.js

# # Running the second step
# npm run build

# # Moving files to temporary directory
# mv ./dist/assets/profile_data_extractor.js ./tmp/profile_data_extractor.js

# Copying the third config file
cp ./tmp/vite.config-3.js ./vite.config.js

# Running the third step
npm run build

# Moving files to temporary directory
mv ./dist/assets/mixed_data_extractor.js ./tmp/mixed_data_extractor.js

# Copying the fourth config file
cp ./tmp/vite.config-4.js ./vite.config.js

# Running the fourth step
npm run build

# Moving back files from temporary directory to assets folder
# mv ./tmp/profile_data_extractor.js ./dist/assets/profile_data_extractor.js

mv ./tmp/mixed_data_extractor.js ./dist/assets/mixed_data_extractor.js

# mv ./tmp/web_ui.js ./dist/assets/web_ui.js

cp ./manifest-example.json ./dist/manifest.json
