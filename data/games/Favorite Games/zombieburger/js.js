const s = id => document.getElementById(id);
const cd = classname =>
{
    var elem = document.createElement('div');
    elem.className = classname;
    return elem;
}


//Svg polygon code for character faces
var faces = [
    '6% 12%,34% 21%,34% 34%,6% 26%,6% 78%,35% 66%,59% 65%,84% 82%,84% 30%,61% 36%,60% 23%,84% 13%,84% 96%,59% 85%,36% 83%,6% 95%,6% 78%',
    '10% 26%,27% 26%,27% 10%,10% 10%,10% 68%,38% 76%,67% 77%,91% 69%,91% 26%,74% 26%,74% 10%,91% 10%,91% 79%,67% 87%,38% 86%,11% 79%,11% 68%'
];


//Function for building character models
const create_person = (type, facenum, skin, clothes) =>
{
    var cont = cd('cont');
    var elem = cd('cont');

    cont.hand = cd('cont hand');
    cont.hand.style.transform = 'translateY(-4vmin) translateX(-3vmin) translateZ(1vmin)';
    cont.hpbar = cd('statusbar');
    cont.hpbar.style.setProperty('--prog','100%');
    cont.hpbar.style.transform = 'translateY(-13vmin) rotateY(var(--angle))';

    cont.progbar = cd('statusbar');
    cont.progbar.style.setProperty('--prog','0');
    cont.progbar.style.setProperty('--color','yellow');
    cont.progbar.style.transform = 'translateY(-15vmin) rotateY(var(--angle))';

    cont.ammobar = cd('statusbar');
    cont.ammobar.style.setProperty('--prog','0');
    cont.ammobar.style.setProperty('--color','blue');
    cont.ammobar.style.transform = 'translateY(-17vmin) rotateY(var(--angle))';

    for(var i = 0; i < 8; ++i)
    {
        var elem2 = cr(3.5,8,clothes + ' linear-gradient(rgba(0,0,0,.5),transparent,transparent,rgba(0,0,0,.5))','rotateY(' + (i*45) + 'deg) translateZ(4vmin) rotateX(30deg)');
        elem2.style.bottom = '0';
        elem2.style.transformOrigin = '50% 100%';
        elem2.style.clipPath = 'polygon(0 100%,50% 0,100% 100%)';
        elem.appendChild(elem2);
    }
    cont.appendChild(elem);
    var elem = cd('cont');
    for(var i = 0; i < 5; ++i)
    {
        var elem2 = cr(5,5,skin + ' radial-gradient(transparent,transparent,rgba(0,0,0,.5))', 'rotateY(' + (i*90) + 'deg) translateZ(2.45vmin)');
        if(i==4) elem2.style.transform = 'rotateX(90deg) translateZ(2.45vmin)';

        if(i==0) {

            var elem3 = cr(5,5,'black');
            elem3.style.clipPath = 'polygon(' + faces[facenum] + ')';
            elem2.appendChild(elem3);
        }


        elem.appendChild(elem2);
    }
    elem.style.transform = 'translateY(-9vmin)';
    elem.style.transformStyle = 'preserve-3d';

    cont.appendChild(elem);
    cont.appendChild(cont.hand);
    cont.appendChild(cont.hpbar);
    cont.appendChild(cont.progbar);
    cont.appendChild(cont.ammobar);
    cont.style.setProperty('--angle', 0);
    return cont;
}

var entities = [];

