var cr = (w,h,bg,t) => {
    var elem = cd('rectangle');
    setsize(elem,w,h);
    elem.style.background = bg;
    elem.style.transform = t;
    return elem;
}
var models = {};
models.tomato = cd('cont');
for(var i = 0; i < 6; ++i)
{

    var elem = cr(3,3,'red radial-gradient(transparent,transparent,rgba(0,0,0,.5))','rotateY(' + (i*90) + 'deg) translateZ(1.45vmin)');
    if(i==4) elem.style.transform = 'rotateX(90deg) translateZ(1.45vmin)';
    else if(i == 5)elem.style.transform = 'rotateX(90deg) translateZ(-1.45vmin)';
    models.tomato.appendChild(elem);
}

models.tomato.appendChild(cr(.5,2,'green','translateY(-1.5vmin) rotateZ(-30deg)'));


models.onion = cd('cont');
for(var i = 0; i < 6; ++i)
{
    var elem = cr(2.5,2,'purple','rotateY(' + (i*90) + 'deg) translateZ(1.20vmin)');

    if(i==4 || i == 5) elem.style.setProperty('--h', '2.5vmin');
    if(i==4) elem.style.transform = 'rotateX(90deg) translateZ(.99vmin)';
    else if(i == 5) elem.style.transform = 'rotateX(90deg) translateZ(-.99vmin)';
    elem.style.backgroundImage = 'radial-gradient(transparent,transparent,rgba(0,0,0,.5))';
    models.onion.appendChild(elem);
}


models.lettuce = cd('cont');
for(var i = 0; i < 6; ++i)
{
    var elem = cr(4,4,'green');

    elem.style.transform = 'rotateY(' + (i*90) + 'deg) translateZ(1.95vmin)';
    if(i==4) elem.style.transform = 'rotateX(90deg) translateZ(1.95vmin)';
    else if(i == 5)elem.style.transform = 'rotateX(90deg) translateZ(-1.95vmin)';
    if(i < 4) elem.style.backgroundImage = 'linear-gradient(90deg, transparent,rgba(255,255,255,.3),transparent,rgba(255,255,255,.3),transparent,rgba(255,255,255,.3),transparent)';
    else elem.style.backgroundImage = 'radial-gradient(transparent,rgba(255,255,255,.3),transparent,rgba(255,255,255,.3),transparent,rgba(255,255,255,.3),transparent)';
    elem.style.backgroundImage += ' radial-gradient(transparent,transparent,rgba(0,0,0,.5))';
    models.lettuce.appendChild(elem);
}

models.bowl = cd('cont');
for(var i = 0; i < 4; ++i)
{
    var elem = cr(3.5,2.5,'rgba(255,255,255,.7) linear-gradient(rgba(0,0,0,.3),transparent,transparent,rgba(0,0,0,.3))','rotateY(' + (i*90) + 'deg) translateZ(1.25vmin) rotateX(-20deg)');
    elem.style.clipPath = 'polygon(0% 0%,100% 0%,78% 100%,22% 100%)';
    models.bowl.appendChild(elem);
}

models.bowl.appendChild(cr(1.95,1.95,'rgba(255,255,255,.7) radial-gradient(transparent,transparent,rgba(0,0,0,.4))','rotateX(90deg) translateZ(-1.05vmin)'));

models.bowl.style.setProperty('--l1', 'transparent');
models.bowl.style.setProperty('--l2', 'transparent');
models.bowl.style.setProperty('--l3', 'transparent');
models.bowl.style.setProperty('--l4', 'transparent');
models.bowl.style.setProperty('--l5', 'transparent');




models.bowl.appendChild(cr(2.13,2.13,'linear-gradient(90deg,var(--l1), transparent,var(--l1),transparent,var(--l1),transparent,var(--l1),transparent,var(--l1))','rotateX(90deg) translateZ(-.7vmin)'));
models.bowl.appendChild(cr(2.3,2.3,'linear-gradient(var(--l2), transparent,var(--l2),transparent,var(--l2),transparent,var(--l2),transparent,var(--l2))','rotateX(90deg) translateZ(-.3vmin)'));
models.bowl.appendChild(cr(2.5,2.5,'linear-gradient(45deg, var(--l3), transparent,var(--l3),transparent,var(--l3),transparent,var(--l3),transparent,var(--l3))','rotateX(90deg) translateZ(.3vmin)'));
models.bowl.appendChild(cr(2.8,2.8,'linear-gradient(-45deg, var(--l4), transparent,var(--l4),transparent,var(--l4),transparent,var(--l4),transparent,var(--l4))','rotateX(90deg) translateZ(.7vmin)'));
models.bowl.appendChild(cr(3,3,'linear-gradient(-45deg, var(--l5), transparent,var(--l5),transparent,var(--l5),transparent,var(--l5),transparent,var(--l5))','rotateX(90deg) translateZ(1.1vmin)'));


