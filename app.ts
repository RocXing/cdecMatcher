"use strict";

import * as express from "express";
import * as bodyParser from "body-parser";
import * as multer from "multer";
import * as DB from "./libs/DB";

let app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

// respond with "hello world" when a GET request is made to the homepage
//app.get('/', function (req, res) {
//    res.send('hello world');
//});

app.get('/api/score', async function (req, res) {
    let sql = `SELECT id, name, description, score, head, times,
                CASE WHEN win IS NULL THEN 0 ELSE win END
                FROM
                    cdec_participant LEFT JOIN
                    (
                        SELECT
                            COUNT (*) AS win,
                            participant_id
                        FROM
                            cdec_match_relation
                        WHERE
                            "result" IS TRUE
                        GROUP BY
                            participant_id
                    ) AS R
                ON R.participant_id = cdec_participant. ID
                ORDER BY score DESC`;
    let result = await DB.queryAsync(sql);
    let ret = result.rows.length ? result.rows : [];
    return res.json({status: 0, message: "success", data: ret}).end();
});

app.get('/api/participant/score', async function (req, res) {
    let userId = req.query.id;
    let userName = req.query.name;
    if (!userId && !userName) {
        return res.json({status: -1, message: "bad parameters"}).end();
    }

    let nameSql = `SELECT
                        Delta.match_id, Delta."result", Delta.delta,
                        Delta.team, cdec_match."time"
                    FROM
                        (
                            SELECT * FROM cdec_match_relation
                            WHERE delta IS NOT NULL
                            AND cdec_match_relation."participant_id" = (
                                SELECT ID FROM cdec_participant
                                WHERE NAME = $1
                            )
                        ) AS Delta
                    LEFT JOIN cdec_match ON cdec_match."id" = Delta.match_id
                    WHERE "valid" = TRUE ORDER BY TIME DESC`;

    let idSql = `SELECT
                    Delta.match_id, Delta."result", Delta.delta,
                    Delta.team, cdec_match."time"
                FROM
                    (
                        SELECT * FROM cdec_match_relation
                        WHERE delta IS NOT NULL
                        AND cdec_match_relation."participant_id" = $1
                    ) AS Delta
                LEFT JOIN cdec_match ON cdec_match."id" = Delta.match_id
                WHERE "valid" = TRUE ORDER BY TIME DESC`;

    let sql = userId ? idSql : nameSql;
    let param = userId ? userId : userName;
    let result = await DB.queryAsync(sql, param);
    let ret = result.rows.length ? result.rows : [];
    return res.json({status: 0, message: "success", data: ret}).end();
});

app.post('/api/participant/add', async function (req, res) {
    let name = req.body.name;
    let score = req.body.score;
    let description = req.body.description;

    let sql = `INSERT INTO cdec_participant(name, description, score) VALUES ($1, $2, $3) RETURNING 1`;
    let result = await DB.queryAsync(sql, [name, description, score]);
    return res.json({status: 0, message: "success"}).end();
});