//Entity class (Players, zombies and customers)
class Human
{
    constructor(type,x,y)
    {
        this.id = entities.length;
        entities.push(this);

        this.level = data.currentlevel;
        this.type = type;
        this.x = x||0;
        this.y = y||0;
        this.speedX=0;
        this.speedY=0;
        this.alive = true;
        this.item = null;
        this.progressinterval = null;
        this.angle = 0;
        this.active = false;
        this.activefocus = null;
        this.currentTile = '0|0';
        this.focusTile = '0|0';
        this.actioncont = false;
        this.currentaction = null;
        this.actionprogress = 0;
        this.reqmovement = false;
        this.hp = 100;
        this.maxhp = 100;
        this.lastdmg = 0;

        //Set appearance for character
        if(type == 'zombie')
        {
            this.look = create_person(0,0,'green','brown');
            var this2 = this;
            setTimeout(()=>{this2.list_targets()});
        }
        else if(type == 'player')
        {
            this.look = create_person(0,1,'lightgoldenrodyellow','#EEE');
        }
        else if(type == 'player2')
        {
            this.look = create_person(0,1,'saddlebrown','#EEE');
        }
        else if(type == 'customer')
        {
            //Generate random order for customer
            this.ordertype = data.ordertypes[~~(data.ordertypes.length*Math.random())];
            this.look = create_person(0,1,Math.random() < .62 ? 'lightgoldenrodyellow' : 'saddlebrown','hsl('+Math.random()*360+'deg,70%,60%)');
            var elem = cd('orderbox');
            elem.innerHTML = '      '+this.ordertype+'      ';
            this.look.appendChild(elem);
            this.look.ammobar.style.setProperty('--color','green');
            this.order = [];
            this.look.ammobar.style.opacity = .85;
            this.ordertime = 60;
            for(var i = 0; i < ~~((data.ordermax) * Math.random())+1; ++i)
            {
                var elem2 = cd('test');
                var food = this.ordertype == 'Salad' ? data.salading[~~(data.salading.length * Math.random())] : (i == 0 ? data.burgering[~~(data.burgering.length * Math.random())] : data.salading[~~(data.salading.length * Math.random())]);
                this.order.push(food);
                elem2.appendChild(models[food].cloneNode(true));
                elem2.lastChild.style.transform = 'scale(.38) rotateX(-30deg) rotateY(45deg)';
                elem.appendChild(elem2); this.ordertime += 30;
            }
            this.ordertimemax = this.ordertime;
            this.orderprocess()

        }
        s('cont').appendChild(this.look);



        if(type == 'zombie')
        {   //Find target for zombies
            this.list_targets();
        }
        else if(type == 'customer')
        {   //Find place to await order for customers
            this.list_orderplaces();
        }

        this.move(0,0.01);



    }
    //Order countdown
    orderprocess()
    {
        if(data.currentlevel == this.level)
        {
            --this.ordertime;
            this.look.ammobar.style.setProperty('--prog', (this.ordertime / this.ordertimemax) * 100 + '%');
            var this2 = this;
            if(this.ordertime < 1)
            {
                this.die(true);
            }
            setTimeout(()=>{
                this2.orderprocess();
        },1000);
        }

    }
    //Move entities by x,y
    move(x,y)
    {

        var prevX = this.x;
        var prevY = this.y;
        this.x += x;
        this.y += y;
        var blocked = false;

        //Keep entities on the map
        if (this.x > data.radX*10) this.x = data.radX*10;
        else if (this.x < -data.radX*10) this.x = -data.radX*10;
        if (this.y > data.radY*10) this.y = data.radY*10;
        else if (this.y < -data.radY*10) this.y = -data.radY*10;

        //Add entity collision if a riot shield is in hand
       for (var i in entities) if (entities[i] != this && entities[i].alive && get_distance(this.x, this.y, entities[i].x, entities[i].y) < 8) {
           if((this.item != null && this.item.type == 'riotshield')||(entities[i].item != null && entities[i].item.type == 'riotshield')) {

               this.x = prevX;
               this.y = prevY;
               //PUSH
               if (!(x == 0 && y == 0)) entities[i].move(x, y);
           }
        }

        //get angle the entity is facing
        if (!(prevX == this.x && prevY == this.y)) this.angle = (Number((Math.PI) + Math.atan2(prevX - this.x, prevY - this.y)));
        if (!(x == 0 && y == 0)) {
            this.look.style.transform = 'translateX(' + this.x + 'vmin) translateZ(' + this.y + 'vmin) rotateY(' + this.angle + 'rad)';
            this.look.style.setProperty('--angle', -this.angle + 'rad');
        }
        this.look.style.transformStyle = 'preserve-3d';

        //Store tiles on which the entity is standing and the one it is facing
        var prevTileC = this.currentTile;
        this.currentTile = Math.round(this.x / 10) + '|' + Math.round(this.y / 10);
        var prevTileF = this.focusTile;

        this.focusTile = (Math.round(this.x / 10) + Math.round(Math.sin(this.angle))) + '|' + (Math.round(this.y / 10) + Math.round(Math.cos(this.angle)));

        //Update tile information on tile change
        if (prevTileC !== this.currentTile) {
            if (tiles[this.currentTile].object == null || !tiles[this.currentTile].object.solid) {
                tiles[prevTileC].entities.splice(tiles[prevTileC].entities.indexOf(this.id), 1);
                tiles[this.currentTile].entities.push(this.id);
                this.changetile();
            }
            else if (tiles[this.currentTile].object != null && tiles[this.currentTile].object.solid) {

                blocked = true;
                this.x = prevX;
                this.y = prevY;
                this.currentTile = prevTileC;
                this.focusTile = prevTileF;
                this.look.style.transform = 'translateX(' + this.x + 'vmin) translateZ(' + this.y + 'vmin) rotateY(' + this.angle + 'rad)';
            }

            //Get tile that is in the direction of the target
            if (this.type == 'zombie') {
                this.reqmovement = false;
                var gototile = this.target.currentTile;
                var t = gototile.split('|');
                var target = this.target_tile(t[0], t[1]);
                this.goto_tile(target);
            }
            else if(this.type == 'customer')
            {
                this.reqmovement = false;
                var t = this.target;
                this.goto_tile(t[0]+'|'+t[1]);
            }

        }
        
        //Highlight focus tile
        if (prevTileF !== this.focusTile && (this.type == 'player' || this.type == 'player2')) {

            if(tiles[this.focusTile] != undefined)tiles[this.focusTile].look.style.backgroundImage = 'radial-gradient(transparent,gray)';
            if(tiles[prevTileF] != undefined)tiles[prevTileF].look.style.backgroundImage = '';
        }




    }
    changetile()
    {
        //Interact with items left on the ground
        if(tiles[this.currentTile].item !== null)
        {
            if(itemdata[tiles[this.currentTile].item.type].squishable)
            {
                particle_spawn(this.x,this.y,itemdata[tiles[this.currentTile].item.type].color,1.4);
                tiles[this.currentTile].item.del();
                tiles[this.currentTile].item = null;

            }
            else if(tiles[this.currentTile].item.type == 'knife')
            {
                this.getdmg(5);
            }
        }
    }
    getdmg(amount,angle)
    {
        //Get damage by something
        
        if(this.item != null && this.item.type == 'riotshield' && this.item.ammo > 0)
        {
            //Ignore damage if riot shield is held
            this.item.ammo -= amount/6;
            this.look.ammobar.style.setProperty('--prog', (this.item.ammo / this.item.maxammo) * 100 + '%');
            if(this.item.ammo <= 0)
            {
                particle_spawn(this.x,this.y,'white',1.5);
                this.item.ammo = 0;
                this.item.look.lastChild.style.opacity = 0;
            }
        }
        else
        {
            if(+new Date() - this.lastdmg > 600) {
                particle_spawn(this.x, this.y, 'red', 1.7);
                this.lastdmg = +new Date();
            }
            this.hp -= amount;
            if(this.hp <= 0) this.die();
            else if(this.hp > this.maxhp) this.hp = this.maxhp;
            else if(this.hp == this.maxhp) this.look.hpbar.style.opacity = 0;
            else this.look.hpbar.style.opacity = .85;
            this.look.hpbar.style.setProperty('--prog', (this.hp/this.maxhp)*100 + '%');
        }


    }
    die(ressurect)
    {
        if(this.alive)
        {
            //Entity death
            //Remove from game and replace with zombie if ressurect is true
            tiles[this.currentTile].entities.splice(tiles[this.currentTile].entities.indexOf(this.id), 1);
            if(this.type == 'zombie')get_money(10);
            this.alive = false;
            if((data.multi && !data.player1.alive && !data.player2.alive) || (!data.multi && !data.player1.alive))losegame();
            if(this.type == 'customer' && (ressurect == undefined || ressurect)) get_money(-50);
            if(this.type == 'customer')
            {
                this.target[2]=false;
            }
            this.look.remove();

            this.reqmovement = false;
            if(this.type != 'zombie' && (ressurect == undefined || ressurect))new Human('zombie',this.x,this.y);

        }

    }
    startuse()
    {
        //Press interaction button

        if(!this.active) {
    
            //Cut vegetables and meat
            if (tiles[this.focusTile].object != null && tiles[this.focusTile].object.type == 'counter' && !tiles[this.focusTile].object.inuse && this.item != null && this.item.type == 'knife' &&  tiles[this.focusTile].object.item != null && ['tomato', 'cheese', 'lettuce', 'onion', 'meat', 'zombiemeat'].includes(tiles[this.focusTile].object.item.type)) {
                this.look.hand.style.animation = 'cutting .4s linear infinite';
                this.activefocus = this.focusTile;
                this.activeitem = this.item;
                this.actioncont = true;
                this.active = true;
                tiles[this.focusTile].object.inuse = true;

                this.progressinterval = setInterval(()=>{this.addprogress(this)}, 40);
                this.look.progbar.style.setProperty('--prog', 0);
                this.look.progbar.style.opacity = .85;
            }

            //Replenish ammo and fix riot shield
            else if (tiles[this.focusTile].object != null && tiles[this.focusTile].object.type == 'ammobox' && !tiles[this.focusTile].object.inuse &&  tiles[this.focusTile].object.item != null && (tiles[this.focusTile].object.item.type == 'pistol' || tiles[this.focusTile].object.item.type == 'riotshield') && tiles[this.focusTile].object.item.ammo != tiles[this.focusTile].object.item.maxammo ) {
                this.activefocus = this.focusTile;
                this.activeitem = this.item;
                this.actioncont = true;
                this.active = true;
                tiles[this.focusTile].object.inuse = true;

                this.progressinterval = setInterval(()=>{this.addprogress(this)}, 60);
                this.look.progbar.style.setProperty('--prog', 0);
                this.look.progbar.style.opacity = .85;
            }

            //Pull lever
            else if (tiles[this.focusTile].object != null && tiles[this.focusTile].object.type == 'lever')
            {
                change_barriercolor();
            }
            //Give food to customer
            else if(this.item != null && (this.item.type == 'bowl' || this.item.type == 'hamburger') && customer_present(this.focusTile))
            {
                var cus = entities[customer_present(this.focusTile)];
                if((this.item.type == 'bowl' && cus.ordertype == 'Salad') || (this.item.type == 'hamburger' && cus.ordertype == 'Burger'))
                {
                    var food = this.item.data.inside.sort();
                    var order = cus.order.sort();
                    if(food.length = order.length)
                    {
                        for(var i in food)
                        {
                            if(food[i] != order[i]) return;
                        }
                        this.item.look.remove();
                        this.item = null;
                        get_money((20 + (15 * food.length) + ~~(cus.ordertime/3)));
                        particle_spawn(cus.x,cus.y,'gold',1.5);
                        cus.die(false);



                    }
                }
            }
            //Use knife as weapon
            else if(!(tiles[this.focusTile].object != null && tiles[this.focusTile].object.type == 'counter') && this.item != null && this.item.type == 'knife')
            {
                this.look.hand.style.animation = 'cutting .5s linear';
                this.active = true;
                this.actioncont = false;
                var this2 = this;
                var dtime = +new Date();
                setTimeout(function(){this2.stopuse();},500);
                for(var i of tiles[this.focusTile].entities)if(entities[i].alive)
                {
                    entities[i].getdmg(50,this.angle);
                }

            }
            //Use pistol
            else if(this.item != null && this.item.type == 'pistol' && this.item.ammo > 0)
            {
                --this.item.ammo;
                this.look.hand.style.animation = 'shoot .3s linear';
                this.active = true;
                this.actioncont = false;
                var this2 = this;
                projectiles.push(new Projectile(this.x,this.y,this.angle,this.id));
                setTimeout(function(){this2.stopuse();},300);
                this.look.ammobar.style.setProperty('--prog', (this.item.ammo / this.item.maxammo) * 100 + '%');

            }
        }
    }
    stopuse()
    {
        //Stop interaction
        this.look.hand.style.animation = 'none';
        clearInterval(this.progressinterval);
        this.actionprogress = 0;
        this.look.progbar.style.opacity = 0;
        this.active = false;
        if(this.activefocus != null && tiles[this.activefocus].object != null)tiles[this.activefocus].object.inuse = false;

    }
    releaseuse()
    {
        //Release interact button
        if(this.actioncont) this.stopuse();
    }
    //Finish interaction
    finishuse()
    {
        //Cut vegetable/meat
        if(tiles[this.focusTile].object.type == 'counter' && ['tomato','cheese','lettuce','onion','meat','zombiemeat'].includes(tiles[this.focusTile].object.item.type))
        {
            var name = tiles[this.focusTile].object.item.type + 'slices';
            if(tiles[this.focusTile].object.item.type == 'zombiemeat') name = 'rawzombieburger';
            else if(tiles[this.focusTile].object.item.type == 'meat') name = 'rawburger';
            tiles[this.focusTile].object.item.del();
            tiles[this.focusTile].object.place_item(new Item(name));
        }
        //Replenish ammo
        else if (tiles[this.focusTile].object.type == 'ammobox')
        {
            tiles[this.focusTile].object.item.ammo = tiles[this.focusTile].object.item.maxammo;
            if(tiles[this.focusTile].object.item.type == 'riotshield') tiles[this.focusTile].object.item.look.lastChild.style.opacity = .8;
        }
    }
    //Countdown to interaction finish
    addprogress(me)
    {
        if(me.activefocus != me.focusTile || me.item != me.activeitem) me.stopuse();
        else
        {
            me.actionprogress += 1.5;
            this.look.progbar.style.setProperty('--prog', me.actionprogress + '%');
            tiles[me.focusTile].object.inuse = true;
            if(me.actionprogress >= 100)
            {
                me.stopuse();
                me.finishuse();
            }
        }




    }
    //Press pick up button
    equip()
    {
        if(tiles[this.focusTile] != undefined) {


            //Pickup item
            if (tiles[this.focusTile].item != null) {
                if (this.item != null) {
                    //If hand is not empty, replace held item
                    var handitem = this.item;
                    this.item = tiles[this.focusTile].item;
                    tiles[this.focusTile].item = null;
                    this.look.hand.appendChild(this.item.look);
                    tiles[this.focusTile].item_dropped(handitem);
                }
                else {
                    this.item = tiles[this.focusTile].item;
                    tiles[this.focusTile].item = null;
                    this.look.hand.appendChild(this.item.look);
                }

            }
            //Pick up item from object
            else if (tiles[this.focusTile].object != null && !tiles[this.focusTile].object.inuse && tiles[this.focusTile].object.item != null && tiles[this.focusTile].object.type != 'crate') {
                if (this.item != null) {
                    if (tiles[this.focusTile].object != null && tiles[this.focusTile].object.type != 'grinder') {
                        var handitem = this.item;
                        this.item = tiles[this.focusTile].object.item;
                        tiles[this.focusTile].object.item = null;
                        this.look.hand.appendChild(this.item.look);
                        tiles[this.focusTile].object.place_item(handitem);
                    }
                }
                else {
                    this.item = tiles[this.focusTile].object.item;
                    tiles[this.focusTile].object.item = null;
                    this.look.hand.appendChild(this.item.look);
                }
            }
            //Get item from crate (Infinite item container)
            else if (tiles[this.focusTile].object != null && tiles[this.focusTile].object.type == 'crate') {
                if (this.item == null) {
                    this.item = new Item(tiles[this.focusTile].object.itemtype);
                    this.look.hand.appendChild(this.item.look);
                }
            }

            //Display ammo bar
            if (this.item != null && (this.item.type == 'pistol' || this.item.type == 'riotshield')) {
                this.look.ammobar.style.opacity = .85;
                this.look.ammobar.style.setProperty('--prog', (this.item.ammo / this.item.maxammo) * 100 + '%');
            }
            else {
                this.look.ammobar.style.opacity = 0;
            }
        }

    }
    //Press drop button
    drop()
    {
        if(tiles[this.focusTile] != undefined) {
            if (this.item != null) {          
                if (tiles[this.focusTile].item == null && tiles[this.focusTile].object == null) {
                    //Drop item on ground
                    tiles[this.focusTile].item_dropped(this.item);
                    this.item = null;
                }
                else if (tiles[this.focusTile].item != null && itemdata[tiles[this.focusTile].item.type].cancombine.includes(this.item.type) && !tiles[this.focusTile].item.full) {
                   //Combine item with one on the ground
                    tiles[this.focusTile].item.combine(this.item);
                    this.item.del();
                    this.item = null;
                }
                else if (tiles[this.focusTile].object != null && !tiles[this.focusTile].object.inuse && objectdata[tiles[this.focusTile].object.type].placeitems && tiles[this.focusTile].object.item == null) {
                    //Drop item on object
                    tiles[this.focusTile].object.place_item(this.item);
                    this.item = null;
                }
                else if (tiles[this.focusTile].object != null && !tiles[this.focusTile].object.inuse && tiles[this.focusTile].object.item != null && itemdata[tiles[this.focusTile].object.item.type].cancombine.includes(this.item.type) && !tiles[this.focusTile].object.item.full) {
                    //Combine item with one on object
                    tiles[this.focusTile].object.item.combine(this.item);
                    this.item.del();
                    this.item = null;
                }
                else if (tiles[this.focusTile].object != null && tiles[this.focusTile].object.type == 'bin') {
                    //Get rid of item
                    this.item.del();
                    this.item = null;
                }

                //Hide ammobar
                if (this.item == null) this.look.ammobar.style.opacity = 0;

            }
        }
    }
    //List possible targets for zombies
    list_targets()
    {
        var targets = [];
        for(var i in entities)if(entities[i].alive && entities[i].type != 'zombie')
        {
            targets.push(i);
        }
        if(targets.length == 0)
        {
            //If none avilable try again later
            var this2 = this;
            setTimeout(()=>{this2.list_targets()},1000);
        }
        else this.select_target(targets);
    }
    //Select one from possible targets
    select_target(targets)
    {
        var num = ~~(targets.length * Math.random());
        this.target = entities[targets[num]];
        var tiles = this.target.currentTile.split('|');
        var tile = this.target_tile(tiles[0],tiles[1]);
        if(tile == undefined && targets.length > 1)
        {
            targets = targets.splice(num,1);
        }
        else this.goto_tile(tile);
    }
    //List places to wait for order as customer
    list_orderplaces()
    {
        var places = [];
        for(var x of data.servetiles)if(!x[2])places.push(x);
        var tile = places[~~(places.length * Math.random())];
        tile[2] = true;
        this.target= tile;

        this.target_tile(tile[0],tile[1]);

    }
    //Get shortest path to a tile
    target_tile(targetX,targetY)
    {
        var tilenums = [];
        var queue = [];
        var currentnum = 1;
        for(var i in tiles)
        {
            if(tiles[i].object != null && tiles[i].object.solid)
            {
                tilenums[i] = 999;
            }
        }
        for(var i = -data.radY-1; ++i; i <= data.radY+1)
        {
            tilenums[(data.radX+1) + '|' + i] = 999;
            tilenums[(-data.radX-1) + '|' + i] = 999;
        }
        for(var i = -data.radX-1; ++i; i <= data.radX+1)
        {
            tilenums[i + '|' + (data.radY+1)] = 999;
            tilenums[i + '|' + (-data.radY-1)] = 999;
        }

        tilenums[targetX + '|' + targetY] = 0;
        queue.push([targetX,targetY]);
        var i = 0;
        while(true)
        {
            var currentX = queue[i][0];
            var currentY = queue[i][1];

            if(tilenums[currentX + '|' + (currentY - 1)] == undefined && currentY - 1 >= -data.radY)
            {
                tilenums[currentX + '|' + (currentY - 1)] = currentnum++;
                queue.push([currentX,currentY - 1]);
            }
            if(tilenums[currentX - 1 + '|' + currentY] == undefined && currentX - 1 >= -data.radX)
            {
                tilenums[currentX - 1 + '|' + currentY] = currentnum++;
                queue.push([currentX - 1,currentY]);
            }
            if(tilenums[currentX + '|' + (currentY - -1)] == undefined && currentY - -1 <= data.radY)
            {
                tilenums[currentX + '|' + (currentY - -1)] = currentnum++;
                queue.push([currentX,currentY - -1]);
            }
            if(tilenums[currentX - -1 + '|' + currentY] == undefined && currentX - -1 <= data.radX)
            {
                tilenums[currentX - -1 + '|' + currentY] = currentnum++;
                queue.push([currentX - -1,currentY]);
            }
            if(++i >= queue.length)break;


        }

        var thisT = this.currentTile.split('|');
        var gototile = undefined;
        //var gotonum = tilenums[this.currentTile];
        var gotonum = 999;
        if(tilenums[thisT[0] - 1 + '|' + thisT[1]] < gotonum)
        {
            gototile = thisT[0] - 1 + '|' + thisT[1];
            gotonum = tilenums[gototile];
        }
        if(tilenums[thisT[0] - -1 + '|' + thisT[1]] < gotonum)
        {
            gototile = thisT[0] - -1 + '|' + thisT[1];
            gotonum = tilenums[gototile];
        }
        if(tilenums[thisT[0] + '|' + (thisT[1]- 1)] < gotonum)
        {
            gototile = thisT[0] + '|' + (thisT[1]- 1);
            gotonum = tilenums[gototile];
        }
        if(tilenums[thisT[0] + '|' + (thisT[1]- -1)] < gotonum)
        {
            gototile = thisT[0] + '|' + (thisT[1]- -1);
            gotonum = tilenums[gototile];
        }


        return gototile;
    }
    //Go to a certain tile
    goto_tile(tile)
    {
        if(tile == undefined) tile = this.currentTile;
        var thisT = tile.split('|');
        var dis = get_distance(thisT[0]*10,thisT[1]*10,this.x,this.y);
        this.step = [((thisT[0]*10) - this.x) / (dis), ((thisT[1]*10) - this.y) / (dis)];
        this.dest = [thisT[0]*10, thisT[1]*10];
        this.reqmovement = true;


    }
    //Move function for npcs
    reqmove(delta)
    {
        if(this.type == 'zombie')
        {
            //Damage entities too close to zombies
            for(var i of entities)
            {
                if(i.alive && i.type != 'zombie' && get_distance(this.x,this.y,i.x,i.y) < 10)
                {
                    i.getdmg(delta/20,this.angle);
                }
            }
            if(get_distance(this.x,this.y,this.target.x,this.target.y) < 10)
            {
                if(!this.target.alive)
                {
                    this.list_targets();
                }
                else
                {
                    this.step = [0,0];
                }

            }
        }


        if((Math.round(this.x) == Math.round(this.dest[0]) && Math.round(this.y) == Math.round(this.dest[1])) || (this.step[0] == 0 && this.step[1] == 0) || (tiles[this.dest[0]/10 + '|' + (this.dest[1]/10)].object != null && tiles[this.dest[0]/10 + '|' + (this.dest[1]/10)].object.solid))
        {

            if(this.type == 'zombie')
            {

                this.reqmovement = false;
                var gototile = this.target.currentTile;
                var t = gototile.split('|');
                var target = this.target_tile(t[0],t[1]);
                this.goto_tile(target);



            }
        }
        else {
            var speed = 200;
            this.move(this.step[0] / speed * delta,this.step[1] / speed * delta);
        }



    }

}