models.cheese = cd('cont');
for(var i = 0; i < 3; ++i) models.cheese.appendChild(cr(4.45,2,'yellow radial-gradient(transparent,rgba(0,0,0,.3))','rotateY(' + Number((i*120)+60) + 'deg) translateZ(1.25vmin)'));

for(var i = 0; i < 2; ++i)
{
    var elem = cr(4.45,4.45,'yellow radial-gradient(at 50% 40%,transparent,rgba(0,0,0,.3))','rotateX(90deg) translateY(1vmin) translateZ(' + (i == 0 ? 1 : -1) + 'vmin)');
    elem.style.clipPath = 'polygon(0% 0%,100% 0%,50% 80%)';
    models.cheese.appendChild(elem);
}


models.counter = cd('cont');
for(var i = 0; i < 5; ++i) models.counter.appendChild(cr(8,(i>3?8:6),'radial-gradient(transparent,transparent,rgba(0,0,0,.5)), linear-gradient('+(i>3?-45:90)+'deg,sandybrown,saddlebrown,sandybrown,saddlebrown,sandybrown,saddlebrown,sandybrown)',(i<4?'rotateY('+i*90+'deg) translateZ(3.94vmin) translateY(-3vmin)':'rotateX(90deg) translateZ(5.94vmin)')));

var elem = cd('cont itemelem');
elem.style.transform = 'translateY(-7.5vmin)';
elem.style.transformStyle = 'preserve-3d';
models.counter.appendChild(elem);

models.crate = cd('cont');
for(var i = 0; i < 10; ++i)
{

    var elem = cr(8,(i<8?6:8),'radial-gradient(transparent,transparent,rgba(0,0,0,.5)), linear-gradient('+(i>3?-45:90)+'deg,sandybrown,saddlebrown,sandybrown,saddlebrown,sandybrown,saddlebrown,sandybrown)','rotateY('+i*90+'deg) translateZ('+(i<4?3.94:3.44)+'vmin) translateY(-3vmin)');
    if(i>7)elem.style.transform = 'rotateX(90deg) translateZ('+Number((i-8)*6+.1)+'vmin)';
    if(i==9)elem.style.clipPath = 'polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 93%,93% 93%,93% 7%,7% 7%,7% 93%, 0% 93%)';
    models.crate.appendChild(elem);
}
for(var i = 0; i < 3; ++i)
{
    var elem = cd('cont itemplace');
    if(i==0)elem.style.transform = 'translateY(-4.3vmin) translateZ(-1.3vmin) translateX(-1.1vmin)';
    else if(i==1)elem.style.transform = 'translateY(-5vmin) translateZ(1.1vmin) translateX(1.3vmin)';
    else elem.style.transform = 'translateY(-6vmin) translateZ(1.5vmin) translateX(-1.2vmin)';
    elem.style.transformStyle = 'preserve-3d';
    models.crate.appendChild(elem);
}

function slices(color, rounded)
{
    var cont = cd('cont');
    for(var i = 0; i < 8; ++i)
    {
        var elem = cr(3,3,color + ' radial-gradient(rgba(255,255,255,.5),transparent,rgba(0,0,0,.5))','rotateY(90deg) translateZ(' + ((i-3)/2) + 'vmin)');
        if(rounded) elem.style.borderRadius = '50%';
        cont.appendChild(elem);
    }
    return cont;
}

models.tomatoslices = slices('red', true);
models.onionslices = slices('purple', true);
models.lettuceslices = slices('green', true);
models.cheeseslices = slices('yellow', false);

models.bin = models.crate.cloneNode(true);
for(var i in models.bin.children) if(i < 11)models.bin.children[i].style.background = '#999 radial-gradient(transparent,transparent,rgba(0,0,0,.5))';


