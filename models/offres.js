const db = require('../config/connect');

db.query(`CREATE TABLE offres (
  id INT  NOT NULL AUTO_INCREMENT,
  nomPack VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  periodePack VARCHAR(255) NOT NULL,
  prixPack VARCHAR(255) NOT NULL,
  dateCreation DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (nomPack)
  );`, (err, result) => {
  if (err) throw err;
  console.log('Table offres created successfully!');
});
