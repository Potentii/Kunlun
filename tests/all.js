'use strict';

// *Parsing the test environment file:
const env_parsing = require('dotenv').config({ path: './tests/.env' });

// *Throwing any errors ocurred when parsing the file:
if(env_parsing.error)
   throw env_parsing.error;

// *Starting the test suits:
require('./operations');
