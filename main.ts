enum myLedSpriteProperty {
    //% block=x
    X,
    //% block=y
    Y,
    //% block=direction
    Direction,
    //% block=brightness
    Brightness,
    //% block=blink
    Blink,
    //%block=red
    Red,
    //%block=green
    Green,
    //%block=blue
    Blue
}


/**
 * A Game package Change the output from LED to a neopixel Matrix.
 * WARNING: Turn on all 256 neopixels to WHITE color will raise the current up to 15A! 
 * #The BBC suggest in the safety guide, that the maximum current you can draw from 
 *   the whole edge connector at any one time is 90mA.
 * #One WHITE neopixel consumes 60mA.
 * #But When mixing colors and displaying animations,
 *   the current draw will be much less. 
 * 
 * 改用neopixel矩陣來當作GAME的輸出螢幕
 * #風險自負警告! 請注意不要同時開啟過多的燈，否則將導致microbit或是連接的硬體有燒毀的可能。
 * #256顆neopixel 全亮白色 電流= 15A.
 * #1顆 全亮白色 電流= 60mA. 顯示動畫及其他顏色時,消耗電流遠低於 60mA.
 * #microbit 安全手冊可容許電流上限 = 90mA.
 * 
 * --- How to connect ---
 * LED matrix       microbit
 * GND          -   GND
 * 5V           -   3.3V output
 * DIN          -   P2
 * 
 */
//% weight=100 color=#0fbc11 icon=""
namespace neoGame {

    let _score: number = 0;
    let _life: number = 3;
    let _startTime: number = 0;
    let _endTime: number = 0;
    let _isGameOver: boolean = false;
    let _countdownPause: number = 0;
    let _level: number = 1;
    let _gameId: number = 0;
    let _paused: boolean = false;
    let _backgroundAnimation = false;
    let _sprites: myLedSprite[] = [];
    let neoBoard = neopixel.create(DigitalPin.P2, 256, NeoPixelMode.RGB)
    neoBoard.clear()

    /**
     * make neoBoard show()
     * 
     */
    //% block
    export function neoBoardShow() {
        if (neoBoard) neoBoard.show();
    }

    /**
     * make neoBoard show()
     * 
     */
    //% blockId=neoGame_neoBoard_setXYColor block="set board x:%x| y:%y|Color red:%red| green:%green| blue:%blue"
    export function neoBoardSetXYColor(x: number, y: number, red: number, green: number, blue: number) {
        neoBoard.setPixelColor(xy2Offset(x, y), neopixel.rgb(red, green, blue))
    }

    /**
     * Gets the current score
     */
    //% weight=9 help=game/score
    //% blockId=neoGame_score block="score" blockGap=8
    export function score(): number {
        return _score;
    }


    /**
    * Adds points to the current score and shows an animation
    * @param points amount of points to change, eg: 1
    */
    //% weight=10 help=game/add-score
    //% blockId=neoGame_add_score block="change score by|%points" blockGap=8
    //% parts="ledmatrix"
    export function addScore(points: number): void {
        setScore(_score + points);
        if (!_paused && !_backgroundAnimation) {

            /*_backgroundAnimation = true;
             
             control.inBackground(() => {
                 led.stopAnimation();
                 basic.showAnimation(`0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 1 1 1 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 0 0 0 1 0 0 0 0 0
     0 0 0 0 0 0 0 1 0 0 0 1 1 1 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 0 0 0 1 0 0 0 0 0 0 0 0 0 0
     0 0 1 0 0 0 1 1 1 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
     0 0 0 0 0 0 0 1 0 0 0 1 1 1 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 0 0 0 1 0 0 0 0 0 0 0 0 0 0
     0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 1 1 1 0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 0 0 0 1 0 0 0 0 0`, 20);
                 _backgroundAnimation = false;
             });*/

        }
    }

