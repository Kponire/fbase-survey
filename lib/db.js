import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'oluwaponire',
  password: process.env.MYSQL_PASSWORD || 'oluwaponire1234#',
  database: process.env.MYSQL_DB || 'survey_db',
});
