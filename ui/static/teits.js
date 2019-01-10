patrol_in_progess = false;

$(function(){
    $('.drag').draggable({revert:"invalid",revertDuration: 300}); // appel du plugin
});

function set_drone_position(drone_id,drop_zone,action){
    $.ajax({
            url: 'set_drone_position',
            type: 'post',
            data: {"drone_id":drone_id,"drop_zone":drop_zone,"action":action},
            success:function(data){
                console.log(data)
            }
        });
}



function set_zone_position(zone_id,top,left){
    $.ajax({
            url: 'set_zone_position',
            type: 'post',
            data: {"zone_id":zone_id,"top":top,"left":left},
            success:function(data){
                console.log(data)
            }
        });
}

function update_zone_coordinates(zone_id){
    $.ajax({
            url: 'get_zone_coordinates',
            type: 'post',
            data: {"zone_id":zone_id},
            success:function(data){
                coordinates = JSON.parse(data);
                console.log(coordinates)
                $("#zone_x").val(coordinates.x);
                $("#zone_y").val(coordinates.y);
            }
        });
}


$('.drop.zone').droppable({
    drop : function(e,ui){
        var drop_zone = $(this).attr('id');
        var drone_id = ui.draggable.attr('id');
        set_drone_position(drone_id,drop_zone);       
    },
}); 

$('.drop.zone').click(function(e){
    $('#drone_1').animate({
            top : e.pageY - 44,
            left: e.pageX - 35
            }, 1000, function() {
                var drop_zone = e.target.id;
                var drone_id = "drone_1";
                set_drone_position(drone_id,drop_zone);  
            });
});


$('#main_map.drop').droppable({
    drop : function(e,ui){
        var zone_id = ui.draggable.attr('id');
        var top = ui.draggable.offset().top / ui.draggable.parent().height() * 100;
        var left = ui.draggable.offset().left / ui.draggable.parent().width() * 100;
        console.log(top);
        console.log(left);
        set_zone_position(zone_id,top,left); 
    },
}); 



function move_to_position(drone_id,zone_id,action){
    console.log("moving " + drone_id + " to " + zone_id);
    // Define zone center
    var zone_div = $("#"+ zone_id);
    var drone_div = $('#' + drone_id);
    var position = zone_div.position();
    var height = zone_div.height();
    var width = zone_div.width();
    set_drone_position(drone_id,zone_id,action);
    drone_div.animate({
        top : position.top + height/2 - drone_div.height()/2,
        left: position.left + width/2 - drone_div.width()/2
        }, 2000);
    }

$("#back_home_button").click(function(){
    $(".drone").each(function(){
        console.log("Stop patrolling");
        patrol_in_progess = false;
        console.log($(this).css('display'));
        if($(this).css('display')!='none'){move_to_position($(this).attr("id"),"home_base","land");}
    })
})

$("#new_drone_button").click(function(){
        if (!$("#drone_1_ui").is(":visible")){
            $("#drone_1").show()
            $("#drone_1_ui").show();
            set_drone_position("drone_1","home_base","takeoff");

        }
        else if (!$("#drone_2_ui").is(":visible")){
            $("#drone_2").show()
            $("#drone_2_ui").show();
            set_drone_position("drone_2","home_base","takeoff");
        }
        else {
            $("#drone_3").show()
            $("#drone_3_ui").show();
            set_drone_position("drone_3","home_base","takeoff");

        }
})


$("#patrol_button").click(function(){
    console.log("Start patroling");
    patrol_in_progess = true;
    patrol();
})




function move_to_next_waypoint(drone_id){
    $.ajax({
        url: 'get_next_waypoint',
        type: 'post',
        data: {"drone_id":drone_id},
        success:function(data){
            console.log("next waypoint for " + drone_id);
            console.log(data);
            var next_waypoint = data;
            move_to_position(drone_id, next_waypoint);
        }
    });
}

function patrol(){
    console.log("Patroling");
    $(".drone").each(function(){
        var drone_id = $(this).attr("id")
        if(patrol_in_progess && $(this).css('display')!='none'){
            move_to_next_waypoint(drone_id);
        }
    })
    if(patrol_in_progess){
        setTimeout(function(){
                    patrol();
                  }, 3000);
    }
}


$("#zone_save").click(function(){
        $.ajax({
            url: 'save_zone',
            type: 'post',
            data: {"zone_name":$("#zone_name").val(),
                    "zone_width":$("#zone_width").val(),
                    "zone_height":$("#zone_height").val(),
                    "zone_top":$("#zone_top").val(),
                    "zone_left":$("#zone_left").val(),
                    "zone_x":$("#zone_x").val(),
                    "zone_y":$("#zone_y").val(),
                    },
            success:function(data){
                console.log(data);
                location.reload();
            }
        });
})


$("#zone_delete").click(function(){
        $.ajax({
            url: 'delete_zone',
            type: 'post',
            data: {"zone_name":$("#zone_name").val()
                    },
            success:function(data){
                console.log(data);
                location.reload();
            }
        });
})


function update_zone_info(zone_id){
    var zone_div = $("#"+zone_id);
    $("#zone_name").val(zone_div.attr("id"));
    $("#zone_height").val(Math.round(zone_div.height()/zone_div.parent().height()*100));
    $("#zone_width").val(Math.round(zone_div.width()/zone_div.parent().width()*100));
    $("#zone_top").val(Math.round(zone_div.offset().top/zone_div.parent().height()*100));
    $("#zone_left").val(Math.round(zone_div.offset().left/zone_div.parent().width()*100));
}

$(".zone.drag").click(function(){
    console.log("update");
    var zone_id = $(this).attr("id")
    update_zone_info(zone_id);
    update_zone_coordinates(zone_id);
})




