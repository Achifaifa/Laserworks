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
laseron=1
filter_default_value=128

//

board=[]
power_grid=[]

// Level data
current_level=0
total_levels=13
levels_completed=0
score=Array(total_levels-1).fill(999)
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
[{x:7, y:7}, [11,0,64]],
[{x:2, y:8}, [11,0,192]],
[{x:4, y:6}, [11,0,128]],
]
level6=[
[{x:0, y:1}, [10,0]],
[{x:9, y:1}, [10,2]],
[{x:4, y:4}, [11,0,128]],
[{x:7, y:7}, [11,0,64]],
[{x:2, y:8}, [11,0,192]],
[{x:4, y:6}, [11,0,128]],
]
level7=[
[{x:4, y:4}, [10,1]],
[{x:5, y:4}, [10,0]],
[{x:4, y:5}, [10,2]],
[{x:5, y:5}, [10,3]],
[{x:7, y:7}, [11,0,276]],
[{x:2, y:8}, [11,0,208]],
[{x:4, y:6}, [11,0,128]],
]
level8=[
[{x:3, y:2}, [10,3]],
[{x:3, y:6}, [11,0,1]],
[{x:4, y:6}, [11,0,1]],
[{x:5, y:6}, [11,0,1]],
[{x:6, y:6}, [11,0,1]],
]
level9=[
[{x:3, y:2}, [10,3]],
[{x:7, y:6}, [10,1]],
[{x:3, y:6}, [11,0,16]],
[{x:2, y:6}, [11,0,36]],
[{x:5, y:4}, [11,0,160]],
[{x:6, y:7}, [11,0,108]],
]
level10=[
[{x:0, y:0}, [10,3]],
[{x:9, y:9}, [10,1]],
[{x:3, y:6}, [11,0,8]],
[{x:2, y:6}, [11,0,4]],
[{x:5, y:4}, [11,0,97]],
[{x:6, y:7}, [11,0,9]],
[{x:1, y:8}, [11,0,160]],
[{x:0, y:4}, [11,0,42]],
[{x:6, y:0}, [11,0,96]],
]
level11=[
[{x:6, y:6}, [10,3]],
[{x:6, y:8}, [10,1]],
[{x:8, y:6}, [10,3]],
[{x:8, y:8}, [10,1]],
[{x:3, y:6}, [11,0,49]],
[{x:9, y:0}, [11,0,227]],
]
level12=[
[{x:1, y:1}, [10,1]],
[{x:0, y:0}, [10,3]],
[{x:2, y:2}, [10,2]],
[{x:3, y:3}, [10,0]],
[{x:3, y:6}, [11,0,72]],
[{x:2, y:6}, [11,0,128]],
[{x:5, y:4}, [11,0,72]],
[{x:7, y:8}, [11,0,272]],
[{x:9, y:0}, [11,0,128]],
[{x:9, y:9}, [11,0,80]],
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

//Save/Load game

var storedlevel=window.localStorage.getItem('maxlevel', levels_completed);
if(storedlevel==null)
{
  window.localStorage.setItem('maxlevel', levels_completed)
  window.localStorage.setItem('score', JSON.stringify(score))
}
else
{
  levels_completed=storedlevel
  score=JSON.parse(window.localStorage.getItem('score'))
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
    var unit=2*Math.PI/nd
    ctx.beginPath();
    ctx.strokeStyle="red"
    ctx.lineWidth=6
    ctx.arc(c.x, c.y, 20, -Math.PI/2, (unit*(pw-nd))-(Math.PI/2));
    ctx.stroke()
    ctx.strokeStyle="white"

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
  ctx.fillStyle="white"

  ctx.font="25px sans-serif"
  ctx.strokeRect(10,1010,80,80)
  draw_line(90,1010,10,1090)
  ctx.fillText("OPT", 15,1035)
  ctx.textAlign="end"
  ctx.fillText("---",85,1085)

  //reset button
  ctx.textAlign="start"
  ctx.strokeRect(710,1010,80,80)
  draw_line(790,1010,710,1090)
  ctx.fillText("RST",715,1035)
  ctx.textAlign="end"
  ctx.fillText("ESC",785,1085)

  //level load
  if (check_pass()==1 || levels_completed-1>=current_level)
  {
    ctx.strokeStyle="green"
  }
  else
  {
    ctx.strokeStyle="red"
  }
  ctx.textAlign="center"
  ctx.strokeRect(810,1010,80,80)
  ctx.fillText(current_level,850,1070)
  ctx.font="20px sans-serif"
  ctx.fillText("LEVEL",850,1040)
  ctx.strokeStyle="white"
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
    for(i=0; i<lvd.length; i++)
    {
      if(lvd[i][1][0]==10)
      {
        draw_laser_path(lvd[i])
      }
    }
  }

  draw_progress()
}