//Set size of div
function setsize(elem, width, height)
{
    elem.style.setProperty('--w',width + 'vmin');
    elem.style.setProperty('--h',height + 'vmin');
}
//Tile class
class Tile
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
        this.object = null;
        this.item = null;

        this.look = cr(10,10,(x+y)%2==0?'#EEE':'#111','translateZ('+y*10+'vmin) translateX('+x*10+'vmin) rotateX(90deg)');
        this.look.style.color='white';
        this.itemelem = cd('cont');
        this.itemelem.style.transform = 'translateZ(0vmin) rotateX(-90deg)';
        this.itemelem.style.transformStyle = this.look.style.transformStyle = 'preserve-3d';
        this.look.appendChild(this.itemelem);
        this.entities = [];
        s('cont').appendChild(this.look);
    }
    //Item dropped on tile
    item_dropped(item)
    {
        this.item = item;
        this.itemelem.appendChild(item.look);
        this.itemelem.style.transform = 'translateZ(1.5vmin) rotateX(-90deg)';
        this.itemelem.style.transformStyle = 'preserve-3d';
    }
    //Object placed on tile
    place_object(object)
    {
        this.object = object;
        this.itemelem.style.transform = 'translateZ(0vmin) rotateX(-90deg)';
        this.itemelem.style.transformStyle = 'preserve-3d';
        this.itemelem.appendChild(object.look);
        this.object.tileX = this.x;
        this.object.tileY = this.y;
    }
}


