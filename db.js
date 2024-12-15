const Pool  = require("pg").Pool;

//observe this Pool vs pool while importing its * capital P *

const pool = new Pool({
  user: "postgres",
  password: "Cbum@123",
  host: "10.210.9.61",
  port: 5432,
  database: "PowerpointGym",
  //dateStrings: "date",
  //timezone: "+00:00",
  //dateStrings: true,
  //date: date
});

module.exports = pool;