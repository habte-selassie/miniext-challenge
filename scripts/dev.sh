#!/bin/bash

# If you do not have the Firebase emulator, you can install it with the following command:
# curl -sL firebase.tools | bash
pkill -f firebase
pkill -f next
set -e

# If we are running in CI, we don't need to export and import data
if [[ ! -z "$CI" ]]; then
    # We want to sleep to make sure everything was killed
    sleep 10
    firebase emulators:start --debug &
else
    sleep 10
    firebase emulators:start --import=./firebase-emulator-data --export-on-exit=./firebase-emulator-data &
fi

# Set environment variables and start the Next.js server
cross-env NEXT_PUBLIC_GIT_SHA=$(git rev-parse --short HEAD) GCLOUD_PROJECT=miniextension-challenge FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099" FIRESTORE_EMULATOR_HOST="127.0.0.1:8081" PORT=3000 FIREBASE_STORAGE_EMULATOR_HOST="127.0.0.1:9199" yarn next dev

# #!/bin/bash

# # If you do not have the firebase emulator, you can install it with the following command:
# # curl -sL firebase.tools | bash
# pkill -f firebase
# pkill -f next
# set -e

# # If we are running in CI, we don't need to export and import data
# if [[ ! -z "$CI" ]]; then
#     # We want to sleep to make sure everything was killed
#     sleep 5
#     firebase emulators:start --debug &
# else
#     sleep 5
#     firebase emulators:start --import=./firebase-emulator-data --export-on-exit=./firebase-emulator-data --debug --timeout=10000 &

#     # firebase emulators:start --import=./firebase-emulator-data --export-on-exit=./firebase-emulator-data &
# fi

# cross-env NEXT_PUBLIC_GIT_SHA=$(git rev-parse --short HEAD) GCLOUD_PROJECT=miniextension-challenge FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099" FIRESTORE_EMULATOR_HOST="127.0.0.1:8081" PORT=3000 FIREBASE_STORAGE_EMULATOR_HOST="127.0.0.1:9199" yarn next dev