// script.js
document.addEventListener('DOMContentLoaded', function() {
    // API endpoints
    const KOTA_API = 'https://api.myquran.com/sholat/kota/semua';
    const JADWAL_API = 'https://api.myquran.com/sholat/jadwal/';
    
    // Elements
    const citySelect = document.getElementById('citySelect');
    const currentDateElement = document.getElementById('currentDate');
    
    // Prayer time elements
    const subuhTime = document.getElementById('subuhTime');
    const dzuhurTime = document.getElementById('dzuhurTime');
    const asharTime = document.getElementById('asharTime');
    const maghribTime = document.getElementById('maghribTime');
    const isyaTime = document.getElementById('isyaTime');
    
    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateElement.textContent = now.toLocaleDateString('id-ID', options);
    
    // Format date for API (YYYY-MM-DD)
    const formattedDate = now.toISOString().split('T')[0];
    
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
        } catch (error) {
            console.error('Error loading cities:', error);
            citySelect.innerHTML = '<option value="">Error loading cities</option>';
        }
    }
    
    // Load prayer times
    async function loadPrayerTimes(cityId) {
        try {
            const response = await fetch(`${JADWAL_API}${cityId}/${formattedDate}`);
            const data = await response.json();
            
            if (data.status && data.data) {
                const jadwal = data.data.jadwal;
                
                // Animate prayer time updates
                animateTimeUpdate(subuhTime, jadwal.subuh);
                animateTimeUpdate(dzuhurTime, jadwal.dzuhur);
                animateTimeUpdate(asharTime, jadwal.ashar);
                animateTimeUpdate(maghribTime, jadwal.maghrib);
                animateTimeUpdate(isyaTime, jadwal.isya);
            }
        } catch (error) {
            console.error('Error loading prayer times:', error);
        }
    }
    
    // Animate time update
    function animateTimeUpdate(element, newTime) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0.5';
        
        setTimeout(() => {
            element.textContent = newTime;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 200);
    }
    
    // Event listener for city selection
    citySelect.addEventListener('change', function() {
        if (this.value) {
            loadPrayerTimes(this.value);
        }
    });
    
    // Initialize
    loadCities();
    
    // Add some interactive effects
    const prayerCards = document.querySelectorAll('.prayer-card');
    
    prayerCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });
});
