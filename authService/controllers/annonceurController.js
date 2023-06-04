const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect.js');
const Joi = require('joi');

//register Annonceur
async function register(req, res) {
  console.log("---------> Username:" + req.body.username);
  const username = req.body.username;
  console.log("---------> Email:" + req.body.email);
  const email = req.body.email;
  console.log("---------> Password:" + req.body.password);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  console.log("---------> Date de naissance:" + req.body.dateNaiss);
  const dateNaiss = req.body.dateNaiss;
  console.log("---------> Tel:" + req.body.tel);
  const tel = req.body.tel;
  console.log("---------> Nom d'entreprise:" + req.body.nomE);
  const nomE = req.body.nomE;
  console.log("---------> Email d'entreprise:" + req.body.emailE);
  const emailE = req.body.emailE;
  console.log("---------> Domaine d'entreprise:" + req.body.domaineE);
  const telE = req.body.telE;
  console.log("---------> Téléphone d'entreprise:" + req.body.telE);
  const domaineE = req.body.domaineE;
  console.log("---------> Adresse d'entreprise:" + req.body.adresseE);
  const adresseE = req.body.adresseE;
  db.getConnection(async (err, connection) => {
    if (err) {
      throw err;
    } else {

      const sqlSearch = "SELECT * FROM annonceurs WHERE email = ?";
      const search_query = mysql.format(sqlSearch, [email]);
      const sqlInsert = "INSERT INTO annonceurs(username, email, password, dateNaiss, tel, nomE, emailE, telE, domaineE, adresseE, typeOffre) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const insert_query = mysql.format(sqlInsert, [username, email, hashedPassword, dateNaiss, tel, nomE, emailE, telE, domaineE, adresseE, "n'a pas fait le paiement"]);

      await connection.query(search_query, async (err, result) => {
        if (err) {
          throw err;
        } else {
          console.log("------> Search Results");
          console.log(result.length);
          if (result.length != 0) {
            connection.release();
            console.log("------> Annonceur already exists");
            res.status(200).json({ message: "Annonceur already exists" });
          } else {
            await connection.query(insert_query, (err, result) => {
              connection.release();
              if (err) {
                throw err;
              } else {
                console.log("--------> Nouveau Annonceur Créé");
                res.status(200).json({ message: "Nouveau Annonceur Créé" });
              }
            });
          }
        }
      });
    }
  });
};

//login Annonceur
async function login(req, res) {
  const annonceurEmail = req.body.email;
  const password = req.body.password;
  const rememberMe = req.body.rememberMe;

  db.getConnection(async (err, connection) => {
    if (err) throw err;

    const sqlSearch = 'SELECT * FROM annonceurs WHERE email = ?';
    const searchQuery = mysql.format(sqlSearch, [annonceurEmail]);

    await connection.query(searchQuery, async (err, result) => {
      if (err) {
        connection.release();
        throw err;
      }

      if (result.length === 0) {
        connection.release();
        console.log('Annonceur does not exist');
        return res.sendStatus(404);
      }

      const hashedPassword = result[0].password;
      if (await bcrypt.compare(password, hashedPassword)) {
        const annonceur = {
          id: result[0].id,
          username: result[0].username,
          email: result[0].email,
          password: result[0].password,
          tel: result[0].tel,
          dateNaiss: result[0].dateNaiss,
          nomE: result[0].nomE,
          emailE: result[0].emailE,
          telE: result[0].telE,
          domaineE: result[0].domaineE,
          adresseE: result[0].adresseE,
        };

        const accessToken = jwt.sign({ annonceur }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15d' });
        const refreshToken = jwt.sign({ annonceur }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '15d' });
        // Set cookies with appropriate expiration times
        const accessTokenMaxAge = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 90 days if "remember me" checked, else 1 day
        const refreshTokenMaxAge = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 90 days if "remember me" checked, else 7 days
        if (rememberMe) {
          res.cookie('annonceurRememberMe', 'true', { maxAge: 90 * 24 * 60 * 60 * 1000 });
          const annonceurRememberMe = jwt.sign({ annonceur }, process.env.REMEMBER_ME_SECRET);
          const updateRememberMeTokenQuery = 'UPDATE annonceurs SET remember_me_token = ? WHERE email = ?';
          const updateRememberMeTokenValues = [annonceurRememberMe, result[0].email];
          connection.query(updateRememberMeTokenQuery, updateRememberMeTokenValues, (err, updateTokenResult) => {
            if (err) {
              connection.release();
              throw err;
            }
            console.log('Remember me token updated successfully in annonceurs table');
          });

        } else {
          res.cookie('annonceurRememberMe', 'false', { httpOnly: true });
        }
        res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: accessTokenMaxAge });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: refreshTokenMaxAge });
        const updateTokenQuery = 'UPDATE annonceurs SET token = ? WHERE id = ?';
        const updateTokenValues = [accessToken, result[0].id];
        connection.query(updateTokenQuery, updateTokenValues, (err, updateTokenResult) => {
          connection.release();
          if (err) {
            throw err;
          }
          console.log('Token updated successfully in annonceurs table');

          res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // one day
          res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // one week

          res.status(200).json({ accessToken: accessToken });
          console.log('Login Annonceur Successful');
        });
      } else {
        connection.release();
        console.log('Annonceur\'s Email or Password is invalid');
        res.status(400).send('Invalid credentials!');
      }
    });
  });
}


async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).send({ message: 'unauthenticated' });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'unauthenticated' });
      }

      const annonceur_id = decoded.annonceur.id;

      const accessToken = jwt.sign({ annonceur: { id: annonceur_id } }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
      });

      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
}

async function authenticateAnnonceur(req, res, next) {
  const authHeader = req.headers['authorization'];
  const refreshToken = req.cookies.refreshToken;

  if (authHeader == null || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.annonceur = decoded.annonceur;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(401);
        const newAccessToken = jwt.sign({ annonceur: decoded.annonceur }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.cookie('accessToken', newAccessToken, { httpOnly: true });
        req.annonceur = decoded.annonceur;
        next();
      });
    } else {
      return res.sendStatus(403);
    }
  }
};

async function logout(req, res) {
  const accessToken = req.cookies.accessToken;
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('annonceurRememberMe');
  res.cookie('accessToken', '', { maxAge: 0 });
  res.send({
    message: 'success'
  });
}




module.exports = {
  register,
  login,
  refreshToken,
  authenticateAnnonceur,
  logout
};
