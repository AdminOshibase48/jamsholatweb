// Konfigurasi dan Variabel Global
let currentCityId = '1301'; // Default: Jakarta
let is24HourFormat = true;
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

// Quote Islami
const islamicQuotes = [
    "Sesungguhnya shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman. (QS. An-Nisa: 103)",
    "Dan dirikanlah shalat, tunaikanlah zakat, dan ruku'lah beserta orang-orang yang ruku'. (QS. Al-Baqarah: 43)",
    "Maka bersabarlah kamu atas apa yang mereka katakan dan bertasbihlah dengan memuji Tuhanmu sebelum terbit matahari dan sebelum terbenam. (QS. Qaf: 39)",
    "Sesungguhnya beruntunglah orang yang membersihkan diri (dengan beriman). (QS. Al-A'la: 14)",
    "Dan sebutlah nama Tuhanmu pada (waktu) pagi dan petang. (QS. Al-Insan: 25)",
    "Maka apabila kamu telah menyelesaikan shalat(mu), ingatlah Allah di waktu berdiri, di waktu duduk dan di waktu berbaring. (QS. An-Nisa: 103)"
];

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setInterval(updateClock, 1000);
    setInterval(checkPrayerTime, 60000); // Cek setiap menit
});

// Fungsi Inisialisasi Aplikasi
function initializeApp() {
    setupEventListeners();
    detectUserLocation();
    loadPrayerTimes();
    updateQuote();
}

// Setup Event Listeners
function setupEventListeners() {
    // Toggle format jam
    document.getElementById('toggle-format').addEventListener('click', toggleTimeFormat);
    
    // Fullscreen
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
    
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

// Deteksi Lokasi Pengguna
function detectUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                // Untuk demo, kita gunakan kota terdekat berdasarkan koordinat
                // Dalam implementasi nyata, gunakan reverse geocoding API
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Estimasi zona waktu berdasarkan longitude
                timezoneOffset = Math.floor(lng / 15);
                if (timezoneOffset < 6) timezoneOffset = 7; // WIB
                else if (timezoneOffset < 8) timezoneOffset = 8; // WITA
                else timezoneOffset = 9; // WIT
                
                updateLocationInfo();
            },
            error => {
                console.log('Geolocation error:', error);
                // Fallback ke lokasi default
                currentCityId = '1301';
                updateLocationInfo();
            }
        );
    }
}

// Update Informasi Lokasi
function updateLocationInfo() {
    const city = cities[currentCityId];
    document.getElementById('location-name').textContent = city.name;
    document.getElementById('timezone').textContent = city.timezone;
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
        document.getElementById('toggle-format').textContent = '12 JAM';
    } else {
        document.getElementById('toggle-format').textContent = '24 JAM';
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
    prayerTimes = {
        subuh: '04:30',
        dzuhur: '12:00',
        ashar: '15:30',
        maghrib: '18:15',
        isya: '19:30'
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
            status.style.color = '#FFD700';
            
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
    
    // Play sound notification (opsional)
    playAdhanSound();
}

// Putar Suara Adzan (opsional)
function playAdhanSound() {
    // Dalam implementasi nyata, tambahkan file audio adzan
    console.log('Adzan time!');
}

// Update Quote Islami
function updateQuote() {
    const randomQuote = islamicQuotes[Math.floor(Math.random() * islamicQuotes.length)];
    document.getElementById('islamic-quote').textContent = randomQuote;
    
    // Update quote setiap 1 jam
    setTimeout(updateQuote, 3600000);
}
