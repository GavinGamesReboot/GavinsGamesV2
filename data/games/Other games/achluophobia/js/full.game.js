var MathHelper = {
	getAngleTo: function(x1, y1, x2, y2) {
		var deltaY = y2 - y1;
		var deltaX = x2 - x1;
		var rads = Math.atan2(deltaY, deltaX);
		var degrees = rads * (180.0 / Math.PI);
		return (degrees > 0.0 ? degrees : (360.0 + degrees));		
	},
	dotproduct: function(a,b) {
		var n = 0;
		var lim = Math.min(a.length,b.length);
		for (var i = 0; i < lim; i++) n += a[i] * b[i];
		return n;
	},
	sign: function(x) {
		return x ? x < 0 ? -1 : 1 : 0;
	},
	distance: function(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow((x2 - x1),2) + Math.pow((y2 - y1),2));
	},
	randomSign: function() {
		return Math.random() < 0.5 ? -1 : 1;
	}
}
function Key (x, y) {
	this.x = x;
	this.y = y;
	this.collected = false;

	this.draw = function() {
		if (this.collected) return;
		ctx.save();	
		ctx.translate(this.x, this.y);
		
		ctx.beginPath();
		
		ctx.arc(0, -6, 4, 2 * Math.PI, false);
		ctx.moveTo(0, -3);
		ctx.lineTo(0, 14);
		ctx.moveTo(0, 6);
		ctx.lineTo(7, 6);
		ctx.moveTo(0, 12);
		ctx.lineTo(7, 12);
		//ctx.closePath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = "#000000";
		ctx.stroke();

		ctx.translate(-this.x, -this.y);
		ctx.restore();
	};
	
	this.update = function() {
		if (this.collected) return;
		if (MathHelper.distance(player.x, player.y, this.x, this.y) < player.width/2) {
			//console.log(MathHelper.distance(player.x, player.y, this.x, this.y));
			//Score for palyer
			NUMBER_OF_KEYS_LEFT -= 1;
			key_count.textContent = NUMBER_OF_KEYS_LEFT;
			this.collected = true;
		}
	};
}

var HOUSE_LAYOUT = new Array();
var HOUSE_ROWS = 60;
var HOUSE_COLS = 60;

var SQUARE_WIDTH = 40;

var FIRST_ROOM = true;

var DOOR_X = 30;
var DOOR_Y = 27;

function find_random() {
	var foundSquare = false;
	
	var location = {};
	
	while(!foundSquare) {
		var randomX = Math.floor(Math.random() * (HOUSE_ROWS - 2)) + 1;
		var randomY = Math.floor(Math.random() * (HOUSE_COLS - 2)) + 1;
		
		if (HOUSE_LAYOUT[randomX][randomY] == 0) {
			if (HOUSE_LAYOUT[randomX + 1][randomY] == 1) {
				foundSquare = true;
				location.new_room = [-1, 0];
			}
			
			if (HOUSE_LAYOUT[randomX - 1][randomY] == 1) {
				if (foundSquare) {
					foundSquare = false;
					continue;
				}
				
				foundSquare = true;
				location.new_room = [1, 0];
			}
			
			if (HOUSE_LAYOUT[randomX][randomY + 1] == 1) {
				if (foundSquare) {
					foundSquare = false;
					continue;
				}
			
				foundSquare = true;
				location.new_room = [0, -1];
			}
			
			if (HOUSE_LAYOUT[randomX][randomY - 1] == 1) {
				if (foundSquare) {
					foundSquare = false;
					continue;
				}
				
				foundSquare = true;
				location.new_room = [0, 1];
			}
		}
	}
	
	location.door = [randomX, randomY];
	
	return location;
}

function add_room() {
	var location = find_random();
	
	var width = (Math.floor(Math.random() * 5) + 5);
	var height = (Math.floor(Math.random() * 5) + 5);
	
	var offset = 0;
	var startX = 0;
	var startY = 0;
	
	if (location.new_room[0] != 0) {
		width *= location.new_room[0];
		startY = Math.floor(Math.random()  * (height-1) * - 1);
	}
	
	if (location.new_room[1] != 0) {
		height *= location.new_room[1];
		startX = Math.floor(Math.random()  * (width-1)* - 1);
	}
	
	if (width < 0) {
		width = Math.abs(width);
		startX = startX + location.door[0] - width;
	} else {
		startX = startX + location.door[0] + location.new_room[0];
	}
	
	if (height < 0) {
		height = Math.abs(height);
		startY = startY + location.door[1] - height;
	} else {
		startY = startY + location.door[1] + location.new_room[1];
	}
	
	if (isFree(startX, startY, width, height)) {	
		HOUSE_LAYOUT[ location.door[0] ][ location.door[1] ] = 1;
		
		digOut(startX, startY, width, height);
		return true;
	} else {
		return false;
	}
}

