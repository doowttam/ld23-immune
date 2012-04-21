(function() {
  var Bullet, Defender, Germ, Immune, Key,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Immune = (function() {

    function Immune(doc, win) {
      var _this = this;
      this.doc = doc;
      this.win = win;
      this.pause = __bind(this.pause, this);
      this.play = __bind(this.play, this);
      this.canvas = this.doc.getElementById("game_canvas");
      this.context = this.canvas.getContext("2d");
      this.buttons = {
        start: this.doc.getElementById("start"),
        pause: this.doc.getElementById("pause")
      };
      this.bullets = [];
      this.germs = [];
      this.status = {
        sickness: 0,
        score: 0
      };
      this.buttons.start.onclick = this.play;
      this.buttons.pause.onclick = this.pause;
      this.key = new Key;
      this.win.onkeyup = function(e) {
        return _this.key.onKeyUp(e);
      };
      this.win.onkeydown = function(e) {
        return _this.key.onKeyDown(e);
      };
      this.defender = new Defender(this.canvas.width / 2, this.canvas.height - 50);
    }

    Immune.prototype.resetCanvas = function() {
      return this.canvas.width = this.canvas.width;
    };

    Immune.prototype.drawFrame = function() {
      var damage;
      this.resetCanvas();
      this.drawBullets();
      damage = this.drawGerms(this.bullets);
      this.defender.move(this.canvas, this.key, this.bullets);
      this.defender.draw(this.context);
      this.spawnGerms();
      this.drawStatus();
      if (this.status.sickness > 99) {
        return this.gameOver();
      } else if (damage) {
        this.context.fillStyle = 'red';
        return this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };

    Immune.prototype.gameOver = function() {
      this.pause();
      this.context.fillStyle = 'rgba(0,0,0,.7)';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 48px sans-serif';
      this.context.textAlign = 'center';
      this.context.fillText("You got sick!", this.canvas.width / 2, 125);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 36px sans-serif';
      this.context.textAlign = 'center';
      return this.context.fillText("Score: " + this.status.score, this.canvas.width / 2, 200);
    };

    Immune.prototype.drawStatus = function() {
      this.context.fillStyle = 'rgba(0,0,0,.5)';
      this.context.fillRect(0, 25, 75, 24);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 12px sans-serif';
      this.context.textAlign = 'left';
      this.context.fillText("Score: " + this.status.score, 5, 42);
      this.context.fillStyle = 'rgba(0,0,0,.5)';
      this.context.fillRect(this.canvas.width, 25, -100, 24);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 12px sans-serif';
      this.context.textAlign = 'right';
      return this.context.fillText('Sickness: ' + this.status.sickness + '%', this.canvas.width - 5, 42);
    };

    Immune.prototype.spawnGerms = function() {
      var randX;
      if (Math.random() < 0.01) {
        randX = Math.ceil(Math.random() * this.canvas.width);
        return this.germs.push(new Germ(randX, 0));
      }
    };

    Immune.prototype.drawGerms = function(bullets) {
      var damage, germ, germIndex, toCleanUp, _i, _len, _ref;
      toCleanUp = [];
      damage = false;
      if (this.germs.length > 0) {
        for (germIndex = 0, _ref = this.germs.length - 1; 0 <= _ref ? germIndex <= _ref : germIndex >= _ref; 0 <= _ref ? germIndex++ : germIndex--) {
          germ = this.germs[germIndex];
          germ.move(this.context);
          germ.draw(this.context);
          if (germ.isHit(bullets)) {
            toCleanUp.push(germIndex);
            this.status.score++;
          } else if (germ.isOffscreen(this.canvas)) {
            this.status.sickness = this.status.sickness + 20;
            damage = true;
            toCleanUp.push(germIndex);
          }
        }
        for (_i = 0, _len = toCleanUp.length; _i < _len; _i++) {
          germIndex = toCleanUp[_i];
          this.germs.splice(germIndex, 1);
        }
      }
      return damage;
    };

    Immune.prototype.drawBullets = function() {
      var bullet, bulletIndex, toCleanUp, _i, _len, _ref, _results;
      toCleanUp = [];
      if (this.bullets.length > 0) {
        for (bulletIndex = 0, _ref = this.bullets.length - 1; 0 <= _ref ? bulletIndex <= _ref : bulletIndex >= _ref; 0 <= _ref ? bulletIndex++ : bulletIndex--) {
          bullet = this.bullets[bulletIndex];
          bullet.move(this.context);
          bullet.draw(this.context);
          if (bullet.isOffscreen()) toCleanUp.push(bulletIndex);
        }
        _results = [];
        for (_i = 0, _len = toCleanUp.length; _i < _len; _i++) {
          bulletIndex = toCleanUp[_i];
          _results.push(this.bullets.splice(bulletIndex, 1));
        }
        return _results;
      }
    };

    Immune.prototype.play = function() {
      var _this = this;
      if (this.frameInterval) return;
      return this.frameInterval = setInterval(function() {
        return _this.drawFrame();
      }, 20);
    };

    Immune.prototype.pause = function() {
      if (this.frameInterval) {
        clearInterval(this.frameInterval);
        return this.frameInterval = null;
      } else {
        return this.play();
      }
    };

    return Immune;

  })();

  Key = (function() {

    function Key() {
      this.onKeyUp = __bind(this.onKeyUp, this);
      this.onKeyDown = __bind(this.onKeyDown, this);
      this.isDown = __bind(this.isDown, this);
    }

    Key.prototype.pressed = {};

    Key.prototype.codes = {
      "LEFT": 37,
      "UP": 38,
      "RIGHT": 39,
      "DOWN": 40,
      "SPACE": 32
    };

    Key.prototype.isDown = function(keyCode) {
      return this.pressed[keyCode];
    };

    Key.prototype.onKeyDown = function(event) {
      return this.pressed[event.keyCode] = true;
    };

    Key.prototype.onKeyUp = function(event) {
      return delete this.pressed[event.keyCode];
    };

    return Key;

  })();

  Germ = (function() {

    function Germ(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 1;
      this.width = 10;
      this.height = 10;
    }

    Germ.prototype.draw = function(context) {
      context.fillStyle = 'green';
      return context.fillRect(this.x, this.y, this.width, this.height);
    };

    Germ.prototype.move = function() {
      return this.y = this.y + this.speed;
    };

    Germ.prototype.isOffscreen = function(canvas) {
      if (this.y > canvas.height) {
        return true;
      } else {
        return false;
      }
    };

    Germ.prototype.isHit = function(bullets) {
      var bullet, _i, _len;
      for (_i = 0, _len = bullets.length; _i < _len; _i++) {
        bullet = bullets[_i];
        if (this.x <= bullet.x + bullet.width && this.x + this.width >= bullet.x && this.y <= bullet.y + bullet.height && this.y + this.height >= bullet.y) {
          return true;
        }
      }
    };

    return Germ;

  })();

  Defender = (function() {

    function Defender(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 2;
      this.width = 24;
      this.height = 10;
    }

    Defender.prototype.draw = function(context) {
      context.fillStyle = 'black';
      context.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = 'red';
      return context.fillRect(this.x + this.width / 4, this.y - this.height / 2, this.width / 2, this.height / 2);
    };

    Defender.prototype.move = function(canvas, key, bullets) {
      if (key.isDown(key.codes.LEFT) && this.x - this.speed >= 0) {
        this.x = this.x - this.speed;
      }
      if (key.isDown(key.codes.RIGHT) && this.x + this.speed <= canvas.width - this.width) {
        this.x = this.x + this.speed;
      }
      if (key.isDown(key.codes.UP)) return this.fire(bullets);
    };

    Defender.prototype.fire = function(bullets) {
      return bullets.push(new Bullet(this.x + this.width / 2, this.y));
    };

    return Defender;

  })();

  Bullet = (function() {

    function Bullet(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 3;
      this.width = 4;
      this.height = 4;
    }

    Bullet.prototype.draw = function(context) {
      return context.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    };

    Bullet.prototype.move = function() {
      return this.y = this.y - this.speed;
    };

    Bullet.prototype.isOffscreen = function() {
      if (this.y < 0) {
        return true;
      } else {
        return false;
      }
    };

    return Bullet;

  })();

  window.onload = function() {
    var immune;
    immune = new Immune(window.document, window);
    immune.drawFrame();
    return immune.play();
  };

}).call(this);
