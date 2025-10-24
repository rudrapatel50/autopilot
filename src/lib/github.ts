import axios from 'axios';

export async function validateToken(token: string) {
  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
      },
    });

    return {
      valid: true,
      username: response.data.login,
      name: response.data.name,
      email: response.data.email,
      scopes: response.headers['x-oauth-scopes']?.split(', ') || [],
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return {
        valid: false,
        error: 'Invalid token',
      };
    }
    throw error; // Re-throw other errors (network issues, etc.)
  }
}