function getRandomSquare(min_x, min_y, x_offset, y_offset) {
	var random_x = Math.floor(Math.random() * (x_offset)) + min_x;
	var random_y = Math.floor(Math.random() * (y_offset)) + min_y;
	return {x: random_x, y: random_y};

}

function hasFreeAdjacent(x, y) {
	if (x + 1 >= HOUSE_ROWS || y + 1 >= HOUSE_COLS ||
		x - 1 < 0 || y - 1 < 0) {
		return true;
	}

	if (x < HOUSE_ROWS && HOUSE_LAYOUT[x + 1][y] == 1) {
		return true;
	}
			
	if (x > 0 && HOUSE_LAYOUT[x - 1][y] == 1) {
		return true;
	}
			
	if (y <  HOUSE_COLS && HOUSE_LAYOUT[x][y + 1] == 1) {
		return true;
	}
			
	if (y > 0 && HOUSE_LAYOUT[x][y - 1] == 1) {
		return true;
	}
	
	return false;
}

function isFree(x, y, w, h) {
	if (x + w >= HOUSE_ROWS || y + h >= HOUSE_COLS ||
		x < 0 || y < 0) {
		return false;
	}	
	for(var i = 0; i < w; i++) {
		for (var j = 0; j < h; j++) {
			if (HOUSE_LAYOUT[x + i][y + j] != 0) return false;
		}
	}
	
	return true;
}

function digOut(x, y, w, h) {
	for(var i = 0; i < w; i++) {
		for (var j = 0; j < h; j++) {w
			HOUSE_LAYOUT[x + i][y + j] = 1;
		}
	}
	
	if (!FIRST_ROOM) {
		var key_square = getRandomSquare(x, y, w, h);
		var new_key = new Key(key_square.x * SQUARE_WIDTH + SQUARE_WIDTH/2,
							key_square.y * SQUARE_WIDTH + SQUARE_WIDTH/2);
		GAME_OBJECTS.push(new_key);
	}
	
	/* var numberOfWalls = Math.ceil(Math.random() * 3);
	while(numberOfWalls--) {
		var wall = getRandomSquare(x+1, y+1, w-1, h-1);
		HOUSE_LAYOUT[wall.x][wall.y] = 0;
	} */
	
	if (FIRST_ROOM) FIRST_ROOM = false;
}

function translateToSquare(x, y) {
	var x_coord = Math.floor(x / SQUARE_WIDTH);
	var y_coord = Math.floor(y / SQUARE_WIDTH);
	
	return {x: x_coord, y: y_coord};
}


function draw_map() {
	for(var i = 0; i < HOUSE_ROWS; i++) {
		for(var j = 0; j < HOUSE_COLS; j++) {
			if (HOUSE_LAYOUT[i][j] != 0) {
				
				ctx.fillStyle = "#FFFFFF";
				ctx.fillRect(i * SQUARE_WIDTH,
						 j * SQUARE_WIDTH,
						 SQUARE_WIDTH,
						 SQUARE_WIDTH);

			}
		}
	}	
}

function init_house() {

	HOUSE_LAYOUT = new Array();
	HOUSE_ROWS = 60;
	HOUSE_COLS = 60;

	SQUARE_WIDTH = 40;

	FIRST_ROOM = true;

	DOOR_X = 30;
	DOOR_Y = 27;


	for(var i = 0; i < HOUSE_ROWS; i++) {
		HOUSE_LAYOUT[i] = new Array();
		for(var j = 0; j < HOUSE_COLS; j++) {
			HOUSE_LAYOUT[i][j] = 0;
		}
	}
	
	HOUSE_LAYOUT[DOOR_X-1][DOOR_Y] = -1;
	HOUSE_LAYOUT[DOOR_X-1][DOOR_Y-1] = -1;
	HOUSE_LAYOUT[DOOR_X][DOOR_Y-1] = -1;
	HOUSE_LAYOUT[DOOR_X+1][DOOR_Y] = -1;
	HOUSE_LAYOUT[DOOR_X+1][DOOR_Y-1] = -1;
	HOUSE_LAYOUT[DOOR_X][DOOR_Y] = -1;
	
	digOut(28, 28, 5, 5);
	
	var room_count = 0;
	while(room_count < NUMBER_OF_ROOMS) {
		if (add_room()) ++room_count;
	}
	
	for(var i = 0; i < HOUSE_ROWS; i++) {
		for(var j = 0; j < HOUSE_COLS; j++) {
			if ((i == 0 || i == HOUSE_ROWS-1) ||
				(j == 0 || j == HOUSE_COLS-1)) {
				HOUSE_LAYOUT[i][j] = 0;
			}
		}
	}
	
}

