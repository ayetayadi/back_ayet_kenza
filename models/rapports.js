const db = require('../config/connect');

db.query(`CREATE TABLE rapports (
  id INT  NOT NULL AUTO_INCREMENT,
  clics FLOAT,
  impressions FLOAT,
  vues FLOAT,
  tauxClics FLOAT,
  id_banner INT,
  PRIMARY KEY (id, id_banner),
  FOREIGN KEY (id_banner) REFERENCES banners(id)
  );`, (err, result) => {
  if (err) throw err;
  console.log('Table rapports created successfully!');
});