    /**
     * Shows an animation, then starts a game countdown timer, which causes Game Over when it reaches 0
    * @param ms countdown duration in milliseconds, eg: 10000
    */
    //% weight=9 help=game/start-countdown
    //% blockId=neoGame_start_countdown block="start countdown|(ms) %duration" blockGap=8
    //% parts="ledmatrix"
    export function startCountdown(ms: number): void {
        if (checkStart()) {
            /*basic.showAnimation(`1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0
    0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0
    1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0
    0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0
    1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0`, 400);*/
            _countdownPause = Math.max(500, ms);
            _startTime = -1;
            _endTime = input.runningTime() + _countdownPause;
            _paused = false;
            control.inBackground(() => {
                basic.pause(_countdownPause);
                gameOver();
            });
        }
    }

    /**
     * Displays a game over animation and the score.
     */
    //% weight=8 help=game/game-over
    //% blockId=neoGame_game_over block="game over"
    //% parts="ledmatrix"
    export function gameOver(): void {
        if (!_isGameOver) {
            _isGameOver = true;
            unplugEvents();
            //led.stopAnimation();
            //led.setBrightness(255);
            while (true) {
                /*
                for (let i = 0; i < 8; i++) {
                    basic.clearScreen();
                    basic.pause(100);
                    basic.showLeds(`1 1 1 1 1
                    1 1 1 1 1
                    1 1 1 1 1
                    1 1 1 1 1
                    1 1 1 1 1`, 300);
                }
                basic.showAnimation(`1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 0 0 1 1 0 0 0 1 0 0 0 0 0 0 0 0 0
                    1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 0 0 1 1 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
                    1 1 0 1 1 1 0 0 0 1 1 0 0 0 1 1 0 0 0 1 1 0 0 0 1 1 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
                    1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 1 0 0 1 1 1 0 0 0 1 1 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
                    1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 1 1 1 1 0 0 1 1 1 0 0 0 1 1 0 0 0 0 1 0 0 0 0 0`, 100);
                */
                for (let j = 0; j < 3; j++) {
                    basic.showString(" GAMEOVER ", 100);
                    showScore();
                }
            }
        } else {
            // already in game over mode in another fiber
            while (true) {
                basic.pause(10000);
            }
        }
    }


    /**
      * Sets the current score value
      * @param value new score value.
      */
    //% blockId=neoGame_set_score block="set score %points" blockGap=8
    //% weight=10 help=game/set-score
    export function setScore(value: number): void {
        _score = Math.max(0, value);
    }

    /**
    * Gets the current life
    */
    //% weight=10
    export function life(): number {
        return _life;
    }

    /**
     * Sets the current life value
     * @param value TODO
     */
    //% weight=10
    export function setLife(value: number): void {
        _life = Math.max(0, value);
        if (_life <= 0) {
            gameOver();
        }
    }

    /**
     * Adds life points to the current life
     * @param lives TODO
     */
    //% weight=10
    export function addLife(lives: number): void {
        setLife(_life + lives);
    }

    /**
     * Gets the remaining time (since `start countdown`) or current time (since the device started or `start stopwatch`) in milliseconds.
     */
    //% weight=10
    export function currentTime(): number {
        if (_endTime > 0) {
            return Math.max(0, _endTime - input.runningTime());
        } else {
            return input.runningTime() - _startTime;
        }
    }


    /**
     * Removes some life
     * @param life TODO
     */
    //% weight=10
    //% parts="ledmatrix"
    export function removeLife(life: number): void {
        setLife(_life - life);
        /*if (!_paused)
            control.inBackground(() => {
                led.stopAnimation();
                basic.showAnimation(`1 0 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 0 0 0
                    0 1 0 1 0 0 0 0 0 0 0 1 0 1 0 0 0 0 0 0
                    0 0 1 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0
                    0 1 0 1 0 0 0 0 0 0 0 1 0 1 0 0 0 0 0 0
                    1 0 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 0 0 0`, 40);
            });*/
    }


    /**
     * Increments the level and display a message.
     */
    //% weight=10
    //% parts="ledmatrix"
    export function levelUp(): void {
        _level = _level + 1;
        basic.showString("LEVEL:", 150);
        basic.showNumber(_level, 150);
    }


