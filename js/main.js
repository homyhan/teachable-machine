// const URL = "https://teachablemachine.withgoogle.com/models/rdcqB69I8/";
// const MODEL_URL = "https://teachablemachine.withgoogle.com/models/Rn6MVZ6kF/"; // tay 207
let MODEL_URL = "";
let model, webcam, labelContainer, maxPredictions;
let countdownValue = 5,
  countdownInterval,
  progressInterval;
let attemptCount = 0;
let currentAudio = null;
let btnApply = document.getElementById("btnApply");
let urlModel = "";
let className1,
  className2,
  className3,
  classNameTest = "";
let nguong = 0;
let currentVideo = null;

// Map lưu file của người dùng: { "Tên lớp" : blobURL }
let fileMap = {};

const domID = (id) => {
  return document.getElementById(id);
};

async function initModel() {
  if (!model) {
    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    webcam = new tmImage.Webcam(200, 200, true);
    await webcam.setup();
    await webcam.play();
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement("div"));
    }
  }
}
btnApply.addEventListener("click", function () {
  urlModel = document.getElementById("inputURLModel").value;
  className1 = document.getElementById("className1").value;
  className2 = document.getElementById("className2").value;
  className3 = document.getElementById("className3").value;
  classNameTest = document.getElementById("classNameTest").value;
  nguong = document.getElementById("nguong").value * 1;

  domID("labelClass1").innerHTML = className1;
  domID("labelClass2").innerHTML = className2;
  domID("labelClass3").innerHTML = className3;
  domID("labelClassTest").innerHTML = classNameTest;
  MODEL_URL = urlModel;

  // Lấy file và tạo blobURL
  // const f1 = domID("fileClass1").files[0];
  // const f2 = domID("fileClass2").files[0];
  // const f3 = domID("fileClass3").files[0];
  // const fTest = domID("fileClassTest").files[0];

  // if (f1) fileMap[className1] = { url: URL.createObjectURL(f1), type: f1.type };
  // if (f2) fileMap[className2] = { url: URL.createObjectURL(f2), type: f2.type };
  // if (f3) fileMap[className3] = { url: URL.createObjectURL(f3), type: f3.type };
  // if (fTest)
  //   fileMap[classNameTest] = {
  //     url: URL.createObjectURL(fTest),
  //     type: fTest.type,
  //   };

  // console.log("File map:", fileMap);

  // Lấy link YouTube
  const u1 = domID("urlClass1").value;
  const u2 = domID("urlClass2").value;
  const u3 = domID("urlClass3").value;
  const uTest = domID("urlClassTest").value;

  if (u1) fileMap[className1] = { url: u1, type: "youtube" };
  if (u2) fileMap[className2] = { url: u2, type: "youtube" };
  if (u3) fileMap[className3] = { url: u3, type: "youtube" };
  if (uTest) fileMap[classNameTest] = { url: uTest, type: "youtube" };

  console.log("File map:", fileMap);
});

