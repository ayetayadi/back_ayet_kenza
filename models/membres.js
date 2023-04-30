const db = require('../config/connect');

db.query(`CREATE TABLE membres (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(255),
  PRIMARY KEY (id)
);`, (err, result) => {
  if (err) throw err;
  console.log('Table membres created successfully!');
});