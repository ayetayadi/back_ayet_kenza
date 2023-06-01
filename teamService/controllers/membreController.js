const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Cookies = require('js-cookie');
const db = require('../../config/connect');




//getTeamMember
async function getTeamMembers(req, res) {
    const code = req.query.code;

    db.getConnection(async (err, connection) => {
        if (err) throw (err);

        const sql0 = `
            SELECT a.id_equipe
            FROM membres m
            INNER JOIN appartient a ON m.id = a.id_membre
            INNER JOIN equipes e ON a.id_equipe = e.id
            WHERE m.code = ?
        `;
        const sql0Values = [code];
        const querySQL0 = mysql.format(sql0, sql0Values);

        const sql = `
            SELECT m.*
            FROM membres m
            INNER JOIN appartient a ON m.id = a.id_membre
            INNER JOIN equipes e ON a.id_equipe = e.id
            WHERE e.id = (${querySQL0})
            AND a.status = 'accepté'
            AND m.code != ?
        `;
        const values = [code];
        const query = mysql.format(sql, values);

        await connection.query(query, async (err, result) => {
            if (err) throw (err);
            if (result.length === 0) {
                connection.release();
                console.log(`Il n'y a pas de membres dans l'équipe de l'id ${querySQL0}!!`);
                res.status(400).send(err);
            } else {
                res.status(200).send(result);
            }
        });
    });
}


module.exports = {
    getTeamMembers
};
