       
        var WIDTH=700, HEIGHT=600, pi=Math.PI;
        var UpArrow=38, DownArrow=40;
        var canvas, ctx, keystate;
        var player, ai, ball;
        var audio = new Audio("bonk.mp3");

        player = {
            x: null, 
            y: null,
            width: 20, 
            height: 100, 

            update: function() {
                //if uparrow is pressed move up 7 pixels
                if(keystate[UpArrow]) this.y -= 10;
                //if downarrow is pressed move up 7 pixels
                if(keystate[DownArrow]) this.y += 10;

                this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0);
            },
            draw: function() {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        };

        ai = {
            x: null, 
            y: null,
            width: 20, 
            height: 100, 

            //moves the ai player towards the ball 
            update: function() {

                var dest = ball.y - (this.height - ball.side)*0.5;
                this.y += (dest - this.y) * 0.175;
            },
            draw: function() {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        };

        ball = {
            x: null, 
            y: null,
            //velocity
            vel: null,
            //size of the side
            side: 20, 
            speed: 10,

            serve: function(side) {
                var rand = Math.random();
                this.x  = side === 1 ? player.x + player.width: ai.x - this.side;
                this.y = (HEIGHT - this.side) * rand;

                var angle  = 0.1 * pi * (1- 2*rand);
                this.vel = {
                    x: side * this.speed * Math.cos(angle),
                    y: this.speed * Math.sin(angle)
                }
            }, 


            update: function() {
                this.x += this.vel.x;
                this.y += this.vel.y;

                //if the ball hits the top then make it bounce
                if(0 > this.y || this.y + this.side > HEIGHT) {

                    //this makes the ball have an 
                    //elastic collision with the ball and keeps it from 
                    //going out of  bounds

                    //idk how this works
                    var offset = this.y < 0 ? 0 - this.y : HEIGHT - (this.y + this.side);
                    this.y += 2 * offset;

                    //makes the ball bounce 
                    this.vel.y *= -1;
                    audio.play();
                };


                var AABBIntersect = function(ax, ay, aw, ah, bx, by, bw, bh) {
                    return ax<bx+bw && ay<by+bh && bx<ax+aw && by<ay+ah;
                };

                var paddle = this.vel.x < 0 ? player: ai;
                if(AABBIntersect(paddle.x, paddle.y, paddle.width, paddle.height,
                        this.x, this.y, this.side, this.side)) 
                {            
                    var n = (this.y + this.side - paddle.y) / (paddle.height + this.side);
                    var angle = 0.25 * pi * (2*n - 1); //pi/4 = 45deg when hit at the top of the paddle

                    //if the paddle hits the ball with the top/bottom it goes super fast 
                    var smash = Math.abs(angle) > 0.1 * pi ? 1.5 : 1;
                    this.vel.x = smash * (paddle===player ? 1 : -1) * this.speed * Math.cos(angle);
                    this.vel.y = smash * this.speed * Math.sin(angle);
                    audio.play();
                }

                if( 0 > this.x + this.side || this.x > WIDTH) {
                    this.serve(paddle === player ? 1 : -1);
                }
            },
            draw: function() {
                ctx.fillRect(this.x, this.y, this.side, this.side);
            }
        };


        function main() {
            

            canvas = document.createElement("canvas");
            canvas.width = WIDTH;
            canvas.height = HEIGHT;
            ctx = canvas.getContext("2d");
            document.body.appendChild(canvas);

            keystate = {};
            document.addEventListener("keydown", function(evt) {
                keystate[evt.keyCode] = true;
            });
            document.addEventListener("keyup", function(evt) {
                delete keystate[evt.keyCode];
            });

            init();

            var loop = function() {
                update();
                draw();

                window.requestAnimationFrame(loop, canvas);
            };
            window.requestAnimationFrame(loop, canvas);


        }

        function init() {

            player.x = player.width;
            player.y = (HEIGHT - player.height) / 2;

            ai.x = WIDTH - (player.width + ai.width);
            ai.y = (HEIGHT - ai.height) / 2;

            ball.serve(1);
        }

        function update()  {
            ball.update();
            player.update();
            ai.update();
        }

        function draw() {
            //draws a black square as a background
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            //saves the current color state as black
            ctx.save();
            //changes the color to white to draw the ai/player/ball
            ctx.fillStyle = "#fff";


            //calls the draw function each of these objects have
            ball.draw();
            player.draw();
            ai.draw();

            //draws the dash line in the middle of the play area
            dashLine();
            
            //changes the color back to black
            ctx.restore();
        }


        //creates a dashed line down the middle of the screen
        function dashLine() {
            //how wide the dashes are 
            var w = 4;
            var x = (WIDTH - w) * 0.5;
            var y = 0;
            //controls how many dash lines there are
            var step = HEIGHT / 15;

            while (y < HEIGHT) {
                ctx.fillRect(x, y + step * 0.25 , w, step*0.5);
                y += step;
            }
        }

        main();