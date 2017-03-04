"use strict";
let participant_data = {};
let participant_ids_picked = [];
function requestScoreAndFill() {
    let url = "/cdec/api/score";
    $.get(url, function (response) {
        for (let item of response.data) {
            participant_data[item.id] = item;
            $("#participant_sel").append(`<option value="${item.id}">${item.name} — ${item.score} — ${item.description}</option>`);
        }
    });
}

function addParticipantBtnClick() {
    if (participant_ids_picked.length >= 10) {
        console.log(participant_ids_picked);
        return;
    }
    const thumbNail = "?imageMogr2/auto-orient/thumbnail/128x128!/blur/1x0/quality/100";
    let selected = $("#participant_sel").find("option:selected");
    let selectedId = selected.val();
    let item = participant_data[selectedId];
    selected.remove();
    let info;
    if (participant_ids_picked.length < 5) {
        info = $("#participant_team_one").find(`.participant_info:eq(${participant_ids_picked.length})`);
    } else {
        info = $("#participant_team_two").find(`.participant_info:eq(${participant_ids_picked.length % 5})`);
    }
    info.find("img").attr("src", item.head + thumbNail);
    info.find("div:eq(0)").text(item.name);
    info.find("div:eq(1)").text(item.score);
    participant_ids_picked.push(selectedId);

    if (participant_ids_picked.length >= 10) {
        let addButton = $("#add_participant_btn");
        let startButton = $("#start_btn");
        addButton.attr("disabled", true);
        addButton.addClass("disabled");
        startButton.attr("disabled", false);
        startButton.removeClass("disabled");
    }


}

function GroupAnimation() {
    let vsDiv = $("#vs_div").fadeIn();
}

function startGroupBtnClick() {
    let url = "/cdec/api/match/group";
    let thumbnail = "?imageMogr2/auto-orient/thumbnail/128x128!/blur/1x0/quality/100";
    let data = {list: JSON.stringify(participant_ids_picked)};
    $.post(url, data, function (response) {
        console.log(response);
        let data = response.data.radiant.concat(response.data.dire);
        let participantTeams = $(".participant_team");
        let index = 0;
        participantTeams.each(function () {
            let team = $(this);
            console.log(team);
            let infos = team.find(".participant_info");
            infos.each(function () {
                let info = $(this);
                let item = data[index];
                let head = item["head"];
                let name = item["name"];
                let score = item["score"];
                info.find("img").attr("src", head + thumbnail);
                info.find("div:eq(0)").text(name);
                info.find("div:eq(1)").text(score);
                index++;
            });
        });
        let startBtn = $("#start_btn");
        startBtn.attr("disabled", true);
        startBtn.addClass("disabled");
        startBtn.text("分拨完毕");
        GroupAnimation();
    });
}

function onDocumentReady() {
    requestScoreAndFill();
    $("#add_participant_btn").click(addParticipantBtnClick);
    $("#start_btn").click(startGroupBtnClick);
}

$(document).ready(onDocumentReady);
