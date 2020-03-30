var c=document.getElementById("laserworks")
c.style.background="#000"
var ctx=c.getContext("2d")
ctx.canvas.width=1000
ctx.canvas.height=1100
ctx.lineCap="round"

//

version="0,1"

//config

fps=30
interval=1000/fps

sfx=1
sfx_types=["off", "on"]
music=1
music_types=["off", "on"]
grid=0
grid_types=["cross", "dot", "none"]
ai=0

//

anistep=1
ani=0
tutorial_page=0
piece_size=(1000/12)-10
dot_size=piece_size/5

//
mouse_coords={x:0,y:0}
mouse_pos={x:0,y:0}
click_coords={x:-1, y:-1}
prev={x:-1, y:-1}
menu_option=-1
selected={x:-1, y:-1}
dragging_piece=0
dragging_flipped=0
laseron=0
filter_default_value=128

//

board=[]
power_grid=[]
turn=0

// Level data
current_level=0
total_levels=5
level0=[
[{x:1, y:1}, [10,0]],
[{x:7, y:7}, [11,0,256]],
]
level1=[
[{x:1, y:1}, [10,0]],
[{x:7, y:7}, [11,0,128]],
]
level2=[
[{x:1, y:1}, [10,0]],
[{x:7, y:7}, [11,0,100]],
]
level3=[
[{x:1, y:1}, [10,0]],
[{x:4, y:4}, [11,0,128]],
[{x:7, y:7}, [11,0,128]],
]
level4=[
[{x:1, y:1}, [10,0]],
[{x:4, y:4}, [11,0,64]],
[{x:7, y:7}, [11,0,4]],
]
level5=[
[{x:1, y:1}, [10,0]],
[{x:1, y:2}, [10,0]],
[{x:4, y:4}, [11,0,128]],
[{x:7, y:7}, [11,0,128]],
[{x:2, y:8}, [11,0,128]],
]

//Mobile detection

try{document.createEvent("TouchEvent"); mobile=1;}
catch(e){mobile=0}

//Adjusting css so canvas scales to fit window

if(window.innerWidth>window.innerHeight)
{
  document.getElementById("laserworks").style.width=""
  document.getElementById("laserworks").style.height="100%"
}

//Audio management

au=new Object();

au.play=function(s)
{
  if (sfx==1)
  {
    tem=eval("this."+s+".cloneNode();")
    tem.play()
  }
}

sounds=[
"menu_back",
"menu_select",
"menu_option",
]

function loader()
{
  for (i=0; i<sounds.length; i++)
  {
    it="./audio/"+sounds[i]+".wav";
    vname=sounds[i]
    eval("au."+vname+"=new Audio('"+it+"');");
  }
}

//Auxiliary functions

function draw_line(x1,y1,x2,y2)
{
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.stroke();
}

function draw_circle(x,y,size,colour="white",alpha=1)
{
  pa=ctx.globalAlpha;
  if (colour!="black"){ctx.globalAlpha=alpha;}
  ctx.strokeStyle=colour;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2*Math.PI, true);
  ctx.stroke();
  ctx.globalAlpha=pa;
}

function fill_circle(x,y,size,colour="white",alpha=1)
{
  pa=ctx.globalAlpha;
  if (colour!="black"){ctx.globalAlpha=alpha;}
  ctx.beginPath();
  ctx.arc(x, y, size, 0, 2*Math.PI, true);
  ctx.fillStyle=colour;
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha=pa;
  ctx.fillStyle="white"
}

function draw_mirror(coords,rot=0)
{
  ctx.lineWidth=2
  c={x:coord_to_pixel(coords.x), y:coord_to_pixel(coords.y)}
  if(rot==0)
  {
    draw_line(c.x-40,c.y-40,c.x+40,c.y+40)
  }
  else if(rot==1)
  {
    draw_line(c.x-40,c.y+40,c.x+40,c.y-40)
  }
  ctx.lineWidth=1
}