function check_pass()
{
  var lvd=eval("level"+current_level)
  var completed=1
  for(var i=0; i<lvd.length; i++)
  {
    if(lvd[i][1].length==3)//Process targets
    {
      if (lvd[i][1][2]!=power_grid[lvd[i][0].y][lvd[i][0].x]) //Check if the target has OK levels
      {
        return 0
      }
    }
  }
  return 1
}

function calculate_score()
{
  var tempscore=0
  for(var i=0; i<10; i++)
  {
    for(var j=0; j<10; j++)
    {
      var t=board[j][i][0]
      if(t!=10 && t!=11)
      {
        tempscore+=t
      }
    }
  }
  return tempscore
}

function draw_progress()
{
  var lvd=eval("level"+current_level)
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

  //overload bar
  if(supplied>need)
  {
    ctx.beginPath();
    ctx.strokeStyle="red"
    ctx.lineWidth=4
    ctx.arc(950, 1050, 30, -Math.PI/2, (2*Math.PI/need*(supplied-need))-(Math.PI/2));
    ctx.stroke()
    ctx.strokeStyle="white"
  }
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
    draw_line(ic.x, ic.y-20, ic.x, ic.y-100)
    next={x:start[0].x, y: start[0].y-1}
    from=3
  }
  if(start[1][1]==2)
  {
    draw_line(ic.x-20, ic.y, ic.x-100, ic.y)
    next={x:start[0].x-1, y: start[0].y}
    from=2
  }
  if(start[1][1]==3)
  {
    draw_line(ic.x, ic.y+20, ic.x, ic.y+100)
    next={x:start[0].x, y: start[0].y+1}
    from=1
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
    if(coords.y==9 && ori==1)
    {
      draw_line(linestart.x, linestart.y, linestart.x+(it[1].x*100), linestart.y+(it[1].y*50))
    }
    else
    {
      draw_line(linestart.x, linestart.y, linestart.x+(it[1].x*100), linestart.y+(it[1].y*100))
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
  ctx.font="20px quizma";
  ctx.fillText("Achi Heavy Industries",500,520)
  if (anistep==80){clearTimeout(ani);ani=setInterval(logo_animation, interval, 0)}
  if(i==1){anistep++;}else{anistep--;}
  if (anistep==0){clearTimeout(ani);ani=setInterval(title_animation, interval, 1)}
}

function title_animation(i)
{
  ctx.clearRect(0,0,1000,1000)
  ctx.font="100px spaceage";
  ctx.fillStyle="rgba(255,255,255,"+(anistep/80)+")";
  ctx.textAlign="center"
  ctx.fillText("Laserworks",500,500);
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
  ctx.clearRect(0,0,1000,1100)
  malpha=anistep/30;
  ctx.lineWidth=1;

  ctx.fillStyle="rgba(255,255,255,"+malpha+")";
  ctx.textAlign="center";
  ctx.font="100px spaceage";
  ctx.fillText("Laserworks",500,160);

  ctx.font="bold 50px quizma";
  ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(350))+")";
  if(levels_completed==0)
  {
    ctx.fillText("New game",500,360);
  }
  else
  {
    ctx.fillText("Continue",500,360)
  }
  ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(450))+")";
  ctx.fillText("Scores",500,460);
  // ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(550))+")";
  // ctx.fillText("Tutorial",500,560);
  // ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(750))+")";
  // ctx.fillText("Settings",500,760);
  // ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(850))+")";
  // ctx.fillText("Credits",500,860);

  if (anistep<30){anistep++;} 
}

