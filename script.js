// Konfigurasi dan Variabel Global
let currentCityId = '1301'; // Default: Jakarta
let prayerTimes = {};
let currentTime = new Date();
let timezoneOffset = 7; // Default WIB
let apiRetryCount = 0;
const MAX_RETRIES = 3;

// Daftar kota Indonesia dengan multiple API endpoints
const cities = {
    '1301': { 
        name: 'Jakarta', 
        timezone: 'WIB',
        endpoints: [
            // Multiple API endpoints untuk redundancy
            `https://api.myquran.com/v1/sholat/jadwal/1301/${getTodayDate()}`,
            `https://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia&method=2`,
            `https://api.banghasan.com/sholat/format/json/jadwal/kota/1301/tanggal/${getTodayDate()}`
        ]
    },
    '1871': { 
        name: 'Bandung', 
        timezone: 'WIB',
        endpoints: [
            `https://api.myquran.com/v1/sholat/jadwal/1871/${getTodayDate()}`,
            `https://api.aladhan.com/v1/timingsByCity?city=Bandung&country=Indonesia&method=2`
        ]
    },
    '3173': { 
        name: 'Surabaya', 
        timezone: 'WIB',
        endpoints: [
            `https://api.myquran.com/v1/sholat/jadwal/3173/${getTodayDate()}`,
            `https://api.aladhan.com/v1/timingsByCity?city=Surabaya&country=Indonesia&method=2`
        ]
    },
    '2171': { 
        name: 'Medan', 
        timezone: 'WIB',
        endpoints: [
            `https://api.myquran.com/v1/sholat/jadwal/2171/${getTodayDate()}`,
            `https://api.aladhan.com/v1/timingsByCity?city=Medan&country=Indonesia&method=2`
        ]
    },
    '5171': { 
        name: 'Denpasar', 
        timezone: 'WITA',
        endpoints: [
            `https://api.myquran.com/v1/sholat/jadwal/5171/${getTodayDate()}`,
            `https://api.aladhan.com/v1/timingsByCity?city=Denpasar&country=Indonesia&method=2`
        ]
    },
    '7371': { 
        name: 'Makassar', 
        timezone: 'WITA',
        endpoints: [
            `https://api.myquran.com/v1/sholat/jadwal/7371/${getTodayDate()}`,
            `https://api.aladhan.com/v1/timingsByCity?city=Makassar&country=Indonesia&method=2`
        ]
    },
    '9271': { 
        name: 'Jayapura', 
        timezone: 'WIT',
        endpoints: [
            `https://api.myquran.com/v1/sholat/jadwal/9271/${getTodayDate()}`,
            `https://api.aladhan.com/v1/timingsByCity?city=Jayapura&country=Indonesia&method=2`
        ]
    }
};

// Background images untuk masjid
const backgroundImages = {
    '1': 'https://images.unsplash.com/photo-1543362427-5afb5c4b2c43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    '2': 'https://images.unsplash.com/photo-1580330510113-812f89ea3173?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    '3': 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80',
    '4': 'https://images.unsplash.com/photo-1566379078573-26ae3b236fa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
};

// Quote Islami
const islamicQuotes = [
    "Sebaik-baik kalian adalah yang belajar Al-Qur'an dan mengajarkannya.",
    "Sesungguhnya shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.",
    "Barangsiapa yang mengerjakan shalat dengan ikhlas karena Allah, maka shalat itu akan menjadi cahaya baginya.",
    "Shalat adalah tiang agama, barangsiapa mendirikannya maka ia mendirikan agama, dan barangsiapa meninggalkannya maka ia meruntuhkan agama.",
    "Amal yang pertama kali dihisab pada hari kiamat adalah shalat.",
    "Shalat itu cahaya, sedekah itu bukti, sabar itu sinar, dan Al-Qur'an itu hujjah untukmu atau terhadapmu."
];

// Data fallback untuk setiap kota (jika semua API gagal)
const fallbackPrayerTimes = {
    '1301': { // Jakarta
        subuh: '04:30', terbit: '05:45', dzuhur: '11:55', 
        ashar: '15:15', maghrib: '18:10', isya: '19:25'
    },
    '1871': { // Bandung
        subuh: '04:25', terbit: '05:40', dzuhur: '11:50', 
        ashar: '15:10', maghrib: '18:05', isya: '19:20'
    },
    '3173': { // Surabaya
        subuh: '04:15', terbit: '05:30', dzuhur: '11:40', 
        ashar: '15:00', maghrib: '17:55', isya: '19:10'
    },
    '2171': { // Medan
        subuh: '05:00', terbit: '06:15', dzuhur: '12:25', 
        ashar: '15:45', maghrib: '18:40', isya: '19:55'
    },
    '5171': { // Denpasar (WITA)
        subuh: '05:00', terbit: '06:15', dzuhur: '12:25', 
        ashar: '15:45', maghrib: '18:40', isya: '19:55'
    },
    '7371': { // Makassar (WITA)
        subuh: '04:45', terbit: '06:00', dzuhur: '12:10', 
        ashar: '15:30', maghrib: '18:25', isya: '19:40'
    },
    '9271': { // Jayapura (WIT)
        subuh: '04:30', terbit: '05:45', dzuhur: '11:55', 
        ashar: '15:15', maghrib: '18:10', isya: '19:25'
    }
};

