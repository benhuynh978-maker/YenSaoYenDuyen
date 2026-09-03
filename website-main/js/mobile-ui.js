// ============================================================
//  MOBILE-UI.JS — Hành vi giao diện Mobile & iPad (≤ 1024px).
//  Script thường (KHÔNG ES module). Nạp SAU js/site-contact.js
//  trên mọi trang. Không có phần tử tương ứng thì tự bỏ qua.
//
//  KHÔNG đổi gì ở cỡ desktop (≥ 1025px):
//   • Phần menu chỉ hoạt động khi menu mở — trên desktop nút
//     hamburger ẩn nên không bao giờ chạy tới.
//   • Nút FAB chỉ được dựng khi màn hình ≤ 1024px, và bị gỡ đi
//     nếu phóng to về desktop.
//
//  Gồm 2 phần độc lập:
//   1) MENU MOBILE — BỔ TRỢ (không tự bind nút hamburger; mỗi trang
//      đã có JS bật/tắt class .is-open). Ở đây: đóng menu khi bấm
//      link / Esc / chạm ra ngoài / phóng về desktop; đồng bộ
//      aria-hidden cho trợ năng.
//   2) NÚT LIÊN HỆ NỔI (FAB) — chèn #fab-main vào .float-cta; chạm
//      để bung/thu Gọi/Zalo/Facebook/Chat AI. CSS ở responsive.css.
// ============================================================
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var mqMobile = window.matchMedia('(max-width: 1024px)');
    var onMq = function (mq, fn) {
      if (mq.addEventListener) mq.addEventListener('change', fn);
      else if (mq.addListener) mq.addListener(fn); // Safari cũ
    };

    // ─────────────────────────────────────────────
    // 1) MENU MOBILE (bổ trợ)
    // ─────────────────────────────────────────────
    var menuToggle = document.getElementById('menu-toggle');
    var mobileNav = document.getElementById('mobile-nav');

    if (menuToggle && mobileNav) {
      var menuIsOpen = function () {
        return mobileNav.classList.contains('is-open') ||
               mobileNav.getAttribute('aria-hidden') === 'false';
      };
      var closeMenu = function () {
        // Tái dùng đúng logic bật/tắt sẵn có của trang thay vì tự sửa DOM.
        if (menuIsOpen()) menuToggle.click();
      };

      // Bấm 1 link trong menu → đóng menu (điều hướng vẫn diễn ra bình thường)
      mobileNav.addEventListener('click', function (e) {
        if (e.target.closest('a')) closeMenu();
      });

      // Esc → đóng
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' || e.key === 'Esc') closeMenu();
      });

      // Chạm ra ngoài vùng menu + nút hamburger → đóng
      document.addEventListener('click', function (e) {
        if (!menuIsOpen()) return;
        if (e.target.closest('#mobile-nav') || e.target.closest('#menu-toggle')) return;
        closeMenu();
      });

      // Phóng to / xoay về cỡ desktop → đóng menu cho sạch
      onMq(mqMobile, function (e) { if (!e.matches) closeMenu(); });

      // Trang chỉ đổi class .is-open → đồng bộ aria-hidden cho trợ năng
      if (typeof MutationObserver === 'function') {
        new MutationObserver(function () {
          mobileNav.setAttribute(
            'aria-hidden',
            mobileNav.classList.contains('is-open') ? 'false' : 'true'
          );
        }).observe(mobileNav, { attributes: true, attributeFilter: ['class'] });
      }
    }

    // ─────────────────────────────────────────────
    // 2) NÚT LIÊN HỆ NỔI — FAB (chỉ ở ≤ 1024px)
    // ─────────────────────────────────────────────
    var cta = document.querySelector('.float-cta');
    if (!cta) return;

    var CHAT_ICON =
      '<svg class="fab-main__open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    var CLOSE_ICON =
      '<svg class="fab-main__close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">' +
      '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    var fab = null;

    var setFab = function (open) {
      var doOpen = !!(open && fab);
      cta.classList.toggle('fab-open', doOpen);
      if (fab) {
        fab.setAttribute('aria-expanded', doOpen ? 'true' : 'false');
        fab.setAttribute('aria-label', doOpen ? 'Đóng liên hệ nhanh' : 'Liên hệ nhanh');
      }
    };

    var buildFab = function () {
      if (fab || document.getElementById('fab-main')) return;
      fab = document.createElement('button');
      fab.id = 'fab-main';
      fab.type = 'button';
      fab.className = 'fab-main';
      fab.setAttribute('aria-label', 'Liên hệ nhanh');
      fab.setAttribute('aria-expanded', 'false');
      fab.innerHTML = CHAT_ICON + CLOSE_ICON;
      fab.addEventListener('click', function () {
        setFab(!cta.classList.contains('fab-open'));
      });
      cta.appendChild(fab);
      // Từ đây CSS mới thu Gọi/Zalo/FB/Chat vào FAB. Không có class này
      // (JS lỗi/desktop) → cụm giữ nguyên như bản gốc.
      cta.classList.add('fab-ready');
    };

    var destroyFab = function () {
      cta.classList.remove('fab-ready', 'fab-open');
      if (fab) { fab.remove(); fab = null; }
    };

    if (mqMobile.matches) buildFab();
    onMq(mqMobile, function (e) { e.matches ? buildFab() : destroyFab(); });

    // Bấm 1 mục con (Gọi/Zalo/FB) hoặc mở Chat → thu FAB lại
    cta.addEventListener('click', function (e) {
      if (!fab || e.target === fab || fab.contains(e.target)) return;
      if (e.target.closest('.float-btn, .ai-chat-toggle')) setFab(false);
    });

    // Chạm ra ngoài → thu FAB
    document.addEventListener('click', function (e) {
      if (!cta.classList.contains('fab-open')) return;
      if (e.target.closest('.float-cta')) return;
      setFab(false);
    });

    // Esc → thu FAB
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && cta.classList.contains('fab-open')) {
        setFab(false);
      }
    });
  });
})();
