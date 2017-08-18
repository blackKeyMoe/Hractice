var MAX_DANMU_LEN = 50;
var audio = $("audio")[0];
var danmus = null;
var topdanmus = [], bottomdanmus = [], scrolldanmus = [];
var tracks = Array(31);
var n = 0;
tracks[0] = 1;
for(i = 1; i<31; i++){
    tracks[i] = null;	
}
var can = document.getElementById("canvas");
var ctx = can.getContext("2d");

var update_danmus = function(){
    $.each(danmus, function(i, item){
        if(!item)
            return;
        if(item.time - current_time() < 0.1){
            if(item.position < 0)
                bottomdanmus.push(item);
            else if(item.position < 0.7)
                topdanmus.push(item);
            else
                scrolldanmus.push(item);
            danmus.splice(i, 1);
        }
    });
};

var clear_frame = function(){
    ctx.clearRect(0, 0, can.width, can.height);
    ctx.fillStyle = "#efefef00";
    ctx.fillRect(0, 0, can.width, can.height);
};

var track_enabled = function(danmu, item){
    if(!item)
        return true;
    if(item.x > can.width-item.width-32)
        return false;
    return (can.width - item.x - item.width) > ((item.x + item.width) / item.vx) * (danmu.vx - item.vx)
};

var track_select = function(danmu){
    for(i=1	; i<31; i++){
        if(track_enabled(danmu, tracks[i])){
            danmu.track = i;
            tracks[i] = danmu;	
            break;
        }
    }
};

var set_brush = function(danmu, font_type){
    font_type = " " + font_type || "Helvetica"
    ctx.textAlign = danmu.position == 1?"left":"center";
    ctx.fillStyle = danmu.color;
    ctx.font = danmu.font + font_type;
    danmu.x -= danmu.vx;
};

var draw_danmu = function(danmuset){
    $.each(danmuset, function(i, item){
        if(!item)
            return;
        if(!item.track && item.position==1)
            track_select(item);
        if(!item.track && item.position!=1)
            item.track = item.position<0?29 - i % 30:i % 30 + 1;

        set_brush(item);
        ctx.fillText(item.text, item.x, 16*item.track);

        if(item.position==1 && item.x > tracks[item.track].x){
            tracks[item.track] = item;
        }
        if(item.position!=1 && (current_time()-item.time > 7)){
            danmuset.splice(i, 1);
        }
        if(item.position==1 && (item.x <= -item.width)){
            danmuset.splice(i,1);
        }
    });
};
var anirun = function(){
    if(audio.paused)
        return;		
    update_danmus();
    clear_frame();
    draw_danmu(scrolldanmus);		
    draw_danmu(topdanmus);
    draw_danmu(bottomdanmus);
};

var setpro = function(danmu){
    ctx.font = danmu.font + " Helvetica";
    danmu.width = ctx.measureText(danmu.text).width;
    danmu.x = can.width * (danmu.position>0?danmu.position:-danmu.position);
    danmu.vx = (danmu.width + can.width) / 350 * (danmu.position>0.7?1:0);
};

var current_time = function(){
    return audio.currentTime;
}
    
$.getJSON("/static/dm.json", function(data) {
    danmus = data.danmu;
    $.each(danmus, function(i, item){
        setpro(item);
    });
    n = setInterval(anirun, 20);
});
$("#danmusubmit").click(function(){
    danmu = {};
    danmu.text = $("#danmutext").val();
    if(danmu.text.length > MAX_DANMU_LEN){
        alert("too long");
        return;
    }
    danmu.position = $("#danmuposition").val();
    danmu.time = current_time() + 0.5;
    danmu.color = "#230079";
    danmu.font = $("#danmufont").val();
    setpro(danmu);
    danmus.push(danmu);
    console.log(danmu, ctx.font);
});