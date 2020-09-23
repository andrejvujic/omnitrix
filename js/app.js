/*
Ben 10 (Ten) Omnitrix App: now on Samsung Galaxy Watches

This project was started on August 19th, 2020
Developed using HTML, CSS and Javascript
by Andrej Vujic (28/08/20)

- GitHub: https://github.com/andrejvujic/omnitrix
- Galaxy Store: https://galaxy.store/benten
- Youtube: https://www.youtube.com/watch?v=5cOPupZvOAw
- Youtube Update 1.2.(1/2/3/4) Trailer: https://www.youtube.com/watch?v=LNyiBof50vI
- Support me via PayPal: https://www.paypal.com/paypalme/andrejvujic

Copyright (C) 2020 Andrej Vujic
*/

var omnitrix;
var audio;
var animation;
var voice_control;

main = () => {
  omnitrix = new Omnitrix();
  audio = new Audio();
  animation = new AnimationScene();
  //voice_control = new VoiceControlClient();
  document.addEventListener("tizenhwkey", exit_app);
  document.addEventListener("rotarydetent", (event) => {
    omnitrix.rotated(event);
  });
  document.addEventListener("click", (event) => {
    omnitrix.clicked(event);
  });
};

exit_app = (event) => {
  if (event.keyName == "back") {
    tizen.application.getCurrentApplication().exit();
  }
};

function Omnitrix() {
  this.html = document.getElementById("main-image");
  this.state = "green";
  this.locked = true;
  this.recharged = true;

  this.image = 0;
  this.max_image = 25;
  this.min_image = 1;

  this.lock = () => {
    this.locked = true;
  };

  this.unlock = () => {
    this.locked = false;
  };

  this.rotated = (event) => {
    if (!(this.state == "green")) {
      return;
    }

    if (audio.playing) {
      audio.pause_all();
    }

    if (this.locked) {
      audio.play("lock");
      setTimeout(() => {
    	if (audio.playing){
    	   audio.pause("lock");
    	}
      }, 500);
    } else {
      let direction = event.detail.direction;

      if (direction == "CW") {
        this.image++;
      } else if (direction == "CCW") {
        this.image--;
      }

      audio.play(`switch-${audio.current_switch}`);
      setTimeout(() => {
        if (audio.playing) {
          audio.pause(`switch-${audio.current_switch}`);
        }
      }, 1000);

      audio.update_switch();
      this.valid_image();
      this.update_image();
    }
  };

  this.clicked = (event) => {
    if (audio.playing) {
      return;
    }

    if (this.locked) {
      audio.play("open");
      setTimeout(() => {
        audio.pause("open");
      }, 2000);

      this.unlock();
      this.image++;
      this.valid_image();
      this.update_image();
    } else if (!this.recharged) {
      animation.recharge();
    } else {
      animation.transform();
    }
  };

  this.set_state = (state) => {
    this.state = state;
  };

  this.valid_image = () => {
    if (this.image > this.max_image) {
      this.image = this.min_image;
    } else if (this.image < this.min_image) {
      this.image = this.max_image;
    }
  };

  this.update_image = () => {
    this.html.src = `js/assets/images/${this.state}/${this.state}_${this.image}.png`;
  };

  this.set_image = (index) => {
    this.image = index;
  };

  this.set_animation = (animation_name) => {
    this.html.style.animation = animation_name;
  };

  this.reset_animation = () => {
    this.html.style.animation = "";
  };
}

function Audio() {
  this.html = document.getElementsByTagName("audio");
  this.current_switch = 0;
  this.max_switch = 2;

  this.update_switch = () => {
    this.current_switch++;
    if (this.current_switch > this.max_switch) {
      this.current_switch = 0;
    } else if (this.current_switch < 0) {
      this.current_switch = this.max_switch;
    }
  };

  this.get_audio = () => {
    let all_audio = {};
    for (const audio_element of this.html) {
      all_audio[audio_element.getAttribute("name")] = audio_element;
    }

    return all_audio;
  };

  this.all_audio = this.get_audio();

  this.play = (audio_name) => {
    if (this.playing) {
      return;
    } else {
      this.playing = true;
      this.all_audio[audio_name].play();
    }
  };

  this.pause = (audio_name) => {
    this.playing = false;
    this.all_audio[audio_name].pause();
    this.all_audio[audio_name].currentTime = 0;
  };

  this.pause_all = () => {
    this.playing = false;
    for (audio_element of this.html) {
      audio_element.pause();
      audio_element.currentTime = 0;
    }
  };
}

function AnimationScene() {
  this.last_image = 0;
  this.current_image = 0;

  this.transform = () => {
    audio.play("transform");
    setTimeout(() => {
      audio.pause("transform");
    }, 2000);

    this.last_image = omnitrix.image;

    omnitrix.set_state("white");
    omnitrix.set_image(0);
    omnitrix.update_image();

    omnitrix.recharged = false;
  };

  this.recharge = () => {
    audio.play("recharge");
    setTimeout(() => {
      audio.pause("recharge");
      omnitrix.reset_animation();
    }, 9000);

    omnitrix.set_state("red");
    omnitrix.set_image(0);
    omnitrix.update_image();

    this.blink(18, 500, {
      0: { state: "red", image: 0 },
      1: { state: "white", image: 0 },
    });
    omnitrix.set_animation(`blink 0.5s linear ${9 * 2}`);
  };

  this.self_destruct = () => {
    //audio.play("destruct");
    setTimeout(() => {
      //audio.pause("destruct");
      omnitrix.reset_animation();
    }, 9000);

    this.last_image = omnitrix.image;

    omnitrix.set_state("orange");
    omnitrix.set_image(0);
    omnitrix.update_image();

    this.blink(10, 1000, {
      0: { state: "orange", image: 0 },
      1: { state: "white", image: 1 },
    });
    omnitrix.set_animation(`blink 1s linear ${10}`);
  };

  this.blink = (limit, sleep_time, states) => {
    setTimeout(() => {
      this.current_image++;
      let current_state = this.current_image % 2;

      omnitrix.set_image(states[`${current_state}`].image);
      omnitrix.set_state(states[`${current_state}`].state);
      omnitrix.update_image();

      if (this.current_image > limit) {
        this.reset_animation();
      } else {
        this.blink(limit, sleep_time, states);
      }
    }, sleep_time);
  };

  this.reset_animation = () => {
    this.current_image = 0;
    omnitrix.recharged = true;
    omnitrix.set_state("green");
    console.log(this.last_image);
    omnitrix.set_image(this.last_image);
    omnitrix.update_image();
  };
}

/*
function VoiceControlClient() {
  this.client = tizen.voicecontrol.getVoiceControlClient();
  this.commands = [
    new tizen.VoiceControlCommand("alpha"),
    new tizen.VoiceControlCommand("bravo"),
    new tizen.VoiceControlCommand("omnitrix"),
  ];
  this.client.setCommandList(this.commands, "FOREGROUND");
  this.resultListenerCallback = function (event, list, result) {
    console.log("Result callback - event: " + event + ", result: " + result);
  };
  this.id = this.client.addResultListener(this.resultListenerCallback);

  console.log(this.client.getCurrentLanguage());
}
*/

window.onerror = (message, url, lineNumber) => {
  document.documentElement.innerHTML = "";
  alert(`Omnitrix couldn't be launched on your Device.`);
  alert(`Error (${message}) on line ${lineNumber}.`);
  alert(`Click OK to exit the application.`);
  tizen.application.getCurrentApplication().exit();
};

document.addEventListener("DOMContentLoaded", main);