var items = [];
//Item class
class Item
{
    constructor(type)
    {
        this.id=items.length;
        items.push(this);
        this.look = models[type].cloneNode(true);
        this.type = type;
        this.data = {};
        this.full = false;


        this.maxammo = this.ammo = type=='pistol'?(data.currentlevel==1?1e5:8):(type=='riotshield'?100:0);


    }
    //Combine items together
    combine(item)
    {
        //Fill bowl to make salad
        if(this.type == 'bowl')
        {
            if(this.data.inside == undefined)
            {
                this.data.inside = [];
            }
            this.data.inside.push(convert_name(item.type));
            var color = item.type == 'lettuceslices' ? 'green' : (item.type == 'tomatoslices' ? 'red' : (item.type == 'onionslices' ? 'purple' : (item.type == 'cheeseslices' ? 'yellow' : 'blue')));
            this.look.style.setProperty('--l' + this.data.inside.length, color);
            if(this.data.inside.length > 4)this.full = true;
        }
        //Fill bun to make hamburger
        else if(this.type == 'hamburger')
        {
            if(this.data.inside == undefined)
            {
                this.data.inside = [];

            }

            var slice = models.hamburgerpart.cloneNode(true);
            slice.style.setProperty('--l', this.data.inside.length);
            slice.style.setProperty('--color', get_color(item.type));
            this.look.appendChild(slice);
            this.data.inside.push(convert_name(item.type));
            this.look.style.setProperty('--l', this.data.inside.length);
            //if(this.data.inside.length > 4)this.full = true;
        }
        //Apply weapon skins
        if(this.type == 'knife' || this.type == 'pistol' || this.type == 'riotshield')
        {

            var color = item.type == 'lettuceslices' ? 'green' : (item.type == 'tomatoslices' ? 'red' : (item.type == 'onionslices' ? 'purple' : (item.type == 'cheeseslices' ? 'yellow' : 'blue')));
            if(this.type == 'knife')this.look.lastChild.style.background = color;
            else this.look.style.setProperty('--color', color);
        }
    }
    //Delete item
    del()
    {
        this.look.remove();
    }
}