models.knife = cd('cont');
for(var i = 0; i < 6; ++i) models.knife.appendChild(cr(.8,(i<4?2:.8),'linear-gradient(45deg,#222,#555,#222,#555,#222,#555,#222)',i<4?'rotateY('+90*i+'deg) translateZ(.4vmin)':'rotateX(90deg) translateZ('+(i<5?-1:1)+'vmin)'));


var elem = cr(1.8,4.5,'darkgray','rotateY(90deg) translateY(-2.75vmin)');
elem.style.borderTopLeftRadius = '1.8vmin 4.5vmin';
models.knife.appendChild(elem);

models.pistol = cd('cont');
models.pistol.style.setProperty('--color', '#222');
for(var i = 0; i < 6; ++i) models.pistol.appendChild(cr(i<4?4:1,1,i==5?'var(--color) radial-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5),transparent,rgba(0,0,0,.5))':'var(--color) radial-gradient(transparent,transparent,rgba(0,0,0,.5))',i<4?'translateY(-1.25vmin) rotateY(90deg) rotateX('+i*90+'deg) translateZ(.5vmin)':'translateY(-1.25vmin) rotateY('+(i>4?0:180)+'deg) translateZ(2vmin)'));


for(var i = 0; i < 5; ++i) models.pistol.appendChild(cr(1,i<4?1.5:1,'var(--color) radial-gradient(transparent,transparent,rgba(0,0,0,.5))',i<4?'translateZ(-1.5vmin) rotateY('+i*90+'deg) translateZ(.5vmin)':'translateZ(-1.5vmin) rotateX(90deg) translateZ(-.75vmin)'));

var elem = cr(.5,.5,'','rotateY(-90deg) translateY(-.25vmin) translateX(-.6vmin)');
elem.style.borderRight = elem.style.borderBottom = '.25vmin solid var(--color)';
elem.style.borderBottomRightRadius = '.5vmin .5vmin';
models.pistol.appendChild(elem);

models.ammobox = models.crate.cloneNode(true);
for(var i in models.ammobox.children)
{
    if(i < 11)models.ammobox.children[i].style.background = 'radial-gradient(transparent,transparent,rgba(0,0,0,.5)), linear-gradient(30deg,darkgreen,green,darkgreen)';
    //if(i < 11)models.ammobox.children[i].style.background = 'radial-gradient(transparent,transparent,rgba(0,0,0,.5)), linear-gradient(30deg,darkgreen,green,darkgreen,green,darkgreen,green,darkgreen)';
}
var ammoboxammo = cr(7 ,7,'radial-gradient(gold,yellow)','rotateX(90deg) translateZ(5.4vmin)');

ammoboxammo.style.backgroundSize = '1vmin 1vmin';

models.ammobox.appendChild(ammoboxammo);

var itemelem = cd('cont itemelem');
itemelem.style.transform = 'translateY(-5.5vmin) rotateZ(-90deg)';
itemelem.style.transformStyle = 'preserve-3d';
models.ammobox.appendChild(itemelem);


var barriergradient = 'transparent, rgba(0,0,0,.4),transparent, rgba(0,0,0,.4),transparent, rgba(0,0,0,.4),transparent, rgba(0,0,0,.4),transparent, rgba(0,0,0,.4),transparent, rgba(0,0,0,.4),transparent, rgba(0,0,0,.4),transparent, rgba(0,0,0,.4),transparent';

models.barrierblue = models.counter.cloneNode(true);
models.barrierblue.style.transition = 'transform 300ms';
for(var i in models.barrierblue.children)
{
    if(i < 5)
    {
        models.barrierblue.children[i].style.background = 'navy';
        models.barrierblue.children[i].style.backgroundImage = 'linear-gradient(45deg, '+barriergradient+'), linear-gradient(-45deg, '+barriergradient+'), radial-gradient(transparent,transparent,rgba(0,0,0,.5))';
    }
}

models.barrierred = models.counter.cloneNode(true);
models.barrierred.style.transition = 'transform 300ms';
for(var i in models.barrierred.childNodes)
{
    if(i < 5)
    {
        models.barrierred.children[i].style.background = 'firebrick';
        models.barrierred.children[i].style.backgroundImage = 'linear-gradient(45deg, ' + barriergradient + '), linear-gradient(-45deg, ' + barriergradient + '), radial-gradient(transparent,transparent,rgba(0,0,0,.5))';
    }
}

