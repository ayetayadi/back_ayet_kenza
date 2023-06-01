const db = require('../config/connect');

db.query(`CREATE TABLE equipes (
  id INT NOT NULL AUTO_INCREMENT,
  nom NOT NULL VARCHAR(255),
  id_annonceur INT,
  nom_campagne NOT NULLVARCHAR(255),
  PRIMARY KEY (id, id_annonceur),
  FOREIGN KEY (id_annonceur) REFERENCES annonceurs(id)
);`, (err, result) => {
  if (err) throw err;
  console.log('Table equipes created successfully!');
});