//Return original name of cut food
function convert_name(item)
{
    return item == 'lettuceslices' ? 'lettuce' : (item == 'tomatoslices' ? 'tomato' : (item == 'onionslices' ? 'onion' : (item == 'cheeseslices' ? 'cheese' : (item == 'burger' ? 'meat' : 'zombiemeat'))));
}
//Return color of food
function get_color(item)
{
    return item == 'lettuceslices' ? '#00A300' : (item == 'tomatoslices' ? 'red' : (item == 'onionslices' ? 'purple' : (item == 'cheeseslices' ? 'yellow' : (item == 'burger' ? 'saddlebrown' : '#004C00'))));
}
var objects = [];
//Object class
class Furniture
{
    constructor(type, data2)
    {
        this.id= objects.length;
        objects.push(this);
        this.type = type;
        this.look = models[type].cloneNode(true);
        this.data = data2;
        this.item = null;
        this.inuse = false;
        this.solid = true;
        this.level = data.currentlevel;

        this.itemelem = this.look.querySelector('.itemelem');
        if(type == 'crate')
        {
            //for(var i in this.look.querySelectorAll('.itemplace'))
            for(var i = 0; i < 3; ++i)
            {
                this.look.querySelectorAll('.itemplace')[i].appendChild(models[data2.type].cloneNode(true));
            }
            this.itemtype = data2.type;
        }
        else if(type == 'counter' && data2 != undefined && data2.type != undefined)
        {
            this.look = models['counter_' + data2.type].cloneNode(true);
            this.itemelem = this.look.querySelector('.itemelem');
        }

        var this2 =this;

        if(data2 != undefined && data2.rot != undefined)this.look.style.transform = 'rotateY('+data2.rot+'deg)';

        if(this.type == 'grinder')
        {
            this.target = null;
            this.grindercheck();
            this.solid = false;
        }
        else if(this.type == 'stove')
        {
            this.stovecheck();
            this.target = null;
        }
        else if(this.type == 'zombieportal')
        {
            setTimeout(()=>{this2.portalcheck()});
            this.target = null;
            this.solid = false;
        }
        else if(this.type == 'customerportal')
        {

            setTimeout(()=>{this2.portal2check()});
            this.target = null;
            this.solid = false;
        }

    }
    //Place item on object
    place_item(item)
    {
        this.item = item;
        this.itemelem.appendChild(item.look);
    }
    //Check for entities to process
    grindercheck()
    {

        if(this.target == null)
        {
            for(var i in entities)if(entities[i].alive)
            {
                if(entities[i].currentTile == this.data.tile)
                {
                    this.target = entities[i];
                    this.targetprog = 0;
                    this.target.look.progbar.style.setProperty('--prog', 0);
                    this.target.look.progbar.style.opacity = .85;
                }
            }
        }
        else
        {
            if(this.target.currentTile == this.data.tile)
            {
                if(this.item == null)
                {
                    this.targetprog += 2;
                    this.target.look.progbar.style.setProperty('--prog', this.targetprog+'%');
                    if(this.targetprog >= 100)
                    {
                        //If entity was here for long enough it turns into meat
                        var t = this.data.tile.split('|');
                        particle_spawn(t[0]*10,t[1]*10,'red',1.7);
                        this.target.die(false);
                        this.place_item(this.target.type=='zombie'?new Item('zombiemeat'):new Item('meat'));
                        this.target = null;
                    }
                }

            }
            else
            {
                this.target.look.progbar.style.opacity = 0;
                this.target = null;
            }

        }
        var this2 = this;
        setTimeout(()=>{this2.grindercheck()},80);
    }
    //Check if item is placed on stove
    stovecheck()
    {
        if(this.target == null && this.item != null && ['rawburger','rawzombieburger','burger','zombieburger'].includes(this.item.type))
        {
            this.target = this.item;
            this.look.lastChild.style.setProperty('--prog','50%');
            this.look.lastChild.style.opacity = .85;
            this.targetprog = 0;
        }
        else if(this.target != null)
        {
            if(this.item == this.target)
            {
                this.look.lastChild.style.setProperty('--prog',++this.targetprog+'%');
                if(this.targetprog >= 100)
                {
                    //If item is placed for long enough turn it into another item
                    var item = {rawburger:'burger',rawzombieburger:'zombieburger',burger:'burntburger',zombieburger:'burntburger'}[this.item.type];
                    this.item.look.remove();
                    this.place_item(new Item(item));
                }
            }
            else
            {
                this.look.lastChild.style.opacity = 0;
                this.target = null;
            }

        }

        var this2 = this;
        setTimeout(()=>{this2.stovecheck()},80);
    }
    //Spawn zombies
    portalcheck()
    {
        if(data.currentlevel == this.level)
        {
            if(Math.random() < .012)
            {
                var j = 0;
                for(var i in entities)if(entities[i].alive && entities[i].type == 'zombie') ++j;
                if(j < data.maxzombies)
                {
                    new Human('zombie',this.tileX * 10, this.tileY * 10);
                }

            }
            var this2 = this;
            setTimeout(()=>{this2.portalcheck()},300);
        }

    }
    //Spawn customers
    portal2check()
    {
        if(data.currentlevel == this.level)
        {
            if(Math.random() < .05)
            {
                var j = 0;
                for(var i in entities)if(entities[i].alive && entities[i].type == 'customer') ++j;
                if(j < data.servetiles.length)
                {
                    new Human('customer',this.tileX * 10, this.tileY * 10);
                }

            }
            var this2 = this;
            setTimeout(()=>{this2.portal2check()},300);
        }

    }

}


const get_distance = (x1, y1, x2, y2) => Math.hypot(x2-x1,y2-y1);

var projectiles = [];
//Projectile (bullet) class
class Projectile
{
    constructor(x,y,angle,parent)
    {
        this.angle = angle;
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.active = true;

        this.look = cd('cont');
        for(var i = 0; i < 6; ++i) this.look.appendChild(cr(1,1,'radial-gradient(#222,black)',i>3?'rotateX('+(i==4?-90:90)+'deg) translateZ(.5vmin)':'rotateY('+i*90+'deg) translateZ(.5vmin)'));

        this.look.style.transform = 'translateY(-8vmin) translateX(' + this.x + 'vmin) translateZ(' + this.y + 'vmin) rotateY(' + this.angle + 'rad)';

        s('cont').appendChild(this.look);

    }
    //Move bullet
    move(delta)
    {
        this.x += Math.sin(this.angle) * delta / 30;
        this.y += Math.cos(this.angle) * delta / 30;
        this.look.style.transform = 'translateY(-8vmin) translateX(' + this.x + 'vmin) translateZ(' + this.y + 'vmin) rotateY(' + this.angle + 'rad)';

        for(var i in entities)
        {
            if(entities[i].alive && i != this.parent)
            {
                if(get_distance(this.x,this.y,entities[i].x,entities[i].y) < 4)
                {
                    entities[i].getdmg(60,this.angle);
                    this.die();
                }
            }
        }

        if(tiles[Math.round(this.x / 10) + '|' + Math.round(this.y  / 10)] != undefined)var tileobj = tiles[Math.round(this.x / 10) + '|' + Math.round(this.y  / 10)].object;
        if(tileobj != null && tileobj.type == 'counter' && tileobj.item != null && tileobj.item.type == 'knife' && this.x % 10 < .5 && this.x % 10 > -.5 && this.y % 10 < .5 && this.y % 10 > -.5)
        {
            //If bullet hits a knife on a counter it splits into two parts
            projectiles.push(new Projectile(this.x + Math.sin(this.angle + .5) * 2,this.y + Math.cos(this.angle + .5) * 2,this.angle + .5, this.parent));
            projectiles.push(new Projectile(this.x + Math.sin(this.angle - .5) * 2,this.y + Math.cos(this.angle - .5) * 2,this.angle - .5, this.parent));
            this.die();
        }

        if(this.x > data.radX*10+5 || this.x < -(data.radX*10+5) || this.y > data.radY*10+5 || this.y < -(data.radY*10+5)) this.die();

    }
    //Remove projectile
    die()
    {
        if(this.active)
        {
            this.look.remove();
            this.active = false;
        }


    }
}

