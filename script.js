/* ==========================================================================
   Main Application Script — Minecrafteri
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic copyright year
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Helper escape function
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // ========================================================================
  // 2. Lightbox Modal Component
  // ========================================================================
  const lightboxDialog = document.querySelector('#lightbox-dialog');
  const lightboxImg = document.querySelector('#lightbox-img');
  const lightboxTitle = document.querySelector('#lightbox-title');
  const lightboxDate = document.querySelector('#lightbox-date');
  const lightboxCloseBtn = document.querySelector('#lightbox-close-btn');
  const lightboxPrevBtn = document.querySelector('#lightbox-prev-btn');
  const lightboxNextBtn = document.querySelector('#lightbox-next-btn');

  let lightboxItems = [];
  let currentLightboxIndex = 0;

  function updateLightboxView() {
    if (!lightboxItems.length) return;
    const item = lightboxItems[currentLightboxIndex];
    if (lightboxImg) {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt || item.caption || '';
    }
    if (lightboxTitle) lightboxTitle.textContent = item.caption || 'Скриншот сервера';
    if (lightboxDate) {
      if (item.date) {
        lightboxDate.textContent = item.date;
        lightboxDate.style.display = 'inline-block';
      } else {
        lightboxDate.style.display = 'none';
      }
    }
    if (lightboxPrevBtn && lightboxNextBtn) {
      const showArrows = lightboxItems.length > 1;
      lightboxPrevBtn.style.display = showArrows ? 'grid' : 'none';
      lightboxNextBtn.style.display = showArrows ? 'grid' : 'none';
    }
  }

  function openLightbox(items, startIndex = 0) {
    if (!lightboxDialog || !items || !items.length) return;
    lightboxItems = items;
    currentLightboxIndex = (startIndex + items.length) % items.length;
    updateLightboxView();
    if (typeof lightboxDialog.showModal === 'function') {
      lightboxDialog.showModal();
    } else {
      lightboxDialog.setAttribute('open', '');
    }
  }

  function closeLightbox() {
    if (!lightboxDialog) return;
    if (typeof lightboxDialog.close === 'function') {
      lightboxDialog.close();
    } else {
      lightboxDialog.removeAttribute('open');
    }
  }

  function prevLightboxItem() {
    if (lightboxItems.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
    updateLightboxView();
  }

  function nextLightboxItem() {
    if (lightboxItems.length <= 1) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % lightboxItems.length;
    updateLightboxView();
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevLightboxItem);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextLightboxItem);

  if (lightboxDialog) {
    lightboxDialog.addEventListener('click', (event) => {
      if (event.target === lightboxDialog) closeLightbox();
    });
    lightboxDialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') prevLightboxItem();
      if (event.key === 'ArrowRight') nextLightboxItem();
    });
  }

  // ========================================================================
  // 3. Hero Carousel Component (Perfect 1:1 Symmetric Alignment)
  // ========================================================================
  const galleryEl = document.querySelector('#gallery');
  const gallerySlides = [...document.querySelectorAll('.gallery-slide')];
  const galleryDots = [...document.querySelectorAll('.gallery-dot')];
  const galleryPrevBtn = document.querySelector('.gallery-prev');
  const galleryNextBtn = document.querySelector('.gallery-next');

  let activeIndex = 0;
  let carouselTimer = null;
  const slideDuration = 5000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function goToSlide(nextIndex) {
    if (!gallerySlides.length) return;
    const count = gallerySlides.length;
    nextIndex = (nextIndex + count) % count;
    if (nextIndex === activeIndex) return;

    const outgoingSlide = gallerySlides[activeIndex];
    const incomingSlide = gallerySlides[nextIndex];

    outgoingSlide.classList.remove('is-active');
    outgoingSlide.classList.add('is-leaving');
    incomingSlide.classList.add('is-active');

    activeIndex = nextIndex;

    // Update Dots
    galleryDots.forEach((dot, idx) => {
      const isActive = idx === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    window.setTimeout(() => {
      outgoingSlide.classList.remove('is-leaving');
    }, 450);
  }

  function nextSlide() {
    goToSlide(activeIndex + 1);
  }

  function prevSlide() {
    goToSlide(activeIndex - 1);
  }

  function startCarouselTimer() {
    if (gallerySlides.length <= 1 || prefersReducedMotion) return;
    stopCarouselTimer();
    carouselTimer = window.setInterval(nextSlide, slideDuration);
  }

  function stopCarouselTimer() {
    if (carouselTimer) {
      clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  // Setup Event Listeners for Carousel
  if (gallerySlides.length > 0) {
    galleryDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === 0);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startCarouselTimer();
      });
    });

    if (galleryPrevBtn) {
      galleryPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
        startCarouselTimer();
      });
    }

    if (galleryNextBtn) {
      galleryNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
        startCarouselTimer();
      });
    }

    if (galleryEl) {
      galleryEl.addEventListener('mouseenter', stopCarouselTimer);
      galleryEl.addEventListener('mouseleave', startCarouselTimer);

      galleryEl.setAttribute('tabindex', '0');
      galleryEl.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          prevSlide();
          startCarouselTimer();
        } else if (e.key === 'ArrowRight') {
          nextSlide();
          startCarouselTimer();
        }
      });

      // Touch swipe gestures
      let touchStartX = 0;
      let touchStartY = 0;
      galleryEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      }, { passive: true });

      galleryEl.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) nextSlide();
          else prevSlide();
          startCarouselTimer();
        }
      }, { passive: true });
    }

    startCarouselTimer();
  }

  // ========================================================================
  // 4. Archive Moments Section & Lightbox Hookup
  // ========================================================================
  const momentCards = [...document.querySelectorAll('.moment-card')];
  const momentsData = momentCards.map((card) => {
    const img = card.querySelector('.moment-card-img');
    const titleEl = card.querySelector('.moment-card-title');
    const dateEl = card.querySelector('.moment-card-date');
    return {
      src: img ? img.getAttribute('src') : '',
      alt: img ? img.getAttribute('alt') : '',
      caption: titleEl ? titleEl.textContent.trim() : 'Момент сервера',
      date: dateEl ? dateEl.textContent.trim() : ''
    };
  });

  momentCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      openLightbox(momentsData, index);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(momentsData, index);
      }
    });
  });

  // ========================================================================
  // 5. Server Status & Live Online Players Monitor
  // ========================================================================
  const headerStatusDot = document.querySelector('#header-status-dot');
  const headerServerOnline = document.querySelector('#header-server-online');
  const serverStatusDot = document.querySelector('#server-status-dot');
  const serverStatusBadge = document.querySelector('#server-status-badge');
  const serverVersionBadge = document.querySelector('#server-version-badge');
  const statusTitle = document.querySelector('#status-title');
  const serverMotd = document.querySelector('#server-motd');
  const serverFaviconImg = document.querySelector('#server-favicon-img');
  const serverIpAddress = document.querySelector('#server-ip-address');
  const serverPlayersText = document.querySelector('#server-players-text');
  const serverPrivacyNotice = document.querySelector('#server-privacy-notice');
  const noticeTitle = document.querySelector('#notice-title');
  const noticeDesc = document.querySelector('#notice-desc');
  const playersGrid = document.querySelector('#players-grid');
  const playersEmptyMsg = document.querySelector('#players-empty-msg');
  const buttonCopyIp = document.querySelector('#button-copy-ip');
  const buttonEditIp = document.querySelector('#button-edit-ip');
  const serverIpEditForm = document.querySelector('#server-ip-edit-form');
  const serverIpInput = document.querySelector('#server-ip-input');
  const buttonSaveIp = document.querySelector('#button-save-ip');
  const buttonRefreshStatus = document.querySelector('#button-refresh-status');
  const presetChips = document.querySelectorAll('.preset-chip');
  const skinSearchForm = document.querySelector('#skin-search-form');
  const skinSearchInput = document.querySelector('#skin-search-input');
  const skinPreviewModal = document.querySelector('#skin-preview-modal');
  const skinPreviewAvatar = document.querySelector('#skin-preview-avatar');
  const skinPreviewName = document.querySelector('#skin-preview-name');
  const skinPreviewClose = document.querySelector('#skin-preview-close');

  const DEFAULT_IP = 'mc.rocketvanilla.ru';
  let currentServerIp = localStorage.getItem('mc_server_ip') || DEFAULT_IP;

  function renderPlayerCards(playersList, isOnline = true, note = '') {
    if (!playersGrid) return;

    if (!playersList || playersList.length === 0) {
      playersGrid.innerHTML = '';
      if (playersEmptyMsg) {
        playersEmptyMsg.style.display = 'block';
        if (note) playersEmptyMsg.innerHTML = `<p>${escapeHtml(note)}</p>`;
        else playersEmptyMsg.innerHTML = '<p>Сейчас на сервере нет игроков. Заходи и исследуй мир первым!</p>';
      }
      return;
    }

    if (playersEmptyMsg) playersEmptyMsg.style.display = 'none';

    playersGrid.innerHTML = playersList.map((player) => {
      const name = typeof player === 'string' ? player : (player.name_clean || player.name || player.name_raw || 'Игрок');
      const role = isOnline ? 'В игре' : 'Не в сети';
      const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(name)}/40`;

      return `
        <article class="player-card" title="Игрок: ${escapeHtml(name)}">
          <img class="player-avatar" src="${avatarUrl}" alt="${escapeHtml(name)}" onerror="this.onerror=null;this.src='https://mc-heads.net/avatar/Steve/40';" loading="lazy" />
          <div class="player-info">
            <span class="player-name">${escapeHtml(name)}</span>
            <span class="player-status-tag"><i></i> ${escapeHtml(role)}</span>
          </div>
        </article>
      `;
    }).join('');
  }

  async function updateServerStatus(ip) {
    if (serverIpAddress) serverIpAddress.textContent = ip;
    if (serverIpInput) serverIpInput.value = ip;

    const isRv = ip.toLowerCase().includes('rocketvanilla');
    const isHypixel = ip.toLowerCase().includes('hypixel');

    try {
      // Query fast, public Minecraft Java Status API
      const response = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(ip)}`);
      if (!response.ok) throw new Error('API response not ok');
      const data = await response.json();

      if (data && data.online) {
        const onlineCount = data.players ? data.players.online : 0;
        const maxCount = data.players ? data.players.max : 20;

        // Header status pill
        if (headerStatusDot) headerStatusDot.classList.remove('is-offline');
        if (headerServerOnline) headerServerOnline.textContent = `Онлайн: ${onlineCount.toLocaleString()}/${maxCount.toLocaleString()}`;

        // Section status card
        if (serverStatusDot) serverStatusDot.classList.remove('is-offline');
        if (serverStatusBadge) {
          serverStatusBadge.textContent = 'СЕРВЕР ОНЛАЙН';
          serverStatusBadge.style.color = '#a8f07b';
        }

        // Server Title & MOTD
        if (statusTitle) {
          if (isRv) statusTitle.textContent = 'Rocket Vanilla — Онлайн';
          else if (isHypixel) statusTitle.textContent = 'Hypixel Network — Онлайн';
          else statusTitle.textContent = `${data.host || ip} — Онлайн`;
        }

        // Favicon Icon
        if (serverFaviconImg) {
          if (data.icon) {
            serverFaviconImg.src = data.icon;
          } else if (isRv) {
            serverFaviconImg.src = 'images/rv-logo.png';
          } else {
            serverFaviconImg.src = 'images/rv-logo.png';
          }
        }

        // Version badge
        if (serverVersionBadge) {
          if (data.version && data.version.name_clean) {
            serverVersionBadge.textContent = data.version.name_clean;
            serverVersionBadge.style.display = 'inline-flex';
          } else {
            serverVersionBadge.style.display = 'none';
          }
        }

        // Server MOTD
        if (serverMotd) {
          if (data.motd && data.motd.html) {
            serverMotd.innerHTML = data.motd.html;
          } else if (data.motd && data.motd.clean) {
            serverMotd.textContent = data.motd.clean;
          } else {
            serverMotd.textContent = 'Следи за онлайном и активными игроками сервера в реальном времени';
          }
        }

        if (serverPlayersText) {
          serverPlayersText.textContent = `Онлайн: ${onlineCount.toLocaleString()} / ${maxCount.toLocaleString()} игроков`;
        }

        // Filter and display ONLY genuine online players returned by the server
        const rawList = (data.players && Array.isArray(data.players.list)) ? data.players.list : [];
        const genuinePlayers = rawList.filter((p) => {
          const name = typeof p === 'string' ? p : (p.name_clean || p.name || p.name_raw || '');
          // Genuine Minecraft nicknames (3-16 chars, no spaces/advertising)
          return /^[a-zA-Z0-9_]{3,16}$/.test(name) && name !== 'Anonymous Player';
        });

        if (genuinePlayers.length > 0) {
          // Server provides genuine real players online right now
          if (serverPrivacyNotice) serverPrivacyNotice.style.display = 'none';
          renderPlayerCards(genuinePlayers, true);
        } else if (onlineCount > 0) {
          // Server has players online, but server proxy blocks the nicknames list
          if (serverPrivacyNotice) {
            serverPrivacyNotice.style.display = 'flex';
            if (noticeTitle) {
              noticeTitle.textContent = isHypixel 
                ? 'Сервер Hypixel скрывает список играющих игроков' 
                : 'Сервер скрывает список играющих игроков';
            }
            if (noticeDesc) {
              noticeDesc.textContent = isHypixel 
                ? `На Hypixel сейчас играют ${onlineCount.toLocaleString()} чел. Из-за огромного онлайна Hypixel блокирует передачу ников в сетевом запросе (защита от парсинга). Ни один внешний мониторинг не может показать скрытые сервером ники.` 
                : `На сервере сейчас играют ${onlineCount.toLocaleString()} чел., но в конфигурации сервера отключена публичная передача ников (hide-online-players).`;
            }
          }
          renderPlayerCards([], true, `На сервере сейчас играют ${onlineCount.toLocaleString()} чел., но список ников скрыт настройками сервера.`);
        } else {
          // 0 players online
          if (serverPrivacyNotice) serverPrivacyNotice.style.display = 'none';
          renderPlayerCards([], true, 'Сейчас на сервере нет игроков. Заходи первым!');
        }
      } else {
        // Server offline
        setOfflineState(ip, 'Сервер сейчас офлайн');
      }
    } catch (err) {
      // Network or API fallback
      setOfflineState(ip, 'Сервер на обслуживании');
    }
  }

  function setOfflineState(ip, statusText) {
    const isRv = ip.toLowerCase().includes('rocketvanilla');

    if (headerStatusDot) headerStatusDot.classList.add('is-offline');
    if (headerServerOnline) headerServerOnline.textContent = 'Сервер офлайн';

    if (serverStatusDot) serverStatusDot.classList.add('is-offline');
    if (serverStatusBadge) {
      serverStatusBadge.textContent = 'СЕРВЕР ОФЛАЙН';
      serverStatusBadge.style.color = '#ff6b6b';
    }
    if (statusTitle) {
      statusTitle.textContent = isRv ? 'Rocket Vanilla — Офлайн' : `${ip} — Офлайн`;
    }
    if (serverFaviconImg) {
      serverFaviconImg.src = 'images/rv-logo.png';
    }
    if (serverVersionBadge) {
      serverVersionBadge.style.display = 'none';
    }
    if (serverMotd) {
      serverMotd.textContent = 'Сервер временно недоступен или перезагружается. Проверьте адрес или попробуйте позже.';
    }
    if (serverPlayersText) {
      serverPlayersText.textContent = statusText || 'Сервер офлайн';
    }
    if (serverPrivacyNotice) {
      serverPrivacyNotice.style.display = 'none';
    }

    renderPlayerCards([], false, isRv 
      ? 'Сервер Rocket Vanilla готовится к новому сезону. Когда сервер будет запущен, здесь появятся реальные игроки онлайн.' 
      : 'Сервер не отвечает на запрос мониторинга.');
  }

  // Setup Server Controls
  if (buttonCopyIp) {
    buttonCopyIp.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(currentServerIp);
        const copyTextEl = buttonCopyIp.querySelector('.copy-text');
        buttonCopyIp.classList.add('is-copied');
        if (copyTextEl) copyTextEl.textContent = 'Скопировано!';
        window.setTimeout(() => {
          buttonCopyIp.classList.remove('is-copied');
          if (copyTextEl) copyTextEl.textContent = 'Скопировать';
        }, 2000);
      } catch (_) {
        prompt('IP сервера для подключения:', currentServerIp);
      }
    });
  }

  if (buttonEditIp && serverIpEditForm) {
    buttonEditIp.addEventListener('click', () => {
      const isHidden = serverIpEditForm.style.display === 'none';
      serverIpEditForm.style.display = isHidden ? 'flex' : 'none';
      if (isHidden && serverIpInput) {
        serverIpInput.focus();
        serverIpInput.select();
      }
    });
  }

  if (buttonSaveIp && serverIpInput) {
    const handleSave = () => {
      const newIp = serverIpInput.value.trim();
      if (newIp) {
        currentServerIp = newIp;
        localStorage.setItem('mc_server_ip', currentServerIp);
        serverIpEditForm.style.display = 'none';
        updateServerStatus(currentServerIp);
      }
    };
    buttonSaveIp.addEventListener('click', handleSave);
    serverIpInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSave();
    });
  }

  // Quick Preset Chips Click
  if (presetChips && presetChips.length) {
    presetChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const ip = chip.getAttribute('data-ip');
        if (ip) {
          currentServerIp = ip;
          localStorage.setItem('mc_server_ip', currentServerIp);
          if (serverIpInput) serverIpInput.value = ip;
          if (serverIpEditForm) serverIpEditForm.style.display = 'none';
          updateServerStatus(currentServerIp);
        }
      });
    });
  }

  // Live Skin Search Checker
  if (skinSearchForm && skinSearchInput) {
    skinSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nick = skinSearchInput.value.trim();
      if (!nick) return;

      if (skinPreviewModal && skinPreviewAvatar && skinPreviewName) {
        skinPreviewName.textContent = nick;
        skinPreviewAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(nick)}/64`;
        skinPreviewModal.style.display = 'block';
      }
    });
  }

  if (skinPreviewClose && skinPreviewModal) {
    skinPreviewClose.addEventListener('click', () => {
      skinPreviewModal.style.display = 'none';
    });
  }

  if (buttonRefreshStatus) {
    buttonRefreshStatus.addEventListener('click', async () => {
      buttonRefreshStatus.classList.add('is-loading');
      await updateServerStatus(currentServerIp);
      window.setTimeout(() => buttonRefreshStatus.classList.remove('is-loading'), 600);
    });
  }

  // Initial Server Status Fetch
  updateServerStatus(currentServerIp);

  // Auto-refresh server status every 60 seconds
  window.setInterval(() => updateServerStatus(currentServerIp), 60000);

  // ========================================================================
  // 6. Single-Page Navigation & Dynamic Height Calculation
  // ========================================================================
  const pageViewport = document.querySelector('#page-viewport');
  const pageTrack = document.querySelector('#page-track');
  const homePage = document.querySelector('#home-page');
  const rv3Page = document.querySelector('#rv3');
  let currentPage = 'home';

  function updateViewportHeight() {
    if (!pageViewport) return;
    const activePage = currentPage === 'rv3' ? rv3Page : homePage;
    if (activePage) {
      pageViewport.style.height = `${activePage.scrollHeight}px`;
    }
  }

  function showPage(page, scrollToTop = true) {
    currentPage = page;
    const isRv3 = page === 'rv3';
    if (pageTrack) pageTrack.classList.toggle('show-rv3', isRv3);

    document.querySelectorAll('.nav-link').forEach((link) => {
      const active = link.hash === `#${page}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    updateViewportHeight();

    if (scrollToTop) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Handle nav clicks
  document.querySelectorAll('a[href="#home"], a[href="#rv3"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const page = link.hash.slice(1);
      if (location.hash !== link.hash) {
        history.pushState(null, '', link.hash);
      }
      showPage(page);
    });
  });

  // Handle smooth scroll to server status or moments
  document.querySelectorAll('a[href="#server-status"], a[href="#moments"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (currentPage !== 'home') {
        showPage('home', false);
      }
      const target = document.querySelector(link.hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const hash = location.hash;
    if (hash === '#rv3') showPage('rv3', false);
    else showPage('home', false);
  });

  // Initialize page from URL hash
  const initialPage = location.hash === '#rv3' ? 'rv3' : 'home';
  showPage(initialPage, false);

  // Resize and image load listeners for dynamic viewport height
  window.addEventListener('resize', () => updateViewportHeight());
  window.addEventListener('load', () => updateViewportHeight());
  document.querySelectorAll('img').forEach((img) => {
    if (!img.complete) {
      img.addEventListener('load', () => updateViewportHeight());
    }
  });

  // Periodic recalculation in first 2 seconds to catch late layout shifts
  [150, 450, 1000, 2000].forEach((delay) => {
    window.setTimeout(updateViewportHeight, delay);
  });
});
