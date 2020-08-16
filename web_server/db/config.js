/* eslint-disable */
const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

/* const development = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DATABASE_DEV_PASSWORD,
  database: '2p4p',
}); */

const production = mysql.createPool({
  host: 5,
  user: 5,
  password: 5,
  database: 'database2P'
});

module.exports = production;