//Spawn particle effects
function particle_spawn(x,y,color,size)
{
    var look = cr(1,1,color,'translateX(var(--x)) translateY(var(--y)) translateZ(var(--z))');
    look.style.borderRadius = '50%';
    var particles = [];
    for(var i = 0; i < 16; ++i)
    {
        particles.push({look:look.cloneNode(true),x:x,y:0,z:y,sx:((Math.random()-.5)/2)*size,sy:(-1.5)*size,sz:((Math.random()-.5)/2)*size});
        s('cont').appendChild(particles[i].look);
    }
    var j = 0;
    var limit = size * 30;
    var partinterval = setInterval(()=>{



    for(var i = 0; i < 16; ++i)
    {
        particles[i].sy += .2;
        particles[i].x += particles[i].sx;
        particles[i].y += particles[i].sy;
        particles[i].z += particles[i].sz;
        particles[i].look.style.setProperty('--x',particles[i].x+'vmin');
        particles[i].look.style.setProperty('--y',particles[i].y+'vmin');
        particles[i].look.style.setProperty('--z',particles[i].z+'vmin');
    }
    if(j > limit)
    {
        for(var i = 0; i < 16; ++i) particles[i].look.remove();
        clearInterval(partinterval);
    }


},50);
}
//Check if customer is on certain tile
function customer_present(tile)
{
    for(var i in entities) if(entities[i].type == 'customer' && entities[i].alive && entities[i].currentTile == tile) return i;
    return false;
}




var data = {};

data.multi = true;//Multiplayer
data.barriercolor = 'blue';//Current barrier active (blue or red)

var get_money = amount => s('money').innerHTML = (data.money += amount) + '$'; //Get money


var prevtime = +new Date();
//Call movemetns of players npcs and projectiles
function gameloop()
{
    var dtime = +new Date() - prevtime;
    prevtime = +new Date();
    if(data.running)
    {

        data.player1.move(data.player1.speedX*dtime,data.player1.speedY*dtime);

        if(data.multi)
        {
            data.player2.move(data.player2.speedX*dtime,data.player2.speedY*dtime);
        }


        if(data.multi)
        {
            s('cont').style.setProperty('--x', (-data.player1.x - data.player2.x)/2 + 'vmin');
            s('cont').style.setProperty('--y', (-data.player1.y - data.player2.y)/2 - -10 + 'vmin');
        }
        else
        {
            s('cont').style.setProperty('--x', -data.player1.x + 'vmin');
            s('cont').style.setProperty('--y', -data.player1.y - -10 + 'vmin');
        }

        for(i in entities)
        {
            if(entities[i].reqmovement && entities[i].alive)entities[i].reqmove(dtime);
        }


        for(i in projectiles)
        {
            if(projectiles[i].active)
            {
                projectiles[i].move(dtime);
            }
        }
    }
    setTimeout(gameloop);



}

gameloop();



//Change current barrier type
function change_barriercolor()
{
    for(var i in tiles)
    {
        if(tiles[i].entities.length > 0 && tiles[i].object != null && tiles[i].object.type.includes('barrier')) return;
    }
    var oldcolor = data.barriercolor;
    if(data.barriercolor == 'red')
    {
        data.barriercolor = 'blue';
        s('cont').style.setProperty('--leverdir', '-30deg');
    }
    else
    {
        data.barriercolor = 'red';
        s('cont').style.setProperty('--leverdir', '30deg');
    }
    for(var i in objects)
    {
        if(objects[i].type == 'barrier' + data.barriercolor)
        {
            objects[i].solid=false;
            objects[i].look.style.transform = 'translateY(5.8vmin)';
        }
        else if(objects[i].type == 'barrier' + oldcolor)
        {
            objects[i].solid=true;
            objects[i].look.style.transform = 'translateY(0)';
        }
    }
}

var tiles = [];

//Load level and apply its properties to the game
function loadlevel(level)
{
    for(var i in level)data[i] = level[i];
    s('cont').innerHTML = '';
    entities = [];
    objects = [];
    items = [];
    projectiles = [];
    tiles = [];

    for(var i = -level.radX; i <= level.radX;  ++i)for(var j = -level.radY; j <= level.radY;  ++j) tiles[i + '|' + j] = new Tile(i,j);
    s('lvltxt').innerHTML = level.msg;

    data.level = level;
    data.servetiles = [];
    for(var x of level.ordertiles) data.servetiles.push([x[0],x[1],false]);
    data.money = 0;

    for(var x of level.obj)
    {
        tiles[x[1]+'|'+x[2]].place_object(new Furniture(x[0],x[3]));
    }
    for(var x of level.items)
    {
        if(tiles[x[1]+'|'+x[2]].object == null)tiles[x[1]+'|'+x[2]].item_dropped(new Item(x[0]));
        else tiles[x[1]+'|'+x[2]].object.place_item(new Item(x[0]));
    }
    leveltimer();
    clearInterval(data.timer);
    data.timer = setInterval(leveltimer,1000);
    data.player1 = new Human('player',level.p1[0],level.p1[1]);
    if(data.multi)data.player2 = new Human('player2',level.p2[0],level.p2[1]);
    s('cont').appendChild(cr(data.radX*20+10,30,'radial-gradient(white,black)','translateY(-15vmin) translateZ('+(-data.radY*10-5)+'vmin)'));
    s('cont').appendChild(cr(data.radY*20+10,30,'radial-gradient(white,black)','rotateY(90deg) translateY(-15vmin) translateZ('+(-data.radX*10-5)+'vmin)'));
    s('cont').appendChild(cr(data.radY*20+10,30,'radial-gradient(white,black)','rotateY(-90deg) translateY(-15vmin) translateZ('+(-data.radX*10-5)+'vmin)'));
}

