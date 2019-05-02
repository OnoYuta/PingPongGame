'use strict';

{
  let ctx,
      youPaddle,
      cpuPaddle,
      myBall,
      mouseX,
      youScore,
      cpuScore,
      isPlaying = false;

  const canvas = document.getElementById('mycanvas');
  if (canvas && canvas.getContext){
    ctx = canvas.getContext('2d');
  }

  function showResult() {
    setTimeout( () => {
      let result;
      if (youScore >= 3) {
        result = "あなたの勝ちです!";
      } else if (cpuScore >= 3) {
        result = "あなたの負けです...";
      } else {
        result = "ゲームは引き分けです";
      }
      $("#msg").text("ゲーム終了");
      $("#msg").toggleClass("rotate");
      $("#modal").text(result);
      $('#btn').text('もう一度ゲームをする');
      $("#modal").removeClass('hidden');
      $("#mask").removeClass('hidden');
      $('#btn').removeClass("inactive");
    }, 100);
  }

  function setNext() {
    isPlaying = false;
    clearStage();
    $("#youScore").text("YOU: " + youScore + " / 3");
    $("#cpuScore").text("CPU: " + cpuScore + " / 3");
    youPaddle.draw();
    cpuPaddle.draw();
    myBall.draw();
    if (youScore < 3 && cpuScore < 3) {
      myBall = new Ball(rand(50, 250), rand(35, 80), rand(2, 4), rand(2, 3), 6);
        setTimeout(function() {
          isPlaying = true;
          update();
        }, 1000);
    } else {
      showResult();
    }
  }

  let Ball = function(x, y, vx, vy, r) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.r = r;
    this.draw = function() {
      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, true);
      ctx.fill();
    };
    this.move = function() {
      this.x += this.vx;
      this.y += this.vy;
      // 左端 or 右端
      if (this.x + this.r > canvas.width || this.x - this.r < 0) {
        this.vx *= -1;
      }
      // 上
      if (this.y - this.r < 0) {
        youScore++;
        $("#youScore").toggleClass("rotate");
        setNext();
      }
      // 下
      if (this.y + this.r > canvas.height) {
        cpuScore++;
        $("#cpuScore").toggleClass("rotate");
        setNext();
      }
    };
    // 通常の当たり判定
    this.checkCollision = function(paddle) {
      if ((this.y + this.r > paddle.y && this.y + this.r < paddle.y + paddle.h) && (this.x > paddle.x - paddle.w / 2 && this.x < paddle.x + paddle.w / 2)) {
        this.vy *= -1;
      }
    };
    // プッシュ時の当たり判定
    this.checkPushCollision = function(paddle) {
      if ((this.y + this.r > paddle.y && this.y + this.r < paddle.y + paddle.h + 30) && (this.x > paddle.x - paddle.w / 2 && this.x < paddle.x + paddle.w / 2)) {
        this.vy = Math.abs(this.vy) * (-1.5);
        this.vx *= 1.5;
        this.y = paddle.y - this.r;
      }
    };
    // cpuの当たり判定
    this.checkCpuCollision = function(paddle) {
      if ((this.y - this.r < paddle.y + paddle.h && this.y - this.r > paddle.y) && (this.x > paddle.x - paddle.w / 2 && this.x < paddle.x + paddle.w / 2)) {
        this.vy *= -1;
        if (this.vx <= 4) {
          this.vx *= 1.1;
        }
      }
    };
  }

  let Paddle = function(w, h, x, y) {
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.operable = true;
    this.draw = function() {
      ctx.fillStyle = "#fff";
      ctx.fillRect(this.x - this.w / 2, this.y, this.w, this.h);
    };
    this.move = function() {
      this.x = mouseX - $('#mycanvas').offset().left;
    }
    this.push = function() {
      if (this.operable) {
        this.y = canvas.height - 60;
        this.operable = false;
        this.reposition();
        myBall.checkPushCollision(youPaddle);
      }
    }
    this.reposition = function() {
      this.y++;
      const timeoutId = setTimeout(() => {
        this.reposition();
      }, 20);
      if(this.y === canvas.height - 30 || !isPlaying) {
        clearTimeout(timeoutId);
        this.y = canvas.height - 30;
        this.operable = true;
      }
    }
  };

  let autoPaddle = function(w, h, x, y) {
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.vx = 1;
    this.draw = function() {
      ctx.fillStyle = "#fff";
      ctx.fillRect(this.x - this.w / 2, this.y, this.w, this.h);
    };
    this.move = function() {
        // autoPaddleはボールが近づいてきたら動く
      if (myBall.y <= canvas.height * 1 / 2) {
        // autoPaddle速度はボール速度と等しいが上限がある
        if (myBall.vx <= 4) {
          this.vx = Math.abs(myBall.vx);
        }
        if (this.x + this.w / 4 < myBall.x) {
          this.x += this.vx;
        } else if (this.x - this.w / 4 > myBall.x) {
          this.x -= this.vx;
        }
      }
    }

  };

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function init() {
    youScore = 0;
    cpuScore = 0;
    isPlaying = true;
    $("#msg").text("対戦中");
    $("#msg").toggleClass("rotate");
    youPaddle = new Paddle(100, 10,canvas.width / 2, canvas.height - 30);
    cpuPaddle = new autoPaddle(100, 10,canvas.width / 2, 20);
    myBall = new Ball(rand(50, 250), rand(35, 80), rand(2, 3), rand(2, 3), 6);
  }

  function clearStage() {
    ctx.fillStyle = "#f5cb5c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function update() {
    clearStage();
    youPaddle.draw();
    youPaddle.move();
    cpuPaddle.draw();
    cpuPaddle.move();
    myBall.draw();
    myBall.move();
    myBall.checkCollision(youPaddle);
    myBall.checkCpuCollision(cpuPaddle);
    const timeoutId = setTimeout(function() {
        update();
    }, 15);
    if (!isPlaying) {clearTimeout(timeoutId)}
  }

  $('#btn').click(() => {
    if (!isPlaying) {
      $('#btn').addClass("inactive");
      $('#modal').addClass("hidden");
      $('#mask').addClass("hidden");
      init();
      update();
    }
  });

  $('body').mousemove((e) => {
    mouseX = e.pageX;
  });
  
  $('#mycanvas').click(() => {
    if (isPlaying) {
      youPaddle.push();
    }
  });

  $('#modal').click(() => {
    $('#modal').addClass("hidden");
    $('#mask').addClass("hidden");
  });

  $('#mask').click(() => {
    $('#modal').addClass("hidden");
    $('#mask').addClass("hidden");
  });
  
  $('#btn').mousedown(() => {
	$('#btn').addClass("pressed");
  });
  
  $('#btn').mouseup(() => {
	$('#btn').removeClass("pressed");
  });

}
