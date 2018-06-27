"use strict";

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


function requestUserAndFill() {
    let user_id = getQueryVariable("user_id");
    let url = "/cdec/api/participant/score";
    let data = {user_id: user_id};
    const imgThumbnail = "?imageMogr2/auto-orient/thumbnail/128x128!/blur/1x0/quality/100";
    $.get(url, data, function (response) {
        let data = response.data;
        let name = data.name;
        let description = data.description;
        let score = data.score;
        let head = data.head;
        let win = data.win;
        let times = data.times;
        let matches = data.matches;
        $(".participant_info img").attr("src", `${head}?imageMogr2/auto-orient/thumbnail/128x128!/blur/1x0/quality/100`);
        $(".list-group-item:eq(0)").text(`${name}(${description})`);
        $(".list-group-item:eq(1)").text(`${score}分`);
        $(".list-group-item:eq(2)").text(`${win}胜/${times}场`);

        for (let item of matches) {

            let content = `<tr><td>${item.time}</td>
                    <td>${item.result ? "胜利" : "失败"}</td>
                    <td>${item.delta > 0 ? "+" + item.delta : item.delta}</td>
                    <td>${item.team ? "夜魇" : "天辉"}</td></tr>`;
            $("#score_table").append(content);
        }

    });
}


function onDocumentReady() {
    requestUserAndFill();
}

$(document).ready(onDocumentReady);