//Level countdown
function leveltimer()
{
    --data.time;
    var min = ~~(data.time/60);
    var sec = data.time - (min * 60);
    sec = sec < 10 ? '0' + '' + sec : sec;
    s('time').innerHTML = min + ':' + sec;
    if(data.time <= 0)
    {
        wingame();

    }
}
s('end').hidden = true;
//Finish level
function wingame()
{
    endgame();
    s('win').hidden = false;
    s('lost').hidden = true;

    for(var i = 1; i <4;++i)
    {
        document.querySelector('.s'+i+'.star').setAttribute('got', 0);
        document.querySelector('.s'+i+'.starm').innerHTML = levels[l]['money'+i] + '$';
        if(data.money > levels[l]['money'+i])
        {
            document.querySelector('.s'+i+'.star').setAttribute('got', 1);
            savefile[l][i] = 1;
        }
    }
    if(savefile[l][4] < data.money)
    {
        savefile[l][4] = data.money;
        s('rec').hidden = false;
    }
    else s('rec').hidden = true;

    s('moneymade').innerHTML = 'Money Collected: ' + data.money + '$<br>Your Record: ' +savefile[l][4]+'$';
    data.running = false;
    if(l<8 && data.money > levels[l].money1)savefile[l+1][0]=1;
    save();
}
//Die in level
function losegame()
{
    endgame();
    s('win').hidden = true;
    s('lost').hidden = false;
}
//Stops certain processes that run while playing on a level
function endgame()
{
    clearInterval(data.timer);
    s('end').hidden = false;
    data.running = false;
    s('next').hidden = true;
    if((l=data.currentlevel) != 8 && savefile[l+1][1])
    {
        s('next').hidden = false;
    }
    s('lvl').innerHTML = 'Level ' + (1+l);
}
//Save game
function save()
{
    localStorage.p93 = JSON.stringify(savefile);
}