    /**
     * Gets the current level
     */
    //% weight=10
    export function level(): number {
        return _level;
    }

    /**
    * Starts a stopwatch timer. `current time` will return the elapsed time.
    */
    //% weight=10
    export function startStopwatch(): void {
        _startTime = input.runningTime();
        _endTime = -1;
    }

    /**
     * Gets a value indicating if the game is still running. Returns `false` if game over.
     */
    //% weight=10
    export function isRunning(): boolean {
        let running: boolean;
        return !_isGameOver;
    }


    /**
     * Displays the score on the screen.
     */
    //%  weight=60
    //% parts="ledmatrix"
    export function showScore(): void {
        basic.showString(" SCORE ", 100);
        basic.showNumber(_score, 150);
        basic.showString(" ", 150);
    }

    /**
     * Indicates if the game is display the game over sequence.
     */
    export function isGameOver(): boolean {
        return _isGameOver;
    }

    /**
     * Indicates if the game rendering is paused to allow other animations
     */
    //%
    export function isPaused(): boolean {
        return _paused;
    }
    /**
     * Pauses the game rendering engine to allow other animations
     */
    //% blockId=neoGame_pause block="pause"
    //% advanced=true blockGap=8 help=game/pause
    export function pause(): void {
        plot()
        _paused = true;
    }


    /**
     * Resumes the game rendering engine
     */
    //% blockId=neoGame_resume block="resume"
    //% advanced=true blockGap=8 help=game/resumeP
    export function resume(): void {
        _paused = false;
        plot();
    }

    /**
     * returns false if game can't start
     */
    function checkStart(): boolean {
        if (_countdownPause > 0 || _startTime > 0) {
            return false;
        } else {
            return true;
        }
    }

    function unplugEvents(): void {
        input.onButtonPressed(Button.A, () => { });
        input.onButtonPressed(Button.B, () => { });
        input.onButtonPressed(Button.AB, () => {
            control.reset();
        });
    }


    /**
     * Creates a new LED sprite pointing to the right.
     * @param x sprite horizontal coordinate, eg: 2
     * @param y sprite vertical coordinate, eg: 2
     */
    //% weight=60 blockGap=8 help=game/create-sprite
    //% blockId=neoGame_create_sprite block="create sprite at|x: %x|y: %y"
    //% parts="ledmatrix"
    export function createSprite(x: number, y: number): myLedSprite {
        init();
        let p = new myLedSprite(x, y);
        return p;
    }

    /**
     * Gets an invalid sprite; used to initialize locals.
     */
    //% weight=0
    export function invalidSprite(): myLedSprite {
        return null;
    }


    /**
    * Plots the current sprites on the screen
    */
    //% parts="neopixel"
    function plot(): void {
        /*if (game.isGameOver() || game.isPaused() || _backgroundAnimation) {
            return;
        }*/
        const now = input.runningTime();
        neoBoard.clear()

        for (let i = 0; i < _sprites.length; i++) {
            //_sprites[i]._plot(now);
            _sprites[i]._plot2();
        }
        neoBoard.show()
        //basic.pause(50)

        /*
        if (game.isGameOver() || game.isPaused() || !_img || _backgroundAnimation) {
            return;
        }
        // ensure greyscale mode
        const dm = led.displayMode();
        if (dm != DisplayMode.Greyscale)
            led.setDisplayMode(DisplayMode.Greyscale);
        // render sprites
        const now = input.runningTime();
        _img.clear();
        for (let i = 0; i < _sprites.length; i++) {
            _sprites[i]._plot(now);
        }
        _img.plotImage(0);
        // restore previous display mode
        if (dm != DisplayMode.Greyscale)
            led.setDisplayMode(dm);
        */
    }

    /**
     * 遊戲角色-一個neoLED點 
     * 勿關閉LED螢幕, DON'T call LED.enable(false)
     */
    //%
    export class myLedSprite {
        private _x: number;
        private _y: number;
        private _dir: number;
        private _brightness: number;
        private _blink: number;
        private _enabled: boolean;
        private _red: number;
        private _green: number;
        private _blue: number;

