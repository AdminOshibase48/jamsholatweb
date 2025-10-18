// Konfigurasi dan Variabel Global
let currentCityId = '';
let prayerTimes = {};
let currentTime = new Date();
let timezoneOffset = 7; // Default WIB
let allCities = [];

// Background images untuk masjid
const backgroundImages = {
    '1': 'https://cdn.pixabay.com/photo/2018/09/09/14/32/u-a-e-3664712_1280.jpg',
    '2': 'https://cdn.pixabay.com/photo/2020/02/20/03/24/nabawi-mosque-4863805_960_720.jpg'
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

// Data fallback untuk setiap kota
const fallbackPrayerTimes = {
    '1301': { // Jakarta
        subuh: '04:30', terbit: '05:45', dzuhur: '11:55', 
        ashar: '15:10', maghrib: '18:05', isya: '19:20'
    },
    '1871': { // Bandung
        subuh: '04:25', terbit: '05:40', dzuhur: '11:50', 
        ashar: '15:05', maghrib: '18:00', isya: '19:15'
    }
};

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setInterval(updateClock, 1000);
    setInterval(checkPrayerTime, 60000); // Cek setiap menit
});

// Inisialisasi Aplikasi
async function initializeApp() {
    setupEventListeners();
    await loadCities();
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
        if (currentCityId) {
            loadPrayerTimes();
        }
    });
    
    // Tutup notifikasi
    document.getElementById('close-notification').addEventListener('click', function() {
        document.getElementById('prayer-notification').classList.add('hidden');
    });
}

// Load Daftar Kota dari API
async function loadCities() {
    try {
        const response = await fetch('https://api.myquran.com/v2/sholat/kota/semua');
        
        if (response.ok) {
            const data = await response.json();
            allCities = data.data;
            
            // Update dropdown kota
            const citySelector = document.getElementById('city-selector');
            citySelector.innerHTML = '<option value="">Pilih Kota</option>';
            
            allCities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.lokasi;
                citySelector.appendChild(option);
            });
            
            // Set default ke Jakarta jika ada
            const jakarta = allCities.find(city => city.lokasi === 'Jakarta');
            if (jakarta) {
                currentCityId = jakarta.id;
                citySelector.value = jakarta.id;
                updateLocationInfo();
                loadPrayerTimes();
            }
        } else {
            throw new Error('Gagal memuat daftar kota');
        }
    } catch (error) {
        console.error('Error loading cities:', error);
        document.getElementById('city-selector').innerHTML = '<option value="">Error loading cities</option>';
    }
}

// Update Informasi Lokasi
function updateLocationInfo() {
    const city = allCities.find(c => c.id == currentCityId);
    if (city) {
        document.getElementById('location-name').textContent = city.lokasi;
        
        // Tentukan timezone berdasarkan longitude (sederhana)
        const lon = parseFloat(city.koordinat.lon);
        if (lon >= 115 && lon < 130) {
            document.getElementById('timezone').textContent = 'WITA';
            timezoneOffset = 8;
        } else if (lon >= 130) {
            document.getElementById('timezone').textContent = 'WIT';
            timezoneOffset = 9;
        } else {
            document.getElementById('timezone').textContent = 'WIB';
            timezoneOffset = 7;
        }
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
    
    // Tanggal Hijriah (simplified)
    const hijriDate = calculateHijriDate(now);
    document.getElementById('hijri-date').textContent = hijriDate;
}

// Kalkulasi Tanggal Hijriah
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
    if (!currentCityId) return;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const date = `${year}/${month}/${day}`;
    
    const apiUrl = `https://api.myquran.com/v2/sholat/jadwal/${currentCityId}/${date}`;
    
    try {
        console.log('Mengambil data dari:', apiUrl);
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.status && data.data && data.data.jadwal) {
                prayerTimes = data.data.jadwal;
                updatePrayerDisplay();
                console.log('Data sholat berhasil diambil:', prayerTimes);
                return;
            }
        }
        
        // Jika gagal, gunakan fallback
        throw new Error('API tidak merespon');
        
    } catch (error) {
        console.log('API gagal, menggunakan data fallback:', error);
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

// Data Fallback
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
    
    const city = allCities.find(c => c.id == currentCityId);
    const timezone = city ? (timezoneOffset === 8 ? 'WITA' : timezoneOffset === 9 ? 'WIT' : 'WIB') : 'WIB';
    
    message.textContent = `Sudah masuk waktu ${prayerName} - ${prayerTime} ${timezone}`;
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
