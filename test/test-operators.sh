#!/bin/bash

if [ -z ${OPERATORS_DIR+x} ]; then
  export OPERATORS_DIR=${CI_PROJECT_DIR}/operators
fi

if [ -z ${OPERATORS_TEST_DIR+x} ]; then
  export OPERATORS_TEST_DIR=${CI_PROJECT_DIR}/test/files
fi

yarn --cwd /app test-operators