        constructor(x: number, y: number) {
            this._x = Math.clamp(0, 15, x);
            this._y = Math.clamp(0, 15, y);
            this._dir = 90;
            this._brightness = 255;
            this._enabled = true;

            //* 設定角色的顏色 */
            this._red = 255;
            this._green = 255;
            this._blue = 255;

            init();
            _sprites.push(this);

            //TODO DEBUG
            //basic.showNumber(_sprites.length)
            //basic.pause(5000)

            plot();
        }

        /**
         * Move a certain number of LEDs in the current direction
         * @param this the sprite to move
         * @param leds number of leds to move, eg: 1, -1
         */
        //% weight=50 help=game/move
        //% blockId=neoGame_move_sprite block="%sprite|move by %leds" blockGap=8
        //% parts="ledmatrix"
        public move(leds: number): void {
            if (this._dir == 0) {
                this._y = this._y - leds;
            } else if (this._dir == 45) {
                this._x = this._x + leds;
                this._y = this._y - leds;
            } else if (this._dir == 90) {
                this._x = this._x + leds;
            } else if (this._dir == 135) {
                this._x = this._x + leds;
                this._y = this._y + leds;
            } else if (this._dir == 180) {
                this._y = this._y + leds;
            } else if (this._dir == -45) {
                this._x = this._x - leds;
                this._y = this._y - leds;
            } else if (this._dir == -90) {
                this._x = this._x - leds;
            } else {
                this._x = this._x - leds;
                this._y = this._y + leds;
            }
            this._x = Math.clamp(0, 15, this._x);
            this._y = Math.clamp(0, 15, this._y);
            plot();
        }

        /**
         * Go to this position on the screen
         * @param this TODO
         * @param x TODO
         * @param y TODO
         */
        //% blockId=neoGame_sprite_goTo block="%sprite|move to x:%x |y:%y" blockGap=8
        //% parts="ledmatrix"
        public goTo(x: number, y: number): void {
            this._x = x;
            this._y = y;
            this._x = Math.clamp(0, 15, this._x);
            this._y = Math.clamp(0, 15, this._y);
            plot();
        }

        /**
         * If touching the edge of the stage and facing towards it, then turn away.
         * @param this TODO
         */
        //% weight=18 help=game/if-on-edge-bounce
        //% blockId=neoGame_sprite_bounce block="%sprite|if on edge, bounce"
        //% parts="ledmatrix"
        public ifOnEdgeBounce(): void {
            if (this._dir == 0 && this._y == 0) {
                this._dir = 180;
            } else if (this._dir == 45 && (this._x == 15 || this._y == 0)) {
                if (this._x == 0 && this._y == 0) {
                    this._dir = -135;
                } else if (this._y == 0) {
                    this._dir = 135;
                } else {
                    this._dir = -45;
                }
            } else if (this._dir == 90 && this._x == 15) {
                this._dir = -90;
            } else if (this._dir == 135 && (this._x == 15 || this._y == 15)) {
                if (this.x() == 15 && this.y() == 15) {
                    this._dir = -45;
                } else if (this._y == 15) {
                    this._dir = 45;
                } else {
                    this._dir = -135;
                }
            } else if (this._dir == 180 && this._y == 15) {
                this._dir = 0;
            } else if (this._dir == -45 && (this._x == 0 || this._y == 0)) {
                if (this.x() == 0 && this.y() == 0) {
                    this._dir = 135;
                } else if (this._y == 0) {
                    this._dir = -135;
                } else {
                    this._dir = 45;
                }
            } else if (this._dir == -90 && this._x == 0) {
                this._dir = 90;
            } else if (this._dir == -135 && (this._x == 0 || this._y == 15)) {
                if (this._x == 0 && this._y == 15) {
                    this._dir = 45;
                } else if (this._y == 15) {
                    this._dir = -45;
                } else {
                    this._dir = 135;
                }
            }
            plot();
        }

