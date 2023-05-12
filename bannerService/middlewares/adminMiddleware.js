const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getReceivedToken } = require('../consume');

function generateToken(id, username, email, dateNaiss, tel, nomE, emailE,telE, domaineE, adresseE) {
  const payload = { id, username, email,dateNaiss, tel, nomE, emailE,telE, domaineE, adresseE };
  const token = jwt.sign(payload, process.env.TOKEN, { expiresIn: '24h' });
  return token;
}

//get From Token the data of admin
function verifyToken(req, res, next) {
  let token = req.query.token;
  let decodedToken = { id: '', email: '' };

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, tokendata) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: 'Unauthorized request' });
    }
    if (tokendata) {
      decodedToken.id = tokendata.admin.id;
      decodedToken.email = tokendata.admin.email;
      req.decodedToken = decodedToken;
      next();
    }
  });
}


//get From Token the Id of admin
function verifyTokenId(req, res, next) {
  let token = getReceivedToken();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, tokendata) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: 'Unauthorized request' });
    }
    if (tokendata) {
      req.decodedToken = tokendata.admin.id;
      next();
    }
  });
}

//get From Token the email of admin
function verifyTokenEmail(req, res, next) {
  let token = getReceivedToken();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, tokendata) {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: 'Unauthorized request' });
    }
    if (tokendata) {
      req.decodedToken = tokendata.admin.email;
      next();
    }
  });
}



module.exports = {
  generateToken,
  verifyToken,
  verifyTokenId,
  verifyTokenEmail
};