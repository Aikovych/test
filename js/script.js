document.addEventListener("DOMContentLoaded", function () {
    const audio = document.getElementById("menu-music");
    const soundButton = document.querySelector(".sound-button");
    const achievementsButton = document.querySelector(".achievements-button");
    const translationButton = document.querySelector(".translation-button");
    const leftButton = document.querySelector(".left-button");
    const infoButton = document.getElementById("info-btn");
    const extraInfoButton = document.getElementById("extra-info-btn");
    const infoModal = document.getElementById("info-modal");
    const extraInfoModal = document.getElementById("extra-info-modal");
    const closeInfo = document.getElementById("close-info");
    const closeExtraInfo = document.getElementById("close-extra-info");
    const soundIcon = soundButton.querySelector("i");

    // Загружаем состояние звука из localStorage
    let isMuted = localStorage.getItem("isMuted") === "true";

    // ✅ Функция обновления кнопки звука
    function updateSoundButton() {
        if (isMuted) {
            soundIcon.classList.replace("fa-volume-up", "fa-volume-mute");
            soundButton.classList.add("sound-off");
        } else {
            soundIcon.classList.replace("fa-volume-mute", "fa-volume-up");
            soundButton.classList.remove("sound-off");
        }
    }

    // ✅ Функция переключения звука
    function toggleSound() {
        isMuted = !isMuted;
        audio.muted = isMuted;
        localStorage.setItem("isMuted", isMuted);
        updateSoundButton();
    }

    // ✅ Универсальная анимация кнопок
    function animateButton(button) {
        button.classList.add("button-clicked");
        setTimeout(() => {
            button.classList.remove("button-clicked");
        }, 200);
    }

    // ✅ Функция переключения активного состояния кнопки
    function toggleButton(button) {
        button.classList.toggle("active");
    }

    // 🎵 Обработчик кнопки звука
    soundButton.addEventListener("click", function () {
        toggleSound();
        animateButton(soundButton);
    });

    // 🏆 Обработчик кнопки достижений
    achievementsButton.addEventListener("click", function () {
        toggleButton(achievementsButton);
        animateButton(achievementsButton);
    });

    // 🌍 Обработчик кнопки перевода
    translationButton.addEventListener("click", function () {
        toggleButton(translationButton);
        animateButton(translationButton);
    });

    // 💡 Обработчик кнопки "Айкович"
    leftButton.addEventListener("click", function () {
        toggleButton(leftButton);
    });

    // ℹ Открытие и закрытие модального окна информации
    infoButton.addEventListener("click", function () {
        infoModal.style.display = infoModal.style.display === "block" ? "none" : "block";
    });
    closeInfo.addEventListener("click", function () {
        infoModal.style.display = "none";
    });

    // ❓ Открытие и закрытие доп. информации (FAQ)
    extraInfoButton.addEventListener("click", function () {
        extraInfoModal.style.display = extraInfoModal.style.display === "block" ? "none" : "block";
    });
    closeExtraInfo.addEventListener("click", function () {
        extraInfoModal.style.display = "none";
    });

    // 🔄 Закрытие окон при клике вне их области
    window.addEventListener("click", function (event) {
        if (event.target === infoModal) {
            infoModal.style.display = "none";
        }
        if (event.target === extraInfoModal) {
            extraInfoModal.style.display = "none";
        }
    });

    // 🎶 Запуск музыки
    audio.muted = isMuted;
    audio.play().catch(error => console.warn("Автозапуск звука заблокирован:", error));

    updateSoundButton(); // Обновление состояния кнопки звука
});

// ✅ **Игровая логика** 🎮

// Получаем элементы
const menu = document.getElementById("menu");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 📌 Функция старта игры
function startGame() {
    console.log("Игра запущена!");

    // ❌ Скрываем меню и нижнюю панель
    menu.style.display = "none";
    document.querySelector(".bottom-bar").style.display = "none";

    // ✅ Показываем саму игру
    canvas.style.display = "block";
    initGame();
}