function draw_splitter(coords,rot=0)
{
  ctx.lineWidth=2
  c={x:coord_to_pixel(coords.x), y:coord_to_pixel(coords.y)}
  if(rot==0)
  {
    draw_line(c.x-40,c.y-40,c.x-24,c.y-24)
    draw_line(c.x-8,c.y-8,c.x+8,c.y+8)
    draw_line(c.x+24,c.y+24,c.x+40,c.y+40)
  }
  else if(rot==1)
  {
    draw_line(c.x-40,c.y+40,c.x-24,c.y+24)
    draw_line(c.x-8,c.y+8,c.x+8,c.y-8)
    draw_line(c.x+24,c.y-24,c.x+40,c.y-40)
  }

  ctx.lineWidth=1
}

function draw_filter(coords,fv=128)
{
    ctx.lineWidth=2
    c={x:coord_to_pixel(coords.x), y:coord_to_pixel(coords.y)}
    ctx.strokeRect(c.x-20,c.y-20,40,40)
    ctx.font="20px sans-serif"
    ctx.fillText(fv,c.x-20,c.y)
}

// 0-right, 1-down, 2-left, 3-up
function draw_laser(coords, or=0)
{
  ctx.lineWidth=2
  c={x:coord_to_pixel(coords.x), y:coord_to_pixel(coords.y)}
  if(or%2==0)
  {
    
    if(or==0){
      draw_line(c.x-20, c.y-20, c.x-20, c.y+20)
      draw_line(c.x-20, c.y+20, c.x+20, c.y)
      draw_line(c.x-20, c.y-20, c.x+20, c.y)
    }
    else
    {
      draw_line(c.x+20, c.y-20, c.x+20, c.y+20)
      draw_line(c.x+20, c.y+20, c.x-20, c.y)
      draw_line(c.x+20, c.y-20, c.x-20, c.y)
    }
  }
  else
  {
    if(or==1){
      draw_line(c.x-20, c.y+20, c.x+20, c.y+20)
      draw_line(c.x+20, c.y+20, c.x, c.y-20)
      draw_line(c.x-20, c.y+20, c.x, c.y-20)
    }
    else
    {
      draw_line(c.x-20, c.y-20, c.x+20, c.y-20)
      draw_line(c.x+20, c.y-20, c.x, c.y+20)
      draw_line(c.x-20, c.y-20, c.x, c.y+20)    
    }
  }
  ctx.lineWidth=1
}

function draw_target(coords, nd)
{
  c={x:coord_to_pixel(coords.x), y:coord_to_pixel(coords.y)}
  var pw=power_grid[coords.y][coords.x]
  ctx.lineWidth=2
  draw_circle(c.x,c.y,20)

  ctx.font="15px sans-serif"
  ctx.textAlign="center"
  ctx.fillText(Math.round(pw)+"/"+nd,c.x,c.y-25)
  ctx.textAlign="start"

  //progress bar
  ctx.beginPath();
  ctx.strokeStyle="green"
  ctx.lineWidth=6
  ctx.arc(c.x, c.y, 20, -Math.PI/2, (2*Math.PI*pw/nd)-(Math.PI/2));
  ctx.stroke()
  ctx.strokeStyle="white"

  //overload
  if(pw>nd)
  {
    //TO-DO
  }
}

function pixel_to_coord(px)
{
  return Math.ceil(px/(100))-1
}

function coord_to_pixel(c)
{
  return (50)*(1+(c*2))
}

function menu_alpha(y)
{
  if (mobile==0){return Math.abs(y-mouse_pos.y)}
  else {return 50}
}

