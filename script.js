// Konfigurasi dan Variabel Global
let currentCityId = '1301'; // Default: Jakarta
let prayerTimes = {};
let currentTime = new Date();
let timezoneOffset = 7; // Default WIB

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

// Background images untuk masjid
const backgroundImages = {
    '1': 'https://images.unsplash.com/photo-1543362427-5afb5c4b2c43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    '2': 'https://images.unsplash.com/photo-1580330510113-812f89ea3173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    '3': 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80',
    '4': 'https://images.unsplash.com/photo-1566379078573-26ae3b236fa4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
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
            setFallbackPrayerTimes();
        }
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        setFallbackPrayerTimes();
    }
}

// Update Tampilan Jadwal Sholat
function updatePrayerDisplay() {
    const prayers = ['subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    
    prayers.forEach(prayer => {
        if (prayerTimes[prayer]) {
            document.getElementById(`${prayer}-time`).textContent = prayerTimes[prayer];
        }
    });
    
    updateCurrentPrayerStatus();
}

// Data Fallback jika API error
function setFallbackPrayerTimes() {
    prayerTimes = {
        subuh: '04:23',
        terbit: '05:38',
        dzuhur: '11:56',
        ashar: '15:10',
        maghrib: '18:07',
        isya: '19:19'
    };
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
        loadPrayerTimes();
    }
});