function draw_door() {
		ctx.save();	
		ctx.translate(DOOR_X * SQUARE_WIDTH, DOOR_Y * SQUARE_WIDTH);
		
		if (NUMBER_OF_KEYS_LEFT > 0) {
			ctx.beginPath();
			ctx.moveTo(0, SQUARE_WIDTH);
			ctx.lineTo(SQUARE_WIDTH, SQUARE_WIDTH);
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#000000";
			ctx.stroke();
		
			ctx.beginPath();
			ctx.arc(SQUARE_WIDTH/2, SQUARE_WIDTH/2, 4, 0, 2 * Math.PI);
			ctx.fillStyle = "#000000";
			ctx.fill();
			
			ctx.beginPath();
			ctx.moveTo(SQUARE_WIDTH/2, SQUARE_WIDTH/2);
			ctx.lineTo(SQUARE_WIDTH/2, SQUARE_WIDTH/2 + 10);
			ctx.lineWidth = 3;
			ctx.strokeStyle = "#000000";
			ctx.stroke();
		} else {
			
			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(0,0,SQUARE_WIDTH,SQUARE_WIDTH);
			ctx.save();	
			//ctx.scale(2, 1);
			ctx.beginPath();
			ctx.moveTo(0, SQUARE_WIDTH);
			ctx.lineTo(-SQUARE_WIDTH, SQUARE_WIDTH * 1.5);
			ctx.bezierCurveTo(-SQUARE_WIDTH, SQUARE_WIDTH * 3, SQUARE_WIDTH * 2, SQUARE_WIDTH * 3, SQUARE_WIDTH * 2, SQUARE_WIDTH * 1.5);
			ctx.lineTo(SQUARE_WIDTH, SQUARE_WIDTH);
			
			var fading_gradient = ctx.createRadialGradient(SQUARE_WIDTH/2, SQUARE_WIDTH, SQUARE_WIDTH * 1.5, SQUARE_WIDTH/2, SQUARE_WIDTH, 0);
			fading_gradient.addColorStop(0, 'rgba(255,255,255,0)');
			fading_gradient.addColorStop(0.5, 'rgba(255,255,255,.9)');
			fading_gradient.addColorStop(1, 'rgba(255,255,255,1)');
			ctx.fillStyle = fading_gradient;

			ctx.fill();
			ctx.restore();
		}
		
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, SQUARE_WIDTH/2);
		ctx.arcTo(SQUARE_WIDTH/2,
				-SQUARE_WIDTH*4,
				SQUARE_WIDTH,
				SQUARE_WIDTH/2,
				SQUARE_WIDTH/2);
		ctx.lineTo(SQUARE_WIDTH, 0);
		ctx.closePath();
		ctx.fillStyle = "#000000";
		ctx.fill();
		
		ctx.translate(-DOOR_X * SQUARE_WIDTH, -DOOR_Y * SQUARE_WIDTH);
		ctx.restore();
}
var player = {
	x: 0,
	y: 0,
	width: 30,
	speed: 2,

	init: function() {
		this.x = (HOUSE_ROWS * SQUARE_WIDTH)/2 + SQUARE_WIDTH/2;
		this.y = (HOUSE_COLS * SQUARE_WIDTH)/2 + SQUARE_WIDTH/2;
	},
	
	draw: function() {
		
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.width/2, 2 * Math.PI, false);
		if (DEBUG) {
			ctx.fillStyle = "#0000FF";
		} else {
			ctx.fillStyle = "#FFFFFF";
		}
		ctx.fill();
		
		
		playerSight.draw();
	},
	
	//TODO: make speed constant with time
	update: function() {	
		//Check only holding 1 button, otherwise dont do anything
		var numberDown = rightDown + leftDown + upDown + downDown;
		
		if (rightDown) {
			this.x = this.x + this.speed;
			var point_1 = translateToSquare(this.x + this.width/2, this.y - this.width/2);
			var point_2 = translateToSquare(this.x + this.width/2, this.y + this.width/2);

			if (HOUSE_LAYOUT[point_1.x][point_1.y] <= 0 ||
				HOUSE_LAYOUT[point_2.x][point_2.y] <= 0) {
				this.x = this.x - this.speed;
				//Shove player around corners
				if (numberDown == 1) {
					if (HOUSE_LAYOUT[point_1.x][point_1.y] > 0) {
						this.y = this.y - this.speed;
					} else if (HOUSE_LAYOUT[point_2.x][point_2.y] > 0) {
						this.y = this.y + this.speed;
					}
				}
			}
		}
		if (leftDown) {
			this.x = this.x - this.speed;
			
			var point_1 = translateToSquare(this.x - this.width/2, this.y - this.width/2);
			var point_2 = translateToSquare(this.x - this.width/2, this.y + this.width/2);

			if (HOUSE_LAYOUT[point_1.x][point_1.y] <= 0 ||
				HOUSE_LAYOUT[point_2.x][point_2.y] <= 0) {
				this.x = this.x + this.speed;
				//Shove player around corners
				if (numberDown == 1) {
					if (HOUSE_LAYOUT[point_1.x][point_1.y] > 0) {
						this.y = this.y - this.speed;
					} else if (HOUSE_LAYOUT[point_2.x][point_2.y] > 0) {
						this.y = this.y + this.speed;
					}
				}
			}
		}
		if (upDown) {
			this.y = this.y - this.speed;
						
			var point_1 = translateToSquare(this.x - this.width/2, this.y - this.width/2);
			var point_2 = translateToSquare(this.x + this.width/2, this.y - this.width/2);

			if (HOUSE_LAYOUT[point_1.x][point_1.y] <= 0 ||
				HOUSE_LAYOUT[point_2.x][point_2.y] <= 0) {
				this.y = this.y + this.speed;
				//Shove player around corners
				if (numberDown == 1) {
					if (HOUSE_LAYOUT[point_1.x][point_1.y] > 0) {
						this.x = this.x - this.speed;
					} else if (HOUSE_LAYOUT[point_2.x][point_2.y] > 0) {
						this.x = this.x + this.speed;
					}
				}
			}
		}
		if (downDown) {
			this.y = this.y + this.speed;
									
			var point_1 = translateToSquare(this.x - this.width/2, this.y + this.width/2);
			var point_2 = translateToSquare(this.x + this.width/2, this.y + this.width/2);

			if (HOUSE_LAYOUT[point_1.x][point_1.y] <= 0 ||
				HOUSE_LAYOUT[point_2.x][point_2.y] <= 0) {
				this.y = this.y - this.speed;
				//Shove player around corners
				if (numberDown == 1) {
					if (HOUSE_LAYOUT[point_1.x][point_1.y] > 0) {
						this.x = this.x - this.speed;
					} else if (HOUSE_LAYOUT[point_2.x][point_2.y] > 0) {
						this.x = this.x + this.speed;
					}
				}
			}
		}
		
		playerSight.update();
	}
};