//Level data
var levels = [
        {//lvl1
            p1:[0,0], //Player1 spawn point
            p2:[10,0], //Player2 spawn point
            radX: 3,    //Level width is radX*2+1
            radY: 2,    //Level height is radY*2+1
            obj: [      //Add objects to level
                ['customerportal',-3,-2],
                ['bin',3,1],
                ['crate',3,-2,{type: 'tomato'}],
                ['crate',3,-1,{type: 'lettuce'}],
                ['crate',3,0,{type: 'bowl'}],
                ['counter',-3,2,{type: 'end'}],
                ['counter',-2,2,{type: 'line'}],
                ['counter',-1,2,{type: 'line'}],
                ['counter',0,2,{type: 'line'}],
                ['counter',1,2,{type: 'line'}],
                ['counter',2,2,{type: 'line'}],
                ['counter',3,2,{type: 'end', rot:180}]
            ],
            items:  //Add items to level
                [
                    ['knife',-1,2],
                    ['knife',1,2]
                ],
            ordertypes: ['Salad'], //Types of food customers can order
            salading: ['lettuce','tomato'], //Salad ingredients customers can order
            burgering: [],//Burger ingredients customers can order
            maxzombies: 0,//Maximum amount of zombies that can be present
            ordermax: 2,//Maximum legth of orders
            money1: 100, //Money needed for 1 star
            money2: 200, //Money needed for 2 stars
            money3: 300, //Money needed for 3 stars
            time: 120, //Level length in seconds
            ordertiles: [[-3,0],[-2,0]], //Tiles customers will go to
            //Message to display in corner
            msg: 'You own a restaurant specialized in salads! Pick up vegetables from the barrels, drop them on a counter, pick up a knife and hold the interaction button to cut them. After this put a bowl on the counter and DROP the sliced veggies into the bowl. When done pick it up and interact with the customer who ordered it'
        },
    {//lvl2
        p1:[10,30],
        p2:[10,-30],
        radX: 4,
        radY: 3,
        obj: [
            ['crate',4,0,{type: 'lettuce'}],
            ['crate',4,1,{type: 'tomato'}],
            ['crate',4,2,{type: 'onion'}],
            ['crate',4,3,{type: 'bowl'}],
            ['zombieportal',4,-2],
            ['customerportal',-4,3],
            ['counter',0,-2,{type: 'end',rot:-90}],
            ['counter',0,-1,{type: 'line',rot:90}],
            ['counter',0,0,{type: 'line',rot:90}],
            ['counter',0,1,{type: 'end',rot:90}],
            ['bin',0,2]
        ],
        items:
            [
                ['knife',0,-1],
                ['pistol',0,-2]
            ],
        ordertypes: ['Salad'],
        salading: ['lettuce','tomato','onion'],
        burgering: [],
        maxzombies: 1,
        ordermax: 3,
        money1: 80,
        money2: 150,
        money3: 250,
        time: 150,
        ordertiles: [[-4,1],[-3,1]],
        msg: 'Oh no! The zombie apocalypse broke out! Protect your customers and yourself from angry zombies! Use the knife to attack them with the interaction button or use a pistol'
    },
    {//lvl3
        p1:[-30,10],
        p2:[-20,10],
        radX: 4,
        radY: 3,
        obj: [
            ['crate',-4,1,{type: 'lettuce'}],
            ['crate',-4,-1,{type: 'tomato'}],
            ['crate',-4,0,{type: 'onion'}],
            ['crate',-4,2,{type: 'bowl'}],
            ['ammobox',-4,3],
            ['counter',-4,-2,{type: 'line'}],
            ['counter',-3,-2,{type: 'line'}],
            ['counter',-2,-2,{type: 'line'}],
            ['counter',-1,-2,{type: 'end',rot:180}],
            ['counter',-1,1,{type: 'end',rot:-90}],
            ['counter',-1,2,{type: 'end',rot:90}],
            ['bin',-1,3],
            ['zombieportal',-4,-3],
            ['customerportal',4,-3]
        ],
        items:
            [
                ['knife',-1,2],
                ['pistol',-4,3]
            ],
        ordertypes: ['Salad'],
        salading: ['lettuce','tomato','onion'],
        burgering: [],
        maxzombies: 1,
        ordermax: 3,
        money1: 80,
        money2: 160,
        money3: 270,
        time: 120,
        ordertiles: [[2,3],[3,3],[4,3]],
        msg: 'Normally the pistol has limited ammo. Use the ammo station (the green one) to replenish it. Drop the gun onto it and hold the interaction button',
    },{//lvl4
        p1:[-20,20],
        p2:[-10,30],
        radX: 4,
        radY: 4,
        obj: [
            ['bin',4,2],
            ['ammobox',-4,-2],

            ['crate',-4,-1,{type: 'meat'}],
            ['crate',-4,0,{type: 'lettuce'}],
            ['crate',-4,1,{type: 'cheese'}],
            ['crate',-4,2,{type: 'hamburger'}],
            ['zombieportal',-4,3],
            ['zombieportal',4,3],

            ['counter',4,1],
            ['stove',4,0,{rot: -90}],
            ['stove',4,-1,{rot: -90}],
            ['counter',4,-2],
            ['customerportal',0,-3],
            ['counter',0,1,{type: 'line'}],
            ['counter',1,1,{type: 'end',rot:180}],
            ['counter',-1,1,{type: 'end'}]



        ],
        items:
            [
                ['pistol',-4,-2],
                ['knife',-1,1],
                ['knife',0,1]
            ],
        ordertypes: ['Burger'],
        salading: ['lettuce','cheese'],
        burgering: ['meat'],
        maxzombies: 1,
        ordermax: 2,
        money1: 70,
        money2: 150,
        money3: 230,
        time: 140,
        msg: "You decided to start selling burgers as you're running out of vegetables. Cut meat the same way you cut vegetables, then place it on an oven and wait for it to cook, but be careful not to overcook it. When done drop it into a hamburger bun",
        ordertiles: [[-1,-1],[1,-1]]
    },{//lvl5
        p1:[-20,20],
        p2:[-10,30],
        radX: 4,
        radY: 4,
        obj: [
            ['bin',-4,4],
            ['counter',-4,3],
            ['stove',-4,2,{rot: 90}],
            ['counter',-4,1],
            ['zombieportal',-4,-4],
            ['zombieportal',4,-4],

            ['crate',-1,-4,{type: 'meat'}],
            ['crate',0,-4,{type: 'onion'}],
            ['crate',1,-4,{type: 'cheese'}],


            ['crate',-2,4,{type: 'bowl'}],
            ['crate',-1,4,{type: 'hamburger'}],

            ['customerportal',4,4],

            ['barrierblue',-1,0],
            ['lever',0,1],

            ['ammobox',4,0],

            ['counter',-2,0,{type: 'end',rot:180}],
            ['counter',-3,0,{type: 'line'}],
            ['counter',-4,0,{type: 'end'}],


            ['counter',0,0,{type: 'end'}],
            ['counter',1,0,{type: 'line'}],
            ['counter',2,0,{type: 'line'}],
            ['counter',3,0,{type: 'end',rot:180}]



        ],
        items:
            [
                ['pistol',4,0],
                ['knife',-3,0],
                ['knife',-2,0],
                ['riotshield',3,0]
            ],
        ordertypes: ['Burger', 'Salad'],
        salading: ['onion','cheese'],
        burgering: ['meat'],
        maxzombies: 3,
        ordermax: 2,
        money1: 150,
        money2: 230,
        money3: 350,
        time: 180,
        msg: 'You can push away zombies without taking damage using the riot shield. Repair it the same way you replenish ammo in your gun. Use the lever to open and close barriers',
        ordertiles: [[3,2],[3,3]]
    },{//lvl6
        p1:[-50,10],
        p2:[-50,20],
        radX: 6,
        radY: 3,
        obj: [
            ['crate',-6,3,{type: 'meat'}],
            ['crate',-5,3,{type: 'tomato'}],
            ['crate',-4,3,{type: 'lettuce'}],
            ['crate',-3,3,{type: 'bowl'}],
            ['stove',-6,-1],
            ['counter',-5,-1],
            ['ammobox',-3,-1],

            ['barrierred',-2,1],
            ['barrierblue',2,1],
            ['lever',0,-2],
            ['lever',-6,1],

            ['zombieportal',0,0],
            ['zombieportal',0,3],
            ['customerportal',6,3],

            ['counter',6,-1,{type:'line'}],
            ['counter',5,-1,{type:'end'}],
            ['counter',3,-1,{type:'end',rot:180}],
            ['counter',2,-1,{type:'line'}],
            ['counter',1,-1,{type:'line'}],
            ['counter',0,-1,{type:'line'}],
            ['counter',-1,-1,{type:'line'}],
            ['counter',-2,-1,{type:'end'}],

            ['counter',-2,0],
            ['counter',2,0],

            ['counter',-2,2,{type:'end',rot:-90}],
            ['counter',-2,3,{type:'end',rot:90}],

            ['counter',2,2,{type:'end',rot:-90}],
            ['counter',2,3,{type:'end',rot:90}]

        ],
        items:
            [
                ['knife',-5,-1],
                ['pistol',-3,-1]
            ],
        ordertypes: ['Salad', 'Burger'],
        salading: ['lettuce','tomato'],
        burgering: ['meat'],
        maxzombies: 2,
        ordermax: 3,
        money1: 50,
        money2: 100,
        money3: 150,
        time: 120,
        ordertiles: [[5,0],[5,2]],
        msg: 'You are the only one who keeps the people protected and fed. Keep up the good work!'
    },{//lvl7
        p1:[10,0],
        p2:[10,-10],
        radX: 3,
        radY: 2,
        obj: [
            ['zombieportal',-3,2],
            ['zombieportal',-2,2],
            ['zombieportal',-3,1],
            ['customerportal',-3,-2],

            ['crate',1,-2,{type: 'hamburger'}],
            ['crate',0,-2,{type: 'cheese'}],


            ['counter',3,-2],
            ['stove',3,-1],
            ['counter',3,0],
            ['grinder',3,1,{tile:'3|1'}],
            ['counter',3,2],

            ['ammobox',1,2],

            ['counter',-3,0,{type: 'end'}],
            ['counter',-2,0,{type: 'line'}],
            ['counter',-1,0,{type: 'end',rot:180}],

            ['bin',-1,2],

            ['barrierblue',-1,1],
            ['lever',0,0]
        ],
        items:
            [
                ['knife',3,0],
                ['riotshield',1,2]
            ],
        ordertypes: ['Burger'],
        salading: ['cheese'],
        burgering: ['zombiemeat'],
        maxzombies: 1,
        ordermax: 2,
        money1: 50,
        money2: 100,
        money3: 150,
        time: 150,
        ordertiles: [[-2,-1],[-2,-2]],
        msg: "You've run out of meat, but you have a large grinder! Push the zombie into the grinder using your riot shield and hold him there until the grinder 'processes' it. When you're done, you'll have a delicious pice of zombie meat"
    },{//lvl8
        p1:[0,0],
        p2:[10,0],
        radX: 4,
        radY: 4,
        obj: [
            ['zombieportal',-4,-4],
            ['zombieportal',4,-4],
            ['zombieportal',-4,4],
            ['zombieportal',4,4],
            ['zombieportal',0,4],
            ['zombieportal',0,-4],
            ['zombieportal',4,0],
            ['zombieportal',-4,0],

            ['ammobox',2,-2],
            ['ammobox',-2,2],
            ['crate',-2,-2,{type: 'knife'}],
            ['crate',2,2,{type: 'knife'}],

            ['counter',-1,-2],
            ['counter',-1,2],
            ['counter',1,-2],
            ['counter',1,2],

            ['counter',-2,-1],
            ['counter',-2,1],
            ['counter',2,-1],
            ['counter',2,1]


        ],
        items:
            [
                ['pistol',-2,2],
                ['pistol',-2,1],
                ['riotshield',2,-1],
                ['riotshield',2,-2]
            ],
        ordertypes: [],
        salading: [],
        burgering: [],
        maxzombies: 5,
        ordermax: 2,
        money1: 90,
        money2: 140,
        money3: 220,
        time: 120,
        msg: 'The zombies have come for you. Survive their attack to defeat them for good, and take BACK the city from them!<br>Pro tip: You can use the shield while using the ammo station',
        ordertiles: []
    },{//lvl9
        p1:[10,-20],
        p2:[-10,-20],
        radX: 4,
        radY: 4,
        obj: [
            ['crate',-3,-4,{type: 'bowl'}],
            ['crate',-2,-4,{type: 'lettuce'}],
            ['crate',-1,-4,{type: 'tomato'}],
            ['crate',0,-4,{type: 'onion'}],
            ['crate',1,-4,{type: 'cheese'}],
            ['crate',2,-4,{type: 'meat'}],
            ['crate',3,-4,{type: 'hamburger'}],
            ['lever',0,-2],
            ['bin',4,-4],

            ['barrierblue',4,0],
            ['barrierblue',-4,0],

            ['counter',3,0],
            ['counter',-3,0],

            ['stove',2,0],
            ['stove',-2,0],

            ['counter',-1,0,{type: 'end'}],
            ['counter',0,0,{type: 'line'}],
            ['counter',1,0,{type: 'end',rot:180}],

            ['lever',0,1],

            ['barrierred',-4,2],
            ['barrierred',-3,2],
            ['barrierred',-2,2],
            ['barrierred',-1,2],
            ['barrierred',0,2],
            ['barrierred',1,2],
            ['barrierred',2,2],
            ['barrierred',3,2],
            ['barrierred',4,2],

            ['customerportal',-4,4],
            ['customerportal',4,4]
        ],
        items:
            [
                ['knife',-3,0],
                ['knife',3,0],
                ['riotshield',4,-2]
            ],
        ordertypes: ['Salad','Burger'],
        salading: ['lettuce','tomato','onion','cheese'],
        burgering: ['meat'],
        maxzombies: 0,
        ordermax: 5,
        money1: 130,
        money2: 270,
        money3: 400,
        time: 210,
        ordertiles: [[-1,3],[1,3]],
        msg: 'You did it! You took BACK the city from the zombies! The people are celebrating you, but they are also hungry. So be ready to make more food than ever before'
    }
    ];

//Load or create save file
var savefile = localStorage.p93 != undefined ? JSON.parse(localStorage.p93) : [[1,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
