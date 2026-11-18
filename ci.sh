#!/bin/bash

# this script runs in a screen, so run it forever
while true; do
    # check for git updates
    git fetch origin main

    if [[ "$(git rev-parse main)" != "$(git rev-parse origin/main)" ]]; then
        echo "main updated, rebuilding"

        docker compose up --build -d

        echo "build complete"
    fi

    sleep 60
done