        /**
         * Turn the sprite
         * @param this TODO
         * @param direction left or right
         * @param degrees angle in degrees to turn, eg: 45, 90, 180, 135
         */
        //% weight=49 help=game/turn
        //% blockId=neoGame_turn_sprite block="%sprite|turn %direction|by (°) %degrees"
        public turn(direction: Direction, degrees: number) {
            if (direction == Direction.Right)
                this.setDirection(this._dir + degrees);
            else
                this.setDirection(this._dir - degrees);
        }

        /**
         * Turn to the right (clockwise)
         * @param this TODO
         * @param degrees TODO
         */
        public turnRight(degrees: number): void {
            this.turn(Direction.Right, degrees);
        }

        /**
         * Turn to the left (counter-clockwise)
         * @param this TODO
         * @param degrees TODO
         */
        public turnLeft(degrees: number): void {
            this.turn(Direction.Left, degrees);
        }

        /**
         * Sets a property of the sprite
         * @param property the name of the property to change
         * @param the updated value
         */
        //% weight=29 help=game/set
        //% blockId=neoGame_sprite_set_property block="%sprite|set %property|to %value" blockGap=8
        public set(property: myLedSpriteProperty, value: number) {
            switch (property) {
                case myLedSpriteProperty.X: this.setX(value); break;
                case myLedSpriteProperty.Y: this.setY(value); break;
                case myLedSpriteProperty.Direction: this.setDirection(value); break;
                case myLedSpriteProperty.Brightness: this.setBrightness(value); break;
                case myLedSpriteProperty.Blink: this.setBlink(value); break;
                case myLedSpriteProperty.Red: this.setRed(value); break;
                case myLedSpriteProperty.Green: this.setGreen(value); break;
                case myLedSpriteProperty.Blue: this.setBlue(value); break;
            }
        }

        /**
         * Changes a property of the sprite
         * @param property the name of the property to change
         * @param value amount of change, eg: 1
         */
        //% weight=30 help=game/change
        //% blockId=neoGame_sprite_change_xy block="%sprite|change %property|by %value" blockGap=8
        public change(property: myLedSpriteProperty, value: number) {
            switch (property) {
                case myLedSpriteProperty.X: this.changeXBy(value); break;
                case myLedSpriteProperty.Y: this.changeYBy(value); break;
                case myLedSpriteProperty.Direction: this.changeDirectionBy(value); break;
                case myLedSpriteProperty.Brightness: this.changeBrightnessBy(value); break;
                case myLedSpriteProperty.Blink: this.changeBlinkBy(value); break;
                case myLedSpriteProperty.Red: this.changeRedBy(value); break;
                case myLedSpriteProperty.Green: this.changeGreenBy(value); break;
                case myLedSpriteProperty.Blue: this.changeBlueBy(value); break;
            }
        }

        /**
         * Gets a property of the sprite
         * @param property the name of the property to change
         */
        //% weight=28 help=game/get
        //% blockId=neoGame_sprite_property block="%sprite|%property"
        public get(property: myLedSpriteProperty) {
            switch (property) {
                case myLedSpriteProperty.X: return this.x();
                case myLedSpriteProperty.Y: return this.y();
                case myLedSpriteProperty.Direction: return this.direction()
                case myLedSpriteProperty.Brightness: return this.brightness();
                case myLedSpriteProperty.Blink: return this.blink();
                case myLedSpriteProperty.Red: return this.getRed();
                case myLedSpriteProperty.Green: return this.getGreen();
                case myLedSpriteProperty.Blue: return this.getBlue();
                default: return 0;
            }
        }

        /**
         * Set the direction of the current sprite, rounded to the nearest multiple of 45
         * @param this TODO
         * @param degrees TODO
         */
        //% parts="ledmatrix"
        public setDirection(degrees: number): void {
            this._dir = ((degrees / 45) % 8) * 45;
            if (this._dir <= -180) {
                this._dir = this._dir + 360;
            } else if (this._dir > 180) {
                this._dir = this._dir - 360;
            }
            plot();
        }