models.lever = cd('cont');

for(var i = 0; i < 5; ++i)
{

    if(i<2)var elem = cr(4,2,'gray radial-gradient(transparent,transparent,rgba(0,0,0,.5))','translateY(-1vmin) rotateY('+i*180+'deg) translateZ(1.5vmin)');
    else if(i<4) var elem = cr(3,2,'gray radial-gradient(transparent,transparent,rgba(0,0,0,.5))','translateY(-1vmin) rotateY('+Number(i*180+90)+'deg) translateZ(2vmin)');
    else var elem = cr(4,3,'linear-gradient(90deg,gray,red,gray,blue,gray), radial-gradient(transparent,transparent,rgba(0,0,0,.5))','rotateX(90deg) translateZ(2vmin)');

    models.lever.appendChild(elem);

}
var elem = cd('cont');
for(var i = 0; i < 5; ++i) elem.appendChild(cr(1,i<4?8:1,i<4?'radial-gradient(transparent,transparent,rgba(0,0,0,.5)), linear-gradient(to top, saddlebrown 0%,saddlebrown 80%,gray 82%,gray 100%)':'gray radial-gradient(transparent,transparent,rgba(0,0,0,.5))',i<4?'translateY(-4vmin) rotateY('+i*90+'deg) translateZ(.5vmin)':'translateY(-8vmin) rotateX(90deg)'));

elem.style.transition = 'transform 300ms';
elem.style.transform = 'translateY(-1vmin) rotateZ(var(--leverdir))';
models.lever.appendChild(elem);



models.counter_line = cd('cont');
for(var i = 0; i < 3; ++i) models.counter_line.appendChild(cr(10.1,i<2?6:8,'linear-gradient(rgba(0,0,0,.5),transparent,transparent,rgba(0,0,0,.5)), linear-gradient('+(i>1?0:90)+'deg,sandybrown,saddlebrown,sandybrown,saddlebrown,sandybrown,saddlebrown,sandybrown)',i<2?'rotateY('+i*180+'deg) translateZ(3.94vmin) translateY(-3vmin)':'rotateX(90deg) translateZ(5.94vmin)'));

models.counter_end = cd('cont');
for(var i = 0; i < 4; ++i)
{

    var elem = cr(0,0,'linear-gradient(rgba(0,0,0,.5),transparent,transparent,rgba(0,0,0,.5)), linear-gradient('+(i>2?0:90)+'deg,sandybrown,saddlebrown,sandybrown,saddlebrown,sandybrown,saddlebrown,sandybrown)','');
    if(i<2) {
        setsize(elem, 9, 6);
        elem.style.transform = 'translateX(.5vmin) rotateY('+i*180+'deg) translateZ(3.94vmin) translateY(-3vmin)';
    }
    else if(i < 3)
    {
        setsize(elem, 8, 6);
        elem.style.transform = 'rotateY(-90deg) translateZ(3.94vmin) translateY(-3vmin)';}
    else {
        setsize(elem, 9, 8);
        elem.style.transform = 'translateX(.5vmin) rotateX(90deg) translateZ(5.94vmin)';
    }
    models.counter_end.appendChild(elem);

}
var elem = cd('cont itemelem');
elem.style.transform = 'translateY(-7.5vmin)';
elem.style.transformStyle = 'preserve-3d';
models.counter_line.appendChild(elem.cloneNode(true));
models.counter_end.appendChild(elem);

models.zombieportal = cr(8,8,'rgba(0,0,0,.9)','rotateX(90deg) translateZ(.5vmin)');
models.zombieportal.style.borderRadius = '50%';
models.zombieportal.style.boxShadow = 'red 0 0 2vmin,orange 0 0 3vmin';

models.customerportal = models.zombieportal.cloneNode(true);
models.customerportal.style.boxShadow = 'blue 0 0 2vmin,green 0 0 3vmin';