var playerSight = {
	arc_length : 180,
	arc_angle : 35,
	update: function() {
		var lookStart = MathHelper.getAngleTo(WIDTH/2, HEIGHT/2, MOUSEX, MOUSEY) - this.arc_angle/2;
		var lookEnd = MathHelper.getAngleTo(WIDTH/2, HEIGHT/2, MOUSEX, MOUSEY) + this.arc_angle/2;
		if (lookStart - 10 < beast.getAngle() &&
			lookEnd + 10 > beast.getAngle()) {
			beast.newPosition();
		}
	},
	draw: function() {
		
		var startX = player.x;
		var startY = player.y;
		
		var rotateTo = MathHelper.getAngleTo(WIDTH/2, HEIGHT/2, MOUSEX, MOUSEY) - this.arc_angle/2;
		
		ctx.save();	
		ctx.translate(startX, startY);
		
		ctx.rotate(rotateTo * Math.PI/180);
		
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0 + this.arc_length, 0);
		ctx.arc(0, 0, this.arc_length, 0, Math.PI/180 * this.arc_angle, false);
		ctx.closePath();
		
		if (DEBUG) {
			ctx.fillStyle = "#00FF00";
		} else {
			var fading_gradient = ctx.createRadialGradient(0,0,this.arc_length,0,0,0);
			fading_gradient.addColorStop(0, 'rgba(255,255,255,0)');
			fading_gradient.addColorStop(0.5, 'rgba(255,255,255,.9)');
			fading_gradient.addColorStop(1, 'rgba(255,255,255,1)');
			ctx.fillStyle = fading_gradient;
		}
		ctx.fill();
		
		ctx.rotate(-rotateTo * Math.PI/180);

		ctx.translate(-startX, -startY);
		ctx.restore();
	}
};