        /**
         * Reports the ``x`` position of a sprite on the LED screen
         * @param this TODO
         */
        public x(): number {
            return this._x;
        }

        /**
         * Reports the ``y`` position of a sprite on the LED screen
         * @param this TODO
         */
        public y(): number {
            return this._y;
        }

        /**
         * Reports the current direction of a sprite
         * @param this TODO
         */
        public direction(): number {
            return this._dir;
        }

        /**
         * Set the ``x`` position of a sprite
         * @param this TODO
         * @param x TODO
         */
        public setX(x: number): void {
            this.goTo(x, this._y);
        }

        /**
         * Set the ``y`` position of a sprite
         * @param this TODO
         * @param y TODO
         */
        public setY(y: number): void {
            this.goTo(this._x, y);
        }

        /**
         * Changes the ``y`` position by the given amount
         * @param this TODO
         * @param y TODO
         */
        public changeYBy(y: number): void {
            this.goTo(this._x, this._y + y);
        }

        /**
         * Changes the ``x`` position by the given amount
         * @param this TODO
         * @param x TODO
         */
        public changeXBy(x: number): void {
            this.goTo(this._x + x, this._y);
        }

        /**
         * Reports true if sprite has the same position as specified sprite
         * @param this TODO
         * @param other TODO
         */
        //% weight=20 help=game/is-touching
        //% blockId=neoGame_sprite_touching_sprite block="%sprite|touching %other|?" blockGap=8
        public isTouching(other: myLedSprite): boolean {
            return this._enabled && other._enabled && this._x == other._x && this._y == other._y;
        }

        /**
         * Reports true if sprite is touching an edge
         * @param this TODO
         */
        //% weight=19 help=game/is-touching-edge
        //% blockId=neoGame_sprite_touching_edge block="%sprite|touching edge?" blockGap=8
        public isTouchingEdge(): boolean {
            return this._x == 0 || this._x == 15 || this._y == 0 || this._y == 15;
        }

        /**
         * Turns on the sprite (on by default)
         * @param this the sprite
         */
        public on(): void {
            this.setBrightness(255);
        }

        /**
         * Turns off the sprite (on by default)
         * @param this the sprite
         */
        public off(): void {
            this.setBrightness(0);
        }

        /**
         * Set the ``brightness`` of a sprite
         * @param this the sprite
         * @param brightness the brightness from 0 (off) to 255 (on), eg: 255.
         */
        //% parts="ledmatrix"
        public setBrightness(brightness: number): void {
            this._brightness = Math.clamp(0, 255, brightness);
            plot();
        }

        /**
         * Reports the ``brightness` of a sprite on the LED screen
         * @param this the sprite
         */
        //% parts="ledmatrix"
        public brightness(): number {
            let r: number;
            return this._brightness;
        }

        /**
         * Changes the ``y`` position by the given amount
         * @param this the sprite
         * @param value the value to change brightness
         */
        public changeBrightnessBy(value: number): void {
            this.setBrightness(this._brightness + value);
        }

        /**
         * Changes the ``direction`` position by the given amount by turning right
         * @param this TODO
         * @param angle TODO
         */
        public changeDirectionBy(angle: number): void {
            this.turnRight(angle);
        }

        /**
         * Deletes the sprite from the game engine. The sprite will no longer appear on the screen or interact with other sprites.
         * @param this sprite to delete
         */
        //% weight=59 help=game/delete
        //% blockId="game_delete_sprite" block="delete %this"
        public delete(): void {
            this._enabled = false;
            if (_sprites.removeElement(this))
                plot();
        }

        /**
         * Sets the blink duration interval in millisecond.
         * @param sprite TODO
         * @param ms TODO
         */
        public setBlink(ms: number): void {
            this._blink = Math.clamp(0, 10000, ms);
        }

        /**
         * 設定紅色值.
         */
        public setRed(color: number): void {
            this._red = Math.clamp(0, 255, color);
        }

