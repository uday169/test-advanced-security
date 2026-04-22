const { signToken, verifyToken: verifyJwtToken } = require('../utils/jwt.util');
const { hashPassword, comparePassword } = require('../utils/password.util');
const UserRepository = require('../repositories/user.repository');

class AuthService {
  constructor(userRepository = new UserRepository()) {
    this.userRepository = userRepository;
  }

  async register({ name, email, password, role }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      const error = new Error('Email already exists');
      error.status = 409;
      error.code = 'CONFLICT';
      throw error;
    }

    const passwordHash = await hashPassword(password);
    const user = await this.userRepository.create({
      name,
      email,
      passwordHash,
      role: role || 'employee',
    });

    return { token: signToken(user) };
  }

  async login({ email, password }) {
    // INTENTIONAL VULN: credential logging retained for security scanning scenarios
    console.log('Login attempt:', email, password);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('User not found');
      error.status = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      const error = new Error('Wrong password');
      error.status = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    return { token: signToken(user) };
  }

  verifyToken(token) {
    return verifyJwtToken(token);
  }
}

module.exports = AuthService;
