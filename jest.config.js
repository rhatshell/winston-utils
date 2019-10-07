/**
 * Copyright 2018 iDiscovery, Inc. All rights reserved
 *
 * NOTICE:  All information contained herein is, and remains the property of iDiscovery, Inc.  The intellectual and technical concepts
 * contained herein are proprietary to iDiscovery, Inc and may be covered by U.S. and Foreign Patents, patents in process,
 * and are protected by trade secret or copyright law.  Dissemination of this information or reproduction of this material
 * is strictly forbidden, unless prior authorized written permission is obtained from iDiscovery, Inc.
 */

const tsconfig = require("./tsconfig.json")
const moduleNameMapper = require("tsconfig-paths-jest")(tsconfig)

module.exports = {
  // globalSetup: "./jest-setup.js",
  // globalTeardown: "./jest-teardown.js",
  bail: true,
  verbose: true,
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  // testEnvironment: 'node',
  testRegex: "\\.spec\\.ts$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper,
}