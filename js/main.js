/*
Ben 10 Omnitrix for Galaxy Watches
August 19th, 2020

This app was written Javascript, HTML and CSS on the Tizen Studio IDE by Andrej Vujic

How-to-use:
- click on screen: unlocks Omnitrix (on inital launch)
- rotate bezel clockwise: shows next alien
- rotate bezel counter-clockwise: shows previous alien
- click on alien: starts transformation

Credits:
- TheHawkDown: creator and owner of the artwork used in the app
- ManOfAction and Cartoon Network Studios: creators and owners of the famous cartoon show (Ben 10)

Links:
- GitHub: https://github.com/andrejvujic/omnitrix
- Galaxy Store: https://galaxy.store/benten
- Youtube: 
*/

var max_image = 19;
var min_image = 1;
var current_image = 1;
var current_state = "green";
var current_index = 0;

var switching_audio;
var opening_audio;
var transforming_audio;
var recharging_audio;
var destruct_audio;
var locked_audio;

var main_container;
var main_image;
var body;

window.onload = function () {
  main_container = document.getElementsByClassName("main")[0];
  main_image = main_container.getElementsByClassName("main-image")[0];

  body = document.getElementsByTagName("body")[0];

  switching_audio = document.getElementById("switching-audio");
  transforming_audio = document.getElementById("transforming-audio");
  recharging_audio = document.getElementById("recharging-audio");
  opening_audio = document.getElementById("opening-audio");
  destruct_audio = document.getElementById("destruct-audio");
  locked_audio = document.getElementById("locked-audio");

  update_image(main_image, 0, current_state);
  document.addEventListener("click", main);
  document.addEventListener("rotarydetent", locked_omnitrix);
};

function locked_omnitrix() {
  locked_audio.pause();
  locked_audio.currentTime = 0;
  locked_audio.play();
}

function recharged_omnitrix() {
  main_image.removeEventListener("click", recharged_omnitrix);
  main_image.addEventListener("click", transform_animation);
  recharge_animation();
}

function main() {
  opening_audio.play();

  current_image = 1;
  update_image(main_image, current_image, current_state);

  document.removeEventListener("click", main);
  document.removeEventListener("rotarydetent", locked_omnitrix);
  main_image.addEventListener("click", transform_animation);

  document.addEventListener("tizenhwkey", function (event) {
    if (event.keyName == "back") {
      try {
        tizen.application.getCurrentApplication().exit();
      } catch (ignore) {}
    }
  });

  document.addEventListener("rotarydetent", function (event) {
    if (current_state != "green") {
      return;
    }
    if (
      recharging_audio.currentTime > 0 ||
      transforming_audio.currentTime > 0
    ) {
      return;
    }

    switching_audio.currentTime = 0;
    switching_audio.play();

    var direction = event.detail.direction; // Bezel rotation direction

    if (direction == "CW") {
      // Clockwise
      current_image++;
    } else if (direction == "CCW") {
      // Counter-Clockwise
      current_image--;
    }

    current_image = valid_image(current_image);
    update_image(main_image, current_image, current_state);
  });
  /*
  setTimeout(function () {
    opening_audio.currentTime = 0;
  }, opening_audio.duration * 1000);
  */
}

function update_image(main_image, current_image, state) {
  main_image.src = `js/assets/images/${state}/${state}_${current_image}.png`;
}

function valid_image(current_image) {
  return current_image < min_image
    ? max_image
    : current_image > max_image
    ? min_image
    : current_image;
}

function transform_animation(event) {
  if (recharging_audio.currentTime > 0 || transforming_audio.currentTime > 0) {
    return;
  }
  current_state = "white";
  update_image(main_image, 0, current_state);

  transforming_audio.play();
  setTimeout(function () {
    current_state = "red";

    transforming_audio.pause();
    transforming_audio.currentTime = 0;

    main_image.removeEventListener("click", transform_animation);
    main_image.addEventListener("click", recharged_omnitrix);
  }, transforming_audio.duration * 1000);
}

function recharge_animation() {
  current_state = "red";
  update_image(main_image, 0, current_state);

  new_animation(
    main_image,
    `blink 0.5s linear ${recharging_audio.duration * 2}`
  );
  recharging_audio.play();

  blink_image();

  setTimeout(function () {
    current_state = "green";
    update_image(main_image, current_image, current_state);
    reset_animation(main_image);
    recharging_audio.pause();
    recharging_audio.currentTime = 0;
  }, recharging_audio.duration * 1000);
}

function blink_image() {
  setTimeout(function () {
    console.log(current_index);
    current_index++;
    if (current_index % 2 == 0) {
      update_image(main_image, 0, "red");
    } else {
      update_image(main_image, 0, "white");
    }

    if (current_index < parseInt(recharging_audio.duration) * 2) {
      blink_image();
    } else {
      current_index = 0;
    }
  }, 500);
}

function self_destruct_animation() {
  current_state = "orange";
  update_image(main_image, 0, current_state);

  new_animation(main_image, `blink 0.5s linear ${destruct_audio.duration * 2}`);
  destruct_audio.play();

  setTimeout(function () {
    current_state = "green";
    update_image(main_image, current_image, current_state);
    reset_animation(main_image);
    destruct_audio.pause();
    destruct_audio.currentTime = 0;
  }, destruct_audio.duration * 1000);
}

function new_animation(target, animation_name) {
  target.style.animation = animation_name;
}

function reset_animation(target) {
  target.style.animation = "";
}
