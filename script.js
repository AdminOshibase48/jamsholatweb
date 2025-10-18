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
    
    // Update waktu real-time
    function updateDateTime() {
        const now = new Date();
        
        // Format tanggal
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = now.toLocaleDateString('id-ID', options);
        
        // Format waktu
        const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
        currentTimeElement.textContent = now.toLocaleTimeString('id-ID', timeOptions);
    }
    
    // Format date untuk API (YYYY-MM-DD)
    function getFormattedDate() {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }
    
    // Load cities
    async function loadCities() {
        try {
            const response = await fetch(KOTA_API);
            const cities = await response.json();
            
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
            const jakarta = cities.find(city => city.lokasi.toLowerCase().includes('jakarta'));
            if (jakarta) {
                citySelect.value = jakarta.id;
                currentCityElement.textContent = jakarta.lokasi;
                loadPrayerTimes(jakarta.id);
            }
        } catch (error) {
            console.error('Error loading cities:', error);
            citySelect.innerHTML = '<option value="">Error loading cities</option>';
        }
    }
    
    // Load prayer times
    async function loadPrayerTimes(cityId) {
        try {
            const formattedDate = getFormattedDate();
            const response = await fetch(`${JADWAL_API}${cityId}/${formattedDate}`);
            const data = await response.json();
            
            if (data.status && data.data) {
                const jadwal = data.data.jadwal;
                currentCityElement.textContent = data.data.lokasi;
                
                // Animate prayer time updates
                animateTimeUpdate(subuhTime, jadwal.subuh);
                animateTimeUpdate(dzuhurTime, jadwal.dzuhur);
                animateTimeUpdate(asharTime, jadwal.ashar);
                animateTimeUpdate(maghribTime, jadwal.maghrib);
                animateTimeUpdate(isyaTime, jadwal.isya);
                
                // Highlight current prayer time
                highlightCurrentPrayer();
            }
        } catch (error) {
            console.error('Error loading prayer times:', error);
        }
    }
    
    // Animate time update
    function animateTimeUpdate(element, newTime) {
        element.style.transform = 'scale(1.2)';
        element.style.color = '#ff5252';
        
        setTimeout(() => {
            element.textContent = newTime;
            element.style.transform = 'scale(1)';
            element.style.color = '#ffd54f';
        }, 300);
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
        });
        
        // Find and highlight current prayer
        for (let i = 0; i < prayerTimes.length; i++) {
            const nextPrayer = i < prayerTimes.length - 1 ? prayerTimes[i + 1] : null;
            
            if (currentTime >= prayerTimes[i].time && 
                (nextPrayer === null || currentTime < nextPrayer.time)) {
                
                const prayerItem = document.querySelector(`[data-prayer="${prayerTimes[i].name}"]`);
                if (prayerItem) {
                    prayerItem.style.background = 'rgba(33, 150, 243, 0.3)';
                    prayerItem.style.borderLeftColor = '#2196f3';
                    prayerItem.style.animation = 'pulse 2s infinite';
                }
                break;
            }
        }
    }
    
    // Convert time string to minutes
    function convertTimeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    // Event listener untuk city selection
    citySelect.addEventListener('change', function() {
        if (this.value) {
            loadPrayerTimes(this.value);
        }
    });
    
    // Add hover effects untuk prayer items
    document.querySelectorAll('.prayer-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
    });
    
    // Initialize
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setInterval(() => {
        if (citySelect.value) {
            highlightCurrentPrayer();
        }
    }, 60000); // Update current prayer highlight every minute
    
    loadCities();
    
    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(33, 150, 243, 0); }
            100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
        }
    `;
    document.head.appendChild(style);
});
