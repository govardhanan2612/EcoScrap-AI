// EcoScrap AI Backend API Client — thin fetch wrapper over the real Express + SQLite backend
const API = {
  async _send(method, url, body) {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  bootstrap() { return this._send('GET', '/api/bootstrap'); },

  kabadiwalaLogin(phone, pin) { return this._send('POST', '/api/auth/kabadiwala-login', { phone, pin }); },
  kabadiwalaRegister(payload) { return this._send('POST', '/api/auth/kabadiwala-register', payload); },
  recyclerLogin(payload) { return this._send('POST', '/api/auth/recycler-login', payload); },

  listLots(params) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this._send('GET', `/api/lots${qs}`);
  },
  createLot(payload) { return this._send('POST', '/api/lots', payload); },
  confirmLotPayment(lotId) { return this._send('PATCH', `/api/lots/${encodeURIComponent(lotId)}/confirm-payment`); },

  updateMaterialRate(materialId, payload) { return this._send('PATCH', `/api/materials/${encodeURIComponent(materialId)}/rate`, payload); },

  sendPriceListSms(kabadiId) { return this._send('POST', `/api/kabadiwalas/${encodeURIComponent(kabadiId)}/send-price-sms`); },
  triggerDailyPriceListBroadcast() { return this._send('POST', '/api/notifications/send-daily-price-list'); },

  listMessages(kabadiwalaId, recyclerId) {
    const qs = new URLSearchParams({ kabadiwalaId, recyclerId }).toString();
    return this._send('GET', `/api/messages?${qs}`);
  },
  sendMessage(payload) { return this._send('POST', '/api/messages', payload); }
};

window.API = API;