// Helper function untuk format tanggal
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setInterval(updateClock, 1000);
    setInterval(checkPrayerTime, 60000); // Cek setiap menit
});

// Inisialisasi Aplikasi
function initializeApp() {
    setupEventListeners();
    updateLocationInfo();
    loadPrayerTimes();
    updateQuote();
    updateDates();
}

// Setup Event Listeners
function setupEventListeners() {
    // Pilih kota
    document.getElementById('city-selector').addEventListener('change', function(e) {
        currentCityId = e.target.value;
        updateLocationInfo();
        loadPrayerTimes();
    });
    
    // Pilih background
    document.getElementById('background-selector').addEventListener('change', function(e) {
        changeBackground(e.target.value);
    });
    
    // Fullscreen
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
    
    // Refresh data
    document.getElementById('refresh-btn').addEventListener('click', function() {
        loadPrayerTimes();
    });
    
    // Tutup notifikasi
    document.getElementById('close-notification').addEventListener('click', function() {
        document.getElementById('prayer-notification').classList.add('hidden');
    });
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

// Update Jam
function updateClock() {
    currentTime = new Date();
    
    // Sesuaikan dengan timezone Indonesia
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const indonesiaTime = new Date(utc + (3600000 * timezoneOffset));
    
    const hours = indonesiaTime.getHours().toString().padStart(2, '0');
    const minutes = indonesiaTime.getMinutes().toString().padStart(2, '0');
    const seconds = indonesiaTime.getSeconds().toString().padStart(2, '0');
    
    // Update jam digital
    document.getElementById('digital-hours').textContent = hours;
    document.getElementById('digital-minutes').textContent = minutes;
    document.getElementById('digital-seconds').textContent = seconds;
    
    // Update jam analog
    updateAnalogClock(indonesiaTime);
    
    // Update status sholat setiap menit
    if (seconds === '00') {
        updateCurrentPrayerStatus();
    }
}

// Update Jam Analog
function updateAnalogClock(time) {
    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours() % 12;
    
    const secondDegrees = ((seconds / 60) * 360) + 90;
    const minuteDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6) + 90;
    const hourDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30) + 90;
    
    document.getElementById('second-hand').style.transform = `translateX(-50%) rotate(${secondDegrees}deg)`;
    document.getElementById('minute-hand').style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`;
    document.getElementById('hour-hand').style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`;
}

// Update Tanggal
function updateDates() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const gregorianDate = now.toLocaleDateString('id-ID', options);
    document.getElementById('today-date').textContent = gregorianDate;
    
    // Tanggal Hijriah (simulasi)
    const hijriDate = calculateHijriDate(now);
    document.getElementById('hijri-date').textContent = hijriDate;
}

