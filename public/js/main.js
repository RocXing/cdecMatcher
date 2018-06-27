"use strict";
function requestScoreAndFill() {
    let url = "/cdec/api/score";
    $.get(url, function (response) {
        let index = 0;
        for (let item of response.data) {
            let imgThumbnail = `?imageView2/2/w/32/h/32/interlace/1/q/100`;
            let redirect = "./user.html?user_id=";
            let pic = "";
            if(index>=0 && index <4) pic = `<img src="http://olo9f0ooe.bkt.clouddn.com/${index+1}.png">`;
            let content = `<tr><td>${++index}${pic}</td>
                            <td><a href="${redirect + item.id}"><img src="${item.head + imgThumbnail}">${item.name}</a></td>
                            <td>${item.description}</td>
                            <td>${item.score}</td>
                            <td>${item.times}</td>
                            <td>${item.win}</td></tr>`;
            $("#score_table ").append(content);
        }
    });
}
$(document).ready(requestScoreAndFill());