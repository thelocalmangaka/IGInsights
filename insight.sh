#!/bin/bash
if [[ $1 == *"c"* ]]; then
  # Prompts login, and generates code
  npm run code
fi

if [[ $1 == *"t"* ]]; then
  # Uses code generated from previous step to generate token
  npm run token
fi

if [[ $1 == *"m"* ]]; then
  # Runs node commands/media to generate list of permalinks
  npm run media
fi

# perform insight analytics
npm run insight