var BEAST_OFFSET = 200;

var beast = {
	init : function() {
		if (typeof(this.source) != "undefined") {
			this.source.pause();
		} else {
			this.source = new Audio("breath.ogg");
			this.source.loop = true;
		}
		this.source.volume = 0;
		this.source.play();
		this.angle = Math.ceil(Math.random() * 360);
		this.x = Math.floor(Math.cos(this.angle * ( Math.PI / 180.0 ) ) * ( 50 ));
		this.y = Math.floor(Math.sin(this.angle * ( Math.PI / 180.0 ) ) * ( 50 ));
		this.escapeAngle = MathHelper.getAngleTo(0, 0, this.x, this.y) + MathHelper.randomSign() * 30;
		this.backOffTimer = 1200;
		this.offset = 0;
		this.speed = 6;
		this.size = 18;
		this.backingOff = false;
	},
	draw : function() {
		if (this.backOffTimer > 0 && this.offset == 0) return;
		ctx.beginPath();
		ctx.arc( player.x + Math.floor(this.x), player.y + Math.floor(this.y), this.size, 0, 2 * Math.PI, false);
		ctx.fillStyle = "#000000";
		ctx.fill();
	},
	update : function() {
		if (!this.backingOff && this.backOffTimer > 0) {
			this.backOffTimer--;
			return;
		}
		if (this.backingOff) {
			this.offset += this.speed;
			this.x = this.x + Math.floor(Math.cos( this.escapeAngle * ( Math.PI / 180.0 ) ) * ( this.speed ));
			this.y = this.y + Math.floor(Math.sin( this.escapeAngle * ( Math.PI / 180.0 ) ) * ( this.speed ));
			if (this.source.volume > 0) this.source.volume = (this.source.volume - 0.01).toFixed(2);
		}
		if (this.offset > BEAST_OFFSET) {
			this.backingOff = false;
			this.offset = 0;
			this.source.volume = 0;
			this.angle = Math.ceil(Math.random() * 360);
			this.x = Math.floor(Math.cos(this.angle * ( Math.PI / 180.0 ) ) * ( 50 ));
			this.y = Math.floor(Math.sin(this.angle * ( Math.PI / 180.0 ) ) * ( 50 ));
			this.escapeAngle = MathHelper.getAngleTo(0, 0, this.x, this.y) + MathHelper.randomSign() * 30;
		}
		if (!this.backingOff && this.source.volume < 1) {
			//Damn rounding errors
			this.source.volume = (this.source.volume + 0.1).toFixed(1);
		}
	},
	getAngle : function() {
		return this.angle;
	},
	newPosition : function() {
		if (this.backOffTimer > 0) {
			return;
		}
		this.backingOff = true;
		
		this.backOffTimer = Math.random() * 500 + 600;
	}

};