function draw_grid()
{
  ctx.lineWidth=1;
  for (cx=100; cx<1000; cx+=100){
    for (cy=100; cy<1000; cy+=100){
      if(grid==0){
        draw_line(cx-3,cy,cx+3,cy, "white");
        draw_line(cx,cy-3,cx,cy+3, "white");
      }
      if(grid==1)
      {
        ctx.strokeRect(cx,cy,1,1);
      }
    }
  }
  draw_line(0,1000,1000,1000)
  draw_mirror({x:1,y:10})
  draw_splitter({x:2,y:10})
  draw_filter({x:3,y:10},filter_default_value)

  ctx.strokeRect(10,1010,80,80)
  if(laseron==0)
  {
    fill_circle(50,1050,35,"green")
  }
  if(laseron==1)
  {
    fill_circle(50,1050,35,"red")
  }

  //reset button
  ctx.textAlign="center"
  ctx.strokeRect(810,1010,80,80)
  ctx.font="30px sans-serif"
  ctx.fillText("RST",850,1060)

  //level load
  ctx.strokeRect(710,1010,80,80)
  ctx.fillText(current_level,750,1070)
  ctx.font="20px sans-serif"
  ctx.fillText("LEVEL",750,1040)

  ctx.textAlign="start"
}



function draw_game()
{
  draw_grid();

  for(i=0; i<board.length; i++)
  {
    for(j=0; j<board[0].length; j++)
    {
      ci=board[j][i]
      if(ci[0]==1)
      {
        draw_mirror({x:i,y:j},ci[1])
      }
      if(ci[0]==2)
      {
        draw_splitter({x:i,y:j},ci[1])
      }
      if(ci[0]==3)
      {
        draw_filter({x:i,y:j},ci[1])
      }
      if(ci[0]==10)
      {
        draw_laser({x:i,y:j},ci[1])
      }
      if(ci[0]==11)
      {
        draw_target({x:i,y:j},ci[2])
      }
    }
  }
  ctx.strokeStyle="rgb(255,128,0)"
  if(dragging_piece==1)
  {
    draw_mirror({x:mouse_coords.x, y: mouse_coords.y},dragging_flipped)
  }
  else if(dragging_piece==2)
  {
    draw_splitter({x:mouse_coords.x, y: mouse_coords.y},dragging_flipped)
  }
  else if(dragging_piece==3)
  {
    draw_filter({x:mouse_coords.x, y: mouse_coords.y},dragging_flipped)
  }
  ctx.strokeStyle="white"

  //Draw laser path
  if(laseron==1)
  {
    reset_pgrid()
    lvd=eval("level"+current_level)
    draw_laser_path(lvd[0])
  }

  draw_progress()
}

function draw_progress()
{
  lvd=eval("level"+current_level)
  var need=0
  var supplied=0
  for(i=0; i<lvd.length; i++)
  {
    if(lvd[i][1].length==3)//Process targets
    {
      need+=lvd[i][1][2]
      supplied+=power_grid[lvd[i][0].y][lvd[i][0].x]
    }
  }
  //progress bar
  ctx.beginPath();
  ctx.strokeStyle="green"
  ctx.lineWidth=4
  ctx.arc(950, 1050, 30, -Math.PI/2, (2*Math.PI*supplied/need)-(Math.PI/2));
  ctx.stroke()
  ctx.strokeStyle="white"
  ctx.textAlign="center"
  ctx.fillText(parseInt(supplied)+"/"+need,950,1055)
  ctx.textAlign="start"
}

// 0-right, 1-down, 2-left, 3-up
function draw_laser_path(start)
{

  ic={x: coord_to_pixel(start[0].x), y: coord_to_pixel(start[0].y)}
  next=[]
  ctx.lineWidth=3
  ctx.strokeStyle="red"
  if(start[1][1]==0)
  {
    draw_line(ic.x+20, ic.y, ic.x+100, ic.y)
    next={x:start[0].x+1, y: start[0].y}
    from=0
  }
  if(start[1][1]==1)
  {
    draw_line(ic.x, ic.y-20, ic.x+100, ic.y+120)
  }
  if(start[1][1]==2)
  {
    draw_line(ic.x-20, ic.y, ic.x-100, ic.y)
  }
  if(start[1][1]==3)
  {
    draw_line(ic.x, ic.y+20, ic.x, ic.y+100)
  }
  ctx.lineWidth=1
  follow_laser(next, from)
  ctx.strokeStyle="white"
}

