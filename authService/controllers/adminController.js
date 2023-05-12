const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../../config/connect.js');
const { publishAuthMessage } = require('../produce');

//add admin
async function add(req, res) {
  console.log("---------> Email:" + req.body.email);
  const email = req.body.email;
  console.log("---------> Password:" + req.body.password);
  salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "SELECT * FROM admins WHERE email = ?";
    const search_query = mysql.format(sqlSearch, [email]);
    const sqlInsert = "INSERT INTO admins VALUES (0, ?, ?)";
    const insert_query = mysql.format(sqlInsert, [email, hashedPassword]);

    await connection.query(search_query, async (err, result) => {
      if (err) throw err;
      console.log("------> Search Results");
      console.log(result.length);
      if (result.length != 0) {
        connection.release();
        console.log("------> Admin already exists");
        res.sendStatus(409);
      } else {
        await connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          console.log("--------> Nouveau Admin Créé");
          console.log(result.insertId);
          res.sendStatus(201);
        });
      }
    });
  });
};

//loginadmin
async function login(req, res) {
  const admin = req.body.email;
  const password = req.body.password;
  const rememberMe = req.body.rememberMe;

  db.getConnection(async (err, connection) => {
    if (err) throw (err)
    const sqlSearch = "Select * from admins where email = ?"
    const search_query = mysql.format(sqlSearch, [admin])
    await connection.query(search_query, async (err, result) => {
      connection.release()

      if (err) throw (err)
      if (result.length == 0) {
        console.log("--------> Admin does not exist")
        res.sendStatus(404)
      }
      else {
        const hashedPassword = result[0].password

        if (await bcrypt.compare(password, hashedPassword)) {

          const admin = {
            id: result[0].id,
            email: result[0].email,
          }

          const accessToken = jwt.sign({ admin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
          const refreshToken = jwt.sign({ admin  }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '15d' });
/*     // Create access token and refresh token
            const accessToken = jwt.sign({ email:admin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            const refreshToken = jwt.sign({ email:admin }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '15d' });
           
            // Set cookies with appropriate expiration times
            const accessTokenMaxAge = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 90 days if "remember me" checked, else 1 day
            const refreshTokenMaxAge = rememberMe ? 90 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000; // 90 days if "remember me" checked, else 7 days
            res.cookie('accessToken', accessToken, { httpOnly: true, maxAge: accessTokenMaxAge }); 
            res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: refreshTokenMaxAge }); */
          
          res.cookie('accessToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // un jour
          res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // une semaine
  
            res.status(200).json({ accessToken: accessToken });
  
            console.log('---------> Login Admin Successful')
  
            publishAuthMessage(accessToken);

        }
        else {
          console.log("---------> Admin's Email or Password are invalid")
          res.send("Email or Password are invalid!")
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

      const admin_id = decoded.admin.id;

      const accessToken = jwt.sign({ admin: { id: admin_id } }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
      });

      res.json({ accessToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
}

async function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const refreshToken = req.cookies.refreshToken;

  if (authHeader == null || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(401);
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.admin = decoded.admin;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.sendStatus(401);
        const newAccessToken = jwt.sign({ admin: decoded.admin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        res.cookie('accessToken', newAccessToken, { httpOnly: true });
        req.admin = decoded.admin;
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
  add,
  login,
  refreshToken,
  authenticateAdmin,
  logout
}