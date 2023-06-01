const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateAccessToken(id, username, email, dateNaiss, tel, nomE, emailE,telE, domaineE, adresseE) {
  const payload = { id, username, email ,dateNaiss, tel, nomE, emailE,telE, domaineE, adresseE };
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
  return token;
}

function generateRefreshToken(id, username, email, dateNaiss, tel, nomE, emailE,telE, domaineE, adresseE) {
  const payload = { id, username, email ,dateNaiss, tel, nomE, emailE,telE, domaineE, adresseE };
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' });
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
  let token = req.query.token;

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, tokendata) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: 'Unauthorized request' });
    }
    if (tokendata && tokendata.annonceur && tokendata.annonceur.id) {
      req.decodedToken = tokendata.annonceur.id;
      next();
    } else {
      return res.status(400).json({ message: 'Invalid token data' });
    }
  });
}

//get From Token the email of annonceur
function verifyTokenEmail(req, res, next) {
  let token = req.query.token;

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
  let token = req.query.token;

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
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyTokenId,
  verifyTokenEmail,
  verifyTokenUsername
};