// 0-from left, 1-from up, 2-from right, 3-from down
function follow_laser(coords,ori,str=256)
{
  if (coords.x<0 || coords.x>9 || coords.y<0 || coords.y>9){return 0}
    power_grid[coords.y][coords.x]+=str
  if (board[coords.y][coords.x][0]>9){return 0}

  

  var linestart={x: coord_to_pixel(coords.x), y: coord_to_pixel(coords.y)}
  var nextr=[]
  
  //ray from left side
  if(ori==0)
  {
    if(board[coords.y][coords.x][0]==0 || board[coords.y][coords.x][0]==3) {nextr=nextr.concat([[0,{x:+1, y:0},1]])}//nothing, filter
    if(board[coords.y][coords.x][0]==1)//reflector
    {
      if(board[coords.y][coords.x][1]==0) {nextr=nextr.concat([[1,{x:0, y:+1},1]])}//Normal
      if(board[coords.y][coords.x][1]==1) {nextr=nextr.concat([[3,{x:0, y:-1},1]])}//Flipped
    }
    if(board[coords.y][coords.x][0]==2)//splitter
    {
      if(board[coords.y][coords.x][1]==0) {nextr=nextr.concat([[1,{x:0, y:+1},2], [0,{x:+1, y:0},2]])}//Normal
      if(board[coords.y][coords.x][1]==1) {nextr=nextr.concat([[3,{x:0, y:-1},2], [0,{x:+1, y:0},2]])}//Flipped
    }
  }
  if(ori==1)//ray from top
  {
    if(board[coords.y][coords.x][0]==0 || board[coords.y][coords.x][0]==3) {nextr=nextr.concat([[1,{x:0, y:+1},1]])}//nothing, filter
    if(board[coords.y][coords.x][0]==1)//reflector
    {
      if(board[coords.y][coords.x][1]==0) {nextr=nextr.concat([[0,{x:+1, y:0},1]])} //Normal
      if(board[coords.y][coords.x][1]==1) {nextr=nextr.concat([[2,{x:-1, y:0},1]])}//Flipped
    }
    if(board[coords.y][coords.x][0]==2)//splitter
    {
      if(board[coords.y][coords.x][1]==0) {nextr=nextr.concat([[0,{x:+1, y:0},2], [1,{x:0, y:+1},2]])}//Normal
      if(board[coords.y][coords.x][1]==1) {nextr=nextr.concat([[2,{x:-1, y:0},2], [1,{x:0, y:+1},2]])}//Flipped
    }
  }
  if(ori==2)//ray from right side
  {
    if(board[coords.y][coords.x][0]==0 || board[coords.y][coords.x][0]==3) {nextr=nextr.concat([[2,{x:-1, y:0},1]])}//nothing, filter
    if(board[coords.y][coords.x][0]==1)//reflector
    {
      if(board[coords.y][coords.x][1]==0) {nextr=nextr.concat([[3,{x:0, y:-1},1]])}//Normal
      if(board[coords.y][coords.x][1]==1) {nextr=nextr.concat([[1,{x:0, y:1},1]])}//Flipped
    }
    if(board[coords.y][coords.x][0]==2)//splitter
    {
      if(board[coords.y][coords.x][1]==0) {nextr=nextr.concat([[3,{x:0, y:-1},2], [2,{x:-1, y:0},2]])}//Normal
      if(board[coords.y][coords.x][1]==1) {nextr=nextr.concat([[1,{x:0, y:1},2], [2,{x:-1, y:0},2]])}//Flipped
    }
  }
  if(ori==3)//ray from bottom
  {
    if(board[coords.y][coords.x][0]==0 || board[coords.y][coords.x][0]==3) {nextr=nextr.concat([[3,{x:0, y:-1},1]])}//nothing, filter
    if(board[coords.y][coords.x][0]==1)//reflector
    {
      if(board[coords.y][coords.x][1]==0) {nextr=nextr.concat([[2,{x:-1, y:0},1]])}//Normal
      if(board[coords.y][coords.x][1]==1) {nextr=nextr.concat([[0,{x:1, y:0},1]])}//Flipped
    }
    if(board[coords.y][coords.x][0]==2)//splitter
    {
      if(board[coords.y][coords.x][1]==0) {nextr=nextr.concat([[2,{x:-1, y:0},2], [3,{x:0, y:-1},2]])}//Normal
      if(board[coords.y][coords.x][1]==1) {nextr=nextr.concat([[0,{x:1, y:0},2], [3,{x:0, y:-1},2]])}//Flipped
    }
  }
  for(var i=0; i<nextr.length; i++)
  {

    var it=nextr[i]
    var next={x:coords.x+it[1].x, y:coords.y+it[1].y}


    if(board[coords.y][coords.x][0]==3 && fstr>board[coords.y][coords.x][1])//filter processing
    {
      fstr=board[coords.y][coords.x][1]
    }
    else
    {
      fstr=str/it[2]
    }

    ctx.lineWidth=3
    ctx.strokeStyle="rgb("+fstr+",0,0)"
    if(coords.y<9)
    {
      draw_line(linestart.x, linestart.y, linestart.x+(it[1].x*100), linestart.y+(it[1].y*100))
    }
    else if(coords.y==9)
    {
      draw_line(linestart.x, linestart.y, linestart.x+(it[1].x*50), linestart.y+(it[1].y*50))
    }
    ctx.lineWidth=1
    follow_laser(next, it[0], fstr)
  }
}


