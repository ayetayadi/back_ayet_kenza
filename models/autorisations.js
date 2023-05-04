const db = require('../config/connect');

db.query(`CREATE TABLE autorisations (
    id INT NOT NULL AUTO_INCREMENT,
    status ENUM('en_attente', 'approuvée', 'rejetée') NOT NULL,
    nom_banniere VARCHAR(255) NOT NULL,
    id_admin INT,
    PRIMARY KEY (id),
    FOREIGN KEY (id_admin) REFERENCES admins(id)
  );`, (err, result) => {
    if (err) throw err;
    console.log('Table autorisations created successfully!');
  });