// const URL = "https://teachablemachine.withgoogle.com/models/rdcqB69I8/";
const URL = "https://teachablemachine.withgoogle.com/models/Rn6MVZ6kF/"; // tay 207
let model, webcam, labelContainer, maxPredictions;
let countdownValue = 5,
  countdownInterval,
  progressInterval;
let attemptCount = 0;
let currentAudio = null;
let btnApply = document.getElementById("btnApply");
let urlModel ="";
let className1, className2, className3, classNameTest = ""
let nguong = 0;
let currentVideo = null;


const domID = (id)=>{
  return document.getElementById(id);
}

async function initModel() {
  if (!model) {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
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
   className1 = document.getElementById("className1").value
   className2 = document.getElementById("className2").value
   className3 = document.getElementById("className3").value
   classNameTest = document.getElementById("classNameTest").value
   nguong = document.getElementById("nguong").value*1;


   domID("labelClass1").innerHTML = className1
   domID("labelClass2").innerHTML = className2
   domID("labelClass3").innerHTML = className3
   domID("labelClassTest").innerHTML = classNameTest
    
   console.log(urlModel);
   console.log(className1);
   console.log(className2);
   console.log(className3);
   console.log(classNameTest);
   console.log(nguong);
   
   
  
})

function playVideo(file) {
  // Nếu đang phát video khác thì dừng lại
  if (currentVideo) {
    currentVideo.pause();
    currentVideo.currentTime = 0;
    currentVideo.remove(); // xóa video cũ khỏi DOM
  }

  // Tạo thẻ video mới
  currentVideo = document.createElement("video");
  currentVideo.src = file;
  currentVideo.controls = true; // có nút điều khiển
  currentVideo.autoplay = true;
  currentVideo.style.maxWidth = "300px";

  // Thêm video vào vùng hiển thị (ví dụ trong #history hoặc một div riêng)
  document.getElementById("history").appendChild(currentVideo);
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

  if (highestProb > 0.8) {
  if (highestClass === "1") {
    document.body.style.backgroundColor = "red";
    // playVideo("video1.mp4");
  } else if (highestClass === "2") {
    document.body.style.backgroundColor = "blue";
    // playVideo("video2.mp4");
  } else if (highestClass === "3") {
    document.body.style.backgroundColor = "yellow";
    playVideo("meme10diem.mp4");
  }
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
