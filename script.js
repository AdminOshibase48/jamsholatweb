document.addEventListener('DOMContentLoaded', function() {
    // API endpoints
    const KOTA_API = 'https://api.myquran.com/v2/sholat/kota/semua';
    const JADWAL_API = 'https://api.myquran.com/v2/sholat/jadwal/';
    
    // Elements
    const citySelect = document.getElementById('citySelect');
    const currentDateElement = document.getElementById('currentDate');
    const currentTimeElement = document.getElementById('currentTime');
    const currentCityElement = document.getElementById('currentCity');
    
    // Prayer time elements
    const subuhTime = document.getElementById('subuhTime');
    const dzuhurTime = document.getElementById('dzuhurTime');
    const asharTime = document.getElementById('asharTime');
    const maghribTime = document.getElementById('maghribTime');
    const isyaTime = document.getElementById('isyaTime');

    // Countdown elements
    const subuhCountdown = document.getElementById('subuhCountdown');
    const dzuhurCountdown = document.getElementById('dzuhurCountdown');
    const asharCountdown = document.getElementById('asharCountdown');
    const maghribCountdown = document.getElementById('maghribCountdown');
    const isyaCountdown = document.getElementById('isyaCountdown');

    // Notification elements
    const adzanNotification = document.getElementById('adzanNotification');
    const closeNotification = document.getElementById('closeNotification');
    const notificationPrayer = document.getElementById('notificationPrayer');
    const notificationCountdown = document.getElementById('notificationCountdown');
    const notificationIcon = document.getElementById('notificationIcon');
    const playAdzan = document.getElementById('playAdzan');
    const stopAdzan = document.getElementById('stopAdzan');
    const adzanAudio = document.getElementById('adzanAudio');

    // Default times sebagai fallback
    const defaultTimes = {
        subuh: '04:30',
        dzuhur: '12:00', 
        ashar: '15:30',
        maghrib: '18:15',
        isya: '19:30'
    };

    // Variabel untuk notifikasi
    let notificationTimeout;
    let currentNotificationPrayer = '';
    const NOTIFICATION_TIMES = [30, 15, 10, 5, 1]; // menit sebelum adzan

    // Set default times
    subuhTime.textContent = defaultTimes.subuh;
    dzuhurTime.textContent = defaultTimes.dzuhur;
    asharTime.textContent = defaultTimes.ashar;
    maghribTime.textContent = defaultTimes.maghrib;
    isyaTime.textContent = defaultTimes.isya;
    
    // Update waktu real-time
    function updateDateTime() {
        const now = new Date();
        
        // Format tanggal
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = now.toLocaleDateString('id-ID', options);
        
        // Format waktu
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        currentTimeElement.textContent = now.toLocaleTimeString('id-ID', timeOptions);
    }
    
    // Format date untuk API (YYYY-MM-DD)
    function getFormattedDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Load cities
    async function loadCities() {
        try {
            console.log('Memuat data kota...');
            const response = await fetch(KOTA_API);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Periksa struktur response
            if (!data.data || !Array.isArray(data.data)) {
                throw new Error('Format data tidak valid');
            }
            
            const cities = data.data;
            console.log('Data kota berhasil dimuat:', cities.length, 'kota');
            
            // Clear loading option
            citySelect.innerHTML = '<option value="">Pilih Kota</option>';
            
            // Add cities to dropdown
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.lokasi;
                citySelect.appendChild(option);
            });
            
            // Set default to Jakarta
            const jakarta = cities.find(city => 
                city.lokasi && city.lokasi.toLowerCase().includes('jakarta')
            );
            
            if (jakarta) {
                citySelect.value = jakarta.id;
                currentCityElement.textContent = jakarta.lokasi;
                loadPrayerTimes(jakarta.id);
            } else if (cities.length > 0) {
                // Fallback ke kota pertama
                citySelect.value = cities[0].id;
                currentCityElement.textContent = cities[0].lokasi;
                loadPrayerTimes(cities[0].id);
            }
            
        } catch (error) {
            console.error('Error loading cities:', error);
            citySelect.innerHTML = '<option value="">Error loading cities</option>';
            
            // Fallback untuk demo
            setTimeout(() => {
                loadFallbackCities();
            }, 1000);
        }
    }
    
    // Fallback cities jika API error
    function loadFallbackCities() {
        const fallbackCities = [
            { id: 1, lokasi: 'Jakarta Pusat' },
            { id: 2, lokasi: 'Bandung' },
            { id: 3, lokasi: 'Surabaya' },
            { id: 4, lokasi: 'Medan' },
            { id: 5, lokasi: 'Makassar' }
        ];
        
        citySelect.innerHTML = '<option value="">Pilih Kota</option>';
        fallbackCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.id;
            option.textContent = city.lokasi;
            citySelect.appendChild(option);
        });
        
        citySelect.value = '1';
        currentCityElement.textContent = 'Jakarta Pusat';
        console.log('Menggunakan data fallback');
    }
    
    // Load prayer times
    async function loadPrayerTimes(cityId) {
        try {
            const formattedDate = getFormattedDate();
            console.log(`Memuat jadwal untuk kota ${cityId} pada ${formattedDate}`);
            
            const response = await fetch(`${JADWAL_API}${cityId}/${formattedDate}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Response jadwal:', data);
            
            if (data.status && data.data && data.data.jadwal) {
                const jadwal = data.data.jadwal;
                currentCityElement.textContent = data.data.lokasi || 'Kota Terpilih';
                
                // Animate prayer time updates
                animateTimeUpdate(subuhTime, jadwal.subuh || defaultTimes.subuh);
                animateTimeUpdate(dzuhurTime, jadwal.dzuhur || defaultTimes.dzuhur);
                animateTimeUpdate(asharTime, jadwal.ashar || defaultTimes.ashar);
                animateTimeUpdate(maghribTime, jadwal.maghrib || defaultTimes.maghrib);
                animateTimeUpdate(isyaTime, jadwal.isya || defaultTimes.isya);
                
                // Start countdown monitoring
                startCountdownMonitoring();
                
            } else {
                throw new Error('Format data jadwal tidak valid');
            }
        } catch (error) {
            console.error('Error loading prayer times:', error);
            
            // Fallback ke waktu default dengan animasi
            animateTimeUpdate(subuhTime, defaultTimes.subuh);
            animateTimeUpdate(dzuhurTime, defaultTimes.dzuhur);
            animateTimeUpdate(asharTime, defaultTimes.ashar);
            animateTimeUpdate(maghribTime, defaultTimes.maghrib);
            animateTimeUpdate(isyaTime, defaultTimes.isya);
            
            currentCityElement.textContent = 'Data Offline';
            
            // Start countdown dengan waktu default
            startCountdownMonitoring();
        }
    }
    
    // Animate time update
    function animateTimeUpdate(element, newTime) {
        if (!element) return;
        
        element.style.transform = 'scale(1.2)';
        element.style.color = '#ff5252';
        
        setTimeout(() => {
            element.textContent = newTime;
            element.style.transform = 'scale(1)';
            element.style.color = '#ffd54f';
        }, 300);
    }

    // Start monitoring countdown untuk semua sholat
    function startCountdownMonitoring() {
        // Update countdown setiap detik
        setInterval(() => {
            updateAllCountdowns();
            checkNotifications();
        }, 1000);
        
        // Update awal
        updateAllCountdowns();
    }

    // Update countdown untuk semua sholat
    function updateAllCountdowns() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayers = [
            { name: 'subuh', element: subuhTime, countdown: subuhCountdown },
            { name: 'dzuhur', element: dzuhurTime, countdown: dzuhurCountdown },
            { name: 'ashar', element: asharTime, countdown: asharCountdown },
            { name: 'maghrib', element: maghribTime, countdown: maghribCountdown },
            { name: 'isya', element: isyaTime, countdown: isyaCountdown }
        ];

        prayers.forEach(prayer => {
            const prayerTime = convertTimeToMinutes(prayer.element.textContent);
            const timeDiff = prayerTime - currentTime;
            
            if (timeDiff > 0 && timeDiff <= 60) { // Tampilkan jika <= 60 menit
                prayer.countdown.textContent = `${timeDiff}m`;
                prayer.countdown.style.display = 'block';
                
                if (timeDiff <= 5) {
                    prayer.countdown.classList.add('countdown-urgent');
                } else {
                    prayer.countdown.classList.remove('countdown-urgent');
                }
            } else {
                prayer.countdown.style.display = 'none';
                prayer.countdown.classList.remove('countdown-urgent');
            }
        });

        highlightCurrentPrayer();
    }

    // Check untuk menampilkan notifikasi
    function checkNotifications() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayers = [
            { name: 'subuh', displayName: 'SHOLAT SUBUH', element: subuhTime, icon: 'fas fa-sun' },
            { name: 'dzuhur', displayName: 'SHOLAT DZUHUR', element: dzuhurTime, icon: 'fas fa-sun' },
            { name: 'ashar', displayName: 'SHOLAT ASHAR', element: asharTime, icon: 'fas fa-sun' },
            { name: 'maghrib', displayName: 'SHOLAT MAGHRIB', element: maghribTime, icon: 'fas fa-moon' },
            { name: 'isya', displayName: 'SHOLAT ISYA', element: isyaTime, icon: 'fas fa-moon' }
        ];

        prayers.forEach(prayer => {
            const prayerTime = convertTimeToMinutes(prayer.element.textContent);
            const timeDiff = prayerTime - currentTime;
            
            // Cek jika waktu sudah sesuai untuk notifikasi
            NOTIFICATION_TIMES.forEach(notifTime => {
                if (timeDiff === notifTime && currentNotificationPrayer !== prayer.name) {
                    showNotification(prayer, timeDiff);
                    currentNotificationPrayer = prayer.name;
                    
                    // Reset current notification setelah 1 menit
                    setTimeout(() => {
                        currentNotificationPrayer = '';
                    }, 60000);
                }
            });

            // Notifikasi saat waktu sholat tiba
            if (timeDiff === 0) {
                showAdzanTimeNotification(prayer);
            }
        });
    }

    // Show notification popup
    function showNotification(prayer, minutesLeft) {
        notificationPrayer.textContent = prayer.displayName;
        notificationIcon.className = prayer.icon;
        
        let countdownText = '';
        if (minutesLeft === 1) {
            countdownText = '1 menit lagi';
        } else if (minutesLeft === 0) {
            countdownText = 'Waktu sholat telah tiba!';
        } else {
            countdownText = `${minutesLeft} menit lagi`;
        }
        
        notificationCountdown.textContent = countdownText;
        
        // Show notification
        adzanNotification.classList.add('show');
        
        // Auto close setelah 10 detik, kecuali untuk 1 menit terakhir
        if (minutesLeft > 1) {
            clearTimeout(notificationTimeout);
            notificationTimeout = setTimeout(() => {
                adzanNotification.classList.remove('show');
            }, 10000);
        }
        
        // Show toast notification juga
        showToastNotification(prayer.displayName, minutesLeft);
    }

    // Show notification ketika waktu adzan tiba
    function showAdzanTimeNotification(prayer) {
        notificationPrayer.textContent = prayer.displayName;
        notificationCountdown.textContent = 'WAKTU SHOLAT TELAH TIBA!';
        notificationIcon.className = prayer.icon;
        
        adzanNotification.classList.add('show');
        
        // Otomatis putar adzan
        playAdzanSound();
        
        // Tidak auto close untuk notifikasi waktu sholat
        clearTimeout(notificationTimeout);
        
        // Show urgent toast
        showToastNotification(prayer.displayName, 0, true);
    }

    // Show toast notification
    function showToastNotification(prayerName, minutesLeft, isUrgent = false) {
        const toast = document.createElement('div');
        toast.className = 'adzan-toast';
        
        let message = '';
        if (minutesLeft === 0) {
            message = `🏷️ ${prayerName} - WAKTU SHOLAT TELAH TIBA!`;
            toast.classList.add('urgent');
        } else if (minutesLeft === 1) {
            message = `⏰ ${prayerName} - 1 menit lagi!`;
            toast.classList.add('warning');
        } else {
            message = `⏰ ${prayerName} - ${minutesLeft} menit lagi`;
        }
        
        toast.innerHTML = `
            <i class="fas ${minutesLeft === 0 ? 'fa-bell' : 'fa-clock'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Auto remove setelah 5 detik
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }, 5000);
    }

    // Play adzan sound
    function playAdzanSound() {
        adzanAudio.currentTime = 0;
        adzanAudio.play().catch(e => {
            console.log('Autoplay diblokir:', e);
        });
    }

    // Stop adzan sound
    function stopAdzanSound() {
        adzanAudio.pause();
        adzanAudio.currentTime = 0;
    }
    
    // Highlight current prayer time
    function highlightCurrentPrayer() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayerTimes = [
            { name: 'subuh', element: subuhTime, time: convertTimeToMinutes(subuhTime.textContent) },
            { name: 'dzuhur', element: dzuhurTime, time: convertTimeToMinutes(dzuhurTime.textContent) },
            { name: 'ashar', element: asharTime, time: convertTimeToMinutes(asharTime.textContent) },
            { name: 'maghrib', element: maghribTime, time: convertTimeToMinutes(maghribTime.textContent) },
            { name: 'isya', element: isyaTime, time: convertTimeToMinutes(isyaTime.textContent) }
        ];
        
        // Remove previous highlights
        document.querySelectorAll('.prayer-item').forEach(item => {
            item.style.background = 'rgba(0, 0, 0, 0.4)';
            item.style.borderLeftColor = 'transparent';
            item.style.animation = 'none';
        });
        
        // Find and highlight current prayer
        let currentPrayerFound = false;
        
        for (let i = 0; i < prayerTimes.length; i++) {
            const nextPrayer = i < prayerTimes.length - 1 ? prayerTimes[i + 1] : null;
            
            if (currentTime >= prayerTimes[i].time && 
                (nextPrayer === null || currentTime < nextPrayer.time)) {
                
                const prayerItem = document.querySelector(`[data-prayer="${prayerTimes[i].name}"]`);
                if (prayerItem) {
                    prayerItem.style.background = 'rgba(33, 150, 243, 0.3)';
                    prayerItem.style.borderLeftColor = '#2196f3';
                    prayerItem.style.animation = 'pulse 2s infinite';
                    currentPrayerFound = true;
                }
                break;
            }
        }
        
        // Jika tidak ada sholat yang aktif, highlight sholat berikutnya
        if (!currentPrayerFound) {
            for (let i = 0; i < prayerTimes.length; i++) {
                if (currentTime < prayerTimes[i].time) {
                    const prayerItem = document.querySelector(`[data-prayer="${prayerTimes[i].name}"]`);
                    if (prayerItem) {
                        prayerItem.style.background = 'rgba(76, 175, 80, 0.3)';
                        prayerItem.style.borderLeftColor = '#4caf50';
                    }
                    break;
                }
            }
        }
    }
    
    // Convert time string to minutes
    function convertTimeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    // Event Listeners
    citySelect.addEventListener('change', function() {
        if (this.value) {
            loadPrayerTimes(this.value);
        }
    });

    closeNotification.addEventListener('click', function() {
        adzanNotification.classList.remove('show');
        stopAdzanSound();
    });

    playAdzan.addEventListener('click', playAdzanSound);
    stopAdzan.addEventListener('click', stopAdzanSound);
    
    // Add hover effects untuk prayer items
    document.querySelectorAll('.prayer-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            if (!this.style.animation || this.style.animation === 'none') {
                this.style.transform = 'translateX(0) scale(1)';
            }
        });
    });
    
    // Initialize
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load cities setelah delay kecil untuk memastikan DOM siap
    setTimeout(() => {
        loadCities();
    }, 100);
    
    // Add CSS untuk pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { 
                box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
                background: rgba(33, 150, 243, 0.3);
            }
            70% { 
                box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
                background: rgba(33, 150, 243, 0.4);
            }
            100% { 
                box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
                background: rgba(33, 150, 243, 0.3);
            }
        }
        
        .prayer-item {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});