        /**
         * 設定綠色值.
         */
        public setGreen(color: number): void {
            this._green = Math.clamp(0, 255, color);
        }
        /**
         * 設定藍色值.
         */
        public setBlue(color: number): void {
            this._blue = Math.clamp(0, 255, color);
        }
        /**
         * 設定RGB顏色
         * @param this
         * @param red
         * @param green
         * @param blue
         * //% blockId=neoGame_sprite_setRGB block="%sprite|set color to| Red:%red |Green:%green |Blue:%blue"
         */
        public setRGB(red: number, green: number, blue: number) {
            this._red = Math.clamp(0, 255, red);
            this._green = Math.clamp(0, 255, green);
            this._blue = Math.clamp(0, 255, blue);
        }

        /**
         * Changes the ``blink`` duration by the given amount of millisecons
         * @param this TODO
         * @param ms TODO
         */
        public changeBlinkBy(ms: number): void {
            this.setBlink(this._blink + ms);
        }

        /**
         * 改變顏色值
         * @param this TODO
         * @param ms TODO
         */
        public changeRedBy(value: number): void {
            this.setRed(this._red + value);
        }
        /**
         * 改變顏色值
         * @param this TODO
         * @param ms TODO
         */
        public changeGreenBy(value: number): void {
            this.setGreen(this._green + value);
        }
        /**
         * 改變顏色值
         * @param this TODO
         * @param ms TODO
         */
        public changeBlueBy(value: number): void {
            this.setBlue(this._blue + value);
        }

        /**
         * Reports the ``blink`` duration of a sprite
         * @param this TODO
         */
        public blink(): number {
            let r: number;
            return this._blink;
        }


        /**
         * 取得顏色值
         * @param this TODO
         * //% block
         */
        public getRed(): number {
            return this._red;
        }
        /**
         * 取得顏色值
         * @param this TODO
         * //% block
         */
        public getGreen(): number {
            return this._green;
        }
        /**
         * 取得顏色值
         * @param this TODO
         * //% block
         */
        public getBlue(): number {
            return this._blue;
        }
        /**
         * 閃爍
         * 
         */
        //% weight=-1
        //%parts="neopixel"
        public _plot(now: number) {
            let ps = this
            //如果亮度有，時間對準時，切換亮度形成閃爍
            if (ps._brightness > 0) {
                let r = 0;
                if (ps._blink > 0) {
                    r = (now / ps._blink) % 2;
                }
                if (r == 0) {

                    neoBoard.setPixelColor(xy2Offset(ps._x, ps._y), neopixel.rgb(ps._red, ps._green, ps._blue))
                    //_img.setPixelBrightness(ps._x, ps._y, _img.pixelBrightness(ps._x, ps._y) + ps._brightness);
                }
                else
                    neoBoard.setPixelColor(xy2Offset(ps._x, ps._y), neopixel.rgb(0, 0, 0))
            }
        }
        public _plot2() {
            let ps = this
            neoBoard.setPixelColor(xy2Offset(ps._x, ps._y), neopixel.rgb(ps._red, ps._green, ps._blue))
        }

    }

    function init(): void {
        basic.forever(() => {
            basic.pause(30);
            plot();
            if (game.isGameOver()) {
                basic.pause(600);
            }
        });

        /*
        if (_img) return;
        const img = images.createImage(`0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0`);
        _sprites = (<myLedSprite[]>[]);
        basic.forever(() => {
            basic.pause(30);
            plot();
            if (game.isGameOver()) {
                basic.pause(600);
            }
        });
        _img = img;
        */
    }


    function xy2Offset(x: number, y: number): number {
        return flipX(getSPos(x + y * 16, 16), 16, 16)
        //return x + y * 16
    }

    function flipX(pos: number, rows: number, cols: number): number {
        return (pos / cols) * cols + (cols - (pos % cols) - 1)
    }
    function getSPos(pos: number, cols: number): number {
        if ((pos / cols) % 2 == 0)
            return pos
        else
            return (cols * (pos / cols)) + (cols - 1 - (pos % cols))
    }
}

