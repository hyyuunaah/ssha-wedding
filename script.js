/**
 * Watercolor Soft Wedding Invitation
 * Korean Mobile 청첩장 - Script (페이드인 완벽 보정 최종본)
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     Utility Helpers
     ═══════════════════════════════════════════ */

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function formatDate(dateStr, timeStr) {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours < 12 ? '오전' : '오후';
    const h12 = hours % 12 || 12;
    const minuteStr = minutes > 0 ? ` ${minutes}분` : '';
    return `${year}년 ${month}월 ${date}일 ${day}요일 ${period} ${h12}시${minuteStr}`;
  }

  function getWeddingDateTime() {
    return new Date(`${CONFIG.wedding.date}T${CONFIG.wedding.time}:00`);
  }

  /* ═══════════════════════════════════════════
     Image Auto-Detection
     ═══════════════════════════════════════════ */

  function loadImagesFromFolder(folder, maxAttempts = 50) {
    return new Promise(resolve => {
        const images = [];
        let current = 1;
        let consecutiveFails = 0;

        function tryNext() {
            if (current > maxAttempts || consecutiveFails >= 3) {
                resolve(images);
                return;
            }
            const img = new Image();
            const path = `images/${folder}/${current}.jpg`;
            img.onload = function() {
                images.push(path);
                consecutiveFails = 0;
                current++;
                tryNext();
            };
            img.onerror = function() {
                consecutiveFails++;
                current++;
                tryNext();
            };
            img.src = path;
        }

        tryNext();
    });
  }

  /* ═══════════════════════════════════════════
     Toast & Clipboard
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  async function copyToClipboard(text, successMsg) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast(successMsg || '복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
    }
  }

  /* ═══════════════════════════════════════════
     OG Meta Tags
     ═══════════════════════════════════════════ */

  function setMetaTags() {
    const m = CONFIG.meta;
    document.title = m.title;
    const setMeta = (attr, val, content) => {
      const el = document.querySelector(`meta[${attr}="${val}"]`);
      if (el) el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', 'images/og/1.jpg');
    setMeta('name', 'description', m.description);
  }

  /* ═══════════════════════════════════════════
     Curtain (Watercolor Wash) - 💡 완전 통합형 단일 페이드인 로직
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtain');
    const btn = $('#curtainBtn');
    const namesEl = $('#curtainNames');
    const heroSection = $('#hero');

    if (CONFIG.useCurtain === false) {
      if (curtain) curtain.style.display = 'none';
      if (heroSection) {
        heroSection.classList.add('is-visible');
      }
      initSparkles();
      return;
    }

    if (namesEl) {
      namesEl.textContent = `${CONFIG.groom.name}  &  ${CONFIG.bride.name}`;
    }

    if (btn) {
      btn.addEventListener('click', () => {
        // 1. 대문 커튼 열림 애니메이션 시작
        curtain.classList.add('is-open');
        document.body.classList.remove('no-scroll');
        
        // 2. 💡 브라우저가 페이드인을 인지할 수 있도록 0.05초(50ms) 뒤에 클래스를 붙입니다.
        if (heroSection) {
          setTimeout(() => {
            heroSection.classList.add('is-visible');
          }, 50);
        }

        // 3. 커튼을 완전히 숨기고 이펙트를 켜는 최소한의 타이밍 (스크롤 이동 코드 삭제)
        setTimeout(() => {
          curtain.classList.add('is-hidden');
          initSparkles();      
        }, 1400); // 커튼이 완전히 걷히는 시간(1.4초)에 맞춤
      });
    }

    document.body.classList.add('no-scroll');
  }
  
  /* ═══════════════════════════════════════════
     Falling Pastel Confetti / Sparkles
     ═══════════════════════════════════════════ */

  function initSparkles() {
    const canvas = $('#sparkleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    const particles = [];
    const PARTICLE_COUNT = 30;

    const colors = [
      'rgba(232, 223, 240, 0.6)',
      'rgba(245, 224, 224, 0.6)',
      'rgba(220, 232, 240, 0.55)',
      'rgba(224, 240, 232, 0.55)',
      'rgba(196, 168, 212, 0.4)',
      'rgba(255, 255, 255, 0.7)'
    ];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height * -1 : -20;
        this.size = 3 + Math.random() * 6;
        this.speedY = 0.3 + Math.random() * 0.8;
        this.speedX = -0.2 + Math.random() * 0.4;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.03;
        this.oscillateAmp = 15 + Math.random() * 25;
        this.oscillateSpeed = 0.008 + Math.random() * 0.015;
        this.oscillateOffset = Math.random() * Math.PI * 2;
        this.opacity = 0.3 + Math.random() * 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.t = 0;
        this.type = Math.floor(Math.random() * 3);
      }

      update() {
        this.t++;
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.t * this.oscillateSpeed + this.oscillateOffset) * 0.4;
        this.rotation += this.rotSpeed;
        if (this.y > height + 20) this.reset();
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        if (this.type === 0) {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 1) {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          const s = this.size * 0.8;
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
            const midAngle = angle + Math.PI / 4;
            ctx.lineTo(Math.cos(midAngle) * s * 0.3, Math.sin(midAngle) * s * 0.3);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ═══════════════════════════════════════════
     Hero Section - 💡 이미지 프리로드 안전장치
     ═══════════════════════════════════════════ */

  function initHero() {
    const heroSection = $('#hero');
    const heroImg = $('#heroPhoto');

    // 1. 💡 모바일 주소창 변화를 무시하고 실제 화면 높이를 픽셀(px)로 대못 박기
    if (heroSection) {
      const actualHeight = window.innerHeight;
      heroSection.style.setProperty('height', `${actualHeight}px`, 'important');
      heroSection.style.setProperty('max-height', `${actualHeight}px`, 'important');
      heroSection.style.setProperty('min-height', `${actualHeight}px`, 'important');
      heroSection.style.setProperty('overflow', 'hidden', 'important');
    }

    // 2. 💡 기존에 만들어둔 프리로드(Preload) 안전장치도 그대로 유지
    if (heroImg) {
      const imgPreload = new Image();
      imgPreload.src = 'images/hero/1.jpg';
      imgPreload.onload = function() {
        heroImg.src = 'images/hero/1.jpg';
      };
      
      // 이미지 크기도 부모 박스(px 고정된)에 100% 맞추기
      heroImg.style.setProperty('height', '100%', 'important');
      heroImg.style.setProperty('width', '100%', 'important');
    }
    
    if ($('#heroNames')) $('#heroNames').textContent = `${CONFIG.groom.name}  ·  ${CONFIG.bride.name}`;
    if ($('#heroDate')) $('#heroDate').textContent = formatDate(CONFIG.wedding.date, CONFIG.wedding.time);
    if ($('#heroVenue')) $('#heroVenue').textContent = CONFIG.wedding.venue;
  }

  /* ═══════════════════════════════════════════
     Countdown
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;
      const labelEl = $('#countdownLabel');

      if (diff <= 0) {
        if ($('#countDays')) $('#countDays').textContent = '0';
        if ($('#countHours')) $('#countHours').textContent = '0';
        if ($('#countMinutes')) $('#countMinutes').textContent = '0';
        if ($('#countSeconds')) $('#countSeconds').textContent = '0';
        if (labelEl) labelEl.textContent = '결혼식이 시작되었습니다';
        return;
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (labelEl) labelEl.textContent = `결혼식까지 D-${totalDays}`;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if ($('#countDays')) $('#countDays').textContent = days;
      if ($('#countHours')) $('#countHours').textContent = String(hours).padStart(2, '0');
      if ($('#countMinutes')) $('#countMinutes').textContent = String(minutes).padStart(2, '0');
      if ($('#countSeconds')) $('#countSeconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Greeting Section
     ═══════════════════════════════════════════ */

  function initGreeting() {
    if ($('#greetingTitle')) $('#greetingTitle').textContent = CONFIG.greeting.title;
    if ($('#greetingContent')) $('#greetingContent').textContent = CONFIG.greeting.content;

    const g = CONFIG.groom;
    const b = CONFIG.bride;

    function parentLine(father, mother, fatherDeceased, motherDeceased) {
      const fd = fatherDeceased ? ' deceased' : '';
      const md = motherDeceased ? ' deceased' : '';
      return `<span class="${fd}">${father}</span> · <span class="${md}">${mother}</span>`;
    }

    const parentsHTML = `
      <div class="parent-row">
        ${parentLine(g.father, g.mother, g.fatherDeceased, g.motherDeceased)}
        <span class="parent-dot">●</span>
        의 아들 <span class="child-name">${g.name}</span>
      </div>
      <div class="parent-row">
        ${parentLine(b.father, b.mother, b.fatherDeceased, b.motherDeceased)}
        <span class="parent-dot">●</span>
        의  딸 <span class="child-name">${b.name}</span>
      </div>
    `;

    if ($('#greetingParents')) $('#greetingParents').innerHTML = parentsHTML;
  }

  /* ═══════════════════════════════════════════
     Calendar Section
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = dt.getMonth();
    const weddingDay = dt.getDate();
    const grid = $('#calendarGrid');
    if (!grid) return;

    grid.innerHTML = `<div class="calendar__header">${year}년 ${month + 1}월</div>`;

    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const wdRow = document.createElement('div');
    wdRow.className = 'calendar__weekdays';
    weekdays.forEach(wd => {
      const el = document.createElement('span');
      el.className = 'calendar__weekday';
      el.textContent = wd;
      wdRow.appendChild(el);
    });
    grid.appendChild(wdRow);

    const daysContainer = document.createElement('div');
    daysContainer.className = 'calendar__days';

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('span');
      empty.className = 'calendar__day is-empty';
      daysContainer.appendChild(empty);
    }

    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('span');
      dayEl.className = 'calendar__day';
      if (d === weddingDay) dayEl.classList.add('is-today');
      dayEl.textContent = d;
      daysContainer.appendChild(dayEl);
    }

    grid.appendChild(daysContainer);

    const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
    
    if ($('#googleCalBtn')) $('#googleCalBtn').href = gcalUrl;

    if ($('#icsDownloadBtn')) {
      $('#icsDownloadBtn').addEventListener('click', () => {
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Wedding//Invitation//KO',
          'BEGIN:VEVENT',
          `DTSTART:${startDate}`,
          `DTEND:${endDate}`,
          `SUMMARY:${CONFIG.groom.name} ♥ ${CONFIG.bride.name} 결혼식`,
          `LOCATION:${CONFIG.wedding.venue} ${CONFIG.wedding.address}`,
          'DESCRIPTION:결혼식에 초대합니다.',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wedding.ics';
        a.click();
        URL.revokeObjectURL(url);
        showToast('캘린더 파일이 다운로드됩니다');
      });
    }
  }

  /* ═══════════════════════════════════════════
     Story Section
     ═══════════════════════════════════════════ */

  function initStory(storyImages) {
    if ($('#storyTitle')) $('#storyTitle').textContent = CONFIG.story.title;
    if ($('#storyContent')) $('#storyContent').textContent = CONFIG.story.content;

    const container = $('#storyPhotos');
    if (!container) return;
    const placeholder = container.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'story__photo-item animate-item';
      div.setAttribute('data-animate', 'fade-up');
      div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
      // div.addEventListener('click', () => openPhotoModal(storyImages, i));
      // [버그 해결] 스토리 사진 클릭 시 맨 위로 튕기는 현상 차단
      div.addEventListener('click', (e) => {
        e.preventDefault(); // 👈 최상단 이동 링크 동작을 원천 차단!
        openPhotoModal(storyImages, i);
      });
      container.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
    if (!grid) return;
    const placeholder = grid.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (galleryImages.length === 0) {
      const gallerySection = $('#gallery');
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    galleryImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'gallery__item animate-item';
      div.setAttribute('data-animate', 'scale-in');
      div.innerHTML = `<img src="${src}" alt="갤러리 사진 ${i + 1}" loading="lazy">`;
      // div.addEventListener('click', () => openPhotoModal(galleryImages, i));
      div.addEventListener('click', (e) => {
        e.preventDefault(); // 👈 최상단 이동 링크 동작을 원천 차단!
        openPhotoModal(galleryImages, i);
      });
      grid.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
   Photo Modal (스크롤 튕김 버그 완전 박멸 최종본)
   ═══════════════════════════════════════════ */
  let modalImages = [];
  let modalIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  
  // 💡 하객이 사진을 누른 위치를 영구 저장할 메모리 변수
  let globalWeddingScrollY = 0;
  
  function openPhotoModal(images, index) {
    // 1. 튕기기 전 현재 하객의 완벽한 스크롤 높이를 기억합니다.
    globalWeddingScrollY = window.scrollY;
  
    modalImages = images;
    modalIndex = index;
    showModalImage();
    
    // 2. 화면 강제 고정 (no-scroll을 쓰지 않고 튕김을 원천 차단)
    const modal = $('#photoModal');
    if (modal) {
      modal.classList.add('is-open');
    }
  
    // 3. 브라우저가 강제로 화면을 위로 올리려 시도하는 순간 원래 위치로 즉시 재고정시킵니다.
    requestAnimationFrame(() => {
      window.scrollTo(0, globalWeddingScrollY);
    });
  }
  
  function closePhotoModal() {
    $('#photoModal').classList.remove('is-open');
    
    // 닫을 때도 하객이 원래 보던 그 자리에 완벽하게 세워둡니다.
    window.scrollTo(0, globalWeddingScrollY);
  }
  
  function showModalImage() {
    // 💡 HTML 소스 원본에 맞게 정확히 매칭 (#modalImg)
    const img = $('#modalImg');
    if (!img) return;
    
    img.src = modalImages[modalIndex];
    
    if ($('#modalCounter')) $('#modalCounter').textContent = `${modalIndex + 1} / ${modalImages.length}`;
    if ($('#modalPrev')) $('#modalPrev').style.display = modalIndex > 0 ? '' : 'none';
    if ($('#modalNext')) $('#modalNext').style.display = modalIndex < modalImages.length - 1 ? '' : 'none';
  }
  
  function modalNavigate(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex >= 0 && newIndex < modalImages.length) {
      modalIndex = newIndex;
      showModalImage();
      
      // 사진을 옆으로 넘길 때도 스크롤 위치를 고정합니다.
      window.scrollTo(0, globalWeddingScrollY);
    }
  }
  
  /* ═══════════════════════════════════════════
     Photo Modal Section (초기화 및 클릭 차단)
     ═══════════════════════════════════════════ */
  function initPhotoModal() {
    if ($('#modalClose')) {
      $('#modalClose').addEventListener('click', (e) => {
        e.preventDefault();
        closePhotoModal();
      });
    }
  
    if ($('#modalPrev')) {
      $('#modalPrev').addEventListener('click', (e) => {
        e.preventDefault();
        modalNavigate(-1);
      });
    }
  
    if ($('#modalNext')) {
      $('#modalNext').addEventListener('click', (e) => {
        e.preventDefault();
        modalNavigate(1);
      });
    }
  
    const modal = $('#photoModal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        // 배경의 어두운 영역을 누르면 정상적으로 닫히도록 제어
        if (e.target === modal || e.target.id === 'modalContainer') {
          closePhotoModal();
        }
      });
    }
  
    document.addEventListener('keydown', (e) => {
      if (!modal || !modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowLeft') modalNavigate(-1);
      if (e.key === 'ArrowRight') modalNavigate(1);
    });
  }
  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    const ml = CONFIG.mapLinks;
    if ($('#locationVenue')) $('#locationVenue').textContent = w.venue;
    if ($('#locationHall')) $('#locationHall').textContent = w.hall;
    if ($('#locationAddress')) $('#locationAddress').textContent = w.address;
    if ($('#locationTel')) $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    
    if ($('#kakaoMapBtn')) $('#kakaoMapBtn').href = ml.kakao || '#';
    if ($('#naverMapBtn')) $('#naverMapBtn').href = ml.naver || '#';

    if ($('#copyAddressBtn')) {
      $('#copyAddressBtn').addEventListener('click', () => {
        copyToClipboard(w.address, '주소가 복사되었습니다');
      });
    }

    const mapContainer = document.getElementById('daumMap'); 
    if (!mapContainer || typeof kakao === 'undefined') return; 

    kakao.maps.load(function () {
      const mapOption = {
          center: new kakao.maps.LatLng(37.8853, 127.7544), 
          level: 3 
      };

      const map = new kakao.maps.Map(mapContainer, mapOption);
      const geocoder = new kakao.maps.services.Geocoder();

      geocoder.addressSearch(w.address, function(result, status) {
          if (status === kakao.maps.services.Status.OK) {
              const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
              const marker = new kakao.maps.Marker({
                  map: map,
                  position: coords
              });

              const infowindow = new kakao.maps.InfoWindow({
                  content: `<div style="width:150px; text-align:center; padding:6px 0; font-family:'Nanum Myeongjo', serif; font-size:12px; color:#4a4a4a; border:none;">${w.venue}</div>`
              });
              infowindow.open(map, marker);
              map.setCenter(coords);
              
              setTimeout(() => {
                  map.relayout();
                  map.setCenter(coords);
              }, 600);
          }
      });
    });
  }
  
  /* ═══════════════════════════════════════════
     Account Section (축의금)
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    if (!container) return;
    accounts.forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      item.innerHTML = `
      <div class="account-item__info">
        <div class="account-item__detail" style="text-align: left; line-height: 1.5;">
          <span class="account-item__role" style="display: inline-block; min-width: 45px; color: #6e6e6e;">${acc.role}</span>
          <span class="account-item__name"><strong>${acc.name || ''}</strong></span>
          <br>
          ${acc.bank} ${acc.number}
        </div>
      </div>
      <button class="account-item__copy" data-account="${acc.bank} ${acc.number}" style="font-size: 0.8rem; background: none; border: 1px solid var(--color-border); padding: 4px 8px; border-radius: 4px; cursor: pointer;">
        복사
      </button>
    `;
      container.appendChild(item);
    });
  }

  function initAccordion(triggerId, panelId) {
    const trigger = $(`#${triggerId}`);
    const panel = $(`#${panelId}`);
    if (!trigger || !panel) return;
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !expanded);

      if (!expanded) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0';
      }
    });
  }

  function initAccounts() {
    renderAccounts(CONFIG.accounts.groom, 'groomAccountList');
    renderAccounts(CONFIG.accounts.bride, 'brideAccountList');

    initAccordion('groomAccordion', 'groomAccordionPanel');
    initAccordion('brideAccordion', 'brideAccordionPanel');

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item__copy');
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, '계좌번호가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Footer & Placeholders
     ═══════════════════════════════════════════ */

  function initFooter() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    if ($('#footerText')) $('#footerText').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
  }

  function showLoadingPlaceholders() {
    const storyPhotos = $('#storyPhotos');
    const galleryGrid = $('#galleryGrid');
    const placeholderHTML = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';

    if (storyPhotos) storyPhotos.innerHTML = placeholderHTML;
    if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
  }

  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.animate-item').forEach((el) => observer.observe(el));

    const mutObs = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.classList && node.classList.contains('animate-item')) {
            observer.observe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.animate-item').forEach((el) => observer.observe(el));
          }
        });
      });
    });

    mutObs.observe(document.body, { childList: true, subtree: true });
  }

  /* ═══════════════════════════════════════════
     Main Init
     ═══════════════════════════════════════════ */

  async function init() {
    setMetaTags();
    initCurtain();
    initHero();
    initCountdown();
    initGreeting();
    initCalendar();

    showLoadingPlaceholders();

    initPhotoModal();
    initLocation();
    initAccounts();
    initFooter();
    initScrollAnimations();

    const [storyImages, galleryImages] = await Promise.all([
      loadImagesFromFolder('story'),
      loadImagesFromFolder('gallery')
    ]);

    initStory(storyImages);
    initGallery(galleryImages);

    // ─── Firebase 데이터 RSVP / 방명록 연동 ───
    const firebaseConfig = {
      apiKey: "AIzaSyCuGgS156629uvEj6Qv5KSO6gtq4CHtHM4",
      authDomain: "ssha-wedding.firebaseapp.com",
      databaseURL: "https://ssha-wedding-default-rtdb.firebaseio.com",
      projectId: "ssha-wedding",
      storageBucket: "ssha-wedding.firebasestorage.app",
      messagingSenderId: "439719249640",
      appId: "1:439719249640:web:0ba4c7676654ef54a12b5d"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();
    
    const rsvpRef = database.ref('rsvp');
    const guestbookRef = database.ref('guestbook');

    // ==========================================================================
    // 🎯 [새로 정의] 메시지 리스트를 화면에 분할해서 그려주는 핵심 함수 위치
    // ==========================================================================
    // 1. 방명록 리스트 렌더링 및 팝업 제어 함수
    function renderMessages(snapshot) {
        const $gbList = document.getElementById('guestbookList');
        const $modalList = document.getElementById('modalMessageList');
        const $openModalBtn = document.getElementById('openModalBtn');
        const $totalCountSpan = document.getElementById('totalMessageCount');
    
        if (!$gbList) return;
        $gbList.innerHTML = '';
        if ($modalList) $modalList.innerHTML = '';
    
        const data = snapshot.val();
        if (!data) {
            $gbList.innerHTML = `<p style="text-align:center; color:var(--color-text-muted);">첫 번째 축하 메시지를 남겨주세요 🌸</p>`;
            if ($openModalBtn) $openModalBtn.style.display = 'none';
            return;
        }
    
        const keys = Object.keys(data).reverse();
        let mainCardCount = 0;
    
        keys.forEach((key) => {
            const post = data[key];
            const date = new Date(post.timestamp).toLocaleDateString('ko-KR', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
    
            const cardHtml = `
                <div class="gb-card" style="margin-bottom: 12px;">
                    <div class="gb-card__header">
                        <strong class="gb-card__name">${escapeHtml(post.name)}</strong>
                        <span style="font-size: 0.8rem;">${date}</span>
                    </div>
                    <p class="gb-card__msg">${escapeHtml(post.message)}</p>
                    <button class="gb-card__delete-btn" onclick="deleteGuestbookPost('${key}', '${post.password}')">삭제</button>
                </div>
            `;
    
            if (mainCardCount < 3) {
                $gbList.insertAdjacentHTML('beforeend', cardHtml);
                mainCardCount++;
            }
            if ($modalList) $modalList.insertAdjacentHTML('beforeend', cardHtml);
        });
    
        if ($openModalBtn) {
            $openModalBtn.style.display = (keys.length > 3) ? 'block' : 'none';
            if ($totalCountSpan) $totalCountSpan.innerText = `(${keys.length}개)`;
        }
    }

    const $rsvpForm = document.getElementById('rsvpForm');
    const $gbForm = document.getElementById('guestbookForm');
    const $gbList = document.getElementById('guestbookList');

    if ($rsvpForm) {
      const attendRadios = document.querySelectorAll('input[name="rsvpAttend"]');
      const countGroup = document.getElementById('rsvpCountGroup');
      const $rsvpCount = document.getElementById('rsvpCount');
      
      attendRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.value === '미참석') {
            if (countGroup) countGroup.style.display = 'none';
          } else {
            if (countGroup) countGroup.style.display = 'flex';
          }
        });
      });

      $rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('rsvpName').value.trim();
        const side = document.querySelector('input[name="rsvpSide"]:checked').value;
        const attend = document.querySelector('input[name="rsvpAttend"]:checked').value;
        // const meal = document.querySelector('input[name="rsvpMeal"]:checked').value;
        
        let count = '0명';
        if (attend === '참석') {
          const countVal = parseInt($rsvpCount.value, 10);
          if (isNaN(countVal) || countVal < 1) {
            alert('참석 인원은 1명 이상 입력해 주세요 🌸');
            return;
          }
          count = countVal + '명';
        }

        if (!name) return;

        const newRsvpRef = rsvpRef.push();
        newRsvpRef.set({
          name: name,
          side: side,
          attend: attend,
          // meal: meal,
          count: count,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }, (error) => {
          if (error) {
            alert('전송에 실패했습니다. 다시 시도해 주세요.');
          } else {
            showToast('참석 의사가 신랑 신부에게 전달되었습니다 🌸');
            document.getElementById('rsvpName').value = '';
            if ($rsvpCount) $rsvpCount.value = '1';
          }
        });
      });
    }

    if ($gbForm) {
      $gbForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('gbName').value.trim();
        const password = document.getElementById('gbPassword').value.trim();
        const message = document.getElementById('gbMessage').value.trim();

        if (!name || !password || !message) return;

        const newGbRef = guestbookRef.push();
        newGbRef.set({
          name: name,
          password: password,
          message: message,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }, (error) => {
          if (error) {
            alert('등록에 실패했습니다. 다시 시도해 주세요.');
          } else {
            showToast('축하 메시지가 등록되었습니다 ✨');
            $gbForm.reset();
          }
        });
      });
    }

    // 2. 파이어베이스 연동부
    if (guestbookRef && $gbList) {
        guestbookRef.on('value', (snapshot) => {
            renderMessages(snapshot);
        });
    }

    // 3. 팝업 여닫기 (최종 보장용 이벤트 리스너)
    document.addEventListener('click', (e) => {
        const $modal = document.getElementById('messageModal');
        // 전체보기 버튼 클릭 시
        if (e.target && e.target.id === 'openModalBtn') {
            $modal.classList.add('is-active');
            document.body.style.overflow = 'hidden';
        }
        // X 버튼 혹은 모달 배경 클릭 시
        if (e.target && (e.target.id === 'closeModalBtn' || e.target.id === 'messageModal')) {
            $modal.classList.remove('is-active');
            document.body.style.overflow = '';
        }
    });

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    window.deleteGuestbookPost = function(key, correctPassword) {
      const inputPassword = prompt('글 작성 시 입력했던 비밀번호를 입력하세요:');
      if (!inputPassword) return;

      if (inputPassword === correctPassword) {
        if (confirm('정말 축하 메시지를 삭제하시겠습니까?')) {
          database.ref('guestbook/' + key).remove()
            .then(() => showToast('메시지가 삭제되었습니다.'))
            .catch(() => alert('삭제 처리에 실패했습니다.'));
        }
      } else {
        alert('비밀번호가 일치하지 않습니다 😢');
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }  
})();

/* ═══════════════════════════════════════════
   💡 외부 연동용 글로벌 함수 (안전하게 항아리 바깥 하단 배치)
   ═══════════════════════════════════════════ */

// 계좌번호 아코디언 토글 외부 연동 함수
window.toggleRemit = function(id) {
  const panel = document.getElementById(id);
  if (!panel) return;
  
  // 1. 기존에 툭툭 끊기게 만들던 display 제어 잔재를 완전히 제거
  panel.style.display = ''; 

  // 2. 높이를 계산해서 부드럽게 밀고 당기기 (CSS transition과 연동)
  if (!panel.style.maxHeight || panel.style.maxHeight === '0px') {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  } else {
    panel.style.maxHeight = '0px';
  }
};

// 텍스트 클립보드 복사 외부 연동 함수
window.copyText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    const el = document.querySelector('#toast');
    if (el) {
      el.textContent = '계좌번호가 복사되었습니다 🌸';
      el.classList.add('is-visible');
      setTimeout(() => el.classList.remove('is-visible'), 2500);
    } else {
      alert('계좌번호가 복사되었습니다.');
    }
  });
};
