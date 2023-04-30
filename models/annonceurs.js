const db = require('../config/connect');

db.query(`CREATE TABLE annonceurs (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  dateNaiss DATE,
  tel VARCHAR(45),
  nomE VARCHAR(255),
  emailE VARCHAR(255),
  telE VARCHAR(45),
  domaineE VARCHAR(255),
  adresseE VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_token_expiration VARCHAR(255),
  PRIMARY KEY (id),
  UNIQUE (email)
);`, (err, result) => {
  if (err) throw err;
  console.log('Table annonceurs created successfully!');
});