// Konfigurasi dan Variabel Global
let currentCityId = '1301'; // Default: Jakarta
let is24HourFormat = true;
let prayerTimes = {};
let currentTime = new Date();
let timezoneOffset = 7; // Default WIB
let currentTheme = 'auto';

// Daftar kota Indonesia (ID dari API MyQuran)
const cities = {
    '1301': { name: 'Jakarta', timezone: 'WIB' },
    '1871': { name: 'Bandung', timezone: 'WIB' },
    '3173': { name: 'Surabaya', timezone: 'WIB' },
    '2171': { name: 'Medan', timezone: 'WIB' },
    '5171': { name: 'Denpasar', timezone: 'WITA' },
    '7371': { name: 'Makassar', timezone: 'WITA' },
    '9271': { name: 'Jayapura', timezone: 'WIT' }
};

// Quote Islami
const islamicQuotes = [
    "Sesungguhnya shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman. (QS. An-Nisa: 103)",
    "Dan dirikanlah shalat, tunaikanlah zakat, dan ruku'lah beserta orang-orang yang ruku'. (QS. Al-Baqarah: 43)",
    "Maka bersabarlah kamu atas apa yang mereka katakan dan bertasbihlah dengan memuji Tuhanmu sebelum terbit matahari dan sebelum terbenam. (QS. Qaf: 39)",
    "Sesungguhnya beruntunglah orang yang membersihkan diri (dengan beriman). (QS. Al-A'la: 14)",
    "Dan sebutlah nama Tuhanmu pada (waktu) pagi dan petang. (QS. Al-Insan: 25)",
    "Maka apabila kamu telah menyelesaikan shalat(mu), ingatlah Allah di waktu berdiri, di waktu duduk dan di waktu berbaring. (QS. An-Nisa: 103)",
    "Hai orang-orang yang beriman, jadikanlah sabar dan shalat sebagai penolongmu, sesungguhnya Allah beserta orang-orang yang sabar. (QS. Al-Baqarah: 153)",
    "Dan mintalah pertolongan (kepada Allah) dengan sabar dan shalat. (QS. Al-Baqarah: 45)"
];

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeParticles();
    setInterval(updateClock, 1000);
    setInterval(checkPrayerTime, 60000); // Cek setiap menit
    setInterval(updateTheme, 300000); // Update tema setiap 5 menit
});

// Inisialisasi Aplikasi
function initializeApp() {
    setupEventListeners();
    detectUserLocation();
    loadPrayerTimes();
    updateQuote();
    updateTheme();
}

// Setup Event Listeners
function setupEventListeners() {
    // Toggle format jam
    document.getElementById('toggle-format').addEventListener('click', toggleTimeFormat);
    
    // Fullscreen
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
    
    // Toggle tema
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Pilih kota
    document.getElementById('city-selector').addEventListener('change', function(e) {
        currentCityId = e.target.value;
        updateLocationInfo();
        loadPrayerTimes();
    });
    
    // Lokasi otomatis
    document.getElementById('auto-location').addEventListener('click', detectUserLocation);
    
    // Tutup notifikasi
    document.getElementById('close-notification').addEventListener('click', function() {
        document.getElementById('prayer-notification').classList.add('hidden');
    });
}

// Inisialisasi Partikel Background
function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#00FFF0" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#00FFF0",
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                }
            },
            retina_detect: true
        });
    }
}

// Deteksi Lokasi Pengguna
function detectUserLocation() {
    if (navigator.geolocation) {
        document.getElementById('auto-location').classList.add('loading');
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Estimasi zona waktu berdasarkan longitude
                timezoneOffset = Math.floor(lng / 15);
                if (timezoneOffset < 6) {
                    currentCityId = '1301'; // Jakarta (WIB)
                } else if (timezoneOffset < 8) {
                    currentCityId = '5171'; // Denpasar (WITA)
                } else {
                    currentCityId = '9271'; // Jayapura (WIT)
                }
                
                document.getElementById('city-selector').value = currentCityId;
                updateLocationInfo();
                loadPrayerTimes();
                document.getElementById('auto-location').classList.remove('loading');
            },
            error => {
                console.log('Geolocation error:', error);
                // Fallback ke lokasi default
                currentCityId = '1301';
                updateLocationInfo();
                document.getElementById('auto-location').classList.remove('loading');
                
                // Tampilkan pesan error
                showTemporaryNotification('Lokasi otomatis gagal, menggunakan lokasi default');
            }
        );
    } else {
        showTemporaryNotification('Browser tidak mendukung deteksi lokasi otomatis');
    }
}

