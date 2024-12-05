import { jwtVerify, SignJWT } from 'jose';

// Dummy user for testing
export const dummyUser = {
  id: "MFR-001",
  name: "İnci Akü",
  email: "demo@inciaku.com",
  password: "demo1234", // In real app, this would be hashed
  role: "manufacturer",
};

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key_change_this_in_production'
);

export async function createToken(user: typeof dummyUser) {
  return await new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}