app.post('/api/match/group', async function (req, res) {
    let idList = req.body.list ? JSON.parse(req.body.list) : req.body.list;
    if (!idList || !Array.isArray(idList) || idList.length != 10) {
        return res.json({status: -1, message: "bad parameters"}).end();
    }

    let sql = `SELECT * FROM cdec_participant WHERE id IN (${idList.map(id=> {
        return "'" + id + "'";
    }).join(',')})`;
    let result = await DB.queryAsync(sql);

    if (result.rows.length != 10) {
        return res.json({status: -1, message: "internal error"}).end();
    }

    let n = result.rows.length;
    let participants = result.rows;
    for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
            if (participants[i].score > participants[j].score) {
                let temp = participants[i];
                participants[i] = participants[j];
                participants[j] = temp;
            }
        }
    }
    let matchGroup = [];
    let matchGroupDiff = [];
    for (let i = 0; i < n / 2; i++) {
        matchGroup[i] = [participants[2 * i + 1], participants[2 * i]];
        matchGroupDiff[i] = participants[2 * i + 1].score - participants[2 * i].score;
    }

    for (let i = 0; i < matchGroup.length - 1; i++) {
        for (let j = i + 1; j < matchGroup.length; j++) {
            if (matchGroupDiff[i] > matchGroupDiff[j]) {
                let temp = matchGroup[i];
                matchGroup[i] = matchGroup[j];
                matchGroup[j] = temp;
                temp = matchGroupDiff[i];
                matchGroupDiff[i] = matchGroupDiff[j];
                matchGroupDiff[j] = temp;
            }
        }
    }

    let radiant = [];
    let dire = [];
    let balance = 0;
    for (let i = matchGroup.length - 1; i >= 0; i--) {
        if (balance > 0) {
            radiant.push(matchGroup[i][1]);
            dire.push(matchGroup[i][0]);
            balance -= matchGroupDiff[i];
        } else {
            radiant.push(matchGroup[i][0]);
            dire.push(matchGroup[i][1]);
            balance += matchGroupDiff[i];
        }
    }

    // create match
    sql = `INSERT INTO cdec_match(valid) VALUES (false) RETURNING id`;
    result = await DB.queryAsync(sql);
    let matchId = result.rows[0].id;
    for (let participant of radiant) {
        sql = `INSERT INTO cdec_match_relation(participant_id,match_id,team) VALUES ($1,$2,$3)`;
        result = await DB.queryAsync(sql, [participant.id, matchId, 0]);
    }
    for (let participant of dire) {
        sql = `INSERT INTO cdec_match_relation(participant_id,match_id,team) VALUES ($1,$2,$3)`;
        result = await DB.queryAsync(sql, [participant.id, matchId, 1]);
    }

    let ret = {matchId: matchId, radiant: radiant, dire: dire, balance: balance};
    return res.json({status: 0, message: "success", data: ret}).end();

});

app.post('/api/match/record', async function (req, res) {
    let matchId = req.body.matchId;
    let winner = req.body.winner;

    let sql = `SELECT
                    cdec_participant.id AS participant_id, score, team
                FROM
                    cdec_match,
                    cdec_participant,
                    cdec_match_relation
                WHERE
                    cdec_match."id" = cdec_match_relation.match_id
                AND cdec_participant."id" = cdec_match_relation.participant_id
                AND VALID = FALSE
                AND match_id = $1
                ORDER BY team ASC, score DESC`;

    let result = await DB.queryAsync(sql, matchId);
    let participants = result.rows;
    let radiantScore = 0;
    let direScore = 0;
    let radiantParticipantIds = [];
    let direParticipantIds = [];
    for (let participant of participants) {
        if (participant.team == 0) {
            radiantScore += participant.score;
            radiantParticipantIds.push(participant.participant_id);
        } else {
            direScore += participant.score;
            direParticipantIds.push(participant.participant_id);
        }
    }
    const K = 200;
    const PX = 500 * 5;
    let Ea = 1 / (1 + Math.pow(10, (direScore - radiantScore) / PX));
    let Eb = 1 - Ea;
    let radiantDelta;
    let direDelta;
    if (winner == 0) {
        radiantDelta = K * (1 - Ea);
        direDelta = -1 * radiantDelta;
    } else {
        direDelta = K * (1 - Eb);
        radiantDelta = -1 * direDelta;
    }
    radiantDelta = Math.round(radiantDelta);
    direDelta = Math.round(direDelta);

    sql = `UPDATE cdec_match_relation SET delta = $1, result = $2 WHERE match_id = $3 AND team = $4`;
    await DB.queryAsync(sql, [radiantDelta.toString(), radiantDelta > 0, matchId, 0]);
    await DB.queryAsync(sql, [direDelta.toString(), direDelta > 0, matchId, 1]);

    sql = `UPDATE cdec_match SET valid = true WHERE id = $1`;
    await DB.queryAsync(sql, [matchId]);

    console.log(radiantParticipantIds);
    sql = `UPDATE cdec_participant SET times = times + 1, score = score + $1 WHERE id IN (${radiantParticipantIds.map(id=> {
        return "'" + id + "'"
    }).join(",")})`;
    await DB.queryAsync(sql, [radiantDelta]);

    sql = `UPDATE cdec_participant SET times = times + 1, score = score + $1 WHERE id IN (${direParticipantIds.map(id=> {
        return "'" + id + "'"
    }).join(",")})`;
    await DB.queryAsync(sql, [direDelta]);

    return res.json({status: 0, message: "success"}).end();


});

app.use('/', express.static('public'));

app.use(function (req, res, next) {
    res.status(404);
});

app.listen("8080");