//Intro and menus

function logo_animation(i)
{
  ctx.clearRect(0,0,1000,1000)
  ctx.font="45px sans-serif";
  ctx.fillStyle="rgba(255,255,255,"+(anistep/80)+")";
  ctx.textAlign="center"
  ctx.fillText("愛智重工",500,500);
  ctx.font="20px quizma-light";
  ctx.fillText("Achi Heavy Industries",500,520)
  if (anistep==80){clearTimeout(ani);ani=setInterval(logo_animation, interval, 0)}
  if(i==1){anistep++;}else{anistep--;}
  if (anistep==0){clearTimeout(ani);ani=setInterval(title_animation, interval, 1)}
}

function title_animation(i)
{
  ctx.clearRect(0,0,1000,1000)
  ctx.font="120px quizma-light";
  ctx.fillStyle="rgba(255,255,255,"+(anistep/80)+")";
  ctx.textAlign="center"
  ctx.fillText("Xi",500,500);
  if (anistep==80)
  {
    clearTimeout(ani);
    ctx.canvas.addEventListener("click", main_menu_listener, false);
    ani=setInterval(title_animation, interval, 0)
  }
  if(i==1){anistep++;}else{anistep--;}
  if (anistep==0){clearTimeout(ani);ani=setInterval(menu, interval, 1)}
}

function menu()
{
  ctx.canvas.removeEventListener("click", skip_to_menu);
  ctx.clearRect(0,0,1000,1000)
  malpha=anistep/30;
  ctx.lineWidth=1;
  draw_line(80,120,80,880, "white", malpha);
  draw_line(80,120,100,120, "white", malpha);

  ctx.fillStyle="rgba(255,255,255,"+malpha+")";
  ctx.textAlign="start";

  ctx.font="120px quizma-light";
  ctx.fillText("Xi",125,160);
  ctx.font="20px quizma-light";
  ctx.fillText(version,210,160);
  ctx.font="bold 50px quizma-light";
  ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(200))+")";
  ctx.fillText("New game",150,260);
  ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(300))+")";
  ctx.fillText("Play vs AI",150,360);
  ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(400))+")";
  ctx.fillText("Tutorial",150,460);
  ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(600))+")";
  ctx.fillText("Settings",150,660);
  ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(700))+")";
  ctx.fillText("Credits",150,760);

  if (anistep<30){anistep++;} 
}

