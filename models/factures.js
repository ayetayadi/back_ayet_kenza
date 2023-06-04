const db = require('../config/connect');

db.query(`CREATE TABLE factures (
  id INT NOT NULL AUTO_INCREMENT,
  num_facture VARCHAR(255) NOT NULL,
  nom_offre VARCHAR(255) NOT NULL,
  refPaiement VARCHAR(255) NOT NULL,
  prixdt VARCHAR(255) NOT NULL,
  tva FLOAT NOT NULL,
  total FLOAT NOT NULL,
  email_annonceur VARCHAR(255) NOT NULL,
  username_annonceur VARCHAR(255) NOT NULL,
  tel_annonceur VARCHAR(255) NOT NULL,
  date_paiement DATE,
  dateFin_paiement DATE,
  id_paiement INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (id_paiement) REFERENCES paiements(id)
 );`, (err, result) => {
    if (err) throw err;
    console.log('Table factures created successfully!');
  });
  
