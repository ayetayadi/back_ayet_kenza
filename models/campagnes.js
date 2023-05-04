const db = require('../config/connect');

db.query(`CREATE TABLE campagnes (
  id INT  NOT NULL AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  start_date DATETIME NOT NULL,
  id_admin INT,
  id_annonceur INT,
  PRIMARY KEY (id, id_admin, id_annonceur),
  FOREIGN KEY (id_admin) REFERENCES admins(id),
  FOREIGN KEY (id_annonceur) REFERENCES annonceurs(id)
);`, (err, result) => {
  if (err) throw err;
  console.log('Table campagnes created successfully!');
});