function credits()
{
  ctx.clearRect(0,0,1000,1000)

  calpha=anistep/30
  draw_line(80,120,80,880, "white", calpha);
  draw_line(80,120,100,120, "white", calpha);
  draw_line(250,120,275,120, "white", calpha);

  ctx.fillStyle="rgba(255,255,255,"+calpha+")";
  ctx.textAlign="start";

  ctx.font="120px quizma-light";
  ctx.fillText("Xi",125,160);
  ctx.font="75px quizma-light";
  ctx.fillText("Credits",300,145);
  ctx.font="20px quizma-light";
  ctx.fillText(version,210,160);

  ctx.font="bold 50px quizma-light";
  ctx.fillText("Code",150,260);
  ctx.fillText("SFX",150,360);
  ctx.fillText("Font",150,460);
  ctx.fillStyle="rgba(255,255,255,"+(30*calpha/menu_alpha(700))+")";
  ctx.fillText("Back",150,760);

  ctx.font="45px quizma-light";
  ctx.fillStyle="rgba(255,255,255,"+(30*calpha/menu_alpha(200))+")";
  ctx.fillText("Achifaifa",350,260);
  ctx.fillStyle="rgba(255,255,255,"+(30*calpha/menu_alpha(300))+")";
  ctx.fillText("broumbroum",350,360);
  ctx.fillStyle="rgba(255,255,255,"+(50*calpha/menu_alpha(400))+")";
  ctx.fillText("Studio Typo",350,460);

  if (anistep<30){anistep++}
}

function settings()
{
  ctx.clearRect(0,0,1000,1000)

  salpha=anistep/30
  draw_line(80,120,80,880, "white", salpha);
  draw_line(80,120,100,120, "white", salpha);
  draw_line(250,120,275,120, "white", salpha);

  ctx.fillStyle="rgba(255,255,255,"+salpha+")";
  ctx.textAlign="start";

  ctx.font="120px quizma-light";
  ctx.fillText("Xi",125,160);
  ctx.font="75px quizma-light";
  ctx.fillText("Settings",300,145);
  ctx.font="20px quizma-light";
  ctx.fillText(version,210,160);
  ctx.font="bold 50px quizma-light";

  ctx.fillStyle="rgba(255,255,255,"+(30*salpha/menu_alpha(200))+")";
  ctx.fillText("Grid",150,260);
  ctx.fillStyle="rgba(255,255,255,"+(30*salpha/menu_alpha(300))+")";
  ctx.fillText("Players",150,360);
  ctx.fillStyle="rgba(255,255,255,"+(30*salpha/menu_alpha(400))+")";
  ctx.fillText("SFX",150,460);
  ctx.fillStyle="rgba(255,255,255,"+(30*salpha/menu_alpha(500))+")";
  ctx.fillText("Music",150,560);
  ctx.fillStyle="rgba(255,255,255,"+(30*salpha/menu_alpha(600))+")";
  ctx.fillText("AI",150,660);
  ctx.fillStyle="rgba(255,255,255,"+(30*salpha/menu_alpha(700))+")";
  ctx.fillText("Back",150,760);

  ctx.font="45px quizma-light";
  ctx.fillStyle="rgba(255,255,255,"+salpha+")";
  ctx.fillText(grid_types[grid],350,260);
  ctx.fillText(flip_types[flip],350,360);
  ctx.fillText(sfx_types[sfx],350,460);
  ctx.fillText(music_types[music],350,560);
  ctx.fillText(difficulty_types[difficulty],350,660);

  if (anistep<30){anistep++;}
}


function main_loop()
{
  ctx.clearRect(0,0,1000,1100);

  draw_grid();
  draw_game();
}

//Listeners


function skip_to_menu(e,mute=0)
{
  if (mute==0){au.play("menu_select")}
  clearTimeout(ani);
  anistep=1
  ai=0
  ctx.canvas.addEventListener("click", main_menu_listener, false);
  ani=setInterval(menu, interval, 1)
  ctx.canvas.removeEventListener("click", skip_to_menu);
}