models.riotshield = cd('cont');
for(var i = 0; i < 6; ++i)
{
    if(i<2)var elem = cr(5,2,'#222 radial-gradient(transparent,transparent,rgba(0,0,0,.5))', 'rotateY('+i*180+'deg) translateZ(.25vmin)');
    else if(i<4)var elem = cr(.5,2,'#222 radial-gradient(transparent,transparent,rgba(0,0,0,.5))', 'rotateY('+Number(90+i*180)+'deg) translateZ(2.5vmin)');
    else var elem = cr(5,.5,'#222 radial-gradient(transparent,transparent,rgba(0,0,0,.5))', 'rotateX('+Number(90+i*180)+'deg) translateZ(1vmin)');
    models.riotshield.appendChild(elem);
}
var elem = cr(5, 9, 'var(--color)','');
elem.style.opacity  = .8;
elem.style.borderRadius  = '1vmin';
models.riotshield.style.setProperty('--color','white');
models.riotshield.appendChild(elem);
models.riotshield.style.transform = 'translateZ(2.6vmin) translateY(-1.1vmin)';

models.grinder = cd('cont');
for(var i = 0; i < 2; ++i)
{
    var elem = cd('cont');
    elem.style.animation = 'rotate 3s linear infinite';
    elem.style.setProperty('--z',(i>0?-3:3)+'vmin');
    elem.style.setProperty('--d',(i>0?-1:1));
    for(var j = 0; j < 3; ++j)
    {
        var elem2 = cr(8,3,'gray radial-gradient(transparent,transparent,rgba(0,0,0,.5))','rotateX('+(j*120)+'deg) translateZ(.8vmin)');
        elem.appendChild(elem2);
    }
    models.grinder.appendChild(elem);
}

var elem = cd('cont itemelem');
elem.style.transform = 'translateY(-2vmin)';
elem.style.transformStyle = 'preserve-3d';
models.grinder.appendChild(elem);

models.meat = cd('cont');
models.meat.style.setProperty('--color','saddlebrown');
models.meat.style.transform = 'rotateX(90deg) rotateZ(45deg)';
for(var i = 0; i < 4; ++i)
{
    var elem = cr(3.25,3.5,'var(--color) linear-gradient(rgba(0,0,0,.3),transparent,transparent,rgba(0,0,0,.3))','rotateY(' + (i*90) + 'deg) translateZ(1vmin) rotateX(-20deg)');
    elem.style.clipPath = 'polygon(0% 0%,100% 0%,63% 100%,37% 100%)';
    models.meat.appendChild(elem);
}
models.meat.appendChild(cr(3.25,3.25,'var(--color) radial-gradient(transparent,transparent,rgba(0,0,0,.4))','rotateX(90deg) translateZ(1.5vmin)'));
for(var i = 0; i < 4; ++i) models.meat.appendChild(cr(.8,2.6,'#EEE linear-gradient(rgba(0,0,0,.3),transparent,transparent,rgba(0,0,0,.3))','translateY(3vmin)rotateY(' + (i*90) + 'deg) translateZ(.38vmin)'));
models.meat.appendChild(cr(.8,.8,'#EEE radial-gradient(transparent,transparent,rgba(0,0,0,.4))','translateY(4.3vmin) rotateX(90deg)'));

models.zombiemeat = models.meat.cloneNode(true);
models.zombiemeat.style.setProperty('--color','darkgreen');

models.rawburger = cd('cont');
for(var i = 0; i < 6; ++i)
{
    var elem = cr(3,.5,'var(--color) radial-gradient(transparent,transparent,rgba(0,0,0,.5)','rotateY(' + (i*90) + 'deg) translateZ(1.48vmin)');

    if(i>3)
    {
        setsize(elem,3,3);
        elem.style.transform = 'rotateX(90deg) translateZ('+(i<5?.24:-.24)+'vmin)';
    }
    models.rawburger.appendChild(elem);
}
models.rawburger.style.setProperty('--color','#AA3C3B');
models.rawburger.style.transform = 'translateY(.6vmin)';

models.rawzombieburger = models.rawburger.cloneNode(true);
models.rawzombieburger.style.setProperty('--color','lightgreen');

models.burntburger = models.rawburger.cloneNode(true);
models.burntburger.style.setProperty('--color','#222');

models.burger = models.rawburger.cloneNode(true);
for(var i = 4; i < 6; ++i) models.burger.children[i].style.backgroundImage = 'linear-gradient(45deg, transparent, #111, transparent, #111, transparent, #111, transparent, #111, transparent), radial-gradient(transparent,transparent,rgba(0,0,0,.5)';
models.burger.style.setProperty('--color','saddlebrown');

