/**
 * Watercolor Soft Wedding Invitation
 * Korean Mobile 청첩장 - Script (페이드인 완벽 융합본)
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
     Curtain (Watercolor Wash) - 💡 페이드인 융합 버전
     ═══════════════════════════════════════════ */

  function initCurtain() {
    const curtain = $('#curtain');
    const btn = $('#curtainBtn');
    const namesEl = $('#curtainNames');
    const heroSection = $('#hero'); 

    if (CONFIG.useCurtain === false) {
      curtain.style.display = 'none';
      if (heroSection) heroSection.classList.add('is-visible'); 
      initSparkles();
      return;
    }

    namesEl.textContent = `${CONFIG.groom.name}  &  ${CONFIG.bride.name}`;

    btn.addEventListener('click', () => {
      // 1. 커튼이 열리는 애니메이션 시작
      curtain.classList.add('is-open');
      document.body.classList.remove('no-scroll');
      
      // 2. 💡 중요: 커튼이 절반쯤 걷혔을 때(0.5초 뒤) 메인 화면을 스르륵 페이드인 시킵니다.
      setTimeout(() => {
        if (heroSection) {
          heroSection.classList.add('is-visible');
        }
      }, 500);

      // 3. 커튼 완전히 치우기 및 꽃가루 효과 시작
      setTimeout(() => {
        curtain.classList.add('is-hidden');
        initSparkles();      
        
        // 4. 모든 등장이 완료되면 메인 화면 최상단으로 부드럽게 스크롤 이동
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 1400);
    });

    document.body.classList.add('no-scroll');
  }

  /* ═══════════════════════════════════════════
     Sparkles Effect (꽃가루)
     ═══════════════════════════════════════════ */

  function initSparkles() {
    if (CONFIG.useSparkles === false) return;
    const container = $('#sparklesContainer');
    if (!container) return;

    const colors = ['#f5e0e0', '#e8dff0', '#dce8f0', '#ffffff', '#fdfbf8'];
    const totalCount = 45;

    for (let i = 0; i < totalCount; i++) {
      const p = document.createElement('div');
      p.className = 'sparkle';
      
      const size = Math.random() * 8 + 4;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${Math.random() * 100}%`;
      
      const delay = Math.random() * 4;
      const duration = Math.random() * 3 + 3;
      p.style.animationDelay = `${delay}s`;
      p.style.animationDuration = `${duration}s`;
      
      if (Math.random() > 0.5) {
        p.style.borderRadius = '50%';
      } else {
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
      }

      container.appendChild(p);
    }

    setTimeout(() => {
      container.style.opacity = '0';
      container.style.transition = 'opacity 1.5s ease';
      setTimeout(() => container.remove(), 1500);
    }, 6000);
  }

  /* ═══════════════════════════════════════════
     Hero Section
     ═══════════════════════════════════════════ */

  function initHero() {
    const w = CONFIG.wedding;
    $('#heroNames').textContent = `${CONFIG.groom.name}  ·  ${CONFIG.bride.name}`;
    $('#heroMeta').textContent = `${w.dateText} ${w.timeText} | ${w.venue}`;
  }

  /* ═══════════════════════════════════════════
     Countdown Section
     ═══════════════════════════════════════════ */

  function initCountdown() {
    const target = getWeddingDateTime();

    function update() {
      const now = new Date();
      const diff = target - now;
      const labelEl = $('#countdownLabel');

      if (diff <= 0) {
        $('#countDays').textContent = '0';
        $('#countHours').textContent = '00';
        $('#countMinutes').textContent = '00';
        $('#countSeconds').textContent = '00';
        labelEl.textContent = '결혼식이 시작되었습니다 🌸';
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
    $('#greetingText').innerHTML = CONFIG.greeting.text.replace(/\n/g, '<br>');

    const g = CONFIG.groom;
    const b = CONFIG.bride;
    $('#relationsGroom').innerHTML = `${g.father} · ${g.mother}<span class="relation-bi">의 장남</span> <strong>${g.name}</strong>`;
    $('#relationsBride').innerHTML = `${b.father} · ${b.mother}<span class="relation-bi">의 장녀</span> <strong>${b.name}</strong>`;
  }

  /* ═══════════════════════════════════════════
     Calendar Section
     ═══════════════════════════════════════════ */

  function initCalendar() {
    const dt = getWeddingDateTime();
    const year = dt.getFullYear();
    const month = dt.getMonth(); 
    const weddingDate = dt.getDate();

    $('#calendarMonthText').textContent = `${year}.${String(month + 1).padStart(2, '0')}`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 0, 0).getDate(); 
    const prevLastDate = new Date(year, month, 0).getDate();

    const daysContainer = $('#calendarDays');
    daysContainer.innerHTML = '';

    for (let i = firstDay - 1; i >= 0; i--) {
      const cell = document.createElement('span');
      cell.className = 'calendar__day calendar__day--empty';
      cell.textContent = prevLastDate - i;
      daysContainer.appendChild(cell);
    }

    for (let d = 1; d <= 31; d++) {
      const cell = document.createElement('span');
      cell.className = 'calendar__day';
      cell.textContent = d;

      if (d === weddingDate) {
        cell.classList.add('calendar__day--current');
      }
      daysContainer.appendChild(cell);
    }

    const totalCells = firstDay + 31;
    const nextEmpty = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= nextEmpty; i++) {
      const cell = document.createElement('span');
      cell.className = 'calendar__day calendar__day--empty';
      cell.textContent = i;
      daysContainer.appendChild(cell);
    }
  }

  /* ═══════════════════════════════════════════
     Photo / Gallery Helpers
     ═══════════════════════════════════════════ */

  async function loadImagesFromFolder(folderName) {
    try {
      const response = await fetch(`https://api.github.com/repos/hyyuunaah/ssha-wedding/contents/images/${folderName}`);
      if (!response.ok) return [];
      const files = await response.json();
      return files
        .filter(file => /\.(jfif|jpg|jpeg|png|gif|webp)$/i.test(file.name))
        .map(file => `images/${folderName}/${file.name}`);
    } catch (e) {
      console.error(`${folderName} 이미지 로드 실패:`, e);
      return [];
    }
  }

  function initStory(images) {
    const container = $('#storyPhotos');
    if (!container) return;
    container.innerHTML = '';

    if (images.length === 0) {
      container.innerHTML = '<p class="no-data">등록된 소중한 스토리가 없습니다 🌸</p>';
      return;
    }

    images.forEach((src) => {
      const slide = document.createElement('div');
      slide.className = 'story-slide animate-item';
      slide.setAttribute('data-animate', 'fade-up');
      slide.innerHTML = `<img src="${src}" alt="Story Photo" loading="lazy">`;
      container.appendChild(slide);
    });
  }

  function initGallery(images) {
    const grid = $('#galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (images.length === 0) {
      grid.innerHTML = '<p class="no-data">갤러리 이미지가 준비 중입니다 ✨</p>';
      return;
    }

    images.forEach((src, idx) => {
      const item = document.createElement('div');
      item.className = 'gallery__item animate-item';
      item.setAttribute('data-animate', 'fade-up');
      item.innerHTML = `<img src="${src}" alt="Gallery Thumbnail ${idx+1}" loading="lazy" data-index="${idx}">`;
      grid.appendChild(item);
    });

    grid.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;
      const idx = parseInt(img.dataset.index, 10);
      openModal(images, idx);
    });
  }

  /* ═══════════════════════════════════════════
     Lightbox Modal (미리보기 창)
     ═══════════════════════════════════════════ */

  let currentGalleryImages = [];
  let currentModalIndex = 0;

  function initPhotoModal() {
    const modal = $('#photoModal');
    if (!modal) return;

    $('.modal__close', modal).addEventListener('click', closeModal);
    $('.modal__arrow--left', modal).addEventListener('click', prevModalSlide);
    $('.modal__arrow--right', modal).addEventListener('click', nextModalSlide);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal__wrapper')) {
        closeModal();
      }
    });

    let touchStartX = 0;
    modal.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    modal.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 60) nextModalSlide();
      if (touchEndX - touchStartX > 60) prevModalSlide();
    }, {passive: true});
  }

  function openModal(images, index) {
    currentGalleryImages = images;
    currentModalIndex = index;
    const modal = $('#photoModal');
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    updateModalSlide();
  }

  function closeModal() {
    $('#photoModal').classList.remove('is-active');
    document.body.style.overflow = '';
  }

  function updateModalSlide() {
    const img = $('#modalImg');
    img.src = currentGalleryImages[currentModalIndex];
    $('#modalCounter').textContent = `${currentModalIndex + 1} / ${currentGalleryImages.length}`;
  }

  function nextModalSlide() {
    if (currentGalleryImages.length === 0) return;
    currentModalIndex = (currentModalIndex + 1) % currentGalleryImages.length;
    updateModalSlide();
  }

  function prevModalSlide() {
    if (currentGalleryImages.length === 0) return;
    currentModalIndex = (currentModalIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    updateModalSlide();
  }

  /* ═══════════════════════════════════════════
     Location Section
     ═══════════════════════════════════════════ */

  function initLocation() {
    const w = CONFIG.wedding;
    const ml = CONFIG.mapLinks;
    $('#locationVenue').textContent = w.venue;
    $('#locationHall').textContent = w.hall;
    $('#locationAddress').textContent = w.address;
    $('#locationTel').textContent = w.tel ? `Tel. ${w.tel}` : '';
    
    $('#kakaoMapBtn').href = ml.kakao || '#';
    $('#naverMapBtn').href = ml.naver || '#';
    $('#copyAddressBtn').addEventListener('click', () => {
      copyToClipboard(w.address, '주소가 복사되었습니다');
    });

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

    // ─── Firebase 데이터 연동 ───
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
            countGroup.style.display = 'none';
          } else {
            countGroup.style.display = 'flex';
          }
        });
      });

      $rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rsvpName').value.trim();
        const side = document.querySelector('input[name="rsvpSide"]:checked').value;
        const attend = document.querySelector('input[name="rsvpAttend"]:checked').value;
        const meal = document.querySelector('input[name="rsvpMeal"]:checked').value;
        
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
          meal: meal,
          count: count,
          timestamp: firebase.database.ServerValue.TIMESTAMP
        }, (error) => {
          if (error) {
            alert('전송에 실패했습니다. 다시 시도해 주세요.');
          } else {
            showToast('참석 의사가 신랑 신부에게 전달되었습니다 🌸');
            document.getElementById('rsvpName').value = '';
            $rsvpCount.value = '1';
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

    guestbookRef.on('value', (snapshot) => {
      $gbList.innerHTML = '';
      const data = snapshot.val();
      if (!data) {
        $gbList.innerHTML = `<p style="text-align:center; color:var(--color-text-muted); font-size:0.9rem; padding: 30px 0; font-family: 'Nanum Myeongjo', serif;">첫 번째 축하 메시지를 남겨주세요 🌸</p>`;
        return;
      }

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

  function setMetaTags() {
    if (typeof CONFIG === 'undefined' || !CONFIG.wedding) return;
    const w = CONFIG.wedding;
    document.title = `${CONFIG.groom.name} ♡ ${CONFIG.bride.name} 결혼합니다`;
    
    const metaTitle = document.querySelector('meta[property="og:title"]');
    if (metaTitle) metaTitle.setAttribute('content', `${CONFIG.groom.name} ♡ ${CONFIG.bride.name} 결혼합니다`);

    const metaDesc = document.querySelector('meta[property="og:description"]');
    const descText = `${w.dateText} ${w.timeText} | ${w.venue}`;
    if (metaDesc) metaDesc.setAttribute('content', descText);
  }

  function copyToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMessage || '복사되었습니다 🌸');
      }).catch(err => {
        fallbackCopyText(text, successMessage);
      });
    } else {
      fallbackCopyText(text, successMessage);
    }
  }

  function fallbackCopyText(text, successMessage) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(successMessage || '복사되었습니다 🌸');
    } catch (err) {
      alert('복사에 실패했습니다. 직접 선택해 복사해 주세요.');
    }
    document.body.removeChild(textArea);
  }

  function showToast(message) {
    let toast = document.getElementById('wcToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'wcToast';
      toast.className = 'wc-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-active');
    setTimeout(() => {
      toast.classList.remove('is-active');
    }, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }  
})(); 
// ─── 💡 큰 항아리 괄호가 여기서 무사히 정상 종료됩니다. ───


/* ═══════════════════════════════════════════
   💡 글로벌 연동용 아코디언 & 복사 함수 (안전지대 배치)
   ═══════════════════════════════════════════ */

// [1] 아코디언 토글 함수
window.toggleRemit = function(id) {
  const target = document.getElementById(id);
  if (!target) return;
  if (target.style.display === 'none' || !target.style.display) {
    target.style.display = 'block';
  } else {
    target.style.display = 'none';
  }
};

// [2] 텍스트 클립보드 복사 함수
window.copyText = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    let toast = document.getElementById('wcToast');
    if (toast) {
      toast.textContent = '계좌번호가 복사되었습니다 🌸';
      toast.classList.add('is-active');
      setTimeout(() => toast.classList.remove('is-active'), 2500);
    } else {
      alert('계좌번호가 복사되었습니다 🌸');
    }
  });
};