function level_select()
{
  ctx.clearRect(0,0,1000,1000)
  var malpha=anistep/30;
  ctx.lineWidth=1;

  ctx.fillStyle="rgba(255,255,255,"+malpha+")";
  ctx.textAlign="center";
  ctx.font="100px spaceage";
  ctx.fillText("Laserworks",500,160);
  ctx.textAlign="end"
  ctx.font="60px quizma";
  ctx.fillText("Scores",950,200);

  ctx.textAlign="end"
  ctx.font="30px quizma";
  for(i=0; i<10; i++)
  {
    for(j=0; j<10; j++)
    {
      var sc=score[j*10+i]
      if(typeof(sc)!="undefined" && sc!=999)
      {
        ctx.fillText(sc, 100+90*i, 350+90*j)
      }
      else if(sc==999)
      {
        ctx.fillText("--", 100+90*i, 350+90*j)
      }
    }
  }

  ctx.textAlign="center"
  ctx.font="bold 50px quizma";
  ctx.fillStyle="rgba(255,255,255,"+(30*malpha/menu_alpha(850))+")";
  ctx.fillText("Back",500,860);

  if (anistep<30){anistep++;} 
}

function credits()
{
  ctx.clearRect(0,0,1000,1000)

  calpha=anistep/30

  ctx.fillStyle="rgba(255,255,255,"+calpha+")";
  ctx.textAlign="center";
  ctx.font="100px spaceage";
  ctx.fillText("laserworks",500,160);
  ctx.textAlign="end"
  ctx.font="60px quizma";
  ctx.fillText("Credits",950,200);

  ctx.textAlign="center"
  ctx.font="bold 50px quizma";
  ctx.fillText("Code",350,260);
  ctx.fillText("Music",750,460);
  ctx.fillText("SFX",250,460);
  ctx.fillText("Fonts",350,660);
  ctx.fillStyle="rgba(255,255,255,"+(30*calpha/menu_alpha(850))+")";
  ctx.fillText("Back",500,860);

  ctx.font="45px quizma";
  ctx.fillStyle="rgba(255,255,255,"+(30*calpha/menu_alpha(250))+")";
  ctx.fillText("Achifaifa",350,260);
  ctx.fillStyle="rgba(255,255,255,"+(30*calpha/menu_alpha(350))+")";
  ctx.fillText("broumbroum",350,360);
  ctx.fillStyle="rgba(255,255,255,"+(50*calpha/menu_alpha(450))+")";
  ctx.fillText("Studio Typo",350,460);
  ctx.fillStyle="rgba(255,255,255,"+(50*calpha/menu_alpha(550))+")";
  ctx.fillText("Justin Callaghan",350,560);//https://fonts.webtoolhub.com/font-n29145-space-age.aspx?lic=1

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

  ctx.font="120px quizma";
  ctx.fillText("Xi",125,160);
  ctx.font="75px quizma";
  ctx.fillText("Settings",300,145);
  ctx.font="20px quizma";
  ctx.fillText(version,210,160);
  ctx.font="bold 50px quizma";

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

  ctx.font="45px quizma";
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
       if(mouse_pos.y>320 && mouse_pos.y<370){menu_option=1;}
  else if(mouse_pos.y>420 && mouse_pos.y<470){menu_option=2;}
  else if(mouse_pos.y>520 && mouse_pos.y<570){menu_option=3;}
  else if(mouse_pos.y>620 && mouse_pos.y<670){menu_option=4;}
  else if(mouse_pos.y>720 && mouse_pos.y<770){menu_option=5;}
  else if(mouse_pos.y>820 && mouse_pos.y<870){menu_option=6;}
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
  valid_options=[1,2]

  if (valid_options.includes(menu_option))
  {
    ctx.canvas.removeEventListener("click", main_menu_listener, false);
    anistep=1;
    clearTimeout(ani);
    if (menu_option==1) 
    {
      var inilevel=0
      if(levels_completed>0)
      {
        inilevel=levels_completed
        if(inilevel>=total_levels)
        {
          inilevel=total_levels-1
        }
      }
      load_level(inilevel)
      au.play("menu_select")
      //ctx.canvas.addEventListener("click", main_game_listener, false);
      ctx.canvas.addEventListener("mousedown", mousedown);
      ctx.canvas.addEventListener("mouseup", mouseup);
      ctx.canvas.addEventListener("mousemove", dragmove);
      ani=setInterval(main_loop, interval, false);
    }
    if (menu_option==2){
      au.play("menu_select")
      initialize_board();
      ai=1
      ctx.canvas.addEventListener("click", levels_listener, false);
      ani=setInterval(level_select, interval, false);
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
}

function levels_listener()
{
  valid_options=[7]
  if (valid_options.includes(menu_option))
  {
    ctx.canvas.removeEventListener("click", main_menu_listener, false);
    anistep=1;
    clearTimeout(ani);
  }
  if (menu_option==6)
  {
    au.play("menu_back")
    ctx.canvas.removeEventListener("click", levels_listener, false);
    skip_to_menu(1,1)
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

function mousedown(e)
{
  //left click, drag
  if(e.buttons==1)
  {
    if(mouse_coords.y==10)
    {
      if(mouse_coords.x>0 && mouse_coords.x<4) //component
      {
        dragging_piece=mouse_coords.x
        dragging_flipped=0
        if(mouse_coords.x==3){dragging_flipped=filter_default_value}
      }
      else if(mouse_coords.x==0) //menu
      {
        console.log("game menu")
      }
      else if(mouse_coords.x==8) //next level
      {
        var nextl=current_level+1
        if(nextl>=total_levels)
        {
          nextl=current_level
        }
        if(check_pass()==1 && levels_completed<nextl)
        {
          levels_completed=nextl
        }
        if(levels_completed>=nextl)
        {
          var sc=calculate_score()
          if(sc<score[current_level])
          {
            score[current_level]=sc
          }
          current_level=nextl
          load_level(nextl)
          window.localStorage.setItem('maxlevel', levels_completed)
          window.localStorage.setItem('score', JSON.stringify(score))
        }
      }
      else if(mouse_coords.x==7) //Reset button
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
        board[mouse_coords.y][mouse_coords.x][1]^=1 //flip piece
      }
    }
    if(mouse_coords.y==10)
    {
      if(mouse_coords.x==3)
      {
        if(filter_default_value==8){filter_default_value=128}  //default filter mod
        else{filter_default_value/=2}
      }
      if(mouse_coords.x==7)
      {
        anistep=1;
        clearTimeout(ani);
        ctx.canvas.removeEventListener("mousedown", mousedown);
        ctx.canvas.removeEventListener("mouseup", mouseup);
        ctx.canvas.removeEventListener("mousemove", dragmove);
        ctx.canvas.addEventListener("click", main_menu_listener)
        ani=setInterval(menu, interval, false);
      }
      if(mouse_coords.x==8) // previous level
      {
        var nextl=current_level-1
        if(nextl<0)
        {
          nextl=0
        }
        if(levels_completed-1>=nextl)
        {
          current_level=nextl
          load_level(current_level)
        }
        
      }
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
  }
  dragging_piece=0
}

function dragmove(e)
{
  if(dragging_piece!=0)
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
}

ctx.canvas.addEventListener("click", update_menu_option);
ctx.canvas.addEventListener('mousemove', function(e){
  mouse_pos=mouse_position(ctx.canvas, e);
  mouse_coords={x: pixel_to_coord(mouse_pos.x), y: pixel_to_coord(mouse_pos.y)}
}, false);

//Main listener

ctx.canvas.addEventListener("click", skip_to_menu);
loader()
ani=setInterval(logo_animation, interval, 1);