// 📏 Установка размеров Canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 🎮 Игрок с плавным движением
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    color: "#FFD700",
    velocityX: 0,
    velocityY: 0,
    accelerationX: 0,
    gravity: 0.4,
    jumpPower: -12,
    friction: 0.9, // Трение (чтобы не скользил слишком долго)
    speed: 5 // Скорость передвижения
};

// 🏗 Массив платформ
const platforms = [];

// 🔄 Генерация новых платформ (правильная расстановка)
function generatePlatform(yOffset = 100) {
    let lastPlatform = platforms[platforms.length - 1] || { x: canvas.width / 2, y: canvas.height };

    let newPlatform = {
        x: lastPlatform.x + (Math.random() * 240 - 120),
        y: lastPlatform.y - yOffset,
        width: 120,
        height: 20
    };

    // 📌 Ограничиваем появление платформ по бокам экрана
    if (newPlatform.x < 50) newPlatform.x = 50;
    if (newPlatform.x + newPlatform.width > canvas.width - 50) newPlatform.x = canvas.width - 50 - newPlatform.width;

    platforms.push(newPlatform);
}

// 🔄 Генерация стартовых платформ
for (let i = 0; i < 10; i++) {
    generatePlatform(100);
}

// 📌 Создаем **главную стартовую платформу** под игроком
const startPlatform = {
    x: canvas.width / 2 - 60,
    y: canvas.height - 50,
    width: 120,
    height: 20,
};
platforms.push(startPlatform);

// 🚀 Обеспечиваем, что игрок **стоит на платформе** при старте
player.y = startPlatform.y - player.height;

// 🎨 Отрисовка платформ
function drawPlatforms() {
    ctx.fillStyle = "#DAA520";
    platforms.forEach((p) => ctx.fillRect(p.x, p.y, p.width, p.height));
}

// 🔄 Логика прыжков и движения платформ
function update() {
    updatePhysics(); // ✅ Добавили физику движения
    checkCollision(); // ✅ Проверяем столкновения с платформами

    // 📌 Если игрок выше середины экрана – **двигаем платформы вниз**
    if (player.y < canvas.height / 2 && player.velocityY < 0) {
        player.y = canvas.height / 2;
        platforms.forEach((p) => {
            p.y += Math.abs(player.velocityY) * 1.2;
        });
    }

    // 🎯 Генерация новых платформ **вверху**, если игрок поднимается выше
    while (platforms[platforms.length - 1].y > 0) {
        generatePlatform(100);
    }

    // ❌ Удаление старых платформ, которые **ушли за экран**
    while (platforms[0].y > canvas.height) {
        platforms.shift();
    }

    draw();
    requestAnimationFrame(update);
}

// ✅ Обновление физики движения
function updatePhysics() {
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // 🎯 Применяем трение для плавности
    player.velocityX *= player.friction;
    player.x += player.velocityX;

    // 🔄 Ограничения по краям экрана
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// ✅ Вызов `checkCollision()` (проверяем, стоит ли игрок на платформе)
function checkCollision() {
    for (let p of platforms) {
        if (
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + p.height &&
            player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.velocityY > 0
        ) {
            player.y = p.y - player.height;
            player.velocityY = player.jumpPower * 1.1; // Добавляем больше мощности прыжка
        }
    }
}

// 🎨 Функция отрисовки объектов
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms(); // Отрисовываем платформы

    // 🎮 Рисуем игрока
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// 🎯 Запуск игры только после нажатия Play
function initGame() {
    update();
}

// 🔄 Обработка нажатий клавиш
document.addEventListener("keydown", (event) => {
    if (event.code === "ArrowLeft") {
        player.velocityX = -player.speed; // Теперь скорость выше
    }
    if (event.code === "ArrowRight") {
        player.velocityX = player.speed; // Теперь скорость выше
    }
});

// 🎯 Улучшенная инерция (чтобы игрок не тормозил моментально)
document.addEventListener("keyup", (event) => {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
        player.velocityX *= 0.5; // Плавное замедление
    }
});













