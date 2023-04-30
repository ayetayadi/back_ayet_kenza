const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Cookies = require('js-cookie');
const db = require('../../config/connect');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const shortid = require('shortid');

//create a team
async function createTeam(req, res) {
    const nom = req.body.nom;
    const id_annonceur = req.decodedToken;
  
    db.getConnection(async (err, connection) => {
      if (err) {
        throw err;
      } else {
        const sqlSearch = "SELECT * FROM equipes WHERE nom = ? AND id_annonceur = ?";
        const search_query = mysql.format(sqlSearch, [nom, id_annonceur]);
        const sqlInsert = "INSERT INTO equipes(nom, id_annonceur) VALUES ( ?, ?)";
        const insert_query = mysql.format(sqlInsert, [nom, id_annonceur]);
  
        await connection.query(search_query, async (err, result) => {
          if (err) {
            throw err;
          } else {
            console.log("------> Search Results");
            console.log(result.length);
            if (result.length != 0) {
              connection.release();
              console.log("------> Team already exists with name: " + nom);
              res.status(409).json({ success: false, message: 'Team already exists' });
            } else {
              await connection.query(insert_query, (err, result) => {
                connection.release();
                if (err) {
                  console.error(err);
                  res.status(500).json({ success: false, message: 'Failed to create team' });
                } else {
                  console.log("--------> Une équipe Créée");
                  res.json({ success: true, id: result.insertId, id_annonceur });
                }
              });
            }
          }
        });
      }
    });
  };
  
  //get all teams
  async function getTeams(req, res) {
    const id_annonceur = req.decodedToken;
    console.log(id_annonceur);
    db.getConnection(async (err, connection) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to connect to database');
      }
      const sqlSearch = "SELECT id, nom FROM equipes WHERE id_annonceur = ?";
      const search_query = mysql.format(sqlSearch, [id_annonceur]);
      await connection.query(search_query, async (err, result) => {
        connection.release();
        if (err) {
          console.error(err);
          return res.status(500).send('Failed to fetch teams from database');
        }
        if (result.length == 0) {
          console.log(`No teams found for id_annonceur: ${id_annonceur}`);
          return res.status(404).send('No teams found');
        }
        res.status(200).send(result);
      });
    });
  };
  
  //update a team by his name
  async function updateTeam(req, res) {
    const id_annonceur = req.decodedToken;
    const newTeamName = req.body.nom;
    const teamName = req.params.name;
  
    db.getConnection(async (err, connection) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to connect to database');
      }
  
      const sqlUpdate = "UPDATE equipes SET nom = ? WHERE id_annonceur = ? AND nom = ?";
      const update_query = mysql.format(sqlUpdate, [newTeamName, id_annonceur, teamName]);
  
      await connection.query(update_query, async (err, result) => {
        connection.release();
        if (err) {
          console.error(err);
          return res.status(500).send('Failed to update team name in database');
        }
        if (result.affectedRows == 0) {
          console.log(`No teams found for name: ${teamName} and id_annonceur: ${id_annonceur}`);
          return res.status(404).send('No teams found');
        }
        res.status(200).send({ message: 'Team name updated successfully' });
      });
    });
  };
  
  //delete a team
  async function deleteTeam(req, res) {
    const id_annonceur = req.decodedToken;
    const teamName = req.params.name;
  
    db.getConnection(async (err, connection) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to connect to database');
      }
  
      // Find the team ID
      const sqlTeamId = "SELECT id FROM equipes WHERE id_annonceur = ? AND nom = ?";
      const teamIdQuery = mysql.format(sqlTeamId, [id_annonceur, teamName]);
      await connection.query(teamIdQuery, async (err, result) => {
        if (err) {
          console.error(err);
          connection.release();
          return res.status(500).send('Failed to fetch team ID from database');
        }
        if (result.length == 0) {
          connection.release();
          console.log(`No teams found for name: ${teamName} and id_annonceur: ${id_annonceur}`);
          return res.status(404).send('No teams found');
        }
  
        const teamId = result[0].id;
        console.log(teamId);
        // Delete team and associated members
        const sqlDelete = `
        START TRANSACTION;
        DELETE FROM appartient WHERE id_equipe = ?;
        DELETE FROM membres WHERE id IN (SELECT id_membre FROM appartient WHERE id_equipe = ?);
        DELETE FROM equipes WHERE id = ?;
        COMMIT;
      `;
        const delete_query = {
          sql: sqlDelete,
          values: [teamId, teamId, teamId],
          multipleStatements: true
        };
        await connection.query(delete_query, async (err, result) => {
          connection.release();
          if (err) {
            console.error(err);
            return res.status(500).send('Failed to delete team from database');
          }
          if (!result && !result[2] && result[2].affectedRows == 0) {
            console.log(`No teams found for name: ${teamName} and id_annonceur: ${id_annonceur}`);
            return res.status(404).send('No teams found');
          }
          res.status(200).send({ message: 'Team deleted successfully' });
        });
      });
    });
  }
  
  //invite member into a team
  async function inviteMember(req, res) {
    const email = req.body.email;
    const team = req.body.nom;
    const invitationCode = shortid.generate();
  
    db.getConnection(async (err, connection) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to connect to database');
      }
      //check if the team that I want to invite the member exist or not
      const sqlSearch = "SELECT * FROM equipes WHERE nom = ?";
      const search_query = mysql.format(sqlSearch, [team]);
      await connection.query(search_query, async (err, result) => {
        if (err) {
          console.error(err);
          connection.release();
          return res.status(500).send('Failed to fetch teams from database');
        }
        if (result.length == 0) {
          console.log(`No teams found with name : ${team}`);
          connection.release();
          return res.status(404).send('No teams found');
        }
  
        const team_id = result[0].id;
        //inserere membre plusieurs fois si il n'est pas invité ayu meme team
        const sqlInsertMember = `
        INSERT INTO membres (email, code)
        SELECT ?, ?
        WHERE NOT EXISTS (
          SELECT 1 FROM appartient
          INNER JOIN membres ON membres.id = appartient.id_membre
          INNER JOIN equipes ON equipes.id = appartient.id_equipe
          WHERE membres.email = ?
          AND equipes.nom = ?
        )
      `;
        const memberValues = [email, invitationCode, email, team];
        await connection.query(sqlInsertMember, memberValues, async (err, result) => {
          if (err) {
            console.error(err);
            connection.release();
            return res.status(500).send({ message: "Failed to insert member into database" });
          }
          const member_id = result.insertId;
          const sqlInsertAppartient = "INSERT INTO appartient (id_equipe, id_membre, status) VALUES (?, ?, 'en attente')";
          const appartientValues = [team_id, member_id];
          await connection.query(sqlInsertAppartient, appartientValues, async (err, result) => {
            connection.release();
            if (err) {
              console.error(err);
              return res.status(500).send('Failed to insert membership into database');
            }
            const invitationLink = "http://localhost:4200/invitation";
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              port: 465,
              auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
              }
            });
            const mailOptions = {
              from: process.env.EMAIL,
              to: email,
              subject: 'Vous avez été invité(e) à rejoindre une équipe sur Banner',
              html: `
                <p>Vous avez été invité(e) à rejoindre l'équipe "${team}" de "${req.decodedToken}" avec ce code d'invitation "${invitationCode}". Veuillez cliquer sur le bouton ci-dessous pour accepter l'invitation :</p>
                <a href="${invitationLink}" style="background-color: rgb(167, 158, 215); color: white; padding: 12px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">Accepter l'invitation</a>
                <p>Cordialement,</p>
              `
            };
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error(error);
                res.status(500).send('Internal server error');
              } else {
                res.send({ message: "Invitation sent successfully" });
                console.log('Invitation sent successfully');
              }
            });
          });
        });
      });
    });
  }
  
  
  //delete a member in a team
  async function deleteMember(req, res) {
    const email = req.body.email;
    const team = req.body.nom;
  
    db.getConnection(async (err, connection) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to connect to database' });
      }
  
      const sqlSearch = "SELECT * FROM equipes WHERE nom = ?";
      const search_query = mysql.format(sqlSearch, [team]);
  
      await connection.query(search_query, async (err, result) => {
        if (err) {
          console.error(err);
          connection.release();
          return res.status(500).json({ error: 'Failed to fetch teams from database' });
        }
  
        if (result.length === 0) {
          console.log(`No teams found with name : ${team}`);
          connection.release();
          return res.status(404).json({ error: 'No teams found' });
        }
  
        const team_id = result[0].id;
        const sqlSearchMember = "SELECT * FROM membres WHERE email = ?";
        const search_member_query = mysql.format(sqlSearchMember, [email]);
  
        await connection.query(search_member_query, async (err, result) => {
          if (err) {
            console.error(err);
            connection.release();
            return res.status(500).json({ error: 'Failed to fetch member from database' });
          }
  
          if (result[0].length === 0) {
            console.log(`No member found with email : ${email}`);
            connection.release();
            return res.status(404).json({ error: 'No member found' });
          }
  
          const member_id = result[0].id;
          console.log('member_id: ' + member_id);
          const sqlDeleteAppartient = "DELETE FROM appartient WHERE id_membre = ?";
          const deleteAppartientValues = mysql.format(sqlDeleteAppartient, [member_id]);
  
          await connection.query(deleteAppartientValues, async (err, result) => {
            if (err) {
              console.error(err);
              connection.release();
              return res.status(500).json({ error: 'Failed to delete membership from database' });
            }
  
            const sqlDeleteMember = "DELETE FROM membres WHERE id = ?";
            const deleteMemberValues = mysql.format(sqlDeleteMember, [member_id]);
  
            await connection.query(deleteMemberValues, async (err, result) => {
              connection.release();
              if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to delete member from database' });
              }
              console.log('Member deleted successfully');
              return res.status(200).json({ message: 'Member deleted successfully' });
            });
          });
        });
      });
    });
  }
  
  
  //get members by team
  async function getMembersByTeam(req, res) {
    const teamName = req.params.nom;
  
    db.getConnection(async (err, connection) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to connect to database');
      }
      const sql = `
      SELECT membres.*, appartient.status 
      FROM membres 
      JOIN appartient ON membres.id = appartient.id_membre 
      JOIN equipes ON equipes.id = appartient.id_equipe 
      WHERE equipes.nom = ?
      `;
      const values = [teamName];
      await connection.query(sql, values, async (err, result) => {
        connection.release();
        if (err) {
          console.error(err);
          return res.status(500).send('Failed to fetch members from database');
        }
        res.send(result);
        console.log(`Found ${result.length} members for team "${teamName}"`);
      });
    });
  }
  
  
  
  module.exports = {
    createTeam,
    getTeams,
    updateTeam,
    deleteTeam,
    inviteMember,
    getMembersByTeam,
    deleteMember
  };