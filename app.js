const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "F8_PLAYER";

const root = document.querySelector(':root');
const player = $(".player");
const cd = $(".cd");
const heading = $("header h2");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const playBtn = $(".btn-toggle-play");
const progress = $("#progress");
const nextBtn = $(".btn-next");
const prevBtn = $(".btn-prev");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const playlist = $(".playlist");

const app = {
	currentIndex: 0,
	isPlaying: false,
	isRandom: false,
	isRepeat: false,
	config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
	songs: [
		{
			name: "たぶん",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Tabun.mp3",
			image: "./Yoasobi/img/Tabun.jpg",
		},
		{
			name: "夜に駆ける",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Yoru-ni-kakeru.mp3",
			image: "./Yoasobi/img/Yoru-ni-kakeru.jpg",
		},
		{
			name: "アンコール",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Ankoru.mp3",
			image: "./Yoasobi/img/Ankoru.jpg",
		},
		{
			name: "あの夢をなぞって",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Ano-yume-wo-nazotte.mp3",
			image: "./Yoasobi/img/Ano-yume-wo-nazotte.jpg",
		},
		{
			name: "群青",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Gunjou.mp3",
			image: "./Yoasobi/img/Gunjou.jpg",
		},
		{
			name: "ハルジオン",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Harujion.mp3",
			image: "./Yoasobi/img/Harujion.jpg",
		},
		{
			name: "怪物",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Kaibutsu.mp3",
			image: "./Yoasobi/img/Kaibutsu.jpg",
		},
		{
			name: "もしも命が描けたら",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Moshimo-inochiga-egaketara.mp3",
			image: "./Yoasobi/img/Moshimo-inochiga-egaketara.jpg",
		},
		{
			name: "三原色",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Sangenshoku.mp3",
			image: "./Yoasobi/img/Sangenshoku.jpg",
		},
		{
			name: "ツバメ",
			singer: "Yoasobi",
			path: "./Yoasobi/audio/Tsubame.mp3",
			image: "./Yoasobi/img/Tsubame.jpg",
		},
	],
	setConfig: function (key, value) {
		this.config[key] = value;
		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
	},
	render: function () {
		const htmls = this.songs.map((song, index) => {
			return `
            <div class="song ${
				index === this.currentIndex ? "active" : ""
			}" data-index="${index}">
                <div 
                    class="thumb" 
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `;
		});

		playlist.innerHTML = htmls.join("");
	},

	defineProperty: function () {
		Object.defineProperty(this, "currentSong", {
			get: function () {
				return this.songs[this.currentIndex];
			},
		});
	},

	handleEvents: function () {
		const cdWidth = cd.offsetWidth;
		const _this = this;

		// Xử lý CD quay và dừng
		const cdThumbAnimate = cdThumb.animate(
			[{ transform: "rotate(360deg)" }],
			{
				duration: 10000, // 10s
				iterations: Infinity,
			}
		);
		cdThumbAnimate.pause();

		// Xử lý phóng to thu nhỏ CD
		document.onscroll = function () {
			const scrollTop =
				window.scrollY ||
				document.body.scrollTop ||
				document.documentElement.scrollTop;
			const newCdWidth = cdWidth - scrollTop;

			cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
			cd.style.opacity = newCdWidth / cdWidth;
		};

		// Xử lý khi play
		playBtn.onclick = function () {
			if (_this.isPlaying) {
				audio.pause();
			} else {
				audio.play();
			}
		};

		// Khi bài hát được play
		audio.onplay = function () {
			_this.isPlaying = true;
			player.classList.add("playing");
			cdThumbAnimate.play();
		};

		// Khi bài hát bị pause
		audio.onpause = function () {
			_this.isPlaying = false;
			player.classList.remove("playing");
			cdThumbAnimate.pause();
		};

		// Khi tiến độ bài hát thay đổi
		audio.ontimeupdate = function () {
			if (audio.duration) {
                const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100);
                progress.value = progressPercent;
                // root.style.setProperty('--progress-width-current', `${progressPercent}%`);
			}
		};

		// Xử lý khi tua bài hát
		progress.oninput = function (e) {
			const seekTime = (audio.duration / 100) * e.target.value;
			audio.currentTime = seekTime;
		};

		// Khi next bài hát
		nextBtn.onclick = function () {
			if (_this.isRandom) {
				_this.playRandomSong();
			} else {
				_this.nextSong();
			}
			audio.play();
			_this.render();
			_this.scrollToActiveSong();
		};

		// Khi prev bài hát
		prevBtn.onclick = function () {
			if (_this.isRandom) {
				_this.playRandomSong();
			} else {
				_this.prevSong();
			}
			audio.play();
			_this.render();
			_this.scrollToActiveSong();
		};

		// Xử lý bật tắt random song
		randomBtn.onclick = function () {
			_this.isRandom = !_this.isRandom;
			_this.setConfig("isRandom", _this.isRandom);
			randomBtn.classList.toggle("active", _this.isRandom);
		};

		// Xử lý lặp lại một bài hát
		repeatBtn.onclick = function () {
			_this.isRepeat = !_this.isRepeat;
			_this.setConfig("isRepeat", _this.isRepeat);
			repeatBtn.classList.toggle("active", _this.isRepeat);
		};

		// Xử lí next song khi audio ended
		audio.onended = function () {
			if (_this.isRepeat) {
				audio.play();
			} else {
				nextBtn.click();
			}
		};

		// Lắng nghe hành vi click vào playlist
		playlist.onclick = function (e) {
			const songNode = e.target.closest(".song:not(.active)");
			if (songNode || e.target.closest(".option")) {
				// Xử lý khi click vào song
				if (songNode) {
					_this.currentIndex = Number(songNode.dataset.index);
					_this.loadCurrentSong();
					_this.render();
					audio.play();
				}

				// Xử lý khi click vào option
				if (e.target.closest(".option")) {
				}
			}
		};
	},

	scrollToActiveSong: function () {
		setTimeout(() => {
			if (this.currentIndex >= 3) {
				$(".song.active").scrollIntoView({
					behavior: "smooth",
					block: "nearest",
				});
			} else {
				$(".song.active").scrollIntoView({
					behavior: "smooth",
					block: "end",
				});
			}
		}, 200);
	},

	loadCurrentSong: function () {
		heading.textContent = this.currentSong.name;
		cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
		audio.src = this.currentSong.path;
	},

	loadConfig: function () {
		this.isRandom = this.config.isRandom;
		this.isRepeat = this.config.isRepeat;
	},

	nextSong: function () {
		this.currentIndex++;
		if (this.currentIndex >= this.songs.length) {
			this.currentIndex = 0;
		}
		this.loadCurrentSong();
	},

	prevSong: function () {
		this.currentIndex--;
		if (this.currentIndex < 0) {
			this.currentIndex = this.songs.length - 1;
		}
		this.loadCurrentSong();
	},

	playRandomSong: function () {
		let newIndex;
		do {
			newIndex = Math.floor(Math.random() * this.songs.length);
		} while (newIndex === this.currentIndex);
		this.currentIndex = newIndex;
		this.loadCurrentSong();
	},

	start: function () {
		// Gán cấu hình từ config vào ứng dụng
		this.loadConfig();
		// Định nghĩa các thuộc tính cho object
		this.defineProperty();

		// Lắng nghe và sử lý các sự kiện
		this.handleEvents();

		// Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
		this.loadCurrentSong();

		// Render playlist
		this.render();

        // Hiển thị trạng thái ban đầu của button repeat và random
		randomBtn.classList.toggle("active", this.isRandom);
		repeatBtn.classList.toggle("active", this.isRepeat);
	},
};

app.start();
