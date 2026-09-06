// EcoScrap AI Application Controller & State Engine
// Full-Width Web Platform with Strict Multi-Role Access Control & 7 Languages

const AppState = {
  user: null, // { role: 'customer' | 'kabadiwala' | 'recycler', name: '', phone: '', location: '', govRegNo: '', kabadiId: '' }
  selectedMaterial: ESETU_DATA.materials[0],
  calculatorWeight: 0.2,
  selectedPaymentMode: 'cash',
  capturedImage: null,
  activeBookingNotice: null,
  syncQueue: []
};

// Initialize Web App
document.addEventListener('DOMContentLoaded', () => {
  // Always start at Login Dashboard when index.html is opened
  AppState.user = null;
  localStorage.removeItem('esetu_user');

  setupEventListeners();
  renderApp();
});

// Setup Global Event Listeners
function setupEventListeners() {
  // 7-Language selector buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.dataset.lang;
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      I18N.setLanguage(lang);
      renderApp();
    });
  });
}

// Render Top-Level App View
function renderApp() {
  const container = document.getElementById('appContent');
  const statusBar = document.getElementById('userStatusBar');

  // Update Brand Tagline in selected language
  const brandTagline = document.getElementById('brandTagline');
  if (brandTagline) brandTagline.textContent = I18N.t('tagline');

  // Sync active language button
  document.querySelectorAll('.lang-btn').forEach(b => {
    if (b.dataset.lang === I18N.currentLang) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  if (!AppState.user) {
    if (statusBar) statusBar.style.display = 'none';
    renderLoginPage(container);
    return;
  }

  if (statusBar) statusBar.style.display = 'flex';
  updateStatusBar();

  switch (AppState.user.role) {
    case 'customer':
      renderCustomerPage(container);
      break;
    case 'kabadiwala':
      renderKabadiwalaPage(container);
      break;
    case 'recycler':
      renderRecyclerPage(container);
      break;
    default:
      renderLoginPage(container);
  }
}

// Update Status Bar
function updateStatusBar() {
  const roleNameEl = document.getElementById('userRoleName');
  const userDetailsEl = document.getElementById('userDetails');
  const logoutBtnLabel = document.getElementById('logoutBtnLabel');
  if (!roleNameEl || !AppState.user) return;

  const roleTitles = {
    customer: I18N.t('roleCustomer'),
    kabadiwala: I18N.t('roleKabadiwala'),
    recycler: I18N.t('roleRecycler')
  };

  const icons = {
    customer: '👤',
    kabadiwala: '🚲',
    recycler: '🏭'
  };

  roleNameEl.innerHTML = `${icons[AppState.user.role]} ${roleTitles[AppState.user.role]}`;
  userDetailsEl.textContent = `${AppState.user.name || 'User'} (${AppState.user.phone || ''})`;
  if (logoutBtnLabel) logoutBtnLabel.textContent = I18N.t('logoutBtn');
}

// -------------------------------------------------------------
// STEP 1: SECURE LOGIN PORTAL (NO PUBLIC WHOLESALE TICKER!)
// -------------------------------------------------------------
function renderLoginPage(container) {
  let selectedRole = 'customer';
  let kabadiMode = 'login'; // 'login' | 'register'

  function updateFormHtml() {
    return `
      <div class="card" style="max-width: 860px; margin: 20px auto; border-top: 5px solid var(--primary);">
        <div class="card-header">
          <div>
            <h2 class="card-title" style="font-size: 22px;">${I18N.t('loginTitle')}</h2>
            <p class="card-subtitle">${I18N.t('loginSubtitle')}</p>
          </div>
          <button class="audio-btn" onclick="I18N.speak('${I18N.t('loginTitle')}. ${I18N.t('loginSubtitle')}')">
            ${I18N.t('speakBtn')}
          </button>
        </div>

        <!-- 3-Role Selection Cards -->
        <div class="role-cards-grid">
          <!-- Customer Role -->
          <div class="role-card ${selectedRole === 'customer' ? 'selected' : ''}" id="roleCard-customer" onclick="selectRole('customer')">
            <div class="role-card-icon">👤</div>
            <div class="role-card-content">
              <h3>${I18N.t('roleCustomer')}</h3>
              <p>${I18N.t('roleCustomerDesc')}</p>
            </div>
          </div>

          <!-- Kabadiwala Role (Restricted Access) -->
          <div class="role-card ${selectedRole === 'kabadiwala' ? 'selected' : ''}" id="roleCard-kabadiwala" onclick="selectRole('kabadiwala')">
            <div class="role-card-icon">🚲</div>
            <div class="role-card-content">
              <h3>${I18N.t('roleKabadiwala')}</h3>
              <p>${I18N.t('roleKabadiwalaDesc')}</p>
            </div>
          </div>

          <!-- Recycler Role (Strict Govt Reg Guard) -->
          <div class="role-card ${selectedRole === 'recycler' ? 'selected' : ''}" id="roleCard-recycler" onclick="selectRole('recycler')">
            <div class="role-card-icon">🏭</div>
            <div class="role-card-content">
              <h3>${I18N.t('roleRecycler')}</h3>
              <p>${I18N.t('roleRecyclerDesc')}</p>
            </div>
          </div>
        </div>

        <!-- Kabadiwala Mode Toggle (Login vs Register) -->
        ${selectedRole === 'kabadiwala' ? `
          <div style="display: flex; background: #e2e8f0; border-radius: var(--radius-sm); padding: 4px; margin-bottom: 18px; gap: 6px;">
            <button class="btn-secondary ${kabadiMode === 'login' ? 'btn-primary' : ''}" style="flex:1; padding: 8px; font-size: 13px;" onclick="setKabadiMode('login')">
              🔑 ${I18N.currentLang === 'en' ? 'Authorized Dealer Sign In' : 'आधीच नोंदणीकृत (Sign In)'}
            </button>
            <button class="btn-secondary ${kabadiMode === 'register' ? 'btn-primary' : ''}" style="flex:1; padding: 8px; font-size: 13px;" onclick="setKabadiMode('register')">
              📝 ${I18N.currentLang === 'en' ? 'New Dealer Registration' : 'नवीन कबाड़ी नोंदणी (Register)'}
            </button>
          </div>
        ` : ''}

        <!-- Form Fields Container -->
        <div id="loginFormFields">
          <!-- Role 1: Customer Simple Mobile Login -->
          ${selectedRole === 'customer' ? `
            <div class="desktop-grid-2">
              <div class="form-group">
                <label class="form-label">${I18N.t('nameLabel')}</label>
                <input type="text" id="loginName" class="form-input" placeholder="${I18N.t('namePlaceholder')}" value="Vikas Deshmukh">
              </div>
              <div class="form-group">
                <label class="form-label">${I18N.t('phoneLabel')}</label>
                <input type="tel" id="loginPhone" class="form-input" placeholder="${I18N.t('phonePlaceholder')}" value="98231 09845">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">${I18N.t('pincodeLabel')}</label>
              <input type="text" id="loginLocation" class="form-input" placeholder="${I18N.t('pincodePlaceholder')}" value="411038, Kothrud, Pune">
            </div>
          ` : ''}

          <!-- Role 2: Kabadiwala Predefined Authorized Access -->
          ${selectedRole === 'kabadiwala' ? (kabadiMode === 'login' ? `
            <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-sm); padding: 14px; margin-bottom: 16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <strong style="color: #166534; font-size: 13px;">🔒 ${I18N.currentLang === 'en' ? 'Authorized Scrap Dealer Authentication' : 'अधिकृत कबाड़ी पडताळणी'}</strong>
                <button type="button" class="btn-secondary" style="font-size: 11px; padding: 3px 8px;" onclick="fillDemoKabadiwala()">
                  📋 ${I18N.t('registeredDemoHint')} Raju Shinde (9820144521)
                </button>
              </div>
              <p style="font-size: 12px; color: #166534; margin-bottom: 12px;">
                ${I18N.currentLang === 'en' 
                  ? 'Only verified scrap dealers with a registered mobile number and PIN can access wholesale recycler spot bids.' 
                  : 'फक्त अधिकृत व नोंदणीकृत कबाडी बंधूच घाऊक रिसायकलर दर पाहू शकतात.'}
              </p>
              <div class="desktop-grid-2">
                <div class="form-group" style="margin-bottom:0;">
                  <label class="form-label">${I18N.t('phoneLabel')}</label>
                  <input type="tel" id="loginPhone" class="form-input" placeholder="${I18N.t('phonePlaceholder')}" value="9820144521">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label class="form-label">${I18N.t('kabadiPinLabel')}</label>
                  <input type="password" id="loginKabadiPin" class="form-input" placeholder="4452" value="4452" maxlength="6">
                </div>
              </div>
            </div>
          ` : `
            <!-- Kabadiwala Registration -->
            <div class="desktop-grid-2">
              <div class="form-group">
                <label class="form-label">${I18N.t('nameLabel')}</label>
                <input type="text" id="loginName" class="form-input" placeholder="${I18N.t('namePlaceholder')}" value="Santosh Mohite">
              </div>
              <div class="form-group">
                <label class="form-label">${I18N.t('phoneLabel')}</label>
                <input type="tel" id="loginPhone" class="form-input" placeholder="${I18N.t('phonePlaceholder')}" value="9820988776">
              </div>
            </div>
            <div class="desktop-grid-2">
              <div class="form-group">
                <label class="form-label">${I18N.t('godownLabel')}</label>
                <input type="text" id="regGodownName" class="form-input" placeholder="e.g. Mohite Scrap Traders" value="Mohite Scrap Yard">
              </div>
              <div class="form-group">
                <label class="form-label">${I18N.t('vehicleTypeLabel')}</label>
                <select id="regVehicleType" class="form-input">
                  <option value="Bolero Pickup">Mahindra Bolero Pickup (1.5 Ton)</option>
                  <option value="Tata Ace">Tata Ace / Chhota Hathi</option>
                  <option value="E-Loader">Eco Electric Loader Rickshaw</option>
                  <option value="Handcart">Cycle Cart / Handcart</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">${I18N.t('pincodeLabel')}</label>
              <input type="text" id="loginLocation" class="form-input" placeholder="${I18N.t('pincodePlaceholder')}" value="411038, Kothrud, Pune">
            </div>
            <div style="background: #f0fdf4; border: 1.5px solid #86efac; padding: 12px; border-radius: var(--radius-sm); margin-bottom: 14px; font-size: 13px; color: #166534;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="regDigitalScale" checked style="width: 18px; height: 18px;">
                <strong>${I18N.currentLang === 'en' ? 'I possess a certified digital scale for honest weighing' : 'माझ्याकडे प्रमाणित डिजिटल वजन काटा आहे'}</strong>
              </label>
            </div>
          `) : ''}

          <!-- Role 3: Recycler Predefined CPCB License Check -->
          ${selectedRole === 'recycler' ? `
            <div style="background: #eff6ff; padding: 18px; border-radius: var(--radius-sm); border: 2px solid #3b82f6; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <label class="form-label" style="color: #1e40af; margin-bottom: 0; font-size: 14px;">
                  🛡️ ${I18N.t('govRegLabel')}
                </label>
                <button type="button" class="btn-secondary" style="font-size: 11px; padding: 3px 8px;" onclick="copyDemoGovNo()">
                  📋 ${I18N.t('registeredDemoHint')} CPCB/EPR-REC/2023/MH-0842
                </button>
              </div>
              <input type="text" id="loginGovReg" class="form-input" style="font-weight: 800; color: #1e3a8a; text-transform: uppercase;" placeholder="${I18N.t('govRegPlaceholder')}" value="CPCB/EPR-REC/2023/MH-0842">
              <p class="form-help" style="color: #1d4ed8; margin-top: 6px;">
                ${I18N.t('govRegHelp')}
              </p>
              <div class="desktop-grid-2" style="margin-top: 12px;">
                <div>
                  <label class="form-label" style="color:#1e40af; font-size:12.5px;">Recycler Facility Name:</label>
                  <input type="text" id="loginName" class="form-input" value="MahaGreen E-Waste Recyclers Pvt Ltd">
                </div>
                <div>
                  <label class="form-label" style="color:#1e40af; font-size:12.5px;">Plant Phone Number:</label>
                  <input type="tel" id="loginPhone" class="form-input" value="9820111223">
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <div style="background: var(--success-light); color: var(--success); padding: 10px 14px; border-radius: var(--radius-sm); font-size: 12.5px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          ${I18N.t('otpMockNotice')}
        </div>

        <button class="btn-primary" onclick="handleLoginSubmit()">
          ${selectedRole === 'kabadiwala' && kabadiMode === 'register' ? I18N.t('registerBtn') : I18N.t('loginBtn')}
        </button>
      </div>

      <!-- Security Rejection Modal Container -->
      <div id="loginErrorModalContainer"></div>
    `;
  }

  container.innerHTML = updateFormHtml();

  // Role selection helper
  window.selectRole = (role) => {
    selectedRole = role;
    container.innerHTML = updateFormHtml();
  };

  // Kabadiwala mode toggle
  window.setKabadiMode = (mode) => {
    kabadiMode = mode;
    container.innerHTML = updateFormHtml();
  };

  // Helper demo shortcuts
  window.copyDemoGovNo = () => {
    const el = document.getElementById('loginGovReg');
    if (el) el.value = 'CPCB/EPR-REC/2023/MH-0842';
  };

  window.fillDemoKabadiwala = () => {
    const phone = document.getElementById('loginPhone');
    const pin = document.getElementById('loginKabadiPin');
    if (phone) phone.value = '9820144521';
    if (pin) pin.value = '4452';
  };

  // Submit handler
  window.handleLoginSubmit = () => {
    const nameEl = document.getElementById('loginName');
    const phoneEl = document.getElementById('loginPhone');
    const locEl = document.getElementById('loginLocation');
    const name = nameEl ? nameEl.value.trim() : 'User';
    const phone = phoneEl ? phoneEl.value.trim() : '9820000000';
    const location = locEl ? locEl.value.trim() : 'Pune';

    // 1. RECYCLER STRICT ACCESS GUARD
    if (selectedRole === 'recycler') {
      const govRegInput = document.getElementById('loginGovReg');
      const govRegNo = govRegInput ? govRegInput.value.trim().toUpperCase() : '';
      const matchedRecycler = ESETU_DATA.predefinedRecyclers.find(r => r.cpcbRegNo.toUpperCase() === govRegNo) 
                            || ESETU_DATA.validCpcbRegistrations.find(r => r.toUpperCase() === govRegNo);

      if (!matchedRecycler) {
        showGovRegErrorModal(govRegNo);
        return;
      }

      AppState.user = {
        role: 'recycler',
        name: typeof matchedRecycler === 'object' ? matchedRecycler.name : name,
        phone: typeof matchedRecycler === 'object' ? matchedRecycler.phone : phone,
        location: typeof matchedRecycler === 'object' ? matchedRecycler.facility : location,
        govRegNo: govRegNo
      };
      localStorage.setItem('esetu_user', JSON.stringify(AppState.user));
      renderApp();
      return;
    }

    // 2. KABADIWALA PREDEFINED ACCESS GUARD
    if (selectedRole === 'kabadiwala') {
      if (kabadiMode === 'login') {
        const pinInput = document.getElementById('loginKabadiPin');
        const pin = pinInput ? pinInput.value.trim() : '';
        const cleanPhone = phone.replace(/\D/g, '');

        // Check against predefined certified dealers
        const matchedDealer = ESETU_DATA.predefinedKabadiwalas.find(k => k.phone === cleanPhone && k.pin === pin);

        if (!matchedDealer) {
          showKabadiAuthErrorModal(phone);
          return;
        }

        AppState.user = {
          role: 'kabadiwala',
          name: matchedDealer.name,
          phone: matchedDealer.phone,
          location: matchedDealer.location,
          yard: matchedDealer.yard,
          kabadiId: matchedDealer.kabadiId
        };
        localStorage.setItem('esetu_user', JSON.stringify(AppState.user));
        renderApp();
        return;
      } else {
        // Register new Kabadiwala
        const godownName = document.getElementById('regGodownName') ? document.getElementById('regGodownName').value.trim() : 'My Scrap Yard';
        const vehicleType = document.getElementById('regVehicleType') ? document.getElementById('regVehicleType').value : 'Tata Ace';
        const newKabadiId = `KAB-REG-${Math.floor(1000 + Math.random() * 9000)}`;

        const newDealer = {
          kabadiId: newKabadiId,
          phone: phone.replace(/\D/g, ''),
          pin: '1234',
          name: name,
          yard: godownName,
          location: location
        };
        ESETU_DATA.predefinedKabadiwalas.unshift(newDealer);

        // Add to customer view
        ESETU_DATA.kabadiwalas.unshift({
          id: newKabadiId,
          name: `${name} (${godownName})`,
          nameMr: `${name} (${godownName})`,
          nameHi: `${name} (${godownName})`,
          phone: phone,
          location: location,
          distanceKm: 0.6,
          vehicle: `${vehicleType} & Certified Scales`,
          photo: '👨🏽‍💼',
          status: 'Online • Verified Partner',
          rating: 5.0,
          totalReviews: 1,
          badge: 'Verified Partner',
          cashOnCollection: true,
          reviews: [{ customer: 'System Verification', rating: 5, date: 'Today', text: 'Digital weighing scale verified.' }]
        });

        alert(`🎉 Registration Approved! Welcome ${name}. Assigned ID: ${newKabadiId} (Default PIN: 1234).`);
        AppState.user = {
          role: 'kabadiwala',
          name: name,
          phone: phone,
          location: location,
          yard: godownName,
          kabadiId: newKabadiId
        };
        localStorage.setItem('esetu_user', JSON.stringify(AppState.user));
        renderApp();
        return;
      }
    }

    // 3. CUSTOMER FREE ACCESS
    AppState.user = {
      role: 'customer',
      name: name,
      phone: phone,
      location: location
    };
    localStorage.setItem('esetu_user', JSON.stringify(AppState.user));
    renderApp();
  };

  // Rejection Modal for Fake Recycler
  window.showGovRegErrorModal = (enteredNumber) => {
    const modalContainer = document.getElementById('loginErrorModalContainer');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="border-top: 6px solid #dc2626; max-width: 440px; text-align: center;">
          <div style="font-size: 44px; margin-bottom: 8px;">🚨</div>
          <h3 style="font-size: 18px; font-weight: 900; color: #991b1b; margin-bottom: 8px;">
            ${I18N.currentLang === 'en' ? 'Unauthorized Recycler Access Denied!' : 'अनधिकृत रिसायकलर प्रवेश नाकारला!'}
          </h3>
          <div style="background: #fef2f2; border: 1.5px solid #fca5a5; padding: 14px; border-radius: var(--radius-sm); font-size: 13px; color: #7f1d1d; text-align: left; margin: 14px 0;">
            <p><strong>Input Registration ID:</strong> <code>${enteredNumber || '(Empty)'}</code></p>
            <p style="margin-top: 6px;">
              ${I18N.t('govRegError')}
            </p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn-primary" style="background: #16a34a;" onclick="fillAndCloseDemoCpcb()">
              📋 Use CPCB Demo License (CPCB/EPR-REC/2023/MH-0842)
            </button>
            <button class="btn-secondary" onclick="document.getElementById('loginErrorModalContainer').innerHTML=''">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    I18N.speak(I18N.t('govRegError'));
  };

  // Rejection Modal for Customer attempting Kabadiwala Wholesale Portal
  window.showKabadiAuthErrorModal = (phone) => {
    const modalContainer = document.getElementById('loginErrorModalContainer');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="border-top: 6px solid #ea580c; max-width: 440px; text-align: center;">
          <div style="font-size: 44px; margin-bottom: 8px;">🔒</div>
          <h3 style="font-size: 18px; font-weight: 900; color: #9a3412; margin-bottom: 8px;">
            ${I18N.currentLang === 'en' ? 'Dealer Authentication Failed' : 'कबाड़ी पडताळणी अयशस्वी'}
          </h3>
          <div style="background: #fff7ed; border: 1.5px solid #fed7aa; padding: 14px; border-radius: var(--radius-sm); font-size: 13px; color: #9a3412; text-align: left; margin: 14px 0;">
            <p><strong>Mobile Number:</strong> <code>${phone}</code></p>
            <p style="margin-top: 6px;">
              ${I18N.t('kabadiAuthError')}
            </p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button class="btn-primary" style="background: #047857;" onclick="fillDemoDealerAndClose()">
              📋 Fill Verified Demo Dealer: Raju Shinde (PIN: 4452)
            </button>
            <button class="btn-secondary" onclick="document.getElementById('loginErrorModalContainer').innerHTML=''">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    I18N.speak(I18N.t('kabadiAuthError'));
  };

  window.fillAndCloseDemoCpcb = () => {
    const el = document.getElementById('loginGovReg');
    if (el) el.value = 'CPCB/EPR-REC/2023/MH-0842';
    document.getElementById('loginErrorModalContainer').innerHTML = '';
  };

  window.fillDemoDealerAndClose = () => {
    fillDemoKabadiwala();
    document.getElementById('loginErrorModalContainer').innerHTML = '';
  };
}

// -------------------------------------------------------------
// STEP 2: CUSTOMER PAGE (3 COMPACT SUB-PAGES & LIVE ETA TRACKING)
// Sub-Page 1: Sell Scrap & Fair Pricing Calculator
// Sub-Page 2: Nearby Kabadiwalas, Google Maps Location & Live ETA
// Sub-Page 3: Customer Profile, Sales History & Scrap Dealer Comparison
// -------------------------------------------------------------
function renderCustomerPage(container) {
  if (!AppState.customerTab) AppState.customerTab = 'sell';
  if (!AppState.trackedKabadiwala) AppState.trackedKabadiwala = ESETU_DATA.kabadiwalas[0];

  // Top Tab Navigation for Customer (3 Compact Sub-Pages)
  const tabNavHtml = `
    <div style="display: flex; gap: 8px; background: #e2e8f0; border-radius: var(--radius-sm); padding: 5px; margin-bottom: 16px;">
      <button class="btn-secondary ${AppState.customerTab === 'sell' ? 'btn-primary' : ''}" 
              style="flex: 1; padding: 9px 12px; font-size: 13.5px; font-weight: 700;" 
              onclick="setCustomerTab('sell')">
        🛒 ${I18N.currentLang === 'en' ? 'Sell Scrap & Calculator' : 'स्क्रॅप विका व कॅल्क्युलेटर'}
      </button>
      <button class="btn-secondary ${AppState.customerTab === 'dealers' ? 'btn-primary' : ''}" 
              style="flex: 1; padding: 9px 12px; font-size: 13.5px; font-weight: 700;" 
              onclick="setCustomerTab('dealers')">
        📍 ${I18N.currentLang === 'en' ? 'Nearby Scrap Dealers & Live ETA' : 'कबाड़ीवाले व थेट स्थान (ETA)'}
      </button>
      <button class="btn-secondary ${AppState.customerTab === 'profile' ? 'btn-primary' : ''}" 
              style="flex: 1; padding: 9px 12px; font-size: 13.5px; font-weight: 700;" 
              onclick="setCustomerTab('profile')">
        👤 ${I18N.currentLang === 'en' ? 'Customer Profile & Sales History' : 'ग्राहक प्रोफाइल व विक्री इतिहास'}
      </button>
    </div>
  `;

  if (AppState.customerTab === 'sell') {
    renderCustomerSellTab(container, tabNavHtml);
  } else if (AppState.customerTab === 'dealers') {
    renderCustomerDealersTab(container, tabNavHtml);
  } else {
    renderCustomerProfileTab(container, tabNavHtml);
  }
}

window.setCustomerTab = (tabName) => {
  AppState.customerTab = tabName;
  const container = document.getElementById('appContent');
  renderCustomerPage(container);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// -------------------------------------------------------------
// SUB-PAGE 1: SELL SCRAP & COMPACT CALCULATOR
// -------------------------------------------------------------
function renderCustomerSellTab(container, tabNavHtml) {
  const currentMat = AppState.selectedMaterial;
  const weightKg = Number(AppState.calculatorWeight) || 0.2;
  const weightGrams = Math.round(weightKg * 1000);
  const currentPayout = (weightKg * currentMat.customerRate).toFixed(0);
  const weightDisplayHtml = weightKg < 1 
    ? `<strong style="color: var(--primary); font-size: 26px;">${weightGrams}g</strong> <span style="font-size:13.5px; color:var(--text-muted); font-weight:700;">(${weightKg.toFixed(2)} kg)</span>`
    : `<strong style="color: var(--primary); font-size: 26px;">${weightKg} kg</strong> <span style="font-size:13.5px; color:var(--text-muted); font-weight:700;">(${weightGrams}g)</span>`;

  // Compact 6-hr comparisons
  const compRowsHtml = ESETU_DATA.materials.map(m => {
    const diff = m.customerRate - m.rate6hrAgo;
    const diffText = diff >= 0 ? `+₹${diff} ▲` : `-₹${Math.abs(diff)} ▼`;
    const cls = diff >= 0 ? 'up' : 'down';
    const isSelected = m.id === currentMat.id;
    return `
      <div class="comparison-row" style="padding: 7px 10px; cursor: pointer; ${isSelected ? 'background: #f0fdf4; border-left: 3px solid var(--primary);' : ''}" onclick="selectCustomerMaterial('${m.id}')">
        <div class="comp-mat" style="font-size: 13px;">
          <span>${m.icon}</span>
          <span style="font-weight: 700;">${getLocalizedMatName(m).split('(')[0]}</span>
        </div>
        <div class="comp-prices" style="font-size: 12.5px;">
          <span class="old-rate" style="font-size: 11px;">₹${m.rate6hrAgo}</span>
          <strong class="new-rate">₹${m.customerRate}/kg</strong>
          <span class="trend-badge ${cls}" style="font-size: 10.5px; padding: 2px 6px;">${diffText}</span>
        </div>
      </div>
    `;
  }).join('');

  // Material selection chips (compact)
  const matChipsHtml = ESETU_DATA.materials.map(m => `
    <button class="btn-secondary ${m.id === currentMat.id ? 'btn-primary' : ''}" 
            style="padding: 6px 11px; font-size: 12px; margin: 3px; font-weight: 700;"
            onclick="selectCustomerMaterial('${m.id}')">
      ${m.icon} ${m.symbol} (₹${m.customerRate}/kg)
    </button>
  `).join('');

  container.innerHTML = `
    ${tabNavHtml}

    <!-- Compact Price Guarantee Banner -->
    <div style="background: linear-gradient(135deg, #065f46, #047857); color: #fff; padding: 12px 18px; border-radius: var(--radius-sm); margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
      <div>
        <h3 style="font-size: 16px; font-weight: 800; margin: 0;">${I18N.t('custTitle')}</h3>
        <p style="font-size: 12px; opacity: 0.95; margin-top: 2px;">${I18N.t('custSubtitle')}</p>
      </div>
      <button class="audio-btn" style="background:#fff; color:var(--primary-dark); font-size:11.5px; padding:4px 10px;" onclick="I18N.speak('${I18N.t('custTitle')}. ${I18N.t('custSubtitle')}')">
        ${I18N.t('speakBtn')}
      </button>
    </div>

    <!-- Active Booking Alert (with 1-tap live ETA map link) -->
    ${AppState.activeBookingNotice ? `
      <div style="background: #ecfdf5; border: 1.5px solid #10b981; padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 14px; font-size: 13px; color: #065f46; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div>${AppState.activeBookingNotice}</div>
        <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; width: auto;" onclick="setCustomerTab('dealers')">
          🛵 View Live ETA & Map ➔
        </button>
      </div>
    ` : ''}

    <!-- Compact 2-Column Grid -->
    <div class="desktop-grid-2" style="gap: 14px;">
      
      <!-- Left Column: Price Comparison & AI Photo Classifier -->
      <div>
        <div class="comparison-box" style="padding: 14px; margin-bottom: 14px;">
          <div class="card-header" style="margin-bottom: 8px;">
            <div class="card-title" style="font-size: 14px;">
              ${I18N.t('compareBoxTitle')}
            </div>
            <span style="font-size: 11px; background: #ecfdf5; color: #047857; padding: 2px 7px; border-radius: 4px; font-weight: 800;">
              ● Live Doorstep Rates
            </span>
          </div>
          <div class="comparison-grid">
            ${compRowsHtml}
          </div>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 8px; text-align: right;">
            *${I18N.t('cpcbFloorNotice')}
          </p>
        </div>

        <!-- Scrap Photo Capture Card -->
        <div class="card" style="padding: 14px; margin-bottom: 0;">
          <div class="card-header" style="margin-bottom: 6px;">
            <div>
              <h4 class="card-title" style="font-size: 14.5px;">${I18N.t('scrapCaptureTitle')}</h4>
              <p class="card-subtitle" style="font-size: 11.5px;">${I18N.t('scrapCaptureSubtitle')}</p>
            </div>
            <button class="audio-btn" style="font-size: 11px; padding: 3px 8px;" onclick="I18N.speak('${I18N.t('scrapCaptureTitle')}')">
              ${I18N.t('speakBtn')}
            </button>
          </div>

          <div class="capture-box" style="padding: 18px 12px;" onclick="triggerCameraMock()">
            <div style="font-size: 32px;">📸</div>
            <div style="font-weight: 800; font-size: 14px; margin-top: 4px;">
              ${I18N.t('takePhotoBtn')}
            </div>
            <p style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
              Click to capture circuit board, copper wiring, dead laptop, or battery
            </p>
            <input type="file" id="cameraInput" accept="image/*" style="display:none;" onchange="handleImageSelected(event)">
          </div>

          <div id="aiDetectionCard" style="display: none; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-sm); padding: 12px; margin-top: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 12.5px; font-weight: 800; color: #166534;">🤖 ${I18N.t('detectResult')}</span>
              <span style="font-size: 11px; background: #166534; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: 700;">98.4% Match</span>
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #064e3b; margin-top: 4px;" id="aiDetectedName">
              High-Grade Server Circuit Board (Telecom & Gold-plated)
            </div>
            <div style="font-size: 12.5px; color: #15803d; margin-top: 2px;" id="aiDetectedRate">
              💰 Guaranteed Buyback Rate: <strong>₹950 / kg</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Weight Estimator & Instant Cash Calculation -->
      <div>
        <div class="card calc-container" style="padding: 16px; margin-bottom: 0;">
          <div class="card-header" style="margin-bottom: 6px;">
            <div>
              <h4 class="card-title" style="color: var(--primary-dark); font-size: 15px;">${I18N.t('calcBoxTitle')}</h4>
              <p class="card-subtitle" style="font-size: 11.5px;">Choose scrap type & adjust weight</p>
            </div>
            <button class="audio-btn" style="font-size: 11px; padding: 3px 8px;" onclick="speakCurrentValuation()">
              ${I18N.t('speakBtn')}
            </button>
          </div>

          <!-- Material Picker Chips (Compact) -->
          <div style="margin: 6px 0 10px 0;">
            ${matChipsHtml}
          </div>

          <!-- Stepper Controls (Supporting 100g+ micro-weights) -->
          <div style="text-align: center; margin-top: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <span style="font-size: 12.5px; font-weight: 700; color: var(--primary-dark);">${I18N.t('weightLabel')}</span>
              <span style="font-size: 11px; background: #ecfdf5; color: #065f46; font-weight: 800; padding: 2px 8px; border-radius: 4px;">
                ⚡ Micro-weights accepted: from 100g+
              </span>
            </div>

            <div class="stepper-control" style="margin: 6px auto; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <button class="step-btn" style="font-size: 12.5px; font-weight: 800; min-width: 62px; height: 38px;" onclick="adjustWeight(-0.1)" title="Minus 100 grams">-100g</button>
              <div class="weight-display" style="min-width: 175px;">
                ${weightDisplayHtml}
              </div>
              <button class="step-btn" style="font-size: 12.5px; font-weight: 800; min-width: 62px; height: 38px;" onclick="adjustWeight(0.1)" title="Plus 100 grams">+100g</button>
            </div>

            <!-- Quick Presets in Grams & KG -->
            <div style="display: flex; justify-content: center; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
              <button class="btn-secondary ${AppState.calculatorWeight === 0.1 ? 'btn-primary' : ''}" style="padding: 4px 9px; font-size: 11.5px; font-weight: 800;" onclick="setWeight(0.1)">100g</button>
              <button class="btn-secondary ${AppState.calculatorWeight === 0.2 ? 'btn-primary' : ''}" style="padding: 4px 9px; font-size: 11.5px; font-weight: 800;" onclick="setWeight(0.2)">200g</button>
              <button class="btn-secondary ${AppState.calculatorWeight === 0.5 ? 'btn-primary' : ''}" style="padding: 4px 9px; font-size: 11.5px; font-weight: 800;" onclick="setWeight(0.5)">500g</button>
              <button class="btn-secondary ${AppState.calculatorWeight === 1.0 ? 'btn-primary' : ''}" style="padding: 4px 9px; font-size: 11.5px; font-weight: 800;" onclick="setWeight(1.0)">1 kg</button>
              <button class="btn-secondary ${AppState.calculatorWeight === 2.0 ? 'btn-primary' : ''}" style="padding: 4px 9px; font-size: 11.5px; font-weight: 800;" onclick="setWeight(2.0)">2 kg</button>
              <button class="btn-secondary ${AppState.calculatorWeight === 5.0 ? 'btn-primary' : ''}" style="padding: 4px 9px; font-size: 11.5px; font-weight: 800;" onclick="setWeight(5.0)">5 kg</button>
            </div>
          </div>

          <!-- Total Payout Box -->
          <div class="total-payout-box" style="padding: 12px; margin: 12px 0;">
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted);">${I18N.t('exactPayoutLabel')}</div>
            <div class="payout-amount" style="font-size: 32px; font-weight: 900; color: var(--primary);">₹${Number(currentPayout).toLocaleString('en-IN')}</div>
            <div style="font-size: 11.5px; color: var(--primary-dark); margin-top: 2px;">
              (${weightGrams} grams / ${weightKg} kg × ₹${currentMat.customerRate}/${currentMat.unit})
            </div>
          </div>

          <!-- Payment Methods Selection -->
          <div style="margin-top: 10px;">
            <label class="form-label" style="font-size: 12px; font-weight: 700; margin-bottom: 6px;">${I18N.t('paymentMethodsTitle')}</label>
            <div class="payment-chips" style="gap: 8px;">
              <div class="pay-chip selected" id="payMode-cash" style="padding: 8px 10px; font-size: 12px;" onclick="selectPaymentMode('cash')">
                <span style="font-size:16px;">💵</span>
                <div><strong>${I18N.t('payCashDoorstep')}</strong></div>
              </div>
              <div class="pay-chip" id="payMode-upi" style="padding: 8px 10px; font-size: 12px;" onclick="selectPaymentMode('upi')">
                <span style="font-size:16px;">📱</span>
                <div><strong>${I18N.t('payUpi')}</strong></div>
              </div>
              <div class="pay-chip" id="payMode-bank" style="padding: 8px 10px; font-size: 12px;" onclick="selectPaymentMode('bank')">
                <span style="font-size:16px;">🏦</span>
                <div><strong>${I18N.t('payBank')}</strong></div>
              </div>
            </div>
          </div>

          <!-- Direct Request & Live ETA Trigger -->
          <button class="btn-primary" style="padding: 12px; font-size: 14.5px; font-weight: 800; width: 100%; margin-top: 14px;" onclick="bookPickupFromCalculator()">
            🛵 Request Doorstep Pickup & Track Live ETA ➔
          </button>
        </div>
      </div>

    </div>
  `;
}

// -------------------------------------------------------------
// SUB-PAGE 2: NEARBY KABADIWALAS, MAP LINKS & LIVE ETA
// -------------------------------------------------------------
function renderCustomerDealersTab(container, tabNavHtml) {
  const tracked = AppState.trackedKabadiwala || ESETU_DATA.kabadiwalas[0];
  const payout = (AppState.calculatorWeight * AppState.selectedMaterial.customerRate).toFixed(0);

  const kabadiwalasHtml = ESETU_DATA.kabadiwalas.map(k => {
    const isCurrentlyTracked = k.id === tracked.id;
    const reviewsHtml = k.reviews.map(r => `
      <div class="review-item" style="padding: 8px; font-size: 12px;">
        <div class="review-author">
          <span>👤 ${r.customer}</span>
          <span style="color: #b45309;">★ ${r.rating}</span>
        </div>
        <div class="review-text" style="font-size: 11.5px;">"${r.text}"</div>
      </div>
    `).join('');

    return `
      <div class="card" style="padding: 16px; margin-bottom: 14px; border-left: 5px solid ${isCurrentlyTracked ? 'var(--primary)' : 'var(--border)'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="font-size: 38px; background: #f1f5f9; width: 62px; height: 62px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center;">
              ${k.photo}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h4 style="font-size: 16px; font-weight: 800; color: var(--text-main); margin: 0;">${k.name}</h4>
                <span style="background: #dcfce7; color: #166534; font-size: 10.5px; font-weight: 800; padding: 2px 7px; border-radius: var(--radius-full);">
                  ${k.badge}
                </span>
              </div>
              <div style="font-size: 13px; font-weight: 700; color: var(--primary-dark); margin-top: 2px;">
                🏪 ${k.shopName}
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                📍 ${k.location} • 📞 ${k.phone}
              </div>
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 13px; font-weight: 800; color: #b45309;">★ ${k.rating} <span style="font-size:11px; color:var(--text-muted);">(${k.totalReviews} reviews)</span></div>
            <div style="margin-top: 4px;">
              <span style="background: #ecfdf5; color: #065f46; font-size: 11.5px; font-weight: 800; padding: 3px 8px; border-radius: 4px;">
                🛵 ETA ~${k.etaMinutes} mins (${k.etaDistanceKm} km)
              </span>
            </div>
          </div>
        </div>

        <!-- Deep Scrap Dealer Info & Certified Scales -->
        <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; margin: 10px 0; font-size: 12px; line-height: 1.5;">
          <div>📍 <strong>Address:</strong> ${k.fullAddress}</div>
          <div style="margin-top: 3px;">⚖️ <strong>Weighing Equipment:</strong> ${k.weighingEquipment}</div>
          <div style="margin-top: 3px;">⏰ <strong>Hours:</strong> ${k.operatingHours} • 📜 <strong>License:</strong> <code>${k.licenseNo}</code></div>
          <div style="margin-top: 3px; color: var(--text-muted);">📦 <strong>Accepts:</strong> ${k.materialsAccepted}</div>
        </div>

        <!-- Action Links: Google Maps & Booking -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <!-- Location Link Opening Google Maps in New Tab -->
          <a href="${k.googleMapsUrl}" target="_blank" class="btn-secondary" style="flex: 1; min-width: 170px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; padding: 8px; text-decoration: none; border-color: #3b82f6; color: #1d4ed8; font-weight: 700;">
            🗺️ Open Google Maps Location ↗
          </a>
          <a href="tel:${k.phone}" class="btn-secondary" style="padding: 8px 14px; font-size: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
            📞 Call Dealer
          </a>
          <button class="btn-primary" style="flex: 1.2; min-width: 160px; padding: 8px; font-size: 12.5px;" onclick="bookPickupFromKabadiwala('${k.name}')">
            ${isCurrentlyTracked ? '✅ Currently En Route' : '🛵 Book This Dealer'}
          </button>
        </div>

        <!-- Customer Reviews -->
        <div class="reviews-accordion" style="margin-top: 10px;">
          <div style="font-weight: 700; font-size: 12px; color: var(--text-muted); display: flex; justify-content: space-between;">
            <span>⭐ Customer Feedback (${k.reviews.length})</span>
            <span style="color: var(--primary);">▼</span>
          </div>
          <div style="margin-top: 4px;">
            ${reviewsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${tabNavHtml}

    <!-- 1. Active Order Live Tracking & Estimated Time of Arrival (ETA) -->
    <div class="card" style="border-top: 4px solid var(--primary); background: #ffffff; padding: 18px; margin-bottom: 16px; box-shadow: var(--shadow-md);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="live-dot-pulse"></span>
            <strong style="color: var(--primary); font-size: 12.5px; text-transform: uppercase; letter-spacing: 0.5px;">
              Live Doorstep Pickup Tracking & ETA
            </strong>
          </div>
          <h3 style="font-size: 19px; font-weight: 900; margin-top: 4px; color: var(--text-main);">
            🛵 ${tracked.name} (${tracked.shopName})
          </h3>
          <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
            Vehicle: <strong>${tracked.vehicle}</strong> (Plate: <code>${tracked.vehiclePlate}</code>)
          </div>
        </div>

        <!-- Dynamic Live ETA Badge -->
        <div style="text-align: right;">
          <div style="background: #ecfdf5; border: 1.5px solid #86efac; padding: 8px 14px; border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 11px; font-weight: 800; color: #166534; text-transform: uppercase;">Estimated Time of Arrival</div>
            <div style="font-size: 24px; font-weight: 900; color: #166534; margin-top: 2px;">
              ~${tracked.etaMinutes} mins
            </div>
            <div style="font-size: 11px; color: #15803d; font-weight: 600;">Distance: ${tracked.etaDistanceKm} km away</div>
          </div>
        </div>
      </div>

      <!-- Live 3-Stage Progress Timeline -->
      <div style="margin: 16px 0 12px 0;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; margin-bottom: 6px;">
          <span style="color: #166534;">1. Pickup Confirmed ✓</span>
          <span style="color: var(--primary);">2. Dealer En Route (with Scale) 🛵</span>
          <span style="color: var(--text-muted);">3. Doorstep Handover & Cash 💵</span>
        </div>
        <div style="background: #e2e8f0; height: 8px; border-radius: 4px; position: relative; overflow: hidden;">
          <div style="background: linear-gradient(90deg, #16a34a, #047857); width: 68%; height: 8px; border-radius: 4px; animation: pulseHighlight 2s infinite;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 6px;">
          <span>Scale: ${tracked.weighingEquipment.split('(')[0]}</span>
          <span>Status: <strong>${tracked.transitState}</strong></span>
          <span>Expected Cash: <strong>₹${Number(payout).toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      <!-- Quick Action Buttons for En-Route Dealer -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border);">
        <a href="${tracked.googleMapsUrl}" target="_blank" class="btn-primary" style="flex: 1.4; min-width: 200px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; font-size: 13.5px; padding: 10px;">
          🗺️ View Live Route on Google Maps ↗
        </a>
        <a href="tel:${tracked.phone}" class="btn-secondary" style="flex: 1; min-width: 150px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; text-decoration: none; font-size: 13px; padding: 10px;">
          📞 Call ${tracked.name}
        </a>
        <button class="audio-btn" style="padding: 10px 14px;" onclick="I18N.speak('Estimated arrival time for ${tracked.name} is ${tracked.etaMinutes} minutes. Bringing certified digital scale for doorstep cash payout.')">
          ${I18N.t('speakBtn')}
        </button>
      </div>
    </div>

    <!-- 2. Section Header: Nearby Scrap Dealers -->
    <div class="card-header" style="margin: 18px 0 10px 0;">
      <div>
        <h3 class="card-title" style="font-size: 16px;">📍 Verified Scrap Aggregators with Certified Scales Near You</h3>
        <p class="card-subtitle" style="font-size: 12px;">Click any Google Maps link to view exact shop location, or book directly for doorstep pickup</p>
      </div>
    </div>

    <!-- 3. Nearby Scrap Dealers Cards -->
    <div>
      ${kabadiwalasHtml}
    </div>
  `;
}

// -------------------------------------------------------------
// SUB-PAGE 3: CUSTOMER PROFILE & SALES HISTORY
// -------------------------------------------------------------
function renderCustomerProfileTab(container, tabNavHtml) {
  const custName = AppState.user.name || 'Sunita Deshmukh (Eco-Citizen)';
  const custPhone = AppState.user.phone || '+91 98201 44521';
  const custLocation = AppState.user.location || 'Kothrud, Pune, Maharashtra';
  const summary = ESETU_DATA.customerSalesSummary;

  // Comparison Rows with previous months
  const monthlyRowsHtml = ESETU_DATA.customerMonthlyComparison.map(m => `
    <tr style="border-bottom: 1px solid var(--border);">
      <td style="padding: 10px 8px; font-weight: 700;">${m.period}</td>
      <td style="padding: 10px 8px; color: var(--primary-dark); font-weight: 800;">${m.weightKg} kg</td>
      <td style="padding: 10px 8px;">${m.pickups} pickups</td>
      <td style="padding: 10px 8px; font-weight: 800;">₹${m.earnings.toLocaleString('en-IN')}</td>
      <td style="padding: 10px 8px;">
        <span style="background: #ecfdf5; color: #166534; font-weight: 800; font-size: 11.5px; padding: 2px 7px; border-radius: var(--radius-full);">
          ${m.changeVsPrior}
        </span>
      </td>
    </tr>
  `).join('');

  // Itemized Sales History Rows
  const historyRowsHtml = ESETU_DATA.customerSalesHistory.map(tx => `
    <tr style="border-bottom: 1px solid var(--border); font-size: 12.5px;">
      <td style="padding: 10px 8px;">
        <strong>${tx.date}</strong>
        <div style="font-size: 11px; color: var(--text-muted);">${tx.time} • <code>${tx.txId}</code></div>
      </td>
      <td style="padding: 10px 8px;">
        <strong>${tx.dealerName}</strong>
        <div style="font-size: 11px; color: var(--primary-dark); font-weight: 700;">🏪 ${tx.shopName}</div>
      </td>
      <td style="padding: 10px 8px;">
        ${tx.scrapItems}
      </td>
      <td style="padding: 10px 8px; font-weight: 800;">
        ${tx.weightKg} kg
        <div style="font-size: 11px; color: var(--text-muted); font-weight: normal;">@ ₹${tx.ratePerKg}/kg</div>
      </td>
      <td style="padding: 10px 8px; font-weight: 900; color: #065f46;">
        ₹${tx.totalPaid.toLocaleString('en-IN')}
        <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">${tx.paymentMode}</div>
      </td>
      <td style="padding: 10px 8px;">
        <span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700;">
          🌱 ${tx.certId}
        </span>
      </td>
    </tr>
  `).join('');

  container.innerHTML = `
    ${tabNavHtml}

    <!-- 1. Customer Profile Header Card -->
    <div class="card" style="border-left: 5px solid var(--primary); background: #ffffff; padding: 18px; margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div style="display: flex; gap: 14px; align-items: center;">
          <div style="font-size: 44px; background: #f0fdf4; width: 72px; height: 72px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; border: 2px solid #bbf7d0;">
            👤
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-size: 19px; font-weight: 900; color: var(--text-main); margin: 0;">${custName}</h3>
              <span style="background: #dcfce7; color: #166534; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: var(--radius-full);">
                🌿 Certified Eco-Citizen
              </span>
            </div>
            <div style="font-size: 13.5px; font-weight: 700; color: var(--primary-dark); margin-top: 2px;">
              Preferred Scrap Dealer: <strong>${summary.preferredScrapDealer}</strong>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
              📍 ${custLocation} • 📞 ${custPhone}
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="background: #eff6ff; color: #1e40af; padding: 3px 10px; border-radius: var(--radius-full); font-size: 11.5px; font-weight: 700;">
            🛡️ Zero-Landfill Verified
          </span>
          <div style="margin-top: 6px;">
            <button class="audio-btn" style="font-size: 11.5px; padding: 4px 10px;" onclick="I18N.speak('Customer profile for ${custName}. Total scrap sold to dealers: ${summary.totalWeightSoldKg} kilograms. Total cash earned: ${summary.totalCashReceived} rupees.')">
              ${I18N.t('speakBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Overview Impact Metrics (3-Column Grid) -->
    <div class="desktop-grid-3" style="gap: 12px; margin-bottom: 14px;">
      <div class="card" style="border-top: 4px solid var(--primary); text-align: center; padding: 14px; margin-bottom: 0;">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Scrap Sold</div>
        <div style="font-size: 28px; font-weight: 900; color: var(--primary); margin-top: 2px;">${summary.totalWeightSoldKg} kg</div>
        <div style="font-size: 11px; color: var(--success); font-weight: 700; margin-top: 2px;">Diverted from toxic open dumps</div>
      </div>

      <div class="card" style="border-top: 4px solid #3b82f6; text-align: center; padding: 14px; margin-bottom: 0;">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Cash Received</div>
        <div style="font-size: 28px; font-weight: 900; color: #1e40af; margin-top: 2px;">₹${summary.totalCashReceived.toLocaleString('en-IN')}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">100% fair doorstep payout</div>
      </div>

      <div class="card" style="border-top: 4px solid var(--accent); text-align: center; padding: 14px; margin-bottom: 0;">
        <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Environmental Impact</div>
        <div style="font-size: 28px; font-weight: 900; color: var(--accent); margin-top: 2px;">🌳 ${summary.totalTreesEquivalent} Trees</div>
        <div style="font-size: 11px; color: #166534; font-weight: 700; margin-top: 2px;">${summary.totalCo2PreventedKg} kg CO₂ prevented</div>
      </div>
    </div>

    <!-- 3. Sales Comparison with Previous Months (Table) -->
    <div class="card" style="padding: 16px; margin-bottom: 14px;">
      <div class="card-header" style="margin-bottom: 8px;">
        <div>
          <h4 class="card-title" style="font-size: 15px;">📊 Monthly Scrap Selling Comparison</h4>
          <p class="card-subtitle" style="font-size: 11.5px;">Tracking how much scrap you have channeled into formal recycling over time</p>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border); color: var(--text-muted); text-transform: uppercase; font-size: 11px;">
              <th style="padding: 8px;">Period</th>
              <th style="padding: 8px;">Weight Sold</th>
              <th style="padding: 8px;">Pickups</th>
              <th style="padding: 8px;">Cash Earned</th>
              <th style="padding: 8px;">Growth vs Prior</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyRowsHtml}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. Detailed History of Scrap Sold to Dealers -->
    <div class="card" style="padding: 16px; margin-bottom: 0;">
      <div class="card-header" style="margin-bottom: 8px;">
        <div>
          <h4 class="card-title" style="font-size: 15px;">📋 Itemized Scrap Sales History</h4>
          <p class="card-subtitle" style="font-size: 11.5px;">All verified doorstep pickups with scrap dealers and CPCB Form-6 safe disposal records</p>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border); color: var(--text-muted); text-transform: uppercase; font-size: 11px;">
              <th style="padding: 8px;">Date & Tx ID</th>
              <th style="padding: 8px;">Scrap Dealer & Shop</th>
              <th style="padding: 8px;">Items Sold</th>
              <th style="padding: 8px;">Weight & Rate</th>
              <th style="padding: 8px;">Cash Paid</th>
              <th style="padding: 8px;">CPCB Green Slip</th>
            </tr>
          </thead>
          <tbody>
            ${historyRowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// Window helper functions for customer actions
window.selectCustomerMaterial = (matId) => {
  const mat = ESETU_DATA.materials.find(m => m.id === matId);
  if (mat) {
    AppState.selectedMaterial = mat;
    const container = document.getElementById('appContent');
    renderCustomerPage(container);
  }
};

window.adjustWeight = (delta) => {
  AppState.calculatorWeight = Math.max(0.1, Number((AppState.calculatorWeight + delta).toFixed(2)));
  const container = document.getElementById('appContent');
  renderCustomerPage(container);
};

window.setWeight = (w) => {
  AppState.calculatorWeight = Number(w);
  const container = document.getElementById('appContent');
  renderCustomerPage(container);
};

window.selectPaymentMode = (mode) => {
  AppState.selectedPaymentMode = mode;
  document.querySelectorAll('.pay-chip').forEach(c => c.classList.remove('selected'));
  const el = document.getElementById(`payMode-${mode}`);
  if (el) el.classList.add('selected');
};

window.speakCurrentValuation = () => {
  const matName = getLocalizedMatName(AppState.selectedMaterial);
  const weightKg = Number(AppState.calculatorWeight) || 0.2;
  const weightGrams = Math.round(weightKg * 1000);
  const payout = (weightKg * AppState.selectedMaterial.customerRate).toFixed(0);
  const text = `${matName}, weight ${weightGrams} grams (${weightKg} kg). Total payout: ${Number(payout).toLocaleString('en-IN')} rupees.`;
  I18N.speak(text);
};

window.triggerCameraMock = () => {
  const input = document.getElementById('cameraInput');
  if (input) input.click();
};

window.handleImageSelected = (e) => {
  const card = document.getElementById('aiDetectionCard');
  if (card) {
    card.style.display = 'block';
    I18N.speak('Scrap item analyzed. High-grade server circuit board detected. Value: 950 rupees per kg.');
  }
};

window.bookPickupFromCalculator = () => {
  const tracked = ESETU_DATA.kabadiwalas[0];
  AppState.trackedKabadiwala = tracked;
  const payout = (AppState.calculatorWeight * AppState.selectedMaterial.customerRate).toFixed(0);
  AppState.activeBookingNotice = `✅ Doorstep Pickup Requested! <strong>${tracked.name}</strong> (${tracked.shopName}) is on the way. Estimated cash: <strong>₹${Number(payout).toLocaleString('en-IN')}</strong>.`;
  I18N.speak(`Doorstep pickup booked with ${tracked.name}. Estimated arrival in ${tracked.etaMinutes} minutes.`);
  AppState.customerTab = 'dealers';
  const container = document.getElementById('appContent');
  renderCustomerPage(container);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.bookPickupFromKabadiwala = (kabadiName) => {
  const found = ESETU_DATA.kabadiwalas.find(k => k.name === kabadiName || k.name.includes(kabadiName)) || ESETU_DATA.kabadiwalas[0];
  AppState.trackedKabadiwala = found;
  const payout = (AppState.calculatorWeight * AppState.selectedMaterial.customerRate).toFixed(0);
  AppState.activeBookingNotice = `✅ Pickup Confirmed! <strong>${found.name}</strong> (${found.shopName}) is dispatched with digital scale. Cash: <strong>₹${Number(payout).toLocaleString('en-IN')}</strong>.`;
  I18N.speak(`Pickup confirmed with ${found.name}. Arriving in ${found.etaMinutes} minutes.`);
  AppState.customerTab = 'dealers';
  const container = document.getElementById('appContent');
  renderCustomerPage(container);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// -------------------------------------------------------------
// STEP 3: KABADIWALA (SCRAP DEALER) 3-PAGE DASHBOARD
// Page 1: Live Scrap Commodity Exchange & 10s Fluctuating Graph
// Page 2: Warehouse Stockpile & Wholesale Recyclers Comparison
// Page 3: Dealer Profile & Daily Collection History Comparisons
// -------------------------------------------------------------
let liveMarketEngineInterval = null;
let marketCountdownInterval = null;
let marketCountdown = 10;

function initLivePriceEngine() {
  if (liveMarketEngineInterval) clearInterval(liveMarketEngineInterval);
  if (marketCountdownInterval) clearInterval(marketCountdownInterval);

  marketCountdown = 10;
  marketCountdownInterval = setInterval(() => {
    marketCountdown--;
    if (marketCountdown <= 0) marketCountdown = 10;
    const timerEls = document.querySelectorAll('.live-timer-tick');
    timerEls.forEach(el => { el.textContent = `${marketCountdown}s`; });
  }, 1000);

  liveMarketEngineInterval = setInterval(() => {
    // Fluctuate each material with realistic market movement
    ESETU_DATA.materials.forEach(m => {
      // Random delta between -2.2% and +2.5%
      const pctShift = (Math.random() * 4.7 - 2.2) / 100;
      let diff = Math.round(m.recyclerRate * pctShift);
      if (diff === 0) diff = Math.random() > 0.48 ? 3 : -3;
      
      const newPrice = Math.max(10, m.recyclerRate + diff);
      m.recyclerRate = newPrice;

      // Maintain exactly 10 values in the live sparkline graph
      if (!m.sparkline || m.sparkline.length === 0) {
        m.sparkline = [newPrice, newPrice, newPrice, newPrice, newPrice, newPrice, newPrice, newPrice, newPrice, newPrice];
      }
      m.sparkline.shift();
      m.sparkline.push(newPrice);

      // Recalculate dynamic Highs and Lows from the 10 values
      m.dayHigh = Math.max(...m.sparkline, m.dayHigh || newPrice);
      m.dayLow = Math.min(...m.sparkline, m.dayLow || newPrice);

      const netShift = newPrice - m.recyclerRate6hrAgo;
      m.isPositive = netShift >= 0;
      m.changePct = (netShift >= 0 ? '+' : '') + ((netShift / (m.recyclerRate6hrAgo || 1)) * 100).toFixed(1) + '%';
    });

    // If Kabadiwala is on Exchange tab, refresh table elements live without losing scroll
    if (AppState.user && AppState.user.role === 'kabadiwala' && AppState.kabadiwalaTab === 'exchange') {
      updateExchangeTableLive();
    }
  }, 10000); // REPEATEDLY EVERY 10 SECONDS
}

window.selectHeroMaterial = (matId) => {
  AppState.selectedExchangeMatId = matId;
  updateExchangeTableLive();
};

function updateHeroLiveChart() {
  const container = document.getElementById('heroLiveChartContainer');
  if (!container) return;

  if (!AppState.selectedExchangeMatId) {
    AppState.selectedExchangeMatId = 'cu-wire';
  }
  const mat = ESETU_DATA.materials.find(m => m.id === AppState.selectedExchangeMatId) || ESETU_DATA.materials[0];
  const spark = mat.sparkline && mat.sparkline.length === 10 ? mat.sparkline : [mat.recyclerRate, mat.recyclerRate, mat.recyclerRate, mat.recyclerRate, mat.recyclerRate, mat.recyclerRate, mat.recyclerRate, mat.recyclerRate, mat.recyclerRate, mat.recyclerRate];
  
  const min = Math.min(...spark);
  const max = Math.max(...spark);
  const range = max - min || 1;
  const isUp = mat.isPositive;
  const strokeColor = isUp ? '#16a34a' : '#dc2626';

  // 10 coordinates for viewBox 0 0 680 180
  const points = spark.map((val, idx) => {
    const x = 40 + idx * ((640 - 40) / 9);
    const y = 145 - ((val - min) / range) * 110;
    return { x, y, val, idx };
  });

  const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPoints = `40,155 ${polyPoints} 640,155`;

  const circlesHtml = points.map((p, idx) => {
    const isLatest = idx === 9;
    const isMin = p.val === min;
    const isMax = p.val === max;
    const tagBg = isLatest ? '#0f172a' : (isMax ? '#166534' : (isMin ? '#991b1b' : '#334155'));
    
    return `
      <g>
        ${isLatest ? `<circle cx="${p.x}" cy="${p.y}" r="11" fill="none" stroke="${strokeColor}" stroke-width="2" opacity="0.6">
          <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
        </circle>` : ''}
        <circle cx="${p.x}" cy="${p.y}" r="${isLatest ? 6 : 4.5}" fill="${isLatest ? strokeColor : '#ffffff'}" stroke="${strokeColor}" stroke-width="2.5" />
        
        <!-- Numeric Value Tag (Exact 10 Numbers on Graph) -->
        <rect x="${p.x - 22}" y="${p.y - 25}" width="44" height="17" rx="4" fill="${tagBg}" opacity="0.9" />
        <text x="${p.x}" y="${p.y - 13}" font-size="10.5" font-family="-apple-system, sans-serif" font-weight="700" fill="#ffffff" text-anchor="middle">
          ₹${p.val}
        </text>
      </g>
    `;
  }).join('');

  // Material Chips
  const chipsHtml = ESETU_DATA.materials.map(m => `
    <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px; font-weight: 700; border-radius: var(--radius-full); cursor: pointer; ${m.id === mat.id ? 'background: var(--primary); color: #fff; border-color: var(--primary);' : 'background: #f8fafc;'}" onclick="selectHeroMaterial('${m.id}')">
      ${m.icon} ${m.symbol}
    </button>
  `).join('');

  // 10-Value Time Ribbon
  const ribbonHtml = spark.map((val, idx) => {
    const isLatest = idx === 9;
    const timeLabel = isLatest ? 'NOW' : `T-${(9 - idx) * 10}s`;
    const isPeak = val === max;
    const isFloor = val === min;
    
    return `
      <div style="flex: 1; min-width: 58px; background: ${isLatest ? '#ecfdf5' : '#f8fafc'}; border: 1.5px solid ${isLatest ? 'var(--primary)' : '#e2e8f0'}; border-radius: 6px; padding: 6px 4px; text-align: center;">
        <div style="font-size: 10px; color: ${isLatest ? 'var(--primary-dark)' : 'var(--text-muted)'}; font-weight: 800;">
          ${timeLabel} ${isPeak ? '🏆' : (isFloor ? '🔻' : '')}
        </div>
        <div style="font-size: 13px; font-weight: 900; color: ${isLatest ? '#065f46' : 'var(--text-main)'}; margin-top: 2px;">
          ₹${val}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="card" style="margin-bottom: 20px; border-top: 4px solid ${strokeColor}; box-shadow: var(--shadow-md);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="live-dot-pulse"></span>
            <span style="font-size: 12px; font-weight: 800; color: ${strokeColor}; text-transform: uppercase; letter-spacing: 0.5px;">
              Live Price Stream (Updates Every 10 Seconds)
            </span>
            <span style="background: #f1f5f9; font-size: 11.5px; padding: 2px 8px; border-radius: 4px; color: var(--text-muted);">
              ⏱️ Auto-Tick: <strong class="live-timer-tick" style="color: var(--accent);">${marketCountdown}s</strong>
            </span>
          </div>
          <h2 style="font-size: 22px; font-weight: 900; margin-top: 4px; display: flex; align-items: center; gap: 8px;">
            ${mat.icon} ${getLocalizedMatName(mat)}
            <span class="symbol-badge">${mat.symbol}</span>
          </h2>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="text-align: right;">
            <div style="font-size: 28px; font-weight: 900; color: var(--text-main);">
              ₹${mat.recyclerRate}<span style="font-size: 14px; color: var(--text-muted); font-weight: 600;">/kg</span>
            </div>
            <span class="trend-badge ${isUp ? 'up' : 'down'}" style="font-size: 12px;">
              ${isUp ? '▲' : '▼'} ${mat.changePct}
            </span>
          </div>

          <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 14px; display: flex; gap: 16px; font-size: 12px;">
            <div>
              <div style="color: var(--text-muted); font-weight: 700;">SESSION HIGH</div>
              <div style="color: #166534; font-size: 16px; font-weight: 900;">₹${mat.dayHigh}/kg</div>
            </div>
            <div style="border-left: 1px solid var(--border); padding-left: 16px;">
              <div style="color: var(--text-muted); font-weight: 700;">SESSION LOW</div>
              <div style="color: #991b1b; font-size: 16px; font-weight: 900;">₹${mat.dayLow}/kg</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Material Switcher Pills -->
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 14px;">
        ${chipsHtml}
      </div>

      <!-- High-Resolution Live SVG Graph with 10 Points -->
      <div style="background: linear-gradient(to bottom, #ffffff, #f8fafc); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 6px 4px 6px; position: relative;">
        <svg viewBox="0 0 680 180" style="width: 100%; height: auto; display: block; overflow: visible;">
          <defs>
            <linearGradient id="liveAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
            </linearGradient>
          </defs>

          <!-- Horizontal Guide Grid Lines -->
          <line x1="30" y1="35" x2="650" y2="35" stroke="#e2e8f0" stroke-dasharray="4,4" stroke-width="1"/>
          <text x="32" y="30" font-size="9" font-weight="700" fill="#166534">HIGH ₹${mat.dayHigh}</text>

          <line x1="30" y1="90" x2="650" y2="90" stroke="#f1f5f9" stroke-width="1"/>

          <line x1="30" y1="145" x2="650" y2="145" stroke="#e2e8f0" stroke-dasharray="4,4" stroke-width="1"/>
          <text x="32" y="141" font-size="9" font-weight="700" fill="#991b1b">LOW ₹${mat.dayLow}</text>

          <!-- Filled Area Under Curve -->
          <polygon points="${areaPoints}" fill="url(#liveAreaGrad)"/>

          <!-- 10-Point Connecting Polyline -->
          <polyline fill="none" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polyPoints}"/>

          <!-- 10 Circular Data Vertices & Numeric Value Callouts -->
          ${circlesHtml}
        </svg>

        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); padding: 6px 12px 0 12px; border-top: 1px solid #f1f5f9;">
          <span>⏮️ 90 Seconds Ago (Tick 1)</span>
          <span style="font-weight: 700; color: var(--primary);">⏱️ 10-Second Fluctuating Sparkline (10 Values)</span>
          <span style="font-weight: 700; color: ${strokeColor};">🔴 Current Market Tick (Tick 10) ⏭️</span>
        </div>
      </div>

      <!-- 10-Point Ledger Ribbon Displaying All 10 Numbers -->
      <div style="margin-top: 14px;">
        <div style="font-size: 11.5px; font-weight: 800; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
          📋 Live 10-Value Numerical History Array (Rolling Window):
        </div>
        <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
          ${ribbonHtml}
        </div>
      </div>
    </div>
  `;
}

function updateExchangeTableLive() {
  updateHeroLiveChart();

  const tbody = document.getElementById('liveExchangeTableBody');
  if (!tbody) return;

  tbody.innerHTML = ESETU_DATA.materials.map(m => {
    const isUp = m.isPositive;
    const cls = isUp ? 'up' : 'down';
    const arrow = isUp ? '▲' : '▼';

    const min = Math.min(...m.sparkline);
    const max = Math.max(...m.sparkline);
    const points = m.sparkline.map((val, idx) => {
      const x = (idx / (m.sparkline.length - 1)) * 90 + 2;
      const y = 26 - ((val - min) / (max - min || 1)) * 22;
      return `${x},${y}`;
    }).join(' ');

    return `
      <tr style="animation: pulseHighlight 0.5s ease; cursor: pointer;" onclick="selectHeroMaterial('${m.id}')" title="Click to view full 10-point live graph">
        <td style="padding: 12px 8px;">
          <span class="symbol-badge">${m.symbol}</span>
          <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">${m.icon} ${getLocalizedMatName(m).split('(')[0]}</div>
        </td>
        <td style="padding: 12px 8px;">
          <strong style="font-size: 16px; color: var(--text-main);">₹${m.recyclerRate}/kg</strong>
          <div style="font-size: 11px; color: var(--text-muted);">6h: ₹${m.recyclerRate6hrAgo}</div>
        </td>
        <td style="padding: 12px 8px;">
          <span class="trend-badge ${cls}">${arrow} ${m.changePct}</span>
        </td>
        <td style="padding: 12px 8px; color: #166534; font-weight: 700;">
          ₹${m.dayHigh}/kg
        </td>
        <td style="padding: 12px 8px; color: #991b1b; font-weight: 700;">
          ₹${m.dayLow}/kg
        </td>
        <td style="padding: 12px 8px; min-width: 220px;">
          <svg style="width: 100px; height: 28px; vertical-align: middle;">
            <polyline fill="none" stroke="${isUp ? '#16a34a' : '#dc2626'}" stroke-width="2.5" points="${points}" />
          </svg>
          <div style="font-size: 10.5px; font-family: monospace; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 6px; margin-top: 4px;">
            <strong>10 ticks:</strong> [${m.sparkline.map(v => '₹' + v).join(', ')}]
          </div>
        </td>
        <td style="padding: 12px 8px;">
          <button class="btn-primary" style="padding: 6px 12px; font-size: 12px; width: auto;" onclick="event.stopPropagation(); openCreateLotModal('${ESETU_DATA.recyclers[0].id}', '${ESETU_DATA.recyclers[0].name}')">
            Sell Lot
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderKabadiwalaPage(container) {
  if (!AppState.kabadiwalaTab) AppState.kabadiwalaTab = 'exchange';
  initLivePriceEngine();

  // Top Tab Navigation for Kabadiwala (3 Sub-Pages)
  const tabNavHtml = `
    <div style="display: flex; gap: 8px; background: #e2e8f0; border-radius: var(--radius-sm); padding: 5px; margin-bottom: 20px;">
      <button class="btn-secondary ${AppState.kabadiwalaTab === 'exchange' ? 'btn-primary' : ''}" 
              style="flex: 1; padding: 10px; font-size: 13.5px; font-weight: 700;" 
              onclick="setKabadiwalaTab('exchange')">
        📈 ${I18N.currentLang === 'en' ? 'Live Commodity Exchange' : 'लाइव्ह कमोडिटी मार्केट'}
      </button>
      <button class="btn-secondary ${AppState.kabadiwalaTab === 'warehouse' ? 'btn-primary' : ''}" 
              style="flex: 1; padding: 10px; font-size: 13.5px; font-weight: 700;" 
              onclick="setKabadiwalaTab('warehouse')">
        🏭 ${I18N.currentLang === 'en' ? 'Warehouse & Recyclers' : 'गोडाउन व रिसायकलर्स'}
      </button>
      <button class="btn-secondary ${AppState.kabadiwalaTab === 'profile' ? 'btn-primary' : ''}" 
              style="flex: 1; padding: 10px; font-size: 13.5px; font-weight: 700;" 
              onclick="setKabadiwalaTab('profile')">
        👤 ${I18N.currentLang === 'en' ? 'Dealer Profile & Collection History' : 'प्रोफाइल व संकलन तुलना'}
      </button>
    </div>
  `;

  if (AppState.kabadiwalaTab === 'exchange') {
    renderKabadiwalaExchangeTab(container, tabNavHtml);
  } else if (AppState.kabadiwalaTab === 'warehouse') {
    renderKabadiwalaWarehouseTab(container, tabNavHtml);
  } else {
    renderKabadiwalaProfileTab(container, tabNavHtml);
  }
}

// Window helper to switch tabs
window.setKabadiwalaTab = (tabName) => {
  AppState.kabadiwalaTab = tabName;
  const container = document.getElementById('appContent');
  renderKabadiwalaPage(container);
};

// -------------------------------------------------------------
// SUB-PAGE 1: LIVE SCRAP COMMODITY EXCHANGE (10-SEC LIVE GRAPH)
// -------------------------------------------------------------
function renderKabadiwalaExchangeTab(container, tabNavHtml) {
  container.innerHTML = `
    ${tabNavHtml}

    <!-- Live Market Ticker Tape with 10-sec Countdown Indicator -->
    <div style="background:#0f172a; color:#fff; padding:12px 20px; border-radius:var(--radius-sm); margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e;"></span>
        <strong style="color:#38bdf8; font-size:14px; letter-spacing:0.5px;">LIVE WHOLESALE COMMODITY EXCHANGE</strong>
      </div>
      <div style="display: flex; align-items: center; gap: 14px; font-size: 13px;">
        <span style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 4px;">
          ⏱️ Rate Auto-Tick: <strong class="live-timer-tick" style="color: #facc15;">${marketCountdown}s</strong>
        </span>
        <button class="audio-btn" style="background:#1e293b; color:#38bdf8; border:1px solid #334155;" onclick="I18N.speak('Live Scrap Exchange. Real-time rates updating every 10 seconds.')">
          ${I18N.t('speakBtn')}
        </button>
      </div>
    </div>

    <!-- Featured Live 10-Point Scrap Price Graph Card -->
    <div id="heroLiveChartContainer"></div>

    <!-- Live Ticker Table -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">${I18N.t('stockExchangeTitle')}</h3>
          <p class="card-subtitle">Real-time commodity graph updating every 10 seconds with 10 price points, daily highs & lows</p>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table class="stock-ticker-table">
          <thead>
            <tr>
              <th>Commodity Stream</th>
              <th>Current Bid</th>
              <th>Change</th>
              <th>Day High</th>
              <th>Day Low</th>
              <th>Live 10-Point Trend Graph</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="liveExchangeTableBody">
            <!-- Injected by updateExchangeTableLive() -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Container -->
    <div id="lotModalContainer"></div>
  `;

  updateExchangeTableLive();
}

// -------------------------------------------------------------
// SUB-PAGE 2: WAREHOUSE STOCKPILE & WHOLESALE RECYCLERS
// -------------------------------------------------------------
function renderKabadiwalaWarehouseTab(container, tabNavHtml) {
  let totalStockWeight = 0;
  let totalStockValue = 0;
  let totalEstimatedProfit = 0;

  const stockRowsHtml = ESETU_DATA.inventory.map(inv => {
    const mat = ESETU_DATA.materials.find(m => m.id === inv.materialId);
    const recRate = mat ? mat.recyclerRate : 100;
    const itemVal = inv.weightKg * recRate;
    const profit = inv.weightKg * (recRate - inv.avgBuyCost);

    totalStockWeight += inv.weightKg;
    totalStockValue += itemVal;
    totalEstimatedProfit += profit;

    return `
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 10px 8px;">
          <strong>${inv.name}</strong>
          <div style="font-size: 11px; color: var(--text-muted);">${inv.symbol}</div>
        </td>
        <td style="padding: 10px 8px; font-weight: 700;">${inv.weightKg} kg</td>
        <td style="padding: 10px 8px; color: var(--primary-text); font-weight: 800;">₹${recRate}/kg</td>
        <td style="padding: 10px 8px; font-weight: 800;">₹${itemVal.toLocaleString('en-IN')}</td>
        <td style="padding: 10px 8px; color: var(--success); font-weight: 700;">+₹${profit.toLocaleString('en-IN')}</td>
      </tr>
    `;
  }).join('');

  const recyclersHtml = ESETU_DATA.recyclers.map(r => {
    const reviewsHtml = r.kabadiwalaReviews.map(rev => `
      <div class="review-item">
        <div class="review-author">
          <span>🚲 ${rev.author}</span>
          <span style="color: #b45309;">★ ${rev.rating}</span>
        </div>
        <div class="review-text">"${rev.text}"</div>
      </div>
    `).join('');

    return `
      <div class="rec-compare-card" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h4 style="font-size: 15px; font-weight: 800;">${r.name}</h4>
              <span class="rec-badge-gov">🛡️ ${r.cpcbRegNo}</span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 13px; font-weight: 800; color: #b45309;">★ ${r.rating}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${r.kabadiwalaReviewsCount} dealer reviews</div>
            </div>
          </div>

          <!-- Deep Facility Address & Operating Details -->
          <div style="background: #f8fafc; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); margin: 10px 0; font-size: 12px; line-height: 1.5;">
            <div>📍 <strong>Facility:</strong> ${r.fullAddress}</div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px;">
              <span>📍 Distance: <strong>${r.distanceKm} km</strong></span>
              <span>📦 Min Batch: <strong>${r.minLotKg} kg</strong></span>
            </div>
            <div style="color: #065f46; font-weight: 700; margin-top: 4px;">
              💳 ${r.paymentTerms}
            </div>
          </div>

          <!-- Live Recycler Collection Truck ETA & In-Transit Tracking -->
          <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: var(--radius-sm); padding: 10px 12px; margin: 10px 0; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #1e40af; font-weight: 800;">🚚 Dispatch & Truck ETA</span>
              <span style="background: #dbeafe; color: #1e3a8a; font-weight: 800; padding: 2px 8px; border-radius: 4px;">~${r.collectionTruckETA} mins</span>
            </div>
            <div style="color: #1d4ed8; margin-top: 4px; font-size: 11.5px;">${r.collectionTruckStatus}</div>
            <div style="color: var(--text-muted); font-size: 11px; margin-top: 4px;">⚖️ <strong>Weighbridge:</strong> ${r.weighbridgeTech}</div>
            <div style="color: var(--text-muted); font-size: 11px;">⏰ <strong>Gate Hours:</strong> ${r.operatingHours}</div>
          </div>

          <!-- Live Recycler Buying Rates -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
            <span style="background:#ecfdf5; color:#065f46; font-size:11.5px; padding:3px 7px; border-radius:4px; font-weight:700;">
              PCB: ₹${r.rates['PCB-HI']}/kg
            </span>
            <span style="background:#ecfdf5; color:#065f46; font-size:11.5px; padding:3px 7px; border-radius:4px; font-weight:700;">
              Copper: ₹${r.rates['CU-WIRE']}/kg
            </span>
            <span style="background:#ecfdf5; color:#065f46; font-size:11.5px; padding:3px 7px; border-radius:4px; font-weight:700;">
              Li-Batt: ₹${r.rates['LI-BATT']}/kg
            </span>
          </div>
        </div>

        <div>
          <!-- Action Links: Google Maps & Create Lot -->
          <div style="display: flex; gap: 8px; flex-direction: column; margin-bottom: 10px;">
            <a href="${r.googleMapsUrl}" target="_blank" class="btn-secondary" style="width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; padding: 8px; text-decoration: none; border-color: #3b82f6; color: #1d4ed8; font-weight: 700;">
              🗺️ Open Facility on Google Maps ↗
            </a>
            <button class="btn-primary" style="width: 100%; padding: 8px; font-size: 12px;" onclick="openCreateLotModal('${r.id}', '${r.name}')">
              ${I18N.t('createLotBtn')}
            </button>
          </div>

          <div class="reviews-accordion">
            <div style="font-weight: 700; color: var(--text-muted); display: flex; justify-content: space-between;">
              <span>⭐ ${I18N.t('reviewsByKabadiwala')} (${r.kabadiwalaReviews.length})</span>
              <span style="color: var(--primary);">▼</span>
            </div>
            <div style="margin-top: 6px;">
              ${reviewsHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${tabNavHtml}

    <!-- Top Balanced Section: Hero Metrics & Stockpile Breakdown -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 16px; margin-bottom: 20px;">
      <!-- Hero Stockpile Analytics Card -->
      <div class="inventory-hero" style="margin-bottom: 0; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">
                ${I18N.t('stockpileTitle')} (${AppState.user.yard || 'Warehouse'})
              </span>
              <div class="hero-metric" style="margin: 10px 0;">
                ${totalStockWeight} <span style="font-size: 20px; font-weight: 600;">kg In-Stock</span>
              </div>
            </div>
            <button class="audio-btn" style="background:#fff; color:var(--primary-dark);" onclick="I18N.speak('Total inventory: ${totalStockWeight} kilograms. Current market value: ${totalStockValue} rupees. Projected gross profit: ${totalEstimatedProfit} rupees.')">
              ${I18N.t('speakBtn')}
            </button>
          </div>
          <p style="font-size: 12.5px; opacity: 0.88; line-height: 1.4; margin-top: 4px;">
            Aggregated electronic scrap ready for wholesale lot liquidation to government authorized CPCB recycling plants.
          </p>
        </div>

        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.25); display: flex; justify-content: space-between;">
          <div>
            <div style="font-size: 12px; opacity: 0.85;">${I18N.t('totalStockValue')}</div>
            <div style="font-size: 22px; font-weight: 900;">₹${totalStockValue.toLocaleString('en-IN')}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; opacity: 0.85;">${I18N.t('estMargin')}</div>
            <div style="font-size: 22px; font-weight: 900; color: #86efac;">+₹${totalEstimatedProfit.toLocaleString('en-IN')} (28.4%)</div>
          </div>
        </div>
      </div>

      <!-- Warehouse Stockpile Breakdown Table Card -->
      <div class="card" style="margin-bottom: 0; padding: 18px; display: flex; flex-direction: column; justify-content: space-between;">
        <div class="card-header" style="margin-bottom: 10px; padding-bottom: 8px;">
          <div>
            <h3 class="card-title" style="font-size: 16px;">📦 Warehouse Stockpile Breakdown</h3>
            <p class="card-subtitle" style="font-size: 12px;">Current holdings by material grade and wholesale margin</p>
          </div>
        </div>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 12.5px; text-align: left;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border); color: var(--text-muted);">
                <th style="padding: 7px 6px;">Material</th>
                <th style="padding: 7px 6px;">Weight</th>
                <th style="padding: 7px 6px;">Wholesale</th>
                <th style="padding: 7px 6px;">Value</th>
                <th style="padding: 7px 6px;">Gross Margin</th>
              </tr>
            </thead>
            <tbody>
              ${stockRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Bottom Full-Width Section: Authorized Recyclers (3-Column Desktop Grid) -->
    <div class="card" style="padding: 20px;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h3 class="card-title">${I18N.t('wholesaleCompareTitle')}</h3>
          <p class="card-subtitle">Dispatch lots to authorized CPCB green recyclers with verified digital weighbridges & live dispatch tracking</p>
        </div>
        <span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 700; padding: 6px 12px; font-size: 12px;">
          🟢 3 Recyclers Connected
        </span>
      </div>

      <div class="desktop-grid-3" style="gap: 16px;">
        ${recyclersHtml}
      </div>
    </div>

    <!-- Modal Container -->
    <div id="lotModalContainer"></div>
  `;
}

// -------------------------------------------------------------
// SUB-PAGE 3: KABADIWALA PROFILE & DAILY COLLECTION COMPARISONS
// -------------------------------------------------------------
function renderKabadiwalaProfileTab(container, tabNavHtml) {
  const dealerName = AppState.user.name || 'Raju Shinde';
  const yardName = AppState.user.yard || 'Shinde Scrap Traders';
  const dealerId = AppState.user.kabadiId || 'KAB-MH-4452';
  const phone = AppState.user.phone || '+91 98201 44521';
  const location = AppState.user.location || 'Kothrud / Karve Road, Pune';

  // Calculate totals from daily collection history
  const totalWeeklyKg = ESETU_DATA.dailyCollectionHistory.reduce((sum, d) => sum + d.weightKg, 0);
  const totalWeeklyRev = ESETU_DATA.dailyCollectionHistory.reduce((sum, d) => sum + d.revenue, 0);
  const totalItemsCount = ESETU_DATA.dailyCollectionHistory.reduce((sum, d) => sum + d.itemsCount, 0);

  // Daily collection comparison rows
  const historyRowsHtml = ESETU_DATA.dailyCollectionHistory.map((item, idx) => {
    const isToday = idx === 0;
    const isUp = item.gainVsYesterday.includes('▲');
    const isDown = item.gainVsYesterday.includes('▼');
    const badgeColor = isUp ? 'var(--success)' : (isDown ? 'var(--danger)' : 'var(--text-muted)');
    const badgeBg = isUp ? 'var(--success-light)' : (isDown ? 'var(--danger-light)' : '#f1f5f9');

    // Visual percentage bar
    const barWidth = Math.round((item.weightKg / 200) * 100);

    return `
      <tr style="border-bottom: 1px solid var(--border); background: ${isToday ? '#f0fdf4' : 'transparent'};">
        <td style="padding: 12px 10px;">
          <strong>${item.day}</strong>
          <div style="font-size: 11.5px; color: var(--text-muted);">${item.date}</div>
        </td>
        <td style="padding: 12px 10px;">
          <div style="font-size: 15px; font-weight: 800; color: var(--primary-dark);">${item.weightKg} kg</div>
          <div style="background: #e2e8f0; height: 6px; border-radius: 3px; width: 100px; margin-top: 4px;">
            <div style="background: var(--primary); height: 6px; border-radius: 3px; width: ${barWidth}%;"></div>
          </div>
        </td>
        <td style="padding: 12px 10px; font-weight: 600;">
          ${item.itemsCount} lots
        </td>
        <td style="padding: 12px 10px; font-weight: 800;">
          ₹${item.revenue.toLocaleString('en-IN')}
        </td>
        <td style="padding: 12px 10px;">
          <span style="background: ${badgeBg}; color: ${badgeColor}; font-weight: 800; font-size: 12px; padding: 3px 8px; border-radius: var(--radius-full);">
            ${item.gainVsYesterday}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    ${tabNavHtml}

    <!-- 1. Dealer Profile Header Card -->
    <div class="card" style="border-left: 6px solid var(--primary); background: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; gap: 16px; align-items: center;">
          <div style="font-size: 48px; background: #f0fdf4; width: 80px; height: 80px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 2px solid #bbf7d0;">
            👨🏽‍💼
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h2 style="font-size: 22px; font-weight: 900; color: var(--text-main);">${dealerName}</h2>
              <span style="background: #dcfce7; color: #166534; font-size: 11.5px; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-full);">
                ✅ Certified Partner
              </span>
            </div>
            <div style="font-size: 15px; font-weight: 700; color: var(--primary-dark); margin-top: 2px;">
              🏪 ${yardName}
            </div>
            <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
              📍 ${location} • 📞 ${phone} • ID: <code>${dealerId}</code>
            </div>
          </div>
        </div>

        <div style="text-align: right;">
          <span style="background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: var(--radius-full); font-size: 12.5px; font-weight: 700;">
            ⚖️ Certified Electronic Scale Verified
          </span>
          <div style="margin-top: 8px;">
            <button class="audio-btn" onclick="I18N.speak('Profile for ${dealerName}, owner of ${yardName}. Total weekly collections: ${totalWeeklyKg} kilograms across ${totalItemsCount} transactions.')">
              ${I18N.t('speakBtn')}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Overview Metrics Cards -->
    <div class="desktop-grid-3">
      <div class="card" style="border-top: 4px solid var(--primary); text-align: center;">
        <div style="font-size: 12.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Today's Inflow</div>
        <div style="font-size: 32px; font-weight: 900; color: var(--primary); margin-top: 4px;">185 kg</div>
        <div style="font-size: 12px; color: var(--success); font-weight: 700; margin-top: 2px;">+30.2% ▲ higher than yesterday</div>
      </div>

      <div class="card" style="border-top: 4px solid #3b82f6; text-align: center;">
        <div style="font-size: 12.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">7-Day Cumulative Volume</div>
        <div style="font-size: 32px; font-weight: 900; color: #1e40af; margin-top: 4px;">${totalWeeklyKg} kg</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Processed across ${totalItemsCount} customer pickups</div>
      </div>

      <div class="card" style="border-top: 4px solid var(--accent); text-align: center;">
        <div style="font-size: 12.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">7-Day Net Realization</div>
        <div style="font-size: 32px; font-weight: 900; color: var(--accent); margin-top: 4px;">₹${totalWeeklyRev.toLocaleString('en-IN')}</div>
        <div style="font-size: 12px; color: #166534; font-weight: 700; margin-top: 2px;">Avg gross margin: 28.4%</div>
      </div>
    </div>

    <!-- 3. Day-by-Day Scrap Collection Comparison Table -->
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">📊 Scrap Collection Comparison with Previous Days</h3>
          <p class="card-subtitle">Daily tracking of collected weight, lots count, revenue, and day-over-day growth</p>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid var(--border); color: var(--text-muted); text-transform: uppercase; font-size: 12px;">
              <th style="padding: 10px;">Collection Day</th>
              <th style="padding: 10px;">Scrap Weight (kg)</th>
              <th style="padding: 10px;">Pickups Count</th>
              <th style="padding: 10px;">Estimated Revenue</th>
              <th style="padding: 10px;">Day-over-Day Shift</th>
            </tr>
          </thead>
          <tbody>
            ${historyRowsHtml}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. Material Category Breakdown for this Dealer -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">🔬 Weekly Collected Scrap Streams Breakdown</h3>
      </div>
      <div class="desktop-grid-2">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700;">
              <span>🔌 Copper Wires & Cables</span>
              <span>38% (335 kg)</span>
            </div>
            <div style="background:#e2e8f0; height:8px; border-radius:4px; margin-top:4px;">
              <div style="background:#047857; width:38%; height:8px; border-radius:4px;"></div>
            </div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700;">
              <span>💻 High-Grade PCBs & Telecom Boards</span>
              <span>28% (248 kg)</span>
            </div>
            <div style="background:#e2e8f0; height:8px; border-radius:4px; margin-top:4px;">
              <div style="background:#3b82f6; width:28%; height:8px; border-radius:4px;"></div>
            </div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700;">
              <span>🔋 Lithium-Ion & EV Batteries</span>
              <span>15% (132 kg)</span>
            </div>
            <div style="background:#e2e8f0; height:8px; border-radius:4px; margin-top:4px;">
              <div style="background:#ea580c; width:15%; height:8px; border-radius:4px;"></div>
            </div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:700;">
              <span>📺 CRT & Display Glass</span>
              <span>19% (168 kg)</span>
            </div>
            <div style="background:#e2e8f0; height:8px; border-radius:4px; margin-top:4px;">
              <div style="background:#8b5cf6; width:19%; height:8px; border-radius:4px;"></div>
            </div>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1.5px solid var(--border); padding: 16px; border-radius: var(--radius-sm); font-size: 13px; line-height: 1.6;">
          <h4 style="font-weight: 800; color: var(--primary-dark); margin-bottom: 6px;">♻️ Formal Channel Advantage</h4>
          <p>By routing <strong>${totalWeeklyKg} kg</strong> through authorized CPCB recyclers this week, <strong>${yardName}</strong> gained:</p>
          <ul style="padding-left: 18px; margin-top: 6px; color: var(--text-muted);">
            <li><strong>+₹38,400 higher earnings</strong> compared to local backyard burn pits.</li>
            <li>Zero police or environmental pollution harassment.</li>
            <li>100% documented CPCB Form-6 manifests for every lot dispatched.</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

  // Window helper for lot creation modal
  window.openCreateLotModal = (recyclerId, recyclerName) => {
    const modalEl = document.getElementById('lotModalContainer');
    const lotNo = `LOT-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    modalEl.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <button class="modal-close" onclick="closeLotModal()">✕</button>
          
          <h3 style="font-size: 18px; font-weight: 800; color: var(--primary-dark); margin-bottom: 4px;">
            📄 Create Bulk Lot Manifest
          </h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
            Target Recycler: <strong>${recyclerName}</strong>
          </p>

          <div style="background: #f8fafc; padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); font-size: 12.5px; margin-bottom: 14px;">
            <div>Lot Reference: <strong>${lotNo}</strong></div>
            <div>GPS Handover Coordinates: <strong>18.5074° N, 73.8077° E</strong></div>
            <div>Timestamp: <strong>${new Date().toLocaleString()}</strong></div>
          </div>

          <div class="form-group">
            <label class="form-label">Material Stream:</label>
            <select id="modalMatSelect" class="form-input">
              ${ESETU_DATA.materials.map(m => `
                <option value="${m.id}">${m.icon} ${m.name} (₹${m.recyclerRate}/kg)</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Net Lot Weight (kg):</label>
            <input type="number" id="modalWeightInput" class="form-input" value="100">
          </div>

          <div class="form-group">
            <label class="form-label">Settlement Mode:</label>
            <select id="modalPaySelect" class="form-input">
              <option value="Cash at Gate">💵 Immediate Cash at Gate</option>
              <option value="Same-day RTGS">🏦 Same-day Bank RTGS</option>
              <option value="Instant UPI">📱 Instant UPI Transfer</option>
            </select>
          </div>

          <!-- Digital QR Handover Manifest -->
          <div style="background: #eff6ff; border: 1.5px dashed #3b82f6; padding: 16px; border-radius: var(--radius-sm); text-align: center; margin: 16px 0;">
            <div style="font-size: 13px; font-weight: 800; color: #1e40af; margin-bottom: 8px;">
              📱 CPCB Form-6 Verifiable Digital QR Slip
            </div>
            <div style="background: #fff; width: 140px; height: 140px; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 2px solid #000; font-family: monospace; font-size: 11px; padding: 6px;">
              [QR: ${lotNo}]<br>
              CPCB TRACEABLE
            </div>
            <p style="font-size: 11.5px; color: #1d4ed8; margin-top: 8px;">
              The authorized recycler scans this tamper-proof code at their weighbridge to confirm handover.
            </p>
          </div>

          <button class="btn-primary" onclick="confirmLotCreation('${lotNo}', '${recyclerId}', '${recyclerName}')">
            ✅ Dispatch Lot to Recycler
          </button>
        </div>
      </div>
    `;
  };

  window.closeLotModal = () => {
    document.getElementById('lotModalContainer').innerHTML = '';
  };

  window.confirmLotCreation = (lotNo, recyclerId, recyclerName) => {
    const matId = document.getElementById('modalMatSelect').value;
    const weight = Number(document.getElementById('modalWeightInput').value) || 50;
    const payMode = document.getElementById('modalPaySelect').value;
    const mat = ESETU_DATA.materials.find(m => m.id === matId);

    const newLot = {
      lotId: lotNo,
      date: 'Just now',
      kabadiwalaId: AppState.user.phone,
      kabadiwalaName: AppState.user.name,
      recyclerId: recyclerId,
      recyclerName: recyclerName,
      material: mat ? mat.name : 'Electronic Scrap',
      symbol: mat ? mat.symbol : 'ESCRAP',
      weightKg: weight,
      agreedRate: mat ? mat.recyclerRate : 400,
      totalAmount: weight * (mat ? mat.recyclerRate : 400),
      paymentMethod: payMode,
      paymentStatus: 'Pending Inspection',
      status: 'In Transit / Gate Handover Booked',
      gpsLocation: '18.5074° N, 73.8077° E',
      cpcbManifestNo: `MH-EPR-MAN-${Math.floor(100000 + Math.random() * 900000)}`,
      eprCertIssued: false
    };

    ESETU_DATA.lots.unshift(newLot);
    closeLotModal();
    alert(`✅ Lot ${lotNo} generated and transmitted to ${recyclerName}!`);
    I18N.speak(`Lot generated and sent to ${recyclerName}.`);
    renderKabadiwalaPage(container);
  };

// -------------------------------------------------------------
// STEP 4: RECYCLER PORTAL (CPCB EPR COMPLIANCE & RATES)
// -------------------------------------------------------------
function renderRecyclerPage(container) {
  const lotsHtml = ESETU_DATA.lots.map(lot => {
    const isPaid = lot.paymentStatus === 'Paid';
    const isVerified = lot.eprCertIssued;

    return `
      <div class="card" style="border-left: 5px solid ${isPaid ? 'var(--success)' : 'var(--accent)'}; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span style="font-size: 11.5px; background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-weight: 800;">
              ${lot.lotId}
            </span>
            <h4 style="font-size: 15px; font-weight: 800; margin-top: 5px;">${lot.material}</h4>
            <div style="font-size: 12.5px; color: var(--text-muted);">
              Collector: <strong>${lot.kabadiwalaName}</strong> (${lot.date})
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 17px; font-weight: 900; color: var(--primary-dark);">
              ₹${lot.totalAmount.toLocaleString('en-IN')}
            </div>
            <span style="font-size: 12px; font-weight: 700; color: ${isPaid ? 'var(--success)' : 'var(--accent)'};">
              ● ${lot.paymentStatus}
            </span>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 10px 12px; border-radius: var(--radius-sm); margin: 10px 0; font-size: 12px;">
          <div>Net Weight: <strong>${lot.weightKg} kg</strong> @ ₹${lot.agreedRate}/kg</div>
          <div>Settlement: <strong>${lot.paymentMethod}</strong></div>
          <div>GPS Origin: <strong>${lot.gpsLocation}</strong></div>
          <div>CPCB Form-6 Manifest: <strong>${lot.cpcbManifestNo}</strong></div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 12px;">
          ${!isPaid ? `
            <button class="btn-primary" style="flex:1; padding: 10px; font-size: 13px;" onclick="confirmRecyclerPayment('${lot.lotId}')">
              ${I18N.t('verifyWeightBtn')}
            </button>
          ` : ''}

          <button class="btn-secondary" style="flex:1; padding: 10px; font-size: 13px;" onclick="viewEprCertificate('${lot.lotId}')">
            ${isVerified ? '📜 View CPCB EPR Certificate' : I18N.t('issueCertBtn')}
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <!-- Verified CPCB License Banner -->
    <div style="background: #eff6ff; border: 2px solid #3b82f6; border-radius: var(--radius-md); padding: 18px 24px; margin-bottom: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 32px;">🛡️</span>
          <div>
            <div style="font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase;">
              ${I18N.t('govBadgeText')}
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #1e3a8a;">
              ${AppState.user.name}
            </div>
            <div style="font-size: 12px; color: #2563eb; font-family: monospace;">
              CPCB Registration ID: ${AppState.user.govRegNo || 'CPCB/EPR-REC/2023/MH-0842'}
            </div>
          </div>
        </div>
        <button class="audio-btn" onclick="I18N.speak('Authorized Recycler Compliance Portal. CPCB Authorized Facility.')">
          ${I18N.t('speakBtn')}
        </button>
      </div>
    </div>

    <!-- 2-Column Responsive Layout -->
    <div class="desktop-grid-2">
      <!-- Left: Incoming Lots & Weighbridge -->
      <div>
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">${I18N.t('incomingLotsTitle')}</h3>
              <p class="card-subtitle">Automated weighbridge confirmation & payment settlement</p>
            </div>
            <button class="audio-btn" onclick="I18N.speak('${I18N.t('incomingLotsTitle')}')">
              ${I18N.t('speakBtn')}
            </button>
          </div>

          <div>
            ${lotsHtml}
          </div>
        </div>
      </div>

      <!-- Right: Wholesale Rate Manager -->
      <div>
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">${I18N.t('updateRatesTitle')}</h3>
              <p class="card-subtitle">Changes instantly broadcast to certified scrap dealers</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${ESETU_DATA.materials.map(m => `
              <div style="background: #f8fafc; border: 1px solid var(--border); padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13.5px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 700;">${m.icon} ${m.name} (${m.symbol})</div>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span style="color: var(--primary-text); font-weight: 900; font-size: 15px;">₹${m.recyclerRate}/kg</span>
                  <button class="btn-secondary" style="padding: 4px 10px; font-size: 12px;" onclick="promptRateUpdate('${m.id}')">
                    Edit Rate
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <div id="certModalContainer"></div>
  `;

  // Window helpers for recycler actions
  window.confirmRecyclerPayment = (lotId) => {
    const lot = ESETU_DATA.lots.find(l => l.lotId === lotId);
    if (!lot) return;

    lot.paymentStatus = 'Paid';
    lot.status = 'Recycled & Verified';
    lot.eprCertIssued = true;
    alert(`✅ Lot ${lotId} approved. ₹${lot.totalAmount.toLocaleString('en-IN')} paid and CPCB Form-6 certificate generated!`);
    I18N.speak(`Payment confirmed for Lot ${lotId}. Certificate issued.`);
    renderRecyclerPage(container);
  };

  window.promptRateUpdate = (matId) => {
    const mat = ESETU_DATA.materials.find(m => m.id === matId);
    if (!mat) return;
    const newRate = prompt(`Enter new buying rate per kg for ${mat.name}:`, mat.recyclerRate);
    if (newRate && !isNaN(newRate)) {
      mat.recyclerRate = Number(newRate);
      alert(`✅ Updated: ${mat.symbol} rate is now ₹${newRate}/kg.`);
      renderRecyclerPage(container);
    }
  };

  window.viewEprCertificate = (lotId) => {
    const lot = ESETU_DATA.lots.find(l => l.lotId === lotId);
    if (!lot) return;

    const certContainer = document.getElementById('certModalContainer');
    certContainer.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content" style="border-top: 6px solid #16a34a; max-width: 500px;">
          <button class="modal-close" onclick="document.getElementById('certModalContainer').innerHTML=''">✕</button>
          
          <div style="text-align: center; margin-bottom: 14px;">
            <div style="font-size: 36px;">📜</div>
            <h3 style="font-size: 17px; font-weight: 900; color: #14532d;">
              GOVERNMENT OF INDIA • CPCB EPR CERTIFICATE
            </h3>
            <div style="font-size: 11.5px; color: var(--text-muted);">
              Under E-Waste (Management) Rules, 2022 • Form-6 Compliance Manifest
            </div>
          </div>

          <div style="background: #f8fafc; border: 1.5px solid var(--border); padding: 14px; border-radius: var(--radius-sm); font-size: 13px; line-height: 1.6;">
            <div><strong>Certificate ID:</strong> CPCB-EPR-CERT-${lot.lotId}</div>
            <div><strong>Authorized Recycler:</strong> ${AppState.user.name}</div>
            <div><strong>CPCB Reg No:</strong> ${AppState.user.govRegNo || 'CPCB/EPR-REC/2023/MH-0842'}</div>
            <div><strong>Source Collector:</strong> ${lot.kabadiwalaName}</div>
            <div><strong>Material Stream:</strong> ${lot.material}</div>
            <div><strong>Net Verified Weight:</strong> ${lot.weightKg} kg</div>
            <div><strong>GPS Geotag:</strong> ${lot.gpsLocation}</div>
            <div><strong>Date & Timestamp:</strong> ${lot.date}</div>
            <div><strong>Audit Status:</strong> <span style="color: #16a34a; font-weight: 800;">VERIFIED & PAID</span></div>
          </div>

          <div style="margin-top: 16px; text-align: center;">
            <button class="btn-primary" onclick="alert('🖨️ Official CPCB Certificate PDF Generated & Downloaded!'); document.getElementById('certModalContainer').innerHTML='';">
              🖨️ Download Official CPCB PDF
            </button>
          </div>
        </div>
      </div>
    `;
  };
}

// -------------------------------------------------------------
// SAFETY & HAZARD GUIDANCE MODAL
// -------------------------------------------------------------
window.openSafetyModal = () => {
  let modalContainer = document.getElementById('safetyModalOverlay');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'safetyModalOverlay';
    document.body.appendChild(modalContainer);
  }

  const cardsHtml = ESETU_DATA.safetyGuides.map(guide => {
    const title = I18N.currentLang === 'en' ? guide.title : (I18N.currentLang === 'mr' ? guide.titleMr : guide.titleHi);
    const audioScript = I18N.currentLang === 'en' ? guide.audioScriptEn : (I18N.currentLang === 'mr' ? guide.audioScriptMr : guide.audioScriptHi);

    return `
      <div style="border-left: 5px solid ${guide.color}; background: #f8fafc; padding: 14px; border-radius: var(--radius-sm); margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <h4 style="font-size: 14.5px; font-weight: 800; color: ${guide.color};">
            ${guide.icon} ${title}
          </h4>
          <button class="audio-btn" onclick="I18N.speak('${audioScript.replace(/'/g, "\\'")}')">
            ${I18N.t('speakBtn')}
          </button>
        </div>
        <div style="font-size: 12.5px; margin-top: 8px;">
          <p style="color: #991b1b; font-weight: 800;">⚠️ Hazard: ${guide.hazard}</p>
          <p style="color: var(--text-muted); margin-top: 3px;">${guide.healthRisk}</p>
          <p style="color: #166534; font-weight: 700; margin-top: 6px;">✅ Compliant Practice: ${guide.safeMethod}</p>
        </div>
      </div>
    `;
  }).join('');

  modalContainer.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content" style="max-height: 85vh; max-width: 560px;">
        <button class="modal-close" onclick="document.getElementById('safetyModalOverlay').innerHTML=''">✕</button>
        <h3 style="font-size: 18px; font-weight: 900; color: var(--danger); margin-bottom: 6px;">
          🚨 ${I18N.t('safetyGuideTitle')}
        </h3>
        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">
          ${I18N.t('safetyBanner')}
        </p>

        <div>
          ${cardsHtml}
        </div>
      </div>
    </div>
  `;
};

// Global Helpers
function getLocalizedMatName(mat) {
  if (I18N.currentLang === 'en') return mat.name;
  if (I18N.currentLang === 'ta' && mat.nameTa) return mat.nameTa;
  if (I18N.currentLang === 'te' && mat.nameTe) return mat.nameTe;
  if (I18N.currentLang === 'kn' && mat.nameKn) return mat.nameKn;
  if (I18N.currentLang === 'ml' && mat.nameMl) return mat.nameMl;
  if (I18N.currentLang === 'mr' && mat.nameMr) return mat.nameMr;
  if (I18N.currentLang === 'hi' && mat.nameHi) return mat.nameHi;
  return mat.name;
}

window.logoutUser = () => {
  if (confirm(I18N.currentLang === 'en' ? 'Are you sure you want to log out?' : 'तुम्हाला खरोखर लॉग आउट करायचे आहे का?')) {
    AppState.user = null;
    localStorage.removeItem('esetu_user');
    renderApp();
  }
};
