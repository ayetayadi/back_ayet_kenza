const db = require('../config/connect');

db.query(`CREATE TABLE factures (
  id INT NOT NULL AUTO_INCREMENT,
  description VARCHAR(255) NOT NULL,
  refPaiement VARCHAR(255) NOT NULL,
  prixdt VARCHAR(255) NOT NULL,
  tva VARCHAR(255) NOT NULL,
  nom_annonceur VARCHAR(255) NOT NULL,
  tel_annonceur VARCHAR(255) NOT NULL,
  id_paiement INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (id_paiement) REFERENCES paiements(id)
 );`, (err, result) => {
    if (err) throw err;
    console.log('Table factures created successfully!');
  });
  
