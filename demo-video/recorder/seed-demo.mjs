/**
 * Minimal demo data seed via TransitOps API.
 */
const API = 'http://localhost:8000/api/v1';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 404) {
    throw new Error(json.message || `${method} ${path} failed (${res.status})`);
  }
  return json.data;
}

async function login() {
  const data = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@transitops.com', password: 'adminpassword123' },
  });
  return data.tokens.accessToken;
}

async function findVehicle(token, plate) {
  const list = await request(`/vehicles?plateNumber=${encodeURIComponent(plate)}&limit=1`, { token });
  return list?.data?.[0];
}

async function findDriver(token, license) {
  const list = await request('/drivers?limit=100&populate=user', { token });
  return list?.data?.find((d) => d.licenseNumber === license);
}

async function main() {
  const token = await login();
  const profile = await request('/auth/profile', { token });

  let vehicle = await findVehicle(token, 'TX-DEMO1');
  if (!vehicle) {
    vehicle = await request('/vehicles', {
      method: 'POST',
      token,
      body: {
        plateNumber: 'TX-DEMO1',
        make: 'Freightliner',
        model: 'Cascadia',
        year: 2022,
        type: 'Truck',
        fuelType: 'Diesel',
        mileage: 85000,
        capacity: { payload: 15000, volume: 80 },
      },
    });
    console.log('Created vehicle TX-DEMO1');
  }

  if (!(await findVehicle(token, 'TX-DEMO2'))) {
    await request('/vehicles', {
      method: 'POST',
      token,
      body: {
        plateNumber: 'TX-DEMO2',
        make: 'Volvo',
        model: 'VNL',
        year: 2021,
        type: 'Truck',
        fuelType: 'Diesel',
        mileage: 120000,
        capacity: { payload: 12000, volume: 70 },
      },
    });
    console.log('Created vehicle TX-DEMO2');
  }

  let driver = await findDriver(token, 'DL-DEMO-001');
  if (!driver) {
    const drivers = await request('/drivers?limit=100&populate=user', { token });
    driver = drivers?.data?.[0];
  }

  if (vehicle && driver) {
    await request('/fuel-logs', {
      method: 'POST',
      token,
      body: {
        vehicle: vehicle._id,
        driver: driver._id,
        quantity: 180,
        cost: 245.5,
        odometer: vehicle.mileage || 85000,
        fuelStation: 'Shell Dallas',
        date: new Date().toISOString(),
      },
    }).catch(() => null);

    await request('/expenses', {
      method: 'POST',
      token,
      body: {
        expenseId: `EXP-DEMO-${Date.now()}`,
        category: 'Toll',
        amount: 45,
        vehicle: vehicle._id,
        description: 'Highway toll — Dallas corridor',
        date: new Date().toISOString(),
      },
    }).catch(() => null);
  }

  await request('/notifications', {
    method: 'POST',
    token,
    body: {
      recipient: profile._id,
      title: 'License Renewal Reminder',
      message: 'Review operator compliance before next dispatch cycle.',
      type: 'Compliance',
      priority: 'Medium',
    },
  }).catch(() => null);

  console.log('Demo data ready.');
}

main().catch((e) => {
  console.warn('Seed warning:', e.message);
});
