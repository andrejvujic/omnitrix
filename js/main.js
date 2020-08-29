var current_image = 1;
var images_length = 19;
var switching_audio;
var transforming_audio;

window.onload = function () {
  // add eventListener for tizenhwkey
  switching_audio = document.getElementById("switching-audio");
  transforming_audio = document.getElementById("transforming-audio");

  var main_div = document.getElementsByClassName("main")[0];
  var main_image = main_div.getElementsByClassName("main-image")[0];
  main_image.addEventListener("click", play_transform);

  document.addEventListener("tizenhwkey", function (event) {
    if (event.keyName == "back") {
      try {
        tizen.application.getCurrentApplication().exit();
      } catch (ignore) {}
    }
  });

  document.addEventListener("rotarydetent", function (event) {
    switching_audio.pause();
    switching_audio.currentTime = 0;
    switching_audio.play();

    var direction = event.detail.direction; // Bezel rotation direction

    var main_div = document.getElementsByClassName("main")[0];
    var main_image = main_div.getElementsByClassName("main-image")[0];
    if (direction == "CW") {
      // Clockwise
      current_image += 1;
      current_image = in_range(current_image);

      set_image(main_image, current_image);
    } else if (direction == "CCW") {
      // Counter-Clockwise
      current_image -= 1;
      current_image = in_range(current_image);

      set_image(main_image, current_image);
    }
  });
};

function set_image(main_image, current_image) {
  var image_path = main_image.src;
  image_path = image_path.substring(0, image_path.length - 8);

  if (current_image < 10) {
    current_image = "0" + current_image;
  }

  main_image.src = image_path + "(" + current_image + ")" + ".png";
}

function play_transform(event) {
  var main_div = document.getElementsByClassName("main")[0];
  var main_image = main_div.getElementsByClassName("main-image")[0];

  set_image(main_image, 20);

  transforming_audio.play();
  setTimeout(function () {
    set_image(main_image, current_image);
  }, transforming_audio.duration * 1000);
}

function in_range(current_image) {
  return current_image < 1
    ? images_length
    : current_image > images_length
    ? 1
    : current_image;
}
