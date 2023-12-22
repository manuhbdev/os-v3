import { deepFreeze } from '../../utils.js';

async function get(url, headers = {}) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'GET request failed');
    }

    return responseData;
  } catch (error) {
    console.error('Error making GET request:', error.message);
    throw error;
  }
}

async function post(url, data, headers = {}) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'POST request failed');
    }

    return responseData;
  } catch (error) {
    console.error('Error making POST request:', error.message);
    throw error;
  }
}

async function put(url, data, headers = {}) {
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'PUT request failed');
    }

    return responseData;
  } catch (error) {
    console.error('Error making PUT request:', error.message);
    throw error;
  }
}

async function del(url, headers = {}) {
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'DELETE request failed');
    }

    return responseData;
  } catch (error) {
    console.error('Error making DELETE request:', error.message);
    throw error;
  }
}

export const http = deepFreeze({
  get,
  post,
  put,
  del,
});