function draw_wall_shadow(x_coord, y_coord, from_x, from_y, shadow_depth) {
	//Get points
	var points = [ [from_x * SQUARE_WIDTH, from_y * SQUARE_WIDTH ],
			[from_x * SQUARE_WIDTH + SQUARE_WIDTH, from_y * SQUARE_WIDTH ],
			[from_x * SQUARE_WIDTH + SQUARE_WIDTH, from_y * SQUARE_WIDTH + SQUARE_WIDTH ],
			[from_x * SQUARE_WIDTH, from_y * SQUARE_WIDTH + SQUARE_WIDTH ] ];
	
	var actual_points = new Array();
	
	var dot_products = new Array();
	
	for (var i = 0; i < points.length; i++) {
		var j = (i < points.length - 1) ? i + 1 : 0;
			
		var light_vector_x = points[i][0] - x_coord;
		var light_vector_y = points[i][1] - y_coord;
			
		var nx = -(points[j][1] - points[i][1]);
		var ny = points[j][0] - points[i][0];
		
		var outcome = MathHelper.dotproduct([light_vector_x, light_vector_y], [nx, ny]);
		dot_products.push(outcome);
			
	}
	
	for(var i = 0; i < dot_products.length; i++) {
		var j = (i < dot_products.length - 1) ? i + 1 : 0;

		if (MathHelper.sign(dot_products[i]) == 1 && MathHelper.sign(dot_products[j]) == 1) {
			actual_points.push(points[j]);
		} else if (MathHelper.sign(dot_products[i]) == 1 && MathHelper.sign(dot_products[j]) != 1) {
			actual_points.push(points[j]);
			
			 var new_point_x = points[j][0] + (points[j][0] - x_coord) * shadow_depth;
			 var new_point_y = points[j][1] + (points[j][1] - y_coord) * shadow_depth;	
			 actual_points.push([new_point_x, new_point_y]);
			
		} else if (MathHelper.sign(dot_products[i]) != 1 && MathHelper.sign(dot_products[j]) == 1) {

			 var new_point_x = points[j][0] + (points[j][0] - x_coord) * shadow_depth;
			 var new_point_y = points[j][1] + (points[j][1] - y_coord) * shadow_depth;	
			 actual_points.push([new_point_x, new_point_y]);
			
			actual_points.push(points[j]);
		} 
	}
	
	if (actual_points.length != 0) {
		ctx.beginPath();
		ctx.moveTo(actual_points[0][0], actual_points[0][1]);
		for(var i = 1; i < actual_points.length; i++) {
			ctx.lineTo(actual_points[i][0], actual_points[i][1]);
				
		}
		ctx.closePath( );
		if (DEBUG) {
			ctx.fillStyle = "#FF00FF";
			ctx.strokeStyle = "#000000";
		} else {
			ctx.fillStyle = "#000000";
			ctx.strokeStyle = "#000000";
		}
		ctx.lineWidth = 2;
		ctx.fill();
		ctx.stroke();
	}
}

function draw_shadows() {
	var square = translateToSquare(player.x, player.y);
	var distanceFrom = (Math.ceil(playerSight.arc_length / SQUARE_WIDTH) + 1);
	var draw_shadow_depth = distanceFrom * SQUARE_WIDTH;
	
	var start_X = (square.x - distanceFrom < 0) ? 0 : square.x - distanceFrom;
	var start_Y = (square.y - distanceFrom < 0) ? 0 : square.y - distanceFrom;
	
	var stop_X = (square.x + distanceFrom > HOUSE_ROWS) ? HOUSE_ROWS : square.x + distanceFrom;
	var stop_Y = (square.y + distanceFrom > HOUSE_COLS) ? HOUSE_COLS : square.y + distanceFrom;
	
	for(var i = start_X; i < stop_X; i++) {
		for(var j = start_Y; j < stop_Y; j++) {
			if (i == DOOR_X && j == DOOR_Y) continue;
		
			if ((HOUSE_LAYOUT[i][j] == 0 && hasFreeAdjacent(i,j)) ||
				HOUSE_LAYOUT[i][j] == -1 ) {
				
				draw_wall_shadow(player.x, player.y, i, j, draw_shadow_depth);
			}
		}
	}
}

/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author paulirish / http://paulirish.com/
 */
if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = ( function() {
		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( callback, element ) {
			window.setTimeout( callback, 1000 / 60 );
		};
	} )();
}

var ctx;
var canvas = document.getElementById("game");
var key_count = document.getElementById('key-count');
var updateLoop;

var fade_count;

var HEIGHT;
var WIDTH;

var DEBUG;
var GAME_OBJECTS;

var currentGameState;

//Also key count
var NUMBER_OF_KEYS_LEFT;
var NUMBER_OF_ROOMS;

var rightDown = false;
var leftDown = false;
var upDown = false;
var downDown = false;
var enterDown = false;

var MOUSEX;
var MOUSEY;

var GAME_STATES = {
	WIN : 0,
	PLAY : 1,
}

