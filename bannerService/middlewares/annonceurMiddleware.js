const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getReceivedToken } = require('../consume');

function generateToken(id, username, email, dateNaiss, tel, nomE, emailE,telE, domaineE, adresseE) {
  const payload = { id, username, email,dateNaiss, tel, nomE, emailE,telE, domaineE, adresseE };
  const token = jwt.sign(payload, process.env.TOKEN, { expiresIn: '24h' });
  return token;
}

//get From Token the data of annonceur
function verifyToken(req, res, next) {
  let token = req.query.token;
  let decodedToken = { id: '', email: '', username: '', dateNaiss: '', tel: '', nomE: '', emailE: '', telE:'', domaineE: '', adresseE: '' };

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, tokendata) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: 'Unauthorized request' });
    }
    if (tokendata) {
      decodedToken.id = tokendata.annonceur.id;
      decodedToken.email = tokendata.annonceur.email;
      decodedToken.username = tokendata.annonceur.username;
      decodedToken.dateNaiss = tokendata.annonceur.dateNaiss;
      decodedToken.tel = tokendata.annonceur.tel;
      decodedToken.nomE = tokendata.annonceur.nomE;
      decodedToken.emailE = tokendata.annonceur.emailE;
      decodedToken.domaineE = tokendata.annonceur.domaineE;
      decodedToken.telE = tokendata.annonceur.telE;
      decodedToken.adresseE = tokendata.annonceur.adresseE;
      req.decodedToken = decodedToken;
      next();
    }
  });
}


//get From Token the Id of annonceur
function verifyTokenId(req, res, next) {
  let token = getReceivedToken();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, tokendata) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: 'Unauthorized request' });
    }
    if (tokendata) {
      req.decodedToken = tokendata.annonceur.id;
      next();
    }
  });
}

//get From Token the email of annonceur
function verifyTokenEmail(req, res, next) {
  let token = getReceivedToken();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, tokendata) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: 'Unauthorized request' });
    }
    if (tokendata) {
      req.decodedToken = tokendata.annonceur.email;
      next();
    }
  });
}

function verifyTokenUsername(req, res, next) {
  let token = getReceivedToken();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, tokendata) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: 'Unauthorized request' });
    }
    if (tokendata) {
      req.decodedToken = tokendata.annonceur.username;
      next();
    }
  });
}

module.exports = {
  generateToken,
  verifyToken,
  verifyTokenId,
  verifyTokenEmail,
  verifyTokenUsername
};