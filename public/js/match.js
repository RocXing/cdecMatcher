"use strict";

function GroupAnimation() {
    let vsDiv = $("#vs_div").fadeIn();
}


function getQueryVariable(variable) {
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}


function requestMatchAndFill() {
    let match_id = getQueryVariable("match_id");
    let url = "/cdec/api/match/detail";
    let data = {match_id: match_id};
    const imgThumbnail = "?imageMogr2/auto-orient/thumbnail/128x128!/blur/1x0/quality/100";
    $.get(url, data, function (response) {
        let data = response.data;
        let valid = data.valid;
        let time = data.time;
        let dire = data.dire;
        let radiant = data.radiant;
        $("#start_btn").text(time);
        if (!valid) {
            for (let item of radiant.players) {

                let content = `
                <div class="participant_info">
                <img src="${item.head + imgThumbnail}">
                <div class="list-group-item">${item.name}</div>
                <div class="list-group-item">${item.score}</div>
            </div>
            `;
                $("#participant_team_one ").append(content);
            }

            for (let item of dire.players) {
                let content = `
                <div class="participant_info">
                <img src="${item.head + imgThumbnail}">
                <div class="list-group-item">${item.name}</div>
                <div class="list-group-item">${item.score}</div>
            </div>
            `;
                $("#participant_team_two ").append(content);
            }
        } else {
            for (let item of radiant.players) {

                let content = `
                <div class="participant_info">
                <img src="${item.head + imgThumbnail}">
                <div class="list-group-item">${item.name}</div>
                <div class="list-group-item">${radiant.delta > 0 ? "+"+radiant.delta : radiant.delta}</div>
            </div>
            `;
                $("#participant_team_one ").append(content);
            }

            for (let item of dire.players) {
                let content = `
                <div class="participant_info">
                <img src="${item.head + imgThumbnail}">
                <div class="list-group-item">${item.name}</div>
                <div class="list-group-item">${dire.delta > 0 ? "+" + dire.delta : dire.delta}</div>
            </div>
            `;
                $("#participant_team_two ").append(content);
            }
        }
    });
}


function onDocumentReady() {
    requestMatchAndFill();
    GroupAnimation();
}

$(document).ready(onDocumentReady);