// Kalkulasi Tanggal Hijriah (simplified)
function calculateHijriDate(gregorianDate) {
    const startIslamic = new Date(622, 6, 16);
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

// Ganti Background
function changeBackground(backgroundId) {
    const backgroundImage = backgroundImages[backgroundId];
    if (backgroundImage) {
        document.getElementById('background-image').style.backgroundImage = `url('${backgroundImage}')`;
    }
}

// Load Jadwal Sholat dengan multiple API fallback
async function loadPrayerTimes() {
    showLoading(true);
    apiRetryCount = 0;
    
    const city = cities[currentCityId];
    if (!city) {
        setFallbackPrayerTimes();
        showLoading(false);
        return;
    }

    // Coba semua endpoints sampai berhasil
    for (let endpoint of city.endpoints) {
        try {
            console.log(`Mencoba API: ${endpoint}`);
            const success = await tryApiEndpoint(endpoint);
            if (success) {
                showLoading(false);
                return;
            }
        } catch (error) {
            console.log(`API ${endpoint} gagal:`, error);
            continue;
        }
    }

    // Jika semua API gagal, gunakan fallback
    console.log('Semua API gagal, menggunakan data fallback');
    setFallbackPrayerTimes();
    showLoading(false);
    showTemporaryNotification('Menggunakan data sholat offline');
}

// Coba satu endpoint API
async function tryApiEndpoint(url) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different API response formats
        if (url.includes('myquran.com')) {
            // Format MyQuran v1
            if (data.status && data.data && data.data.jadwal) {
                prayerTimes = data.data.jadwal;
                updatePrayerDisplay();
                console.log('MyQuran API berhasil:', prayerTimes);
                return true;
            }
        } else if (url.includes('aladhan.com')) {
            // Format Aladhan
            if (data.data && data.data.timings) {
                const timings = data.data.timings;
                prayerTimes = {
                    subuh: timings.Fajr,
                    terbit: timings.Sunrise,
                    dzuhur: timings.Dhuhr,
                    ashar: timings.Asr,
                    maghrib: timings.Maghrib,
                    isya: timings.Isha
                };
                updatePrayerDisplay();
                console.log('Aladhan API berhasil:', prayerTimes);
                return true;
            }
        } else if (url.includes('banghasan.com')) {
            // Format Banghasan
            if (data.jadwal && data.jadwal.data) {
                prayerTimes = data.jadwal.data;
                updatePrayerDisplay();
                console.log('Banghasan API berhasil:', prayerTimes);
                return true;
            }
        }
        
        throw new Error('Format response tidak dikenali');
        
    } catch (error) {
        console.error(`Error dengan endpoint ${url}:`, error);
        return false;
    }
}

// Update Tampilan Jadwal Sholat
function updatePrayerDisplay() {
    const prayers = ['subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    
    prayers.forEach(prayer => {
        if (prayerTimes[prayer]) {
            // Format waktu menjadi HH:MM
            let time = prayerTimes[prayer];
            if (time.includes(' ')) {
                time = time.split(' ')[0]; // Ambil hanya bagian waktu jika ada timezone
            }
            if (time.length === 4) {
                time = '0' + time; // Tambah 0 di depan jika hanya 4 digit
            }
            document.getElementById(`${prayer}-time`).textContent = time;
        }
    });
    
    updateCurrentPrayerStatus();
}

// Data Fallback jika semua API error
function setFallbackPrayerTimes() {
    prayerTimes = fallbackPrayerTimes[currentCityId] || fallbackPrayerTimes['1301'];
    updatePrayerDisplay();
}

// Update Status Sholat Saat Ini
function updateCurrentPrayerStatus() {
    const now = currentTime;
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
    
    const prayers = [
        { name: 'subuh', time: prayerTimes.subuh },
        { name: 'terbit', time: prayerTimes.terbit },
        { name: 'dzuhur', time: prayerTimes.dzuhur },
        { name: 'ashar', time: prayerTimes.ashar },
        { name: 'maghrib', time: prayerTimes.maghrib },
        { name: 'isya', time: prayerTimes.isya }
    ];
    
    // Reset semua status
    prayers.forEach(prayer => {
        const item = document.getElementById(prayer.name);
        const status = document.getElementById(`${prayer.name}-status`);
        
        item.classList.remove('active');
        status.textContent = '';
    });
    
    // Cari sholat yang sedang aktif
    for (let i = 0; i < prayers.length; i++) {
        const currentPrayer = prayers[i];
        const nextPrayer = prayers[i + 1];
        
        if (currentTimeStr >= currentPrayer.time && 
            (!nextPrayer || currentTimeStr < nextPrayer.time)) {
            
            const item = document.getElementById(currentPrayer.name);
            const status = document.getElementById(`${currentPrayer.name}-status`);
            
            item.classList.add('active');
            status.textContent = 'WAKTU SHOLAT SAAT INI';
            
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
    
    // Otomatis tutup setelah 30 detik
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 30000);
}

// Tampilkan/Sembunyikan Loading
function showLoading(show) {
    const loader = document.getElementById('loading-indicator');
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
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
            if (document.body.contains(tempNotification)) {
                document.body.removeChild(tempNotification);
            }
        }, 300);
    }, 3000);
}

// Update Quote Islami
function updateQuote() {
    const randomQuote = islamicQuotes[Math.floor(Math.random() * islamicQuotes.length)];
    document.getElementById('quote-text').textContent = `"${randomQuote}"`;
    
    // Update quote setiap 1 jam
    setTimeout(updateQuote, 3600000);
}

// Handle Visibility Change
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateClock();
        // Refresh data setiap kali tab aktif kembali
        loadPrayerTimes();
    }
});

// Handle Online/Offline Status
window.addEventListener('online', function() {
    showTemporaryNotification('Koneksi pulih, memperbarui data sholat');
    loadPrayerTimes();
});

window.addEventListener('offline', function() {
    showTemporaryNotification('Koneksi terputus, menggunakan data offline');
});