models.zombieburger = models.burger.cloneNode(true);
models.zombieburger.style.setProperty('--color','darkgreen');


models.stove = cd('cont');
for(var i = 0; i < 5; ++i) models.stove.appendChild(cr(8,(i>3?8:6),'#DEE radial-gradient(transparent,transparent,rgba(0,0,0,.5))',(i<4?'rotateY('+i*90+'deg) translateZ(3.94vmin) translateY(-3vmin)':'rotateX(90deg) translateZ(5.94vmin)')));

var elem = cd('cont itemelem');
elem.style.transform = 'translateY(-7.5vmin)';
elem.style.transformStyle = 'preserve-3d';
models.stove.appendChild(elem);

var elem = cr(6,4,'rgba(0,0,0,.8)','');
//elem.style.border = '.25vmin rgba(0,0,0,.8) solid';
models.stove.children[0].appendChild(elem);

models.stove.children[4].style.backgroundImage = 'radial-gradient(transparent,transparent,rgba(0,0,0,.5)), radial-gradient(rgba(0,0,0,.8) 50%,transparent 50%)';
models.stove.children[4].style.backgroundSize = '8vmin 8vmin, 4vmin 4vmin';

var elem = cd('cont itemelem');
elem.style.transform = 'translateY(8vmin)';
elem.style.transformStyle = 'preserve-3d';
models.stove.appendChild(elem);

var elem = cd('statusbar');

elem.style.setProperty('--color','yellow');
elem.style.setProperty('--angle','0');
elem.style.transform = 'translateY(-12vmin) rotateY(var(--angle))';

models.stove.style.setProperty('--prog','0');
models.stove.appendChild(elem);

models.hamburger = cd('cont');
models.hamburger.style.setProperty('--l',0);

var elem = cd('cont');
for(var i = 0; i < 4; ++i)
{
    elem.appendChild(cr(3,.5,'#F5B062 linear-gradient(90deg,rgba(0,0,0,.5),transparent,transparent,rgba(0,0,0,.5))','rotateY('+(i*90)+'deg) translateZ(1.5vmin)'));
}
elem.appendChild(cr(3,3,'#F5B062 radial-gradient(transparent,transparent,rgba(0,0,0,.5))','rotateX(90deg) translateZ(-.25vmin)'));
models.hamburger.appendChild(elem);

var elem = cd('cont');
for(var i = 0; i < 4; ++i)
{
    elem.appendChild(cr(3,.5,'#F5B062 linear-gradient(90deg,rgba(0,0,0,.5),transparent,transparent,rgba(0,0,0,.5))','rotateY('+(i*90)+'deg) translateZ(1.5vmin)'));
}
for(var i = 0; i < 4; ++i)
{
    var elem2 = cr(3,2,'#F5B062 linear-gradient(rgba(0,0,0,.5),transparent,transparent,rgba(0,0,0,.2))','translateY(-1.25vmin) rotateY('+(i*90)+'deg) translateZ(1.5vmin) rotateX(50deg)');
    elem2.style.clipPath = 'polygon(0 100%, 50% 0, 100% 100%)';
    elem2.style.transformOrigin = '50% 100%';
    elem.appendChild(elem2);
    //elem.appendChild(cr(3,.5,'#F5B062 radial-gradient(transparent,transparent,rgba(0,0,0,.5))','rotateY('+(i*90)+'deg) translateZ(1.5vmin)'));
}
elem.style.transform = 'translateY(calc((var(--l) + 1)* -.5vmin))';
models.hamburger.appendChild(elem);


models.hamburgerpart = cd('cont');
models.hamburgerpart.style.transform = 'translateY(calc((var(--l) + 1)* -.5vmin))';
models.hamburgerpart.style.setProperty('--color','white');
models.hamburgerpart.style.setProperty('--l',0);
for(var i = 0; i < 4; ++i) models.hamburgerpart.appendChild(cr(3,.5,'var(--color) linear-gradient(90deg,rgba(0,0,0,.5),transparent,transparent,rgba(0,0,0,.5))','rotateY('+(i*90)+'deg) translateZ(1.5vmin)'));






