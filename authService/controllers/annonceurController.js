const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('../../config/connect.js');
const { publishAuthMessage } = require('../produce');
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
      const sqlInsert = "INSERT INTO annonceurs(username, email, password, dateNaiss, tel, nomE, emailE, telE, domaineE, adresseE) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const insert_query = mysql.format(sqlInsert, [username, email, hashedPassword, dateNaiss, tel, nomE, emailE, telE, domaineE, adresseE]);

      await connection.query(search_query, async (err, result) => {
        if (err) {
          throw err;
        } else {
          console.log("------> Search Results");
          console.log(result.length);
          if (result.length != 0) {
            connection.release();
            console.log("------> Annonceur already exists");
            res.sendStatus(409);
          } else {
            await connection.query(insert_query, (err, result) => {
              connection.release();
              if (err) {
                throw err;
              } else {
                console.log("--------> Nouveau Annonceur Créé");
                res.sendStatus(200);
              }
            });
          }
        }
      });
    }
  });
};

function validateLogin(req) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean()
  });

  return schema.validate(req);
}

//login Annonceur
async function login(req, res) {
  const annonceur = req.body.email;
  const password = req.body.password;
  const rememberMe = req.body.rememberMe;


  db.getConnection(async (err, connection) => {
    if (err) throw (err)
    const sqlSearch = 'SELECT * FROM annonceurs WHERE email = ?';
    const search_query = mysql.format(sqlSearch, [annonceur]);
    await connection.query(search_query, async (err, result) => {
      connection.release()
      if (err) throw (err)
      if (result.length == 0) {
        console.log('--------> Annonceur does not exist')
        res.sendStatus(404)
      }
      else {
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
          
          }
          const accessToken = jwt.sign({ annonceur }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
          const refreshToken = jwt.sign({ annonceur }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '15d' });

          // Enregistrer "remember me" token dans annonceurs table and set it cookie
          if (rememberMe) {
            const rememberMeToken = jwt.sign({ annonceur }, process.env.REMEMBER_ME_SECRET, { expiresIn: '90d' });
            const sqlUpdateToken = 'UPDATE annonceurs SET remember_me_token = ? WHERE id = ?';
            const update_query = mysql.format(sqlUpdateToken, [rememberMeToken, result[0].id]);
            await connection.query(update_query);
            
            res.cookie('rememberMeToken', rememberMeToken, { httpOnly: true, maxAge: 90 * 24 * 60 * 60 * 1000 }); // 3mois
          }

          res.cookie('accessToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // un jour
          res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // une semaine

          res.status(200).json({ accessToken: accessToken });

          console.log('---------> Login Annonceur Successful')

          publishAuthMessage(accessToken);

        }
        else {
          console.log('---------> Annonceur\'s Email or Password are invalid')
          res.status(400).send('Invalid credentials!')
        }
      }
    })
  })
};

     


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
  const refreshToken = req.cookies.refreshToken;
  res.clearCookie('refreshToken');
  res.cookie('refreshToken', '', { maxAge: 0 });
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