function playYouTube(url) {
  // Nếu đang phát thì xóa
  if (currentVideo) {
    currentVideo.remove();
    currentVideo = null;
  }

  // Lấy videoId từ URL
  let videoId = "";
  const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&]+)/);
  if (match && match[1]) {
    videoId = match[1];
  } else {
    alert("URL YouTube không hợp lệ!");
    return;
  }

  // Tạo iframe
  currentVideo = document.createElement("iframe");
  currentVideo.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`;
  currentVideo.style.position = "fixed";
  currentVideo.style.top = "0";
  currentVideo.style.left = "0";
  currentVideo.style.width = "100%";
  currentVideo.style.height = "100%";
  currentVideo.style.zIndex = "9999";
  currentVideo.allow = "autoplay; fullscreen";
  document.body.appendChild(currentVideo);
}

// function playVideo(file) {
//   // Nếu đang phát video khác thì dừng lại
//   if (currentVideo) {
//     currentVideo.pause();
//     currentVideo.currentTime = 0;
//     currentVideo.remove(); // xóa video cũ khỏi DOM
//   }

//   // Tạo thẻ video mới
//   currentVideo = document.createElement("video");
//   currentVideo.src = file;
//   currentVideo.controls = true; // có nút điều khiển
//   currentVideo.autoplay = true;
//   currentVideo.style.maxWidth = "300px";

//   // Thêm video vào vùng hiển thị (ví dụ trong #history hoặc một div riêng)
//   document.getElementById("history").appendChild(currentVideo);
// }

function playVideoFullscreen(file) {
  // Nếu đang phát video thì dừng
  if (currentVideo) {
    currentVideo.pause();
    currentVideo.remove();
  }

  // Tạo thẻ video
  currentVideo = document.createElement("video");
  currentVideo.src = file;
  currentVideo.autoplay = true;
  currentVideo.style.display = "block";
  currentVideo.style.position = "fixed";
  currentVideo.style.top = "0";
  currentVideo.style.left = "0";
  currentVideo.style.width = "100%";
  currentVideo.style.height = "100%";
  currentVideo.style.zIndex = "9999";
  currentVideo.style.objectFit = "cover";

  document.body.appendChild(currentVideo);

  // Phát toàn màn hình
  if (currentVideo.requestFullscreen) {
    currentVideo.requestFullscreen();
  } else if (currentVideo.webkitRequestFullscreen) {
    // Safari
    currentVideo.webkitRequestFullscreen();
  } else if (currentVideo.msRequestFullscreen) {
    // IE/Edge
    currentVideo.msRequestFullscreen();
  }

  // Khi video chạy xong thì thoát fullscreen và xóa video
  currentVideo.onended = function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    currentVideo.remove();
    currentVideo = null;
  };
}
async function startPrediction() {
  await initModel();
  document.body.style.backgroundColor = "white";
  attemptCount++;
  countdownValue = 5;
  document.getElementById(
    "countdown"
  ).innerText = `Dự đoán sau: ${countdownValue} giây`;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (countdownInterval) clearInterval(countdownInterval);
  if (progressInterval) clearInterval(progressInterval);

  progressInterval = setInterval(updateProgressBars, 200);

  countdownInterval = setInterval(async () => {
    countdownValue--;
    document.getElementById(
      "countdown"
    ).innerText = `Dự đoán sau: ${countdownValue} giây`;

    if (countdownValue <= 0) {
      clearInterval(countdownInterval);
      clearInterval(progressInterval);
      await predict(attemptCount);
      document.getElementById("countdown").innerText = "Hoàn thành!";
    }
  }, 1000);
}

async function updateProgressBars() {
  webcam.update();
  const prediction = await model.predict(webcam.canvas);

  document.getElementById("bar1").style.width =
    prediction[0].probability * 100 + "%";
  document.getElementById("bar2").style.width =
    prediction[1].probability * 100 + "%";
  document.getElementById("bar3").style.width =
    prediction[2].probability * 100 + "%";
  document.getElementById("bar4").style.width =
    prediction[3].probability * 100 + "%";
}

async function predict(attemptNumber) {
  webcam.update();
  const prediction = await model.predict(webcam.canvas);

  let highestClass = "",
    highestProb = 0;
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = classPrediction;
    if (prediction[i].probability > highestProb) {
      highestProb = prediction[i].probability;
      highestClass = prediction[i].className;
    }
  }

  // Chụp ảnh hiện tại từ webcam
  const snapshot = webcam.canvas.toDataURL("image/png");

  // Lưu lịch sử kèm hình
  const historyEl = document.getElementById("history");
  const timeNow = new Date().toLocaleTimeString();
  const resultItem = document.createElement("div");
  resultItem.className = "history-item";
  resultItem.innerHTML = `
            <img src="${snapshot}" alt="Snapshot">
            <div>Lần ${attemptNumber} (${timeNow}): ${highestClass} (${highestProb.toFixed(
    2
  )})</div>
        `;
  historyEl.appendChild(resultItem);

  // if (highestProb > 0.8) {
  //   if (highestClass === "1") {
  //     document.body.style.backgroundColor = "red";
  //     playSound("happy.mp3");
  //   } else if (highestClass === "2") {
  //     document.body.style.backgroundColor = "blue";
  //     playSound("sad.mp3");
  //   } else if (highestClass === "3") {
  //     document.body.style.backgroundColor = "yellow";
  //     playSound("surprise.mp3");
  //   }
  // }

  //ok
  // if (highestProb > 0.8) {
  //   if (highestClass === "1") {
  //     document.body.style.backgroundColor = "red";
  //     // playVideo("video1.mp4");
  //   } else if (highestClass === "2") {
  //     document.body.style.backgroundColor = "blue";
  //     // playVideo("video2.mp4");
  //   } else if (highestClass === "3") {
  //     document.body.style.backgroundColor = "yellow";
  //     playVideoFullscreen("meme10diem.mp4");
  //   }
  // }

  // Nếu vượt ngưỡng thì phát file mà người dùng đã chọn
  // if (highestProb > nguong && fileMap[highestClass]) {
  //   const file = fileMap[highestClass];
  //   if (file.type.startsWith("video/")) {
  //     playVideoFullscreen(file.url);
  //   } else if (file.type.startsWith("audio/")) {
  //     playSound(file.url);
  //   }
  // }

  if (highestProb > nguong && fileMap[highestClass]) {
    const file = fileMap[highestClass];
    playYouTube(file.url);
    
  }
}

function playSound(file) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  currentAudio = new Audio(file);
  currentAudio.play();
}
