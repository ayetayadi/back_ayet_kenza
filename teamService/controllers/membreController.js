const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Cookies = require('js-cookie');
const db = require('../../config/connect');



//accept invitation
async function acceptInvitation(req, res) {
    const code = req.body.code;

    db.getConnection(async (err, connection) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to connect to database' });
        }
        const sqlSearch = "SELECT * FROM membres WHERE code = ?";
        const search_query = mysql.format(sqlSearch, [code]);
        await connection.query(search_query, async (err, result) => {
            if (err) {
                console.error(err);
                connection.release();
                return res.status(500).json({ error: 'Failed to fetch invitation from database' });
            }
            if (result.length == 0) {
                console.log(`No invitation found with code : ${code}`);
                connection.release();
                return res.status(404).json({ error: 'No invitation found' });
            }
            const member_id = result[0].id;
            const email = result[0].email;
            const code = result[0].code;
            const token = jwt.sign({ member_id, email, code }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

            const sqlUpdateAppartient = "UPDATE appartient SET status = 'accepté' WHERE id_membre = ?";
            const updateValues = [member_id];
            await connection.query(sqlUpdateAppartient, updateValues, async (err, result) => {
                connection.release();
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to update membership in database' });
                }
                const message = 'Invitation accepted successfully';
                res.json({ message, token });
                console.log(message);
            });
        });
    });
}

//getTeamMember
async function getTeamMembers(req, res) {
    const code = req.query.code;
  
    db.getConnection(async (err, connection) => {
        if (err) throw (err);

        const sql = `
            SELECT m.*
            FROM membres m
            INNER JOIN appartient a ON m.id = a.id_membre
            INNER JOIN equipes e ON a.id_equipe = e.id
            WHERE a.status = 'accepté'
            AND m.code != ?
        `;
        const values = [code];
        const query = mysql.format(sql, values);

        await connection.query(query, async (err, result) => {
            if (err) throw (err);
            if (result.length == 0) {
                connection.release();
                console.log(`Il y'a pas des membres dans le team!!`);
                res.status(400).send(err);
            } else {
                res.status(200).send(result);
            }
        });
    });
}


module.exports = {
    acceptInvitation,
    getTeamMembers
};