document.onkeydown = function onKeyDown(evt) {
  if (evt.keyCode == 13) enterDown = true;
  if (evt.keyCode == 68) rightDown = true;
  if (evt.keyCode == 65) leftDown = true;
  if (evt.keyCode == 87) upDown = true;
  if (evt.keyCode == 83) downDown = true;
}

document.onkeyup = function onKeyUp(evt) {
  if (evt.keyCode == 13) enterDown = false;
  if (evt.keyCode == 68) rightDown = false;
  if (evt.keyCode == 65) leftDown = false;
  if (evt.keyCode == 87) upDown = false;
  if (evt.keyCode == 83) downDown = false;
}

document.onmousemove = function mouseMove(event) {
	var x = new Number();
    var y = new Number();

    if (event.x != undefined && event.y != undefined) {
		x = event.x;
        y = event.y;
	} else {
		x = event.clientX + document.body.scrollLeft +
			document.documentElement.scrollLeft;
		y = event.clientY + document.body.scrollTop +
			document.documentElement.scrollTop;
	}
	
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
		
	MOUSEX = x;
	MOUSEY = y;	
}

function clear() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function animateGame() {
	ctx.save();	

    ctx.translate(-player.x + WIDTH/2, -player.y + HEIGHT/2);
		
	if (DEBUG) draw_map();	
	
	player.draw();
	beast.draw();

	for(var i = 0; i < GAME_OBJECTS.length; i++) {
		GAME_OBJECTS[i].draw();
	}
	
	
	draw_shadows();
	
	draw_door();
		
	ctx.translate(player.x - WIDTH/2, player.y - HEIGHT/2);
	ctx.restore();
}

function animateWin() {
	document.body.style.background = "#FFFFFF";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	if (fade_count < 1)	fade_count += 0.005;
	ctx.fillStyle = "rgba(0,0,0," + fade_count + ")";
	ctx.font = "bold 64px Arial";
	ctx.fillText("You Escaped!", WIDTH/2 - 200, HEIGHT/2);
	ctx.font = "bold 24px Arial";
	ctx.fillText("Press the 'Enter' key to replay...", WIDTH/2 - 165, HEIGHT/2 + 40);
	
}

function render() {
	requestAnimationFrame(render);
	clear();
	if (currentGameState == GAME_STATES.PLAY) {
		animateGame();
	} else if (currentGameState == GAME_STATES.WIN) {
		animateWin();
	}
}

function loop() {
	if (currentGameState != GAME_STATES.WIN) {
		player.update();
		beast.update();
	
		for(var i = 0; i < GAME_OBJECTS.length; i++) {
			GAME_OBJECTS[i].update();
		}
	} else {
		if (!beast.source.paused) {
			beast.source.pause();
		}
	}
	if (NUMBER_OF_KEYS_LEFT == 0 && currentGameState != GAME_STATES.WIN) {
		HOUSE_LAYOUT[DOOR_X][DOOR_Y] = 1;
		revealText("goal")
		testWin();
	}
	if (currentGameState == GAME_STATES.WIN && enterDown) {
		initGame();
	}
}

function testWin() {
	var square = translateToSquare(player.x, player.y);
	if (square.x == DOOR_X && square.y == DOOR_Y) {
		currentGameState = GAME_STATES.WIN;
	}
}

function showHelp() {
	document.getElementById('help-link').style.display = "none";
	document.getElementById('help').style.display = "block";
	return false;
}

function revealText(id) {
	var infoPs = document.getElementById('info').getElementsByTagName("p");
	for (var i = 0; i < infoPs.length; i++) {
        infoPs[i].style.display = "none";
    }
	document.getElementById(id).style.display = "block";
}

function initGame() {
	document.body.style.background = "#000000";
	revealText("loading")
	ctx = canvas.getContext("2d");
	fade_count = 0.0;
	
	if (updateLoop != null) clearInterval(updateLoop);
	
	DEBUG = false;
	GAME_OBJECTS = new Array();
	NUMBER_OF_ROOMS = NUMBER_OF_KEYS_LEFT = 6;
	currentGameState = GAME_STATES.PLAY;
	
	ctx.globalAlpha = 1.0;
	
	WIDTH = canvas.width;
	HEIGHT = canvas.height;
	
	key_count.textContent = NUMBER_OF_ROOMS;
	
	beast.init();
	
	init_house();
	
	player.init();
	revealText("objective")
	updateLoop = setInterval(loop, 17);
	window.requestAnimationFrame(render);
		
}

initGame();