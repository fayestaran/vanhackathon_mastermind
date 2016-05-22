
var blltry_values = [0, 0, 0, 0, 0, 0, 0, 0];
var blltry_colors = ["red", "green", "blue", "yellow", "orange", "purple", "cyan", "magenta"];
var blltry_color_codes = ["R", "G", "B", "Y", "O", "P", "C", "M"];
var blltry_guesses = 0;

$(document).ready(function () {

    $('#pnlTabLast').sortable({
        opacity: 0.5,
        stop: function(event, ui) {
            var circlelist = [];
            var blltry_valuesnew = [];
            $("[id^=blltry]").each(function () {
                circlelist.push(Number(this.id.charAt(6)));
            });
            for (var i = 0; i < circlelist.length; i++) {
                blltry_valuesnew.push(blltry_values[circlelist[i] - 1]);
                $("#blltry" + circlelist[i]).attr("id", "blltry" + (i + 1) + "0");
            }
            blltry_values = JSON.parse(JSON.stringify(blltry_valuesnew));
            $("[id^=blltry]").each(function () {
                $("#" + this.id).attr("id", this.id.slice(0, -1));
            });
        }
    });

    $('#btnStop').click(function () {
        if ($("#txtKey").val().trim() == "") {
            alert("You have to start a game first!");
            return;
        }
        if (confirm("Do you want to give up?")) {
            $("html, body").animate({ scrollTop: 0 }, "slow");
            $("#txtName").removeAttr('disabled');
            $("#btnNew").removeAttr('disabled');
            $('#btnStop').attr("disabled", "disabled");
            $("#txtName").val("");
            $("#txtKey").val(""); $('[id^=blltry]').removeClass();
            $('.add').remove();
            $('[id^=blltry]').addClass("circle white");
            blltry_values = [0, 0, 0, 0, 0, 0, 0, 0];
            $("#lblName").text("");
            $('#txtInfo').hide();
        }
    });

    $('#btnNew').click(function () {
        if ($("#txtName").val().trim() == "") {
            $("#txtName").val("Player");
        }
        $('.add').remove();
        if (JSON.stringify(blltry_values) != JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0])) {
            if (confirm("Do you want to clear current colors?")) {
                $('[id^=blltry]').removeClass();
                $('[id^=blltry]').addClass("circle white");
                blltry_values = [0, 0, 0, 0, 0, 0, 0, 0];
            }
        }
        $("#txtName").attr("disabled", "disabled");
        $("#btnNew").attr("disabled", "disabled");
        $('#btnStop').removeAttr('disabled');
        $("#lblName").text($("#txtName").val());
        $('#txtInfo').show();                
        $.ajax({
            url: "http://az-mastermind.herokuapp.com/new_game",
            method: "POST",
            async: "false",
            data: { "user": $("#txtName").val() }
            })
            .done(function (data) {
                $("#txtKey").val(data.game_key);
        });
    });

    $('#btnTry').click(function () {
        if ($("#txtKey").val().trim() == "") {
            alert("You have to start a game first!");
            return;
        }
        var vcode = "";
        var vmissing = "";
        for (var i = 0; i < 8; i++) {
            if (blltry_values[i] == 0) {
                vmissing += (i + 1).toString() + ",";
            } else {
                vcode += blltry_color_codes[blltry_values[i] - 1];
            }
        }
        if (vmissing != "") {
            alert("You must choose a color for the position(s): " + vmissing.slice(0,-1));
            return
        }
        //alert(vcode);
        $.ajax({
            url: "http://az-mastermind.herokuapp.com/guess",
            method: "POST",
            async: "false",
            data: { "code": vcode,
                "game_key": $("#txtKey").val()
                }
            })
            .done(function (data) {
                blltry_guesses = data.num_guesses + 1;
                $("<div id='pnlTab" + blltry_guesses + "' class='add circlelist center'>" +
                        "<div id='bll" + blltry_guesses + "_1' class='add circle " + blltry_colors[blltry_values[0] - 1] + "'></div>" +
                        "<div id='bll" + blltry_guesses + "_2' class='add circle " + blltry_colors[blltry_values[1] - 1] + "'></div>" +
                        "<div id='bll" + blltry_guesses + "_3' class='add circle " + blltry_colors[blltry_values[2] - 1] + "'></div>" +
                        "<div id='bll" + blltry_guesses + "_4' class='add circle " + blltry_colors[blltry_values[3] - 1] + "'></div>" +
                        "<div id='bll" + blltry_guesses + "_5' class='add circle " + blltry_colors[blltry_values[4] - 1] + "'></div>" +
                        "<div id='bll" + blltry_guesses + "_6' class='add circle " + blltry_colors[blltry_values[5] - 1] + "'></div>" +
                        "<div id='bll" + blltry_guesses + "_7' class='add circle " + blltry_colors[blltry_values[6] - 1] + "'></div>" +
                        "<div id='bll" + blltry_guesses + "_8' class='add circle " + blltry_colors[blltry_values[7] - 1] + "'></div>" +
                  "<br/></div>").insertBefore("#pnlTabLast");
                if (data.solved == "false") {
                    $("<div id='pnlRes" + blltry_guesses + "' class='add' style='height:75px;margin-top:10px;margin-left:15px;line-height:25px;'>Perfect! : " + data.result.exact + "<br/>Wrong Place... : " + data.result.near + "</div>").insertBefore("#pnlResLast");
                }
                if (data.solved == "true") {
                    $("<div id='pnlRes" + blltry_guesses + "' class='add' style='height:85px;margin-top:0px;margin-left:15px;'>" + "You Won!<br/>Total Time: " + data.time_taken.toFixed(2) + " s</div>").insertBefore("#pnlResLast");
                    $("#txtName").removeAttr('disabled');
                    $("#btnNew").removeAttr('disabled');
                    $('#btnStop').attr("disabled", "disabled");
                    $("#txtKey").val(""); $('[id^=blltry]').removeClass();
                }
                $("html, body").animate({ scrollTop: $(document).height() }, "slow");
        });
    });
});

function nextColor(id) {
    id = Number(id.substr(id.length - 1));
    var started = false
    if (($("#txtKey").val().trim() != "") || (JSON.stringify(blltry_values) != JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0]))) {
        started = true;
    } 
    blltry_values[id - 1] += 1;
    if (blltry_values[id - 1] == 9)
        blltry_values[id - 1] = 1;
    $("#blltry" + id).removeClass($("#blltry" + id).attr("class"));
    $("#blltry" + id).addClass("circle " + (blltry_colors[blltry_values[id - 1] - 1]));
    if (!started) {
        alert("Don't forget to start a game first.");
    }
}