function update_menu_option()
{
       if(mouse_pos.y>220 && mouse_pos.y<270){menu_option=1;}
  else if(mouse_pos.y>320 && mouse_pos.y<370){menu_option=2;}
  else if(mouse_pos.y>420 && mouse_pos.y<470){menu_option=3;}
  else if(mouse_pos.y>520 && mouse_pos.y<570){menu_option=4;}
  else if(mouse_pos.y>620 && mouse_pos.y<670){menu_option=5;}
  else if(mouse_pos.y>720 && mouse_pos.y<770){menu_option=6;}
  else {menu_option=-1}
}

function update_click_coords()
{
  click_coords={
    x: Math.ceil(pixel_to_coord(mouse_pos.x)),
    y: Math.ceil(pixel_to_coord(mouse_pos.y))
  }
}

function main_menu_listener()
{  
  valid_options=[1,2,3,5,6]

  if (valid_options.includes(menu_option))
  {
    ctx.canvas.removeEventListener("click", main_menu_listener, false);
    anistep=1;
    clearTimeout(ani);
  }
  if (menu_option==1) 
  {
    au.play("menu_select")
    initialize_board();
    ctx.canvas.addEventListener("click", main_game_listener, false);
    ani=setInterval(main_loop, interval, false);
  }
  if (menu_option==2){
    au.play("menu_select")
    initialize_board();
    ai=1
    ctx.canvas.addEventListener("click", main_game_listener, false);
    ani=setInterval(main_loop, interval, false);
  }
    if (menu_option==3){
    au.play("menu_select")
    ctx.canvas.addEventListener("click", tutorial_listener, false);
    ani=setInterval(tutorial, interval, false);
  }
  if (menu_option==5)
  {
    au.play("menu_select")
    ani=setInterval(settings, interval, 1);
    ctx.canvas.addEventListener("click", settings_menu_listener, false);
  }
  if (menu_option==6)
  {
    au.play("menu_select")
    ani=setInterval(credits, interval, 1);
    ctx.canvas.addEventListener("click", credits_menu_listener, false);
  }
}

function settings_menu_listener()
{
  valid_options=[1,2,3,4,5,6]
  if (valid_options.includes(menu_option))
  {
    if (menu_option==1)
    {
      au.play("menu_option")
      grid=(grid+1)%grid_types.length
    }
    if (menu_option==2)
    {
      au.play("menu_option")
      flip=(flip+1)%flip_types.length
    }
    if (menu_option==3)
    {
      au.play("menu_option")
      sfx=(sfx+1)%sfx_types.length
    }
    if (menu_option==4)
    {
      au.play("menu_option")
      music=(music+1)%music_types.length
    }
    if (menu_option==5)
    {
      au.play("menu_option")
      difficulty=(difficulty+1)%difficulty_types.length
    }
    else if (menu_option==6)
    {
      au.play("menu_back")
      ctx.canvas.removeEventListener("click", settings_menu_listener, false);
      skip_to_menu(1,1)
    } 
  }
}

function credits_menu_listener()
{
  valid_options=[1,2,3,6]
  {
    if (menu_option==1)
    {
      au.play("menu_option")
      window.open('https://github.com/achifaifa')
    }
    if (menu_option==2)
    {
      au.play("menu_option")
      window.open('https://freesound.org/people/broumbroum/')
    }
    if (menu_option==3)
    {
      au.play("menu_option")
      window.open('http://www.studiotypo.com/')
    }    
    if (menu_option==6)
    {
      au.play("menu_back")
      ctx.canvas.removeEventListener("click", credits_menu_listener, false);
      skip_to_menu(1,1)
    }
  }
}

function skip_listener()
{
  ctx.canvas.removeEventListener("click", skip_listener);
  skip_to_menu();
}

//Game logic

function initialize_board()
{
  for (i=0; i<10; i++)
  {
    board[i]=Array(10).fill([0,0])
  }
}

function reset_pgrid()
{
  for (i=0; i<10; i++)
  {
    power_grid[i]=Array(10).fill(0)
  }
}

function load_level(lv)
{
  initialize_board()
  reset_pgrid()
  eval("cl=level"+lv)
  for(i=0; i<cl.length; i++)
  {
    piece=cl[i]
    board[piece[0].y][piece[0].x]=piece[1]
  }
  current_level=lv
}

