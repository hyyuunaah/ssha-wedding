/**
 * Watercolor Soft Wedding Invitation
 * Korean Mobile 청첩장 - Script
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
     Toast
     ═══════════════════════════════════════════ */

  let toastTimer = null;
  function showToast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2500);
  }

  /* ═══════════════════════════════════════════
     Clipboard
     ═══════════════════════════════════════════ */

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
     Curtain (Watercolor Wash)
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtain');
    const btn = $('#curtainBtn');
    const namesEl = $('#curtainNames');
    const heroSection = $('#hero');

    if (CONFIG.useCurtain === false) {
      if (curtain) curtain.style.display = 'none';
      if (heroSection) {
        heroSection.style.setProperty('opacity', '1', 'important');
        heroSection.style.setProperty('visibility', 'visible', 'important');
      }
      initSparkles();
      return;
    }

    if (namesEl) {
      namesEl.textContent = `${CONFIG.groom.name}  &  ${CONFIG.bride.name}`;
    }

    if (btn) {
      btn.addEventListener('click', () => {
        // 1. 대문 커튼이 열리기 시작
        curtain.classList.add('is-open');
        document.body.classList.remove('no-scroll');
        
        // 2. 💡 버튼 누르자마자 딜레이(setTimeout) 없이 즉시 트랜지션을 걸어 
        // 커튼이 사라지는 궤적에 맞춰 자연스럽게 스르륵 떠오르도록 만듭니다.
        if (heroSection) {
          heroSection.style.setProperty('transition', 'opacity 1.5s ease-in-out, visibility 1.5s', 'important');
          heroSection.style.setProperty('opacity', '1', 'important');
          heroSection.style.setProperty('visibility', 'visible', 'important');
        }

        // 3. 커튼 완전히 사라짐 및 스크롤 이동
        setTimeout(() => {
          curtain.classList.add('is-hidden');
          initSparkles();      
          
          if (heroSection) {
            heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 1400);
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
      'rgba(232, 223, 240, 0.6)',  // lavender
      'rgba(245, 224, 224, 0.6)',  // blush
      'rgba(220, 232, 240, 0.55)', // sky
      'rgba(224, 240, 232, 0.55)', // mint
      'rgba(196, 168, 212, 0.4)',  // accent
      'rgba(255, 255, 255, 0.7)'   // white sparkle
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
        // 0 = circle confetti, 1 = sparkle star, 2 = soft blob
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
          // Circle confetti
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 1) {
          // Sparkle star (4-point)
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
          // Soft blob
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
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    // $('#heroPhoto').src = 'images/hero/1.jpg';
    // $('#heroNames').textContent = `${CONFIG.groom.name}  ·  ${CONFIG.bride.name}`;
    // $('#heroDate').textContent = formatDate(CONFIG.wedding.date, CONFIG.wedding.time);
    // $('#heroVenue').textContent = CONFIG.wedding.venue;
    
    const heroImg = $('#heroPhoto');
    if (heroImg) {
      // 커튼 뒤에서 이미지가 미리 완벽하게 다운로드되도록 처리
      const imgPreload = new Image();
      imgPreload.src = 'images/hero/1.jpg';
      imgPreload.onload = function() {
        heroImg.src = 'images/hero/1.jpg';
      };
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
        $('#countDays').textContent = '0';
        $('#countHours').textContent = '0';
        $('#countMinutes').textContent = '0';
        $('#countSeconds').textContent = '0';
        labelEl.textContent = '결혼식이 시작되었습니다';
        return;
      }

      const totalDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
      labelEl.textContent = `결혼식까지 D-${totalDays}`;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      $('#countDays').textContent = days;
      $('#countHours').textContent = String(hours).padStart(2, '0');
      $('#countMinutes').textContent = String(minutes).padStart(2, '0');
      $('#countSeconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     Greeting Section
     ═══════════════════════════════════════════ */

  function initGreeting() {
    $('#greetingTitle').textContent = CONFIG.greeting.title;
    $('#greetingContent').textContent = CONFIG.greeting.content;

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
        의 　딸 <span class="child-name">${b.name}</span>
      </div>
    `;

    $('#greetingParents').innerHTML = parentsHTML;
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

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    // grid.innerHTML = `<div class="calendar__header">${monthNames[month]} ${year}</div>`;
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

    // Google Calendar link
    const startDate = dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDt = new Date(dt.getTime() + 2 * 60 * 60 * 1000);
    const endDate = endDt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(CONFIG.groom.name + ' ♥ ' + CONFIG.bride.name + ' 결혼식')}&dates=${startDate}/${endDate}&location=${encodeURIComponent(CONFIG.wedding.venue + ' ' + CONFIG.wedding.address)}&details=${encodeURIComponent('결혼식에 초대합니다.')}`;
    $('#googleCalBtn').href = gcalUrl;

    // ICS download (Apple Calendar)
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

  /* ═══════════════════════════════════════════
     Story Section
     ═══════════════════════════════════════════ */

  function initStory(storyImages) {
    $('#storyTitle').textContent = CONFIG.story.title;
    $('#storyContent').textContent = CONFIG.story.content;

    const container = $('#storyPhotos');
    const placeholder = container.querySelector('.loading-placeholder');
    if (placeholder) placeholder.remove();

    if (storyImages.length === 0) return;

    storyImages.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'story__photo-item animate-item';
      div.setAttribute('data-animate', 'fade-up');
      div.innerHTML = `<img src="${src}" alt="스토리 사진 ${i + 1}" loading="lazy">`;
      div.addEventListener('click', () => openPhotoModal(storyImages, i));
      container.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Gallery Section
     ═══════════════════════════════════════════ */

  function initGallery(galleryImages) {
    const grid = $('#galleryGrid');
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
      div.addEventListener('click', () => openPhotoModal(galleryImages, i));
      grid.appendChild(div);
    });
  }

  /* ═══════════════════════════════════════════
     Photo Modal (with swipe)
     ═══════════════════════════════════════════ */

  let modalImages = [];
  let modalIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;

  function openPhotoModal(images, index) {
    modalImages = images;
    modalIndex = index;
    showModalImage();
    $('#photoModal').classList.add('is-open');
    document.body.classList.add('no-scroll');
  }

  function closePhotoModal() {
    $('#photoModal').classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  function showModalImage() {
    const img = $('#modalImg');
    img.src = modalImages[modalIndex];
    $('#modalCounter').textContent = `${modalIndex + 1} / ${modalImages.length}`;

    $('#modalPrev').style.display = modalIndex > 0 ? '' : 'none';
    $('#modalNext').style.display = modalIndex < modalImages.length - 1 ? '' : 'none';
  }

  function modalNavigate(dir) {
    const newIndex = modalIndex + dir;
    if (newIndex >= 0 && newIndex < modalImages.length) {
      modalIndex = newIndex;
      showModalImage();
    }
  }

  function initPhotoModal() {
    $('#modalClose').addEventListener('click', closePhotoModal);
    $('#modalPrev').addEventListener('click', () => modalNavigate(-1));
    $('#modalNext').addEventListener('click', () => modalNavigate(1));

    const modal = $('#photoModal');
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'modalContainer') {
        closePhotoModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePhotoModal();
      if (e.key === 'ArrowLeft') modalNavigate(-1);
      if (e.key === 'ArrowRight') modalNavigate(1);
    });

    // Swipe support
    const container = $('#modalContainer');

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe || Math.abs(diffX) < Math.abs(diffY)) return;

    if (diffX > 0) {
      modalNavigate(1);
    } else {
      modalNavigate(-1);
    }
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  /*
  function initLocation() {
    const w = CONFIG.wedding;
    const ml = CONFIG.mapLinks;
    $('#locationVenue').textContent = w.venue;
    $('#locationHall').textContent = w.hall;
    $('#locationAddress').textContent = w.address;
    $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    $('#locationMapImg').src = 'images/location/1.jpg';
    $('#kakaoMapBtn').href = ml.kakao || '#';
    $('#naverMapBtn').href = ml.naver || '#';

    $('#copyAddressBtn').addEventListener('click', () => {
      copyToClipboard(w.address, '주소가 복사되었습니다');
    });
  }
  */

  function initLocation() {
    const w = CONFIG.wedding;
    const ml = CONFIG.mapLinks;
    $('#locationVenue').textContent = w.venue;
    $('#locationHall').textContent = w.hall;
    $('#locationAddress').textContent = w.address;
    $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    
    // 기존의 #locationMapImg.src 코드는 에러를 유발하므로 완전히 삭제했습니다.
    
    $('#kakaoMapBtn').href = ml.kakao || '#';
    $('#naverMapBtn').href = ml.naver || '#';

    $('#copyAddressBtn').addEventListener('click', () => {
      copyToClipboard(w.address, '주소가 복사되었습니다');
    });

    // ─── 카카오 지도 로드 및 생성 ───
    const mapContainer = document.getElementById('daumMap'); 
    if (!mapContainer || typeof kakao === 'undefined') return; 

    // API 스크립트가 완벽히 로드된 후 실행하도록 보장
    kakao.maps.load(function () {
      const mapOption = {
          center: new kakao.maps.LatLng(37.8853, 127.7544), // 기본 중심 좌표
          level: 3 // 확대 레벨
      };

      const map = new kakao.maps.Map(mapContainer, mapOption);
      const geocoder = new kakao.maps.services.Geocoder();

      // config.js의 주소를 기반으로 좌표 검색
      geocoder.addressSearch(w.address, function(result, status) {
          if (status === kakao.maps.services.Status.OK) {
              const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

              // 예식장 위치에 마커 생성
              const marker = new kakao.maps.Marker({
                  map: map,
                  position: coords
              });

              // 마커 위에 띄울 이쁜 말풍선(인포윈도우) 생성
              const infowindow = new kakao.maps.InfoWindow({
                  content: `<div style="width:150px; text-align:center; padding:6px 0; font-family:'Nanum Myeongjo', serif; font-size:12px; color:#4a4a4a; border:none;">${w.venue}</div>`
              });
              infowindow.open(map, marker);

              // 지도의 중심을 예식장 좌표로 세팅
              map.setCenter(coords);
              
              // 초대장 애니메이션(Fade-in 등)과 타이밍이 겹쳐서 지도가 깨지거나 하얗게 보이는 현상 방지
              setTimeout(() => {
                  map.relayout();
                  map.setCenter(coords);
              }, 600);
          } else {
              console.error("카카오맵 주소 변환 실패. 상태 코드: ", status);
          }
      });
    });
  }
  
  /* ═══════════════════════════════════════════
     Account Section (축의금)
     ═══════════════════════════════════════════ */

  function renderAccounts(accounts, containerId) {
    const container = $(`#${containerId}`);
    accounts.forEach((acc) => {
      const item = document.createElement('div');
      item.className = 'account-item';
      // item.innerHTML = `
      //   <div class="account-item__info">
      //     <div class="account-item__role">${acc.role}</div>
      //     <div class="account-item__detail">
      //       <span class="account-item__name">${acc.name || ''}</span>
      //       ${acc.bank} ${acc.number}
      //     </div>
      //   </div>
      //   <button class="account-item__copy" data-account="${acc.bank} ${acc.number}">
      //     복사
      //   </button>
      // `;
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

    // Copy account delegates
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.account-item__copy');
      if (!btn) return;
      const text = btn.dataset.account;
      copyToClipboard(text, '계좌번호가 복사되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     Footer
     ═══════════════════════════════════════════ */

  function initFooter() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    $('#footerText').textContent = `${CONFIG.groom.name} & ${CONFIG.bride.name} — ${year}.${month}.${day}`;
  }

  /* ═══════════════════════════════════════════
     Loading Placeholders
     ═══════════════════════════════════════════ */

  function showLoadingPlaceholders() {
    const storyPhotos = $('#storyPhotos');
    const galleryGrid = $('#galleryGrid');

    const placeholderHTML = '<div class="loading-placeholder"><span class="loading-dot"></span><span class="loading-dot"></span><span class="loading-dot"></span></div>';

    if (storyPhotos) storyPhotos.innerHTML = placeholderHTML;
    if (galleryGrid) galleryGrid.innerHTML = placeholderHTML;
  }

  /* ═══════════════════════════════════════════
     Scroll Animations (IntersectionObserver)
     ═══════════════════════════════════════════ */

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
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    $$('.animate-item').forEach((el) => observer.observe(el));

    // Re-observe after dynamic content is added
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
     Init
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

    $('#storyTitle').textContent = CONFIG.story.title;
    $('#storyContent').textContent = CONFIG.story.content;

    const [storyImages, galleryImages] = await Promise.all([
      loadImagesFromFolder('story'),
      loadImagesFromFolder('gallery')
    ]);

    initStory(storyImages);
    initGallery(galleryImages);

    /* 2026.06.12. 방명록 및 참석여부 기능 추가 */
    // ─── Firebase 데이터 분리형 연동 (RSVP / 방명록) ───
    const firebaseConfig = {
      apiKey: "AIzaSyCuGgS156629uvEj6Qv5KSO6gtq4CHtHM4",
      authDomain: "ssha-wedding.firebaseapp.com",
      databaseURL: "https://ssha-wedding-default-rtdb.firebaseio.com",
      projectId: "ssha-wedding",
      storageBucket: "ssha-wedding.firebasestorage.app",
      messagingSenderId: "439719249640",
      appId: "1:439719249640:web:0ba4c7676654ef54a12b5d"
    };

    // Firebase 초기화
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();
    
    // 💡 저장 경로를 각각 분리합니다.
    const rsvpRef = database.ref('rsvp');
    const guestbookRef = database.ref('guestbook');

    const $rsvpForm = document.getElementById('rsvpForm');
    const $gbForm = document.getElementById('guestbookForm');
    const $gbList = document.getElementById('guestbookList');

    // [1] RSVP 참석 여부만 따로 저장하기 (인원수 직접 입력 버전)
    if ($rsvpForm) {
      const attendRadios = document.querySelectorAll('input[name="rsvpAttend"]');
      const countGroup = document.getElementById('rsvpCountGroup');
      const $rsvpCount = document.getElementById('rsvpCount');
      
      attendRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.value === '미참석') {
            countGroup.style.display = 'none'; // 미참석 시 인원수 입력창 숨김
          } else {
            countGroup.style.display = 'flex'; // 참석 시 인원수 입력창 보임
          }
        });
      });

      $rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('rsvpName').value.trim();
        const side = document.querySelector('input[name="rsvpSide"]:checked').value;
        const attend = document.querySelector('input[name="rsvpAttend"]:checked').value;
        const meal = document.querySelector('input[name="rsvpMeal"]:checked').value;
        
        // 💡 미참석일 때는 0명, 참석일 때는 입력된 숫자 뒤에 '명'을 붙여서 저장
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

        // Firebase 데이터베이스에 깔끔하게 저장
        const newRsvpRef = rsvpRef.push();
        newRsvpRef.set({
          name: name,
          side: side,
          attend: attend,
          meal: meal,
          count: count,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }, (error) => {
          if (error) {
            alert('전송에 실패했습니다. 다시 시도해 주세요.');
          } else {
            showToast('참석 의사가 신랑 신부에게 전달되었습니다 🌸');
            document.getElementById('rsvpName').value = ''; // 성함 칸 리셋
            $rsvpCount.value = '1'; // 인원수 초기화
          }
        });
      });
    }

    // [2] 축하 메시지만 따로 저장하기 (방명록)
    if ($gbForm) {
      $gbForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('gbName').value.trim();
        const password = document.getElementById('gbPassword').value.trim();
        const message = document.getElementById('gbMessage').value.trim();

        if (!name || !password || !message) return;

        // guestbook 서랍에 데이터 넣기
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

    // [3] 축하 메시지(방명록)만 실시간으로 읽어와서 하단에 뿌려주기
    guestbookRef.on('value', (snapshot) => {
      $gbList.innerHTML = '';
      const data = snapshot.val();
      if (!data) {
        $gbList.innerHTML = `<p style="text-align:center; color:var(--color-text-muted); font-size:0.9rem; padding: 30px 0; font-family: 'Nanum Myeongjo', serif;">첫 번째 축하 메시지를 남겨주세요 🌸</p>`;
        return;
      }

      // 최신순 정렬
      const keys = Object.keys(data).reverse();
      keys.forEach((key) => {
        const post = data[key];
        const date = new Date(post.timestamp).toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const card = document.createElement('div');
        card.className = 'gb-card';
        card.style.marginBottom = '12px';
        
        card.innerHTML = `
          <div class="gb-card__header">
            <strong class="gb-card__name">${escapeHtml(post.name)}</strong>
            <span class="gb-card__date">${date}</span>
          </div>
          <p class="gb-card__msg">${escapeHtml(post.message)}</p>
          <button class="gb-card__delete-btn" onclick="deleteGuestbookPost('${key}', '${post.password}')">삭제</button>
        `;

        $gbList.appendChild(card);
      });
    });

    // 안전장치 (XSS 공격 방지)
    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    // [4] 방명록 삭제 기능
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
    // ─── Firebase 기능 끝 ───
      
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }  
})();

/* ═══════════════════════════════════════════
   💡 글로벌 외부 호출 연동용 아코디언 & 복사 함수
   ═══════════════════════════════════════════ */

// [1] 계좌번호 아코디언 토글 함수
window.toggleRemit = function(id) {
  const target = document.getElementById(id);
  if (target.style.display === 'none') {
    target.style.display = 'block';
  } else {
    target.style.display = 'none';
  }
};

// [2] 텍스트 클립보드 복사 함수
window.copyText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showToast === 'function') {
      showToast('계좌번호가 복사되었습니다 🌸');
    } else {
      alert('계좌번호가 복사되었습니다.');
    }
  });
};
