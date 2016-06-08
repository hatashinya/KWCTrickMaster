var LevelMax = 10;
var IndexMax = 10;
var ScoreMax = LevelMax * IndexMax;

var ja = false;
var currentLevel = 0;
var currentIndex = 0;
var $currentCell;

var _score;
function sharedScore() {
    if (_score && _score.length >= ScoreMax) {
        return _score;
    }
    
    _score = localStorage.KWC2016Trick
    if (!_score) {
        _score = "0".repeat(ScoreMax);
    } else if (_score.length < ScoreMax) {
        _score += "0".repeat(ScoreMax - _score.length);
    }
    return _score;
}

function scoreIndex(level, index) {
    return (level - 1) * 10 + (index - 1);
}

function trickScore(level, index) {
    var score = sharedScore();
    return score.charAt(scoreIndex(level, index));
}

function setTrickScore(level, index, value) {
    var valueChar = value.charAt(0);
    var score = sharedScore();
    var index = scoreIndex(level, index);
    if (index == 0) {
        _score = valueChar + score.substr(1, ScoreMax - 1);
    } else if (index == ScoreMax - 1) {
        _score = score.substr(0, index) + valueChar;
    } else if (index < ScoreMax) {
        _score = score.substr(0, index) + valueChar + score.substr(index + 1, ScoreMax - (index + 1));
    } else {
        // Unexpected
        return;
    }
    localStorage.KWC2016Trick = _score;
}

function renderTrickCell($cell, value) {
    $cell.removeClass().addClass("frequency-" + value);
}

function updateCurrentTrick(value) {
    if ($currentCell) {
        setTrickScore(currentLevel, currentIndex, value);
        renderTrickCell($currentCell, value);
    }
    $("#trick-modal").modal("hide");
}

function makeModalCenter($modal) {
    var $dialog = $modal.find(".modal-dialog");
    var left = window.scrollX + (window.innerWidth - $dialog.width()) / 2;
    $dialog.css("left", left).css("top", window.scrollY);
}

$(document).ready(function() {
    // Localize
    if (navigator) {
        var lang = (navigator.browserLanguage || navigator.language || navigator.userLanguage || "en").substr(0, 2);
        ja = (lang == "ja");
        if (ja) {
            $("#frequency-note").text("技が成功する頻度を設定してください。");
            $("#frequency-0").text("不可能");
            $("#frequency-1").text("一度だけ");
            $("#frequency-2").text("まれに");
            $("#frequency-3").text("ときどき");
            $("#frequency-4").text("普通は");
            $("#frequency-5").text("いつでも");
            $("#settings-modal .modal-title").text("設定");
            $("#delete").text("データのクリア");
            $("#delete-modal .modal-title").text("データをクリアしますか？");
        }
    }
    
    // Initialize cells
    var index = 1;
    $("#trick-table tr").each(function () {
        var level = 1;
        $(this).find("td").each(function () {
            var $cell = $(this).attr("level", level).attr("index", index);
            var value = trickScore(level, index);
            renderTrickCell($cell, value);
            level++;
        });
        index++;
    });
    
    // Initialize frequency buttons
    $(".frequency").append('<i class="pull-right fa"></i>');
    for (var f = 0 ; f <= 5 ; f++) {
        $("#frequency-" + f).attr("frequency", f);
    }
    
    $("#trick-table td").click(function () {
        $currentCell = $(this);
        
        // Level and index
        var level = currentLevel = $currentCell.attr("level");
        var index = currentIndex = $currentCell.attr("index");
        $("#trick-level-index").text("Level " + level + "-" + index);
        
        // Trick name
        var TrickNames = ja ? TrickNamesJa : TrickNamesEn;
        var trickName = TrickNames[level - 1][index - 1];
        trickName = trickName.replace("\n", "<br />").replace("\n", "<br />"); // for Japanese
        $("#trick-name").html(trickName);
        
        // Current frequency
        $(".frequency .fa").removeClass("fa-check");
        var value = trickScore(level, index);
        $("#frequency-" + value + " .fa").addClass("fa-check");
        
        // Trick video URL
        var pos = VideoPos[level - 1][index - 1];
        var url = "https://www.youtube.com/embed/" + VideoIds[level - 1] + "?showinfo=0&rel=0&autoplay=0&start=" + pos[0] + "&end=" + pos[1];
        $("#trick-video").attr("src", url);
        
        // Trick dialog
        var $modal = $("#trick-modal");
        makeModalCenter($modal);
        $modal.modal();
    });
    
    $('.frequency').click(function () {
        var f = $(this).attr("frequency");
        updateCurrentTrick(f);    
    });
    
    $("#settings").click(function () {
        var $modal = $("#settings-modal");    
        makeModalCenter($modal);
        $modal.modal();
    });
    
    $("#delete").click(function () {
        $("#settings-modal").modal("hide");
        var $modal = $("#delete-modal");
        makeModalCenter($modal);
        $modal.modal();
    });
    
    $("#delete-ok").click(function () {
        _score = "";
        localStorage.KWC2016Trick = _score;
        $("#trick-table td").removeClass();
    });
});