// Update Informasi Lokasi
function updateLocationInfo() {
    const city = cities[currentCityId];
    if (city) {
        document.getElementById('location-name').textContent = city.name;
        document.getElementById('timezone').textContent = city.timezone;
        
        // Update timezone offset berdasarkan kota
        if (city.timezone === 'WITA') timezoneOffset = 8;
        else if (city.timezone === 'WIT') timezoneOffset = 9;
        else timezoneOffset = 7;
    }
}

// Update Jam Digital
function updateClock() {
    currentTime = new Date();
    
    // Sesuaikan dengan timezone Indonesia
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const indonesiaTime = new Date(utc + (3600000 * timezoneOffset));
    
    let hours = indonesiaTime.getHours();
    const minutes = indonesiaTime.getMinutes().toString().padStart(2, '0');
    const seconds = indonesiaTime.getSeconds().toString().padStart(2, '0');
    
    // Format 12/24 jam
    let displayHours = hours;
    if (!is24HourFormat) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        displayHours = hours.toString().padStart(2, '0');
        document.getElementById('format-text').textContent = '12 JAM';
    } else {
        document.getElementById('format-text').textContent = '24 JAM';
    }
    
    // Update tampilan jam
    document.querySelector('.time-hours').textContent = displayHours.toString().padStart(2, '0');
    document.querySelector('.time-minutes').textContent = minutes;
    document.querySelector('.time-seconds').textContent = seconds;
    
    // Update tanggal
    updateDates(indonesiaTime);
    
    // Efek kilau setiap detik
    document.getElementById('digital-clock').classList.add('shine');
    setTimeout(() => {
        document.getElementById('digital-clock').classList.remove('shine');
    }, 500);
}

// Update Tanggal Masehi dan Hijriah
function updateDates(date) {
    // Tanggal Masehi
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const gregorianDate = date.toLocaleDateString('id-ID', options);
    document.getElementById('gregorian-date').textContent = gregorianDate;
    
    // Tanggal Hijriah (simulasi - dalam implementasi nyata gunakan library/conversion)
    const hijriDate = calculateHijriDate(date);
    document.getElementById('hijri-date').textContent = hijriDate;
}

// Kalkulasi Tanggal Hijriah (simplified)
function calculateHijriDate(gregorianDate) {
    // Ini adalah konversi sederhana, untuk akurasi gunakan library seperti hijri-date
    const startIslamic = new Date(622, 6, 16); // 1 Muharram 1 H
    const diffTime = gregorianDate - startIslamic;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const islamicYear = Math.floor(diffDays / 354.367) + 1;
    const islamicMonth = Math.floor((diffDays % 354.367) / 29.53) + 1;
    const islamicDay = Math.floor((diffDays % 354.367) % 29.53) + 1;
    
    const months = ['Muharram', 'Safar', 'Rabiul Awal', 'Rabiul Akhir', 'Jumadil Awal', 
                   'Jumadil Akhir', 'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawal', 
                   'Dzulqa\'dah', 'Dzulhijjah'];
    
    return `${islamicDay} ${months[islamicMonth - 1]} ${islamicYear} H`;
}

// Toggle Format Waktu
function toggleTimeFormat() {
    is24HourFormat = !is24HourFormat;
    updateClock();
    
    // Efek visual pada tombol
    const button = document.getElementById('toggle-format');
    button.classList.add('shine');
    setTimeout(() => button.classList.remove('shine'), 1000);
}

// Toggle Fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Toggle Tema Manual
function toggleTheme() {
    const themes = ['auto', 'morning', 'afternoon', 'evening', 'night'];
    const currentIndex = themes.indexOf(currentTheme);
    currentTheme = themes[(currentIndex + 1) % themes.length];
    
    updateTheme();
    
    // Efek visual
    const button = document.getElementById('theme-toggle');
    button.classList.add('shine');
    setTimeout(() => button.classList.remove('shine'), 1000);
}

// Update Tema Berdasarkan Waktu
function updateTheme() {
    const hour = currentTime.getHours();
    let themeClass = 'night';
    
    if (currentTheme === 'auto') {
        if (hour >= 5 && hour < 10) themeClass = 'morning';
        else if (hour >= 10 && hour < 16) themeClass = 'afternoon';
        else if (hour >= 16 && hour < 19) themeClass = 'evening';
        else themeClass = 'night';
    } else {
        themeClass = currentTheme;
    }
    
    // Hapus semua kelas tema dan tambahkan yang baru
    document.body.className = '';
    document.body.classList.add(themeClass);
}

// Load Jadwal Sholat dari API
async function loadPrayerTimes() {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
    const apiUrl = `https://api.myquran.com/v1/sholat/jadwal/${currentCityId}/${today}`;
    
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status && data.data) {
            prayerTimes = data.data.jadwal;
            updatePrayerDisplay();
        } else {
            // Fallback data jika API error
            setFallbackPrayerTimes();
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        setFallbackPrayerTimes();
    }
}

