(function() {
  var AbsorbBullet, Bullet, Defender, Germ, GiantGerm, Immune, Key, PowerUp,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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
      this.powerups = [];
      this.activePowerUps = [];
      this.resource = {};
      this.status = {
        sickness: 0,
        score: 0,
        freeze: false,
        activeFreezePowerUp: null
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
      this.loadResources(function() {
        _this.buttons.start.disabled = false;
        return _this.showTitleScreen();
      });
    }

    Immune.prototype.loadResources = function(playCallback) {
      var audioCount, audioName, audios, finished, imageCount, imageName, images, img, resourceOnLoad, sound, _i, _j, _len, _len2, _results,
        _this = this;
      imageCount = 0;
      audioCount = 0;
      images = ['img/germ.png'];
      audios = ['sfx/shoot.ogg', 'sfx/explode.ogg', 'sfx/damage.ogg', 'sfx/absorb.ogg', 'sfx/powerup.ogg'];
      finished = false;
      this.loading(imageCount + audioCount, images.length + audios.length);
      setTimeout(function() {
        if (!finished) {
          playCallback();
          return finished = true;
        }
      }, 4000);
      resourceOnLoad = function(type) {
        if (type === 'image') imageCount++;
        if (type === 'audio') audioCount++;
        _this.loading(imageCount + audioCount, images.length + audios.length);
        if (imageCount === images.length && audioCount === audios.length) {
          if (!finished) playCallback();
          return finished = true;
        }
      };
      for (_i = 0, _len = images.length; _i < _len; _i++) {
        imageName = images[_i];
        img = new Image();
        img.src = imageName;
        img.addEventListener('load', function() {
          return resourceOnLoad('image');
        });
        this.resource[imageName] = img;
      }
      _results = [];
      for (_j = 0, _len2 = audios.length; _j < _len2; _j++) {
        audioName = audios[_j];
        sound = new Audio();
        sound.src = audioName;
        sound.addEventListener('canplaythrough', function() {
          return resourceOnLoad('audio');
        });
        _results.push(this.resource[audioName] = sound);
      }
      return _results;
    };

    Immune.prototype.resetCanvas = function() {
      return this.canvas.width = this.canvas.width;
    };

    Immune.prototype.loading = function(cur, total) {
      var msg;
      this.resetCanvas();
      msg = "Loading (" + cur + "/" + total + ")...";
      this.context.font = "bold 12px sans-serif";
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      return this.context.fillText(msg, this.canvas.width - this.canvas.width / 2, this.canvas.height - this.canvas.height / 2);
    };

    Immune.prototype.showTitleScreen = function() {
      this.resetCanvas();
      this.context.fillStyle = 'rgba(0,0,0,.7)';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = 'black';
      this.context.font = 'bold 48px sans-serif';
      this.context.textAlign = 'center';
      return this.context.fillText("Immune", this.canvas.width / 2, 125);
    };

    Immune.prototype.showPauseScreen = function() {
      this.context.fillStyle = 'rgba(0,0,0,.7)';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.fillStyle = 'white';
      this.context.font = 'bold 48px sans-serif';
      this.context.textAlign = 'center';
      return this.context.fillText("Paused", this.canvas.width / 2, 125);
    };

    Immune.prototype.drawFrame = function() {
      var damage;
      this.resetCanvas();
      damage = this.drawGerms(this.bullets, this.activePowerUps, this.resource);
      this.drawPowerUps(this.bullets, this.resource);
      this.drawActivePowerUps(this.bullets);
      this.drawBullets();
      this.defender.move(this.canvas, this.key, this.bullets, this.resource);
      this.defender.draw(this.context);
      if (!this.status.freeze) {
        this.spawnGerms();
        this.spawnPowerUps();
      }
      this.drawStatus();
      if (this.status.sickness > 99) {
        return this.gameOver();
      } else if (damage) {
        this.context.fillStyle = 'red';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        return this.resource['sfx/damage.ogg'].play();
      }
    };

    Immune.prototype.gameOver = function() {
      this.over = true;
      clearInterval(this.frameInterval);
      this.frameInterval = null;
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
        if (Math.random() < 0.7) {
          return this.germs.push(new Germ(randX, 0));
        } else {
          return this.germs.push(new GiantGerm(randX, 0));
        }
      }
    };

    Immune.prototype.spawnPowerUps = function() {
      var randX;
      if (Math.random() < 0.005) {
        randX = Math.ceil(Math.random() * this.canvas.width);
        return this.powerups.push(new PowerUp(randX, 0));
      }
    };

    Immune.prototype.drawGerms = function(bullets, powerups, resource) {
      var bulletHit, damage, germ, germIndex, powerUpHit, toCleanUp, _i, _len, _ref;
      toCleanUp = [];
      damage = false;
      if (this.germs.length > 0) {
        for (germIndex = 0, _ref = this.germs.length - 1; 0 <= _ref ? germIndex <= _ref : germIndex >= _ref; 0 <= _ref ? germIndex++ : germIndex--) {
          germ = this.germs[germIndex];
          if (!this.status.freeze) germ.move(this.context);
          germ.draw(this.context, resource);
          bulletHit = germ.isHit(bullets);
          powerUpHit = germ.isHit(powerups);
          if (bulletHit.hit) {
            if (bulletHit.absorb) {
              germ.health = 0;
              this.status.sickness = this.status.sickness + germ.damage;
              damage = true;
            } else {
              germ.health--;
              this.status.score++;
              if (germ.health < 1) resource['sfx/explode.ogg'].play();
            }
            if (germ.health < 1) toCleanUp.push(germIndex);
          } else if (powerUpHit.hit) {
            toCleanUp.push(germIndex);
            powerUpHit.item.takeDamage(germ.damage);
            resource['sfx/explode.ogg'].play();
          } else if (germ.isOffscreen(this.canvas)) {
            this.status.sickness = this.status.sickness + germ.damage;
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

    Immune.prototype.drawPowerUps = function(bullets, resource) {
      var powerup, powerupHit, powerupIndex, toCleanUp, _i, _len, _ref, _results;
      toCleanUp = [];
      if (this.powerups.length > 0) {
        for (powerupIndex = 0, _ref = this.powerups.length - 1; 0 <= _ref ? powerupIndex <= _ref : powerupIndex >= _ref; 0 <= _ref ? powerupIndex++ : powerupIndex--) {
          powerup = this.powerups[powerupIndex];
          powerup.move(this.context);
          powerup.draw(this.context);
          powerupHit = powerup.isHit(bullets);
          if (powerupHit.hit) {
            toCleanUp.push(powerupIndex);
            if (powerupHit.absorb) {
              powerup.activate(this.canvas, this.status, resource);
              this.activePowerUps.push(powerup);
            }
          } else if (powerup.isOffscreen(this.canvas)) {
            toCleanUp.push(powerupIndex);
          }
        }
        _results = [];
        for (_i = 0, _len = toCleanUp.length; _i < _len; _i++) {
          powerupIndex = toCleanUp[_i];
          _results.push(this.powerups.splice(powerupIndex, 1));
        }
        return _results;
      }
    };

    Immune.prototype.drawActivePowerUps = function(germs) {
      var powerUpIndex, powerup, toCleanUp, _i, _len, _ref, _results;
      toCleanUp = [];
      if (this.activePowerUps.length > 0) {
        for (powerUpIndex = 0, _ref = this.activePowerUps.length - 1; 0 <= _ref ? powerUpIndex <= _ref : powerUpIndex >= _ref; 0 <= _ref ? powerUpIndex++ : powerUpIndex--) {
          powerup = this.activePowerUps[powerUpIndex];
          powerup.draw(this.context);
          if (powerup.health < 1) toCleanUp.push(powerUpIndex);
        }
        _results = [];
        for (_i = 0, _len = toCleanUp.length; _i < _len; _i++) {
          powerUpIndex = toCleanUp[_i];
          _results.push(this.activePowerUps.splice(powerUpIndex, 1));
        }
        return _results;
      }
    };

    Immune.prototype.drawBullets = function() {
      var bullet, bulletIndex, toCleanUp, _i, _len, _ref, _results;
      toCleanUp = [];
      if (this.bullets.length > 0) {
        for (bulletIndex = 0, _ref = this.bullets.length - 1; 0 <= _ref ? bulletIndex <= _ref : bulletIndex >= _ref; 0 <= _ref ? bulletIndex++ : bulletIndex--) {
          bullet = this.bullets[bulletIndex];
          bullet.move(this.context);
          bullet.draw(this.context);
          if (bullet.usedUp()) toCleanUp.push(bulletIndex);
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
      if (this.over) {
        return location.reload();
      } else {
        return this.frameInterval = setInterval(function() {
          return _this.drawFrame();
        }, 20);
      }
    };

    Immune.prototype.pause = function() {
      if (this.frameInterval) {
        clearInterval(this.frameInterval);
        this.frameInterval = null;
        return this.showPauseScreen();
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
      this.damage = 20;
      this.health = this.baseHealth = 1;
      this.frame = 0;
    }

    Germ.prototype.draw = function(context, resource) {
      var offset;
      offset = this.frame <= 4 ? 1 : 0;
      return context.drawImage(resource['img/germ.png'], 20 * offset, 0, 20, 20, this.x, this.y, this.width, this.height);
    };

    Germ.prototype.move = function() {
      this.y = this.y + this.speed;
      if (this.frame < 9) {
        return this.frame++;
      } else {
        return this.frame = 0;
      }
    };

    Germ.prototype.isOffscreen = function(canvas) {
      if (this.y > canvas.height) {
        return true;
      } else {
        return false;
      }
    };

    Germ.prototype.isHit = function(items) {
      var item, _i, _len;
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        if (this.x <= item.x + item.width && this.x + this.width >= item.x && this.y <= item.y + item.height && this.y + this.height >= item.y) {
          item.hitSomething = true;
          return {
            hit: true,
            absorb: item.absorb,
            item: item
          };
        }
      }
      return {
        hit: false
      };
    };

    return Germ;

  })();

  GiantGerm = (function(_super) {

    __extends(GiantGerm, _super);

    function GiantGerm(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 0.5;
      this.width = 20;
      this.height = 20;
      this.damage = 60;
      this.health = this.baseHealth = 15;
    }

    GiantGerm.prototype.draw = function(context, resource) {
      var healthWidth, offset;
      offset = this.frame <= 4 ? 1 : 0;
      context.drawImage(resource['img/germ.png'], 20 * offset, 0, 20, 20, this.x, this.y, this.width, this.height);
      context.fillStyle = 'red';
      if (this.health < this.baseHealth) {
        healthWidth = this.width * this.health / this.baseHealth;
        return context.fillRect(this.x, this.y, healthWidth, 5);
      }
    };

    return GiantGerm;

  })(Germ);

  PowerUp = (function(_super) {

    __extends(PowerUp, _super);

    function PowerUp(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 1;
      this.width = 10;
      this.height = 10;
      this.damage = 20;
      if (Math.random() < 0.5) {
        this.type = 'freeze';
      } else {
        this.type = 'shield';
      }
    }

    PowerUp.prototype.freezeTimeout = null;

    PowerUp.prototype.cancelFreeze = function() {
      clearTimeout(this.freezeTimeout);
      return this.health = 0;
    };

    PowerUp.prototype.activate = function(canvas, status, resource) {
      var _this = this;
      resource['sfx/powerup.ogg'].play();
      if (this.type === 'freeze') {
        status.freeze = true;
        if (status.activeFreezePowerUp) status.activeFreezePowerUp.cancelFreeze();
        status.activeFreezePowerUp = this;
        return this.freezeTimeout = setTimeout(function() {
          status.freeze = false;
          status.activeFreezePowerUp = null;
          return _this.health = 0;
        }, 3000);
      } else {
        this.width = canvas.width;
        this.x = 0;
        return this.health = 60;
      }
    };

    PowerUp.prototype.takeDamage = function(damage) {
      this.health = this.health - damage;
      return this.height = this.height - 2;
    };

    PowerUp.prototype.draw = function(context) {
      if (this.type === 'shield') {
        context.fillStyle = 'blue';
      } else {
        context.fillStyle = 'purple';
      }
      return context.fillRect(this.x, this.y, this.width, this.height);
    };

    return PowerUp;

  })(Germ);

  Defender = (function() {

    function Defender(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 2;
      this.width = 24;
      this.height = 10;
      this.cooldown = false;
    }

    Defender.prototype.draw = function(context) {
      context.fillStyle = 'black';
      context.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = 'red';
      return context.fillRect(this.x + this.width / 4, this.y - this.height / 2, this.width / 2, this.height / 2);
    };

    Defender.prototype.move = function(canvas, key, bullets, resource) {
      if (key.isDown(key.codes.LEFT) && this.x - this.speed >= 0) {
        this.x = this.x - this.speed;
      }
      if (key.isDown(key.codes.RIGHT) && this.x + this.speed <= canvas.width - this.width) {
        this.x = this.x + this.speed;
      }
      if (key.isDown(key.codes.UP)) this.fire(bullets, resource);
      if (key.isDown(key.codes.DOWN)) return this.absorb(bullets, resource);
    };

    Defender.prototype.fire = function(bullets, resource) {
      var _this = this;
      if (this.cooldown) return;
      resource['sfx/shoot.ogg'].play();
      bullets.push(new Bullet(this.x + this.width / 2, this.y));
      this.cooldown = true;
      return setTimeout(function() {
        return _this.cooldown = false;
      }, 100);
    };

    Defender.prototype.absorb = function(bullets, resource) {
      var _this = this;
      if (this.cooldown) return;
      resource['sfx/absorb.ogg'].play();
      bullets.push(new AbsorbBullet(this.x + this.width / 2, this.y));
      this.cooldown = true;
      return setTimeout(function() {
        return _this.cooldown = false;
      }, 100);
    };

    return Defender;

  })();

  Bullet = (function() {

    function Bullet(x, y) {
      this.x = x;
      this.y = y;
      this.speed = 3;
      this.width = 4;
      this.height = 10;
      this.hitSomething = false;
    }

    Bullet.prototype.draw = function(context) {
      context.fillStyle = 'black';
      return context.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    };

    Bullet.prototype.move = function() {
      return this.y = this.y - this.speed;
    };

    Bullet.prototype.usedUp = function() {
      if (this.isOffscreen() || this.hitSomething) {
        return true;
      } else {
        return false;
      }
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

  AbsorbBullet = (function(_super) {

    __extends(AbsorbBullet, _super);

    function AbsorbBullet() {
      AbsorbBullet.__super__.constructor.apply(this, arguments);
    }

    AbsorbBullet.prototype.absorb = true;

    AbsorbBullet.prototype.draw = function(context) {
      context.fillStyle = 'orange';
      return context.fillRect(this.x - this.width / 2, this.y, this.width, this.height);
    };

    return AbsorbBullet;

  })(Bullet);

  window.onload = function() {
    var immune;
    return immune = new Immune(window.document, window);
  };

}).call(this);
