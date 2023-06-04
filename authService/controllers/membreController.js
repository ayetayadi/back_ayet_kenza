const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Cookies = require('js-cookie');
const db = require('../../config/connect');
const { access } = require('fs');


//accept invitation

async function acceptInvitation(req, res) {
  const code = req.body.code;

  db.getConnection(async (err, connection) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to connect to the database' });
    }

    try {
      const sqlSearch = "SELECT * FROM membres WHERE code = ?";
      const searchQuery = mysql.format(sqlSearch, [code]);

      connection.query(searchQuery, async (err, result) => {
        if (err) {
          console.error(err);
          connection.release();
          return res.status(500).json({ error: 'Failed to fetch invitation from the database' });
        }

        if (result.length === 0) {
          console.log(`No invitation found with code: ${code}`);
          connection.release();
          return res.status(404).json({ error: 'No invitation found' });
        }

        const id = result[0].id;
        const email = result[0].email;
        const accessMemberToken = jwt.sign({ id, email, code }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3h' });
        res.cookie('accessMemberToken', accessMemberToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // one week

        const sqlUpdateAppartient = "UPDATE appartient SET status = 'accepté' WHERE id_membre = ?";
        const updateValues = [id];

        connection.query(sqlUpdateAppartient, updateValues, async (err, updateResult) => {
          if (err) {
            console.error(err);
            connection.release();
            return res.status(500).json({ error: 'Failed to update membership in the database' });
          }

          const sqlSearch2 = "SELECT id_equipe FROM appartient WHERE id_membre = ?";
          const searchQuery2 = mysql.format(sqlSearch2, [id]);
          connection.query(searchQuery2, async (err, result2) => {
            if (err) {
              console.error(err);
              connection.release();
              return res.status(500).json({ error: 'Failed to retrieve equipe information' });
            }

            if (result2.length === 0) {
              connection.release();
              return res.status(500).json({ error: 'Failed to retrieve equipe information' });
            }

            const equipeId = result2[0].id_equipe;

            const sqlSearch3 = "SELECT * FROM equipes WHERE id = ?";
            const searchQuery3 = mysql.format(sqlSearch3, [equipeId]);
            connection.query(searchQuery3, async (err, result3) => {
              if (err) {
                console.error(err);
                connection.release();
                return res.status(500).json({ error: 'Failed to retrieve annonceur information' });
              }

              if (result3.length === 0) {
                connection.release();
                return res.status(500).json({ error: 'Failed to retrieve annonceur information' });
              }

              const annonceurId = result3[0].id_annonceur;
              const nom_campagne = result3[0].nom_campagne;
              const sqlSearch4 = "SELECT id, email, token FROM annonceurs WHERE id = ?";
              const searchQuery4 = mysql.format(sqlSearch4, [annonceurId]);
              connection.query(searchQuery4, async (err, selectAnnonceurResult) => {
                connection.release();
                if (err) {
                  console.error(err);
                  return res.status(500).json({ error: 'Failed to retrieve annonceur information' });
                }

                if (selectAnnonceurResult.length === 0) {
                  return res.status(500).json({ error: 'Failed to retrieve annonceur information' });
                }

                const token = selectAnnonceurResult[0].token;
                const idAnn = selectAnnonceurResult[0].id;

                const sqlUpdateToken = "UPDATE membres SET accessMemberToken = ? WHERE id = ?";
                const updateTokenValues = [accessMemberToken, id];

                connection.query(sqlUpdateToken, updateTokenValues, async (err, tokenUpdateResult) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to update access token in the database' });
                  }
                  res.cookie('accessMemberToken', accessMemberToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); 

                  res.json({ idAnn, accessMemberToken, nom_campagne });
                  
                  console.log('Invitation accepted successfully');
                });
              });
            });
          });
        });
      });
    } catch (error) {
      console.error(error);
      connection.release();
      return res.status(500).json({ error: 'An error occurred while accepting the invitation' });
    }
  });
}

async function logout(req, res) {
  const memberToken = req.cookies.memberToken;
  res.clearCookie('memberToken');
  res.cookie('memberToken', '', { maxAge: 0 });
  res.send({
    message: 'success'
  });
}


module.exports = {
  acceptInvitation,
  logout
};
