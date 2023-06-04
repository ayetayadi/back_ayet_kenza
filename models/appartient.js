const db = require('../config/connect');

db.query(`CREATE TABLE appartient (
  id_equipe INT,
  id_membre INT,
  status ENUM('en attente', 'accepté') DEFAULT 'en attente',
  PRIMARY KEY (id_equipe, id_membre),
  FOREIGN KEY (id_equipe) REFERENCES equipes(id),
  FOREIGN KEY (id_membre) REFERENCES membres(id)
);`, (err, result) => {
  if (err) throw err;
  console.log('Table appartient created successfully!');
});