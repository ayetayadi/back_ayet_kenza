const db = require('../config/connect');

db.query(`CREATE TABLE paiements (
  id INT NOT NULL AUTO_INCREMENT,
  datePaiement DATETIME NOT NULL,
  refPaiement VARCHAR(255) NOT NULL,
  montant VARCHAR(255) NOT NULL,
  id_annonceur INT,
  id_offre INT,
  PRIMARY KEY (id),
  FOREIGN KEY (id_annonceur) REFERENCES annonceurs(id),
  FOREIGN KEY (id_offre) REFERENCES offres(id)
);`, (err, result) => {
  if (err) throw err;
  console.log('Table paiements created successfully!');
});