// Update Tampilan Jadwal Sholat
function updatePrayerDisplay() {
    const prayers = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    
    prayers.forEach(prayer => {
        if (prayerTimes[prayer]) {
            document.getElementById(`${prayer}-time`).textContent = prayerTimes[prayer];
        }
    });
    
    // Update status sholat saat ini
    updateCurrentPrayerStatus();
}

// Data Fallback jika API error
function setFallbackPrayerTimes() {
    // Data contoh untuk Jakarta
    prayerTimes = {
        subuh: '04:30',
        dzuhur: '12:00',
        ashar: '15:30',
        maghrib: '18:15',
        isya: '19:30'
    };
    updatePrayerDisplay();
    
    showTemporaryNotification('Menggunakan data sholat offline');
}

// Update Status Sholat Saat Ini
function updateCurrentPrayerStatus() {
    const now = currentTime;
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
    
    const prayers = [
        { name: 'subuh', time: prayerTimes.subuh },
        { name: 'dzuhur', time: prayerTimes.dzuhur },
        { name: 'ashar', time: prayerTimes.ashar },
        { name: 'maghrib', time: prayerTimes.maghrib },
        { name: 'isya', time: prayerTimes.isya }
    ];
    
    // Reset semua status
    prayers.forEach(prayer => {
        const card = document.getElementById(prayer.name);
        const status = document.getElementById(`${prayer.name}-status`);
        
        card.classList.remove('active');
        status.textContent = '';
    });
    
    // Cari sholat yang sedang aktif
    for (let i = 0; i < prayers.length; i++) {
        const currentPrayer = prayers[i];
        const nextPrayer = prayers[i + 1];
        
        if (currentTimeStr >= currentPrayer.time && 
            (!nextPrayer || currentTimeStr < nextPrayer.time)) {
            
            const card = document.getElementById(currentPrayer.name);
            const status = document.getElementById(`${currentPrayer.name}-status`);
            
            card.classList.add('active');
            status.textContent = 'WAKTU SHOLAT SAAT INI';
            status.style.color = '#FFD366';
            
            break;
        }
    }
}

// Cek Waktu Sholat untuk Notifikasi
function checkPrayerTime() {
    const now = new Date();
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
    
    const prayers = [
        { name: 'Subuh', time: prayerTimes.subuh },
        { name: 'Dzuhur', time: prayerTimes.dzuhur },
        { name: 'Ashar', time: prayerTimes.ashar },
        { name: 'Maghrib', time: prayerTimes.maghrib },
        { name: 'Isya', time: prayerTimes.isya }
    ];
    
    prayers.forEach(prayer => {
        if (currentTimeStr === prayer.time) {
            showPrayerNotification(prayer.name, prayer.time);
        }
    });
}

// Tampilkan Notifikasi Waktu Sholat
function showPrayerNotification(prayerName, prayerTime) {
    const notification = document.getElementById('prayer-notification');
    const message = document.getElementById('notification-message');
    
    message.textContent = `Sudah masuk waktu ${prayerName} - ${prayerTime} ${cities[currentCityId].timezone}`;
    notification.classList.remove('hidden');
    
    // Play sound notification
    playAdhanSound();
    
    // Otomatis tutup setelah 30 detik
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 30000);
}

// Notifikasi Sementara
function showTemporaryNotification(message) {
    // Buat elemen notifikasi sementara
    const tempNotification = document.createElement('div');
    tempNotification.className = 'notification';
    tempNotification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="notification-text">
                <p>${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(tempNotification);
    
    // Animasi masuk
    setTimeout(() => {
        tempNotification.style.opacity = '1';
        tempNotification.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
        tempNotification.style.opacity = '0';
        tempNotification.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            document.body.removeChild(tempNotification);
        }, 300);
    }, 3000);
}

// Putar Suara Adzan
function playAdhanSound() {
    const audio = document.getElementById('adhan-sound');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Update Quote Islami
function updateQuote() {
    const randomQuote = islamicQuotes[Math.floor(Math.random() * islamicQuotes.length)];
    document.getElementById('islamic-quote').textContent = randomQuote;
    
    // Update quote setiap 1 jam
    setTimeout(updateQuote, 3600000);
}

// Handle Visibility Change (saat tab tidak aktif)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Tab menjadi aktif, update data
        updateClock();
        loadPrayerTimes();
    }
});

// Handle Online/Offline Status
window.addEventListener('online', function() {
    loadPrayerTimes();
    showTemporaryNotification('Koneksi pulih, memperbarui data sholat');
});

window.addEventListener('offline', function() {
    showTemporaryNotification('Koneksi terputus, menggunakan data offline');
});