//Always-on listeners

function mouse_position(c, e) {
  var rect=c.getBoundingClientRect();
  scalex=ctx.canvas.width/rect.width;  
  scaley=ctx.canvas.height/rect.height;  
  return {
    x: (e.clientX-rect.left)*scalex,
    y: (e.clientY-rect.top)*scaley
  };
}

ctx.canvas.addEventListener("click", update_menu_option);
ctx.canvas.addEventListener('mousemove', function(e){
  mouse_pos=mouse_position(ctx.canvas, e);
  mouse_coords={x: pixel_to_coord(mouse_pos.x), y: pixel_to_coord(mouse_pos.y)}
}, false);

//drag/drop listener
ctx.canvas.addEventListener("mousedown", mousedown);
ctx.canvas.addEventListener("mouseup", mouseup);
ctx.canvas.addEventListener("mousemove", dragmove);


function mousedown(e)
{
  reset_pgrid()
  //left click, drag
  if(e.buttons==1)
  {
    if(mouse_coords.y==10)
    {
      if(mouse_coords.x>0 && mouse_coords.x<4) //component
      {
        dragging_piece=mouse_coords.x
        dragging_flipped=0
        dragging=1
        if(mouse_coords.x==3){dragging_flipped=filter_default_value}
      }
      else if(mouse_coords.x==0) //on/off switch
      {
        laseron^=1
        if(laseron==0){reset_pgrid()}
      }
      else if(mouse_coords.x==7) //Level select
      {
        current_level+=1
        current_level=current_level%total_levels
        load_level(current_level)
        console.log(current_level)
      }
      else if(mouse_coords.x==8) //Reset button
      {
        load_level(current_level)
      }
    }
    else if(board[mouse_coords.y][mouse_coords.x][0]<10)
    {
      dragging_piece=board[mouse_coords.y][mouse_coords.x][0]
      dragging_flipped=board[mouse_coords.y][mouse_coords.x][1]
      board[mouse_coords.y][mouse_coords.x]=[0,0]
    }
  }
  //right click, flip
  else if(e.buttons==2)
  {
    if(mouse_coords.y<10 && board[mouse_coords.y][mouse_coords.x][0]<10)
    {
      if(board[mouse_coords.y][mouse_coords.x][0]==3)
      {
        if(board[mouse_coords.y][mouse_coords.x][1]==8)
        {
          board[mouse_coords.y][mouse_coords.x][1]=128
        }
        else
        {
          board[mouse_coords.y][mouse_coords.x][1]/=2
        }
      }
      else
      {
        board[mouse_coords.y][mouse_coords.x][1]^=1
      }
    }
    if(mouse_coords.y==10 && mouse_coords.x==3){
      if(filter_default_value==8){filter_default_value=128}
      else{filter_default_value/=2}
    }
  }
  //middle click, delete
  else if(e.buttons==4)
  {
    if(mouse_coords.y<10 && board[mouse_coords.y][mouse_coords.x][0]<10)
    {
      board[mouse_coords.y][mouse_coords.x]=[0,0]
    }
  }  
}

function mouseup(e)
{
  if(mouse_coords.y<10 && dragging_piece!=0)
  {
    if(board[mouse_coords.y][mouse_coords.x][0]<10)
    {
      board[mouse_coords.y][mouse_coords.x]=[dragging_piece,dragging_flipped]
      dragging_piece=0
    }
    else
    {
      dragging_piece=0
    }
  }
  else
  {
    dragging_piece=0
  }
}

function dragmove(e)
{
  ctx.strokeStyle="rgb(255,128,0)"
  switch(dragging_piece)
  {
    case 1:
      draw_mirror(mouse_coords, dragging_flipped)
      break
    case 2: 
      draw_splitter(mouse_coords, dragging_flipped)
      break
    case 3: 
      draw_filter(mouse_coords, dragging_flipped)
      break
  }
  ctx.strokeStyle="white"

}

load_level(0)
ani=setInterval(main_